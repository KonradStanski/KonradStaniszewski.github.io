// ANET 4:1 stock split effective December 6, 2024
const SPLIT_DATE = '2024-12-06';
const SPLIT_RATIO = 4;

export function isPreSplit(date: string): boolean {
  return date < SPLIT_DATE;
}

export function normalizeQuantity(qty: number, date: string): number {
  if (isPreSplit(date)) {
    return qty * SPLIT_RATIO;
  }
  return qty;
}

export function normalizePrice(price: number, date: string): number {
  if (isPreSplit(date)) {
    return price / SPLIT_RATIO;
  }
  return price;
}

// FMV per share (post-split) = taxableGain / vestedQty
// Works for both pre/post split since vestedQty in the spreadsheet is already post-split adjusted
export function deriveFmvPerShare(taxableGain: number, vestedQty: number): number {
  return taxableGain / vestedQty;
}

// E*Trade inconsistently split-adjusts ESPP data. Pre-split ANET never traded below
// $100, so a low price on a pre-split date means it's already been adjusted.
const PRE_SPLIT_MIN_PRICE = 100;

export function isEsppAlreadySplitAdjusted(date: string, purchasePrice: number): boolean {
  return isPreSplit(date) && purchasePrice < PRE_SPLIT_MIN_PRICE;
}

export { SPLIT_DATE, SPLIT_RATIO };
