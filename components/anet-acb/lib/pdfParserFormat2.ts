import type { RawSellTransaction } from '../types';

/**
 * Parse E*TRADE Stock Plan format trade confirmations.
 *
 * pdfjs-dist extracts text items joined with spaces. Actual extraction:
 * "08/22/23   08/24/23   6 1   ANET   SELL   13   $184.60   Stock Plan
 *  PRINCIPAL   $2,399.80   COMMISSION   $4.95 FEE   $0.02
 *  NET AMOUNT   $ 2,394.83"
 *
 * Note: MKT/CPT field "61" may be extracted as "6 1", and NET AMOUNT
 * may have a space between $ and the number: "$ 2,394.83"
 */
export function parseFormat2(text: string, filename: string): RawSellTransaction | null {
  const dataMatch = text.match(
    /(\d{2}\/\d{2}\/\d{2})\s+(\d{2}\/\d{2}\/\d{2})\s+[\s\S]*?ANET\s+SELL\s+(\d+)\s+\$\s*([\d,.]+)/
  );
  if (!dataMatch) return null;

  const [, tradeDateRaw, settlementDateRaw, qtyStr, priceStr] = dataMatch;

  const tradeDate = parseMMDDYY(tradeDateRaw);
  const settlementDate = parseMMDDYY(settlementDateRaw);
  const quantity = parseInt(qtyStr, 10);
  const price = parseFloat(priceStr.replace(/,/g, ''));

  const principalMatch = text.match(/PRINCIPAL\s+\$\s*([\d,]+\.?\d*)/);
  const principal = principalMatch ? parseAmount(principalMatch[1]) : quantity * price;

  const commissionMatch = text.match(/COMMISSION\s+\$\s*([\d,]+\.?\d*)/);
  const commission = commissionMatch ? parseAmount(commissionMatch[1]) : 0;

  const feeMatch = text.match(/(?<!Transaction\s)FEE\s+\$\s*([\d,]+\.?\d*)/);
  const fee = feeMatch ? parseAmount(feeMatch[1]) : 0;

  const netMatch = text.match(/NET AMOUNT\s+\$\s*([\d,]+\.?\d*)/);
  const netAmount = netMatch ? parseAmount(netMatch[1]) : principal - commission - fee;

  return {
    tradeDate,
    settlementDate,
    quantity,
    price,
    principal,
    commission,
    fee,
    netAmount,
    transactionType: 'Sold',
    source: filename,
  };
}

function parseMMDDYY(date: string): string {
  const [mm, dd, yy] = date.split('/');
  const year = parseInt(yy, 10);
  const fullYear = year >= 50 ? 1900 + year : 2000 + year;
  return `${fullYear}-${mm}-${dd}`;
}

function parseAmount(s: string): number {
  return parseFloat(s.replace(/,/g, ''));
}
