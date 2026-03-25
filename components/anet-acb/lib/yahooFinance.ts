import type { ExchangeRateCache, PricePoint } from '../types';

const CORS_PROXIES = [
  'https://corsproxy.io/?url=',
  'https://api.allorigins.win/raw?url=',
];

function formatDateUTC(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function parseDateUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

async function fetchWithCorsProxy(url: string): Promise<Response> {
  // Try direct first (Bank of Canada may allow CORS)
  try {
    const resp = await fetch(url);
    if (resp.ok) return resp;
  } catch {
    // Fall through to proxies
  }

  for (const proxy of CORS_PROXIES) {
    try {
      const resp = await fetch(proxy + encodeURIComponent(url));
      if (resp.ok) return resp;
    } catch {
      continue;
    }
  }

  throw new Error(`Failed to fetch: ${url}`);
}

async function fetchYahooChart(
  symbol: string,
  period1: number,
  period2: number,
  interval = '1d',
): Promise<{ timestamps: number[]; closes: number[] }> {
  const baseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}`;

  for (const proxy of CORS_PROXIES) {
    try {
      const url = proxy + encodeURIComponent(baseUrl);
      const resp = await fetch(url);
      if (!resp.ok) continue;

      const json = await resp.json();
      const result = json?.chart?.result?.[0];
      if (!result) continue;

      const timestamps: number[] = result.timestamp || [];
      const closes: number[] = result.indicators?.quote?.[0]?.close || [];
      return { timestamps, closes };
    } catch {
      continue;
    }
  }

  throw new Error(`Failed to fetch Yahoo Finance data for ${symbol}`);
}

export async function fetchStockPrices(
  startDate: string,
  endDate: string,
): Promise<PricePoint[]> {
  const start = parseDateUTC(startDate);
  start.setUTCDate(start.getUTCDate() - 60);
  const end = parseDateUTC(endDate);
  end.setUTCDate(end.getUTCDate() + 60);

  const period1 = Math.floor(start.getTime() / 1000);
  const period2 = Math.floor(end.getTime() / 1000);

  const { timestamps, closes } = await fetchYahooChart('ANET', period1, period2);

  const points: PricePoint[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    if (closes[i] != null) {
      const d = new Date(timestamps[i] * 1000);
      points.push({ date: formatDateUTC(d), close: closes[i] });
    }
  }

  return points;
}

// Bank of Canada Valet API — matches the Rust acb tool's exchange rate logic.
// Pre-2017: IEXE0101 (noon rate, USD→CAD directly)
// 2017+: FXCADUSD (indicative rate, CAD→USD, requires inversion)
// CRA compliant per ITA s.261(1.4): use closest preceding business day if
// no rate published for the transaction date.
async function fetchBankOfCanadaRatesForYear(
  year: number,
): Promise<Record<string, number>> {
  const isPre2017 = year < 2017;
  const obsCode = isPre2017 ? 'IEXE0101' : 'FXCADUSD';
  const url = `https://www.bankofcanada.ca/valet/observations/${obsCode}/json?start_date=${year}-01-01&end_date=${year}-12-31`;

  const resp = await fetchWithCorsProxy(url);
  const json = await resp.json();

  const observations: Array<{ d: string; [key: string]: { v: string } | string }> =
    json?.observations ?? [];

  const rates: Record<string, number> = {};
  for (const obs of observations) {
    const dateStr = obs.d;
    const valueObj = obs[obsCode];
    if (!valueObj || typeof valueObj !== 'object' || !('v' in valueObj)) continue;
    const rawValue = parseFloat(valueObj.v);
    if (isNaN(rawValue) || rawValue <= 0) continue;

    // Pre-2017 IEXE0101 is USD→CAD directly.
    // 2017+ FXCADUSD is CAD→USD, so invert to get USD→CAD.
    rates[dateStr] = isPre2017 ? rawValue : 1 / rawValue;
  }

  return rates;
}

export async function fetchExchangeRates(dates: string[]): Promise<ExchangeRateCache> {
  if (dates.length === 0) return {};

  // Group dates by year to minimize API calls
  const yearSet = new Set<number>();
  for (const date of dates) {
    yearSet.add(parseInt(date.substring(0, 4), 10));
  }

  // Fetch rates for all needed years (plus adjacent years for lookback near boundaries)
  const yearsToFetch = new Set(yearSet);
  for (const y of yearSet) {
    yearsToFetch.add(y - 1); // for lookback across year boundary
  }

  const allRates: Record<string, number> = {};
  const fetchPromises = [...yearsToFetch].map(async (year) => {
    try {
      const yearRates = await fetchBankOfCanadaRatesForYear(year);
      Object.assign(allRates, yearRates);
    } catch {
      // Individual year fetch failures are non-fatal
    }
  });
  await Promise.all(fetchPromises);

  // Resolve rates for each requested date using CRA-compliant backward lookup
  const result: ExchangeRateCache = {};
  for (const date of dates) {
    const rate = findPrecedingRate(date, allRates);
    if (rate !== null) {
      result[date] = rate;
    }
  }

  return result;
}

// CRA-compliant: look backward only, up to 7 days, for the closest preceding
// business day with a published rate. Per ITA s.261(1.4).
function findPrecedingRate(
  targetDate: string,
  ratesByDate: Record<string, number>,
): number | null {
  if (ratesByDate[targetDate]) return ratesByDate[targetDate];

  const target = parseDateUTC(targetDate);

  for (let offset = 1; offset <= 7; offset++) {
    const d = new Date(target);
    d.setUTCDate(d.getUTCDate() - offset);
    const dateStr = formatDateUTC(d);
    if (ratesByDate[dateStr]) return ratesByDate[dateStr];
  }

  return null;
}
