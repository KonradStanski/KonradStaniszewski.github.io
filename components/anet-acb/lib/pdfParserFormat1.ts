import type { RawSellTransaction } from '../types';

/**
 * Parse Morgan Stanley format trade confirmations.
 *
 * Text layout (variable field ordering, some fields optional):
 *
 * Trade Date Settlement Date Quantity Price Settlement Amount
 * MM/DD/YYYY MM/DD/YYYY N PRICE
 * Transaction Type: Sold | Sold Short
 * Description: ARISTA NETWORKS INC
 * Symbol / CUSIP / ISIN: ANET / ...
 * Principal $X,XXX.XX
 * Commission $X.XX          (optional)
 * Supplemental
 * Transaction Fee $X.XX     (optional, may span two lines)
 * Net Amount $X,XXX.XX
 *
 * Note: pdfjs-dist may insert spaces between $ and numbers: "$ 1,234.56"
 */
export function parseFormat1(text: string, filename: string): RawSellTransaction | null {
  const dateLineMatch = text.match(
    /(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})\s+(\d+)\s+([\d.]+)/
  );
  if (!dateLineMatch) return null;

  const [, tradeDateRaw, settlementDateRaw, qtyStr, priceStr] = dateLineMatch;

  const tradeDate = parseMMDDYYYY(tradeDateRaw);
  const settlementDate = parseMMDDYYYY(settlementDateRaw);
  const quantity = parseInt(qtyStr, 10);
  const price = parseFloat(priceStr);

  const typeMatch = text.match(/Transaction Type:\s*(Sold(?:\s+Short)?)/);
  const transactionType = (typeMatch?.[1]?.trim() || 'Sold') as 'Sold' | 'Sold Short';

  const principalMatch = text.match(/Principal\s+\$?\s*([\d,]+\.?\d*)/);
  const principal = principalMatch ? parseAmount(principalMatch[1]) : quantity * price;

  const commissionMatch = text.match(/Commission\s+\$?\s*([\d,]+\.?\d*)/);
  const commission = commissionMatch ? parseAmount(commissionMatch[1]) : 0;

  const feeMatch = text.match(/Transaction Fee\s+\$?\s*([\d,]+\.?\d*)/);
  const fee = feeMatch ? parseAmount(feeMatch[1]) : 0;

  const netMatch = text.match(/Net Amount\s+\$?\s*([\d,]+\.?\d*)/);
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
    transactionType,
    source: filename,
  };
}

function parseMMDDYYYY(date: string): string {
  const [mm, dd, yyyy] = date.split('/');
  return `${yyyy}-${mm}-${dd}`;
}

function parseAmount(s: string): number {
  return parseFloat(s.replace(/,/g, ''));
}
