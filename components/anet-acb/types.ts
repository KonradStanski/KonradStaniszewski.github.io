export type TransactionType = 'vest' | 'espp_purchase' | 'sell';

export interface RawSellTransaction {
  tradeDate: string;
  settlementDate: string;
  quantity: number;
  price: number;
  principal: number;
  commission: number;
  fee: number;
  netAmount: number;
  transactionType: 'Sold' | 'Sold Short';
  source: string;
}

export interface RawVestEvent {
  vestDate: string;
  vestedQty: number;
  taxableGain: number;
  fmvPerShare: number;
  grantNumber: string;
  vestPeriod: number;
  totalTaxesPaid: number;
  taxDescription: string;
  source: string;
}

export interface RawEsppPurchase {
  purchaseDate: string;
  purchasePrice: number;
  purchasedQty: number;
  taxCollectionShares: number;
  netShares: number;
  discountPercent: number;
  grantDateFmv: number;
  purchaseDateFmv: number;
  source: string;
}

export interface NormalizedTransaction {
  id: string;
  date: string;
  settlementDate: string;
  type: TransactionType;
  quantity: number;
  pricePerShareUsd: number;
  totalUsd: number;
  commissionUsd: number;
  feeUsd: number;
  exchangeRate: number | null;
  exchangeRateManual: boolean;
  totalCad: number | null;
  commissionCad: number | null;
  feeCad: number | null;
  source: string;
  preSplit: boolean;
}

export interface AcbEntry {
  id: string;
  date: string;
  settlementDate: string;
  type: TransactionType;
  description: string;
  source: string;
  quantity: number;
  exchangeRate: number;
  pricePerShareUsd: number;
  totalUsd: number;
  commissionUsd: number;
  feeUsd: number;
  pricePerShareCad: number;
  totalCad: number;
  sellingExpensesCad: number;
  sharesHeld: number;
  totalAcbCad: number;
  acbPerShareCad: number;
  proceedsUsd: number | null;
  proceedsCad: number | null;
  acbOfSharesSoldCad: number | null;
  capitalGainCad: number | null;
  taxableCapitalGainCad: number | null;
  superficialLossFlag: boolean;
  superficialLossDeniedCad: number | null;
}

export interface TaxYearSummary {
  year: number;
  totalProceedsCad: number;
  totalAcbOfSharesSoldCad: number;
  totalSellingExpensesCad: number;
  totalCapitalGainsCad: number;
  totalTaxableCapitalGainsCad: number;
  totalSuperficialLossDeniedCad: number;
  dispositionCount: number;
  acquisitionCount: number;
}

export interface PricePoint {
  date: string;
  close: number;
}

export interface ExchangeRateCache {
  [date: string]: number;
}
