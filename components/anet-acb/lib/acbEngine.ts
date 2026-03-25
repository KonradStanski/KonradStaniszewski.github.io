import type {
  NormalizedTransaction,
  AcbEntry,
  TaxYearSummary,
} from '../types';

export function calculateAcb(
  transactions: NormalizedTransaction[],
): AcbEntry[] {
  const entries: AcbEntry[] = [];
  let sharesHeld = 0;
  let totalAcbCad = 0;

  for (const tx of transactions) {
    if (tx.exchangeRate === null || tx.totalCad === null) continue;

    const rate = tx.exchangeRate;

    if (tx.type === 'vest' || tx.type === 'espp_purchase') {
      const costCad = tx.totalCad;
      sharesHeld += tx.quantity;
      totalAcbCad += costCad;
      const acbPerShare = sharesHeld > 0 ? totalAcbCad / sharesHeld : 0;

      entries.push({
        id: tx.id,
        date: tx.date,
        settlementDate: tx.settlementDate,
        type: tx.type,
        description: tx.type === 'vest'
          ? `RSU Vest (${tx.quantity} shares @ $${tx.pricePerShareUsd.toFixed(2)} USD)`
          : `ESPP Purchase (${tx.quantity} shares @ $${tx.pricePerShareUsd.toFixed(2)} USD)`,
        source: tx.source,
        quantity: tx.quantity,
        exchangeRate: rate,
        pricePerShareUsd: tx.pricePerShareUsd,
        totalUsd: tx.totalUsd,
        commissionUsd: tx.commissionUsd,
        feeUsd: tx.feeUsd,
        pricePerShareCad: tx.pricePerShareUsd * rate,
        totalCad: costCad,
        sellingExpensesCad: 0,
        sharesHeld,
        totalAcbCad,
        acbPerShareCad: acbPerShare,
        proceedsUsd: null,
        proceedsCad: null,
        acbOfSharesSoldCad: null,
        capitalGainCad: null,
        taxableCapitalGainCad: null,
        superficialLossFlag: false,
        superficialLossDeniedCad: null,
      });
    } else {
      const acbPerShare = sharesHeld > 0 ? totalAcbCad / sharesHeld : 0;
      const acbOfSharesSold = acbPerShare * tx.quantity;
      const proceedsUsd = tx.pricePerShareUsd * tx.quantity;
      const proceedsCad = proceedsUsd * rate;
      const sellingExpensesCad = ((tx.commissionUsd || 0) + (tx.feeUsd || 0)) * rate;
      const rawCapitalGain = proceedsCad - acbOfSharesSold - sellingExpensesCad;

      // Superficial loss: CRA ITA s.40(2)(g)(i)
      let capitalGain = rawCapitalGain;
      let superficialLossFlag = false;
      let deniedLoss = 0;

      if (rawCapitalGain < 0) {
        const sfl = computeSuperficialLoss(
          tx, tx.quantity, sharesHeld, transactions, rawCapitalGain,
        );
        superficialLossFlag = sfl.isSuperficial;
        if (sfl.isSuperficial) {
          capitalGain = sfl.adjustedGain;
          deniedLoss = sfl.deniedLoss;
        }
      }

      const taxableCapitalGain = capitalGain * 0.5;

      sharesHeld -= tx.quantity;
      totalAcbCad -= acbOfSharesSold;

      // Add denied superficial loss back to ACB
      if (deniedLoss > 0) {
        totalAcbCad += deniedLoss;
      }

      if (sharesHeld <= 0) {
        sharesHeld = 0;
        totalAcbCad = 0;
      }

      const acbPerShareAfter = sharesHeld > 0 ? totalAcbCad / sharesHeld : 0;

      entries.push({
        id: tx.id,
        date: tx.date,
        settlementDate: tx.settlementDate,
        type: tx.type,
        description: `Sell (${tx.quantity} shares @ $${tx.pricePerShareUsd.toFixed(2)} USD)`,
        source: tx.source,
        quantity: tx.quantity,
        exchangeRate: rate,
        pricePerShareUsd: tx.pricePerShareUsd,
        totalUsd: proceedsUsd,
        commissionUsd: tx.commissionUsd,
        feeUsd: tx.feeUsd,
        pricePerShareCad: tx.pricePerShareUsd * rate,
        totalCad: proceedsCad,
        sellingExpensesCad,
        sharesHeld,
        totalAcbCad,
        acbPerShareCad: acbPerShareAfter,
        proceedsUsd,
        proceedsCad,
        acbOfSharesSoldCad: acbOfSharesSold,
        capitalGainCad: capitalGain,
        taxableCapitalGainCad: taxableCapitalGain,
        superficialLossFlag,
        superficialLossDeniedCad: deniedLoss > 0 ? deniedLoss : null,
      });
    }
  }

  return entries;
}

/**
 * CRA Superficial Loss Rule — ITA s.40(2)(g)(i)
 *
 * A capital loss is denied (in whole or proportionally) when identical
 * property is acquired within a 61-day window centred on the settlement
 * date of the disposition (30 days before → 30 days after, inclusive).
 *
 * Denied portion formula (CRA IT-259R4):
 *   ratio = MIN(shares_sold, shares_acquired_in_window, shares_held_at_end_of_window) / shares_sold
 *   denied_loss = |raw_loss| × ratio
 *
 * The denied amount is added back to the ACB of the remaining shares.
 */
function computeSuperficialLoss(
  sellTx: NormalizedTransaction,
  sellQty: number,
  sharesHeldBeforeSell: number,
  allTransactions: NormalizedTransaction[],
  rawLoss: number,
): { isSuperficial: boolean; deniedLoss: number; adjustedGain: number } {
  const sellSettle = new Date(sellTx.settlementDate);
  const windowStart = new Date(sellSettle);
  windowStart.setDate(windowStart.getDate() - 30);
  const windowEnd = new Date(sellSettle);
  windowEnd.setDate(windowEnd.getDate() + 30);

  // Count total shares acquired (buys) within the ±30-day window
  let totalAcquiredInPeriod = 0;
  for (const tx of allTransactions) {
    if (tx === sellTx) continue;
    if (tx.type !== 'vest' && tx.type !== 'espp_purchase') continue;
    const txSettle = new Date(tx.settlementDate);
    if (txSettle >= windowStart && txSettle <= windowEnd) {
      totalAcquiredInPeriod += tx.quantity;
    }
  }

  if (totalAcquiredInPeriod === 0) {
    return { isSuperficial: false, deniedLoss: 0, adjustedGain: rawLoss };
  }

  // Calculate shares held at end of the window period.
  // Start from shares after this sell, then apply subsequent transactions
  // up to end of window.
  let sharesAtEndOfPeriod = sharesHeldBeforeSell - sellQty;
  let pastSell = false;
  for (const tx of allTransactions) {
    if (tx === sellTx) { pastSell = true; continue; }
    if (!pastSell) continue;
    const txSettle = new Date(tx.settlementDate);
    if (txSettle > windowEnd) break;
    if (tx.type === 'vest' || tx.type === 'espp_purchase') {
      sharesAtEndOfPeriod += tx.quantity;
    } else if (tx.type === 'sell') {
      sharesAtEndOfPeriod -= tx.quantity;
    }
  }
  if (sharesAtEndOfPeriod < 0) sharesAtEndOfPeriod = 0;

  const numerator = Math.min(sellQty, totalAcquiredInPeriod, sharesAtEndOfPeriod);
  const ratio = numerator / sellQty;
  const deniedLoss = Math.abs(rawLoss) * ratio;
  const adjustedGain = rawLoss + deniedLoss;

  return { isSuperficial: true, deniedLoss, adjustedGain };
}

export function summarizeByTaxYear(entries: AcbEntry[]): TaxYearSummary[] {
  const byYear: Record<number, TaxYearSummary> = {};

  for (const entry of entries) {
    const year = parseInt(entry.date.substring(0, 4), 10);

    if (!byYear[year]) {
      byYear[year] = {
        year,
        totalProceedsCad: 0,
        totalAcbOfSharesSoldCad: 0,
        totalSellingExpensesCad: 0,
        totalCapitalGainsCad: 0,
        totalTaxableCapitalGainsCad: 0,
        totalSuperficialLossDeniedCad: 0,
        dispositionCount: 0,
        acquisitionCount: 0,
      };
    }

    const summary = byYear[year];

    if (entry.type === 'sell') {
      summary.totalProceedsCad += entry.proceedsCad || 0;
      summary.totalAcbOfSharesSoldCad += entry.acbOfSharesSoldCad || 0;
      summary.totalSellingExpensesCad += entry.sellingExpensesCad;
      summary.totalCapitalGainsCad += entry.capitalGainCad || 0;
      summary.totalTaxableCapitalGainsCad += entry.taxableCapitalGainCad || 0;
      summary.totalSuperficialLossDeniedCad += entry.superficialLossDeniedCad || 0;
      summary.dispositionCount++;
    } else {
      summary.acquisitionCount++;
    }
  }

  return Object.values(byYear).sort((a, b) => a.year - b.year);
}
