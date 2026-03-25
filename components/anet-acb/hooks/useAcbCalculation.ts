import { useMemo } from 'react';
import type { NormalizedTransaction } from '../types';
import { calculateAcb, summarizeByTaxYear } from '../lib/acbEngine';

export function useAcbCalculation(normalized: NormalizedTransaction[]) {
  const acbEntries = useMemo(() => {
    const ready = normalized.filter((tx) => tx.exchangeRate !== null);
    if (ready.length === 0) return [];
    return calculateAcb(ready);
  }, [normalized]);

  const taxYearSummaries = useMemo(() => {
    return summarizeByTaxYear(acbEntries);
  }, [acbEntries]);

  const years = useMemo(() => {
    return taxYearSummaries.map((s) => s.year);
  }, [taxYearSummaries]);

  return { acbEntries, taxYearSummaries, years };
}
