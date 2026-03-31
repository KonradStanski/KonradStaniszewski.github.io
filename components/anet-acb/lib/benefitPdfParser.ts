import type { RawEsppPurchase, RawVestEvent } from '../types';
import { SPLIT_RATIO, isPreSplit } from './stockSplit';
import type { ExtractedPdfText } from './pdfText';

type ParsedBenefitDocument =
  | { kind: 'vest'; value: RawVestEvent }
  | { kind: 'espp_purchase'; value: RawEsppPurchase };

function normalizeLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function compactLines(lines: string[]): string[] {
  return lines.map(normalizeLine).filter(Boolean);
}

function parseParsedValue<T>(
  lines: string[],
  prefix: string,
  parser: (value: string) => T | null,
): T | null {
  for (const line of lines) {
    if (!line.startsWith(prefix)) continue;
    const parsed = parser(normalizeLine(line.slice(prefix.length)));
    if (parsed !== null) {
      return parsed;
    }
  }
  return null;
}

function parseStringValue(lines: string[], prefix: string): string | null {
  return parseParsedValue(lines, prefix, (value) => (value ? value : null));
}

function parseDate(value: string): string | null {
  const dashed = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dashed) {
    const [, mm, dd, yyyy] = dashed;
    return `${yyyy}-${mm}-${dd}`;
  }

  const slash = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slash) {
    const [, mm, dd, yyyy] = slash;
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

function parseLooseNumber(value: string): number | null {
  const cleaned = value.replace(/[,$()*]/g, '').trim();
  if (!cleaned || !/^[-+]?\d+(?:\.\d+)?$/.test(cleaned)) {
    return null;
  }
  return Number.parseFloat(cleaned);
}

function normalizeBenefitPurchase(purchase: RawEsppPurchase): RawEsppPurchase {
  if (!isPreSplit(purchase.purchaseDate)) {
    return purchase;
  }

  return {
    ...purchase,
    purchasedQty: purchase.purchasedQty * SPLIT_RATIO,
    taxCollectionShares: purchase.taxCollectionShares * SPLIT_RATIO,
    netShares: purchase.netShares * SPLIT_RATIO,
    purchasePrice: purchase.purchasePrice / SPLIT_RATIO,
    grantDateFmv: purchase.grantDateFmv / SPLIT_RATIO,
    purchaseDateFmv: purchase.purchaseDateFmv / SPLIT_RATIO,
  };
}

function normalizeBenefitVest(vest: RawVestEvent): RawVestEvent {
  if (!isPreSplit(vest.vestDate)) {
    return vest;
  }

  return {
    ...vest,
    vestedQty: vest.vestedQty * SPLIT_RATIO,
    fmvPerShare: vest.fmvPerShare / SPLIT_RATIO,
  };
}

function parsePurchasePdf(lines: string[], filename: string): RawEsppPurchase | null {
  const purchaseDate = parseParsedValue(lines, 'Purchase Date ', parseDate);
  const purchasedQty = parseParsedValue(lines, 'Shares Purchased ', parseLooseNumber);
  const taxCollectionShares = parseParsedValue(
    lines,
    'Shares Sold to Cover Taxes ',
    parseLooseNumber,
  );
  const grantDateFmv = parseParsedValue(lines, 'Grant Date Market Value ', parseLooseNumber);
  const purchaseDateFmv = parseParsedValue(
    lines,
    'Purchase Value per Share ',
    parseLooseNumber,
  );

  const discountLine = lines.find((line) =>
    /^\([\d.]+% of \$[\d,.]+\)\s+\$?[\d,.]+$/.test(line),
  );
  const discountMatch = discountLine?.match(
    /^\(([\d.]+)% of \$[\d,.]+\)\s+\$?([\d,.]+)$/,
  );

  if (
    !purchaseDate ||
    purchasedQty === null ||
    taxCollectionShares === null ||
    grantDateFmv === null ||
    purchaseDateFmv === null ||
    !discountMatch
  ) {
    return null;
  }

  const purchasePrice = parseLooseNumber(discountMatch[2]);
  if (purchasePrice === null) {
    return null;
  }

  return normalizeBenefitPurchase({
    purchaseDate,
    purchasePrice,
    purchasedQty,
    taxCollectionShares,
    netShares: purchasedQty - taxCollectionShares,
    discountPercent: 100 - Number.parseFloat(discountMatch[1]),
    grantDateFmv,
    purchaseDateFmv,
    source: filename,
  });
}

function parseReleasePdf(lines: string[], filename: string): RawVestEvent | null {
  const grantNumber = parseStringValue(lines, 'Award Number ');
  const vestDate = parseParsedValue(lines, 'Release Date ', parseDate);
  const vestedQty = parseParsedValue(lines, 'Shares Released ', parseLooseNumber);
  const fmvPerShare = parseParsedValue(lines, 'Market Value Per Share ', parseLooseNumber);
  const taxableGain = parseParsedValue(lines, 'Total Gain ', parseLooseNumber);
  const totalTaxesPaid = parseParsedValue(lines, 'Total Tax ', parseLooseNumber);

  const taxHeaderIndex = lines.findIndex((line) => line === 'Taxable Gain $ Rate % Amount $');
  const taxRow = taxHeaderIndex >= 0 ? lines[taxHeaderIndex + 1] : null;
  const taxMatch = taxRow?.match(/^(.+?) ([\d,]+\.\d+) ([\d.]+) ([\d,]+\.\d+)$/);

  if (
    !grantNumber ||
    !vestDate ||
    vestedQty === null ||
    fmvPerShare === null ||
    taxableGain === null ||
    totalTaxesPaid === null
  ) {
    return null;
  }

  return normalizeBenefitVest({
    vestDate,
    vestedQty,
    taxableGain,
    fmvPerShare,
    grantNumber,
    vestPeriod: 0,
    totalTaxesPaid: Math.abs(totalTaxesPaid),
    taxDescription: taxMatch?.[1] ?? '',
    source: filename,
  });
}

export function parseBenefitHistoryPdf(
  extracted: ExtractedPdfText,
  filename: string,
): ParsedBenefitDocument | null {
  const lines = compactLines(extracted.lines);

  if (lines.includes('EMPLOYEE STOCK PLAN PURCHASE CONFIRMATION')) {
    const purchase = parsePurchasePdf(lines, filename);
    return purchase ? { kind: 'espp_purchase', value: purchase } : null;
  }

  if (lines.includes('EMPLOYEE STOCK PLAN RELEASE CONFIRMATION')) {
    const release = parseReleasePdf(lines, filename);
    return release ? { kind: 'vest', value: release } : null;
  }

  return null;
}
