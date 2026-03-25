import { useState, useCallback, useRef } from 'react';
import type { ExchangeRateCache, PricePoint } from '../types';
import { fetchExchangeRates, fetchStockPrices } from '../lib/yahooFinance';

export function useYahooFinance() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateCache>({});
  const [stockPrices, setStockPrices] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<ExchangeRateCache>({});

  const loadExchangeRates = useCallback(async (dates: string[]) => {
    const missing = dates.filter((d) => !cacheRef.current[d]);
    if (missing.length === 0) return cacheRef.current;

    setLoading(true);
    setError(null);

    try {
      const newRates = await fetchExchangeRates(missing);
      const merged = { ...cacheRef.current, ...newRates };
      cacheRef.current = merged;
      setExchangeRates(merged);

      const stillMissing = missing.filter((d) => !merged[d]);
      if (stillMissing.length > 0) {
        setError(`Could not fetch exchange rates for: ${stillMissing.join(', ')}. You can enter them manually.`);
      }

      return merged;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to fetch exchange rates: ${msg}`);
      return cacheRef.current;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStockPrices = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const prices = await fetchStockPrices(startDate, endDate);
      setStockPrices(prices);
      return prices;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to fetch stock prices: ${msg}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const setManualRate = useCallback((date: string, rate: number) => {
    const merged = { ...cacheRef.current, [date]: rate };
    cacheRef.current = merged;
    setExchangeRates(merged);
  }, []);

  return {
    exchangeRates,
    stockPrices,
    loading,
    error,
    loadExchangeRates,
    loadStockPrices,
    setManualRate,
  };
}
