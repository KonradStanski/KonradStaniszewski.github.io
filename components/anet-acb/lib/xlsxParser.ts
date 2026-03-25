import * as XLSX from 'xlsx';
import type { RawVestEvent, RawEsppPurchase } from '../types';
import { deriveFmvPerShare, isPreSplit, isEsppAlreadySplitAdjusted, SPLIT_RATIO } from './stockSplit';

export function parseXlsx(data: ArrayBuffer): {
  vests: RawVestEvent[];
  esppPurchases: RawEsppPurchase[];
  errors: string[];
} {
  const workbook = XLSX.read(data, { type: 'array' });
  const errors: string[] = [];

  let vests: RawVestEvent[] = [];
  let esppPurchases: RawEsppPurchase[] = [];

  const rsSheet = workbook.Sheets['Restricted Stock'];
  if (rsSheet) {
    const rsResult = parseRestrictedStock(rsSheet);
    vests = rsResult.vests;
    errors.push(...rsResult.errors);
  } else {
    errors.push('Sheet "Restricted Stock" not found in workbook');
  }

  const esppSheet = workbook.Sheets['ESPP'];
  if (esppSheet) {
    const esppResult = parseEspp(esppSheet);
    esppPurchases = esppResult.purchases;
    errors.push(...esppResult.errors);
  } else {
    errors.push('Sheet "ESPP" not found in workbook');
  }

  return { vests, esppPurchases, errors };
}

function parseRestrictedStock(sheet: XLSX.WorkSheet): {
  vests: RawVestEvent[];
  errors: string[];
} {
  const rows: (string | number | null)[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: null,
  });

  const vests: RawVestEvent[] = [];
  const errors: string[] = [];

  let currentGrantNumber = '';

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const recordType = String(row[0] || '').trim();

    if (recordType === 'Grant') {
      currentGrantNumber = String(row[10] || '');
      continue;
    }

    if (recordType === 'Vest Schedule') {
      const grantNumber = String(row[10] || currentGrantNumber);
      const vestPeriod = Number(row[24]) || 0;
      const vestDateRaw = String(row[25] || '');
      const vestedQty = Number(row[32]) || 0;
      const totalTaxesPaid = Number(row[37]) || 0;

      if (vestedQty === 0) continue;

      const nextRow = rows[i + 1];
      if (nextRow && String(nextRow[0] || '').trim() === 'Tax Withholding') {
        const taxDescription = String(nextRow[38] || '');
        const taxableGain = Number(nextRow[39]) || 0;

        if (taxableGain > 0) {
          const fmvPerShare = deriveFmvPerShare(taxableGain, vestedQty);
          const vestDate = parseSpreadsheetDate(vestDateRaw);

          if (vestDate) {
            vests.push({
              vestDate,
              vestedQty,
              taxableGain,
              fmvPerShare,
              grantNumber,
              vestPeriod,
              totalTaxesPaid,
              taxDescription,
            });
          } else {
            errors.push(`Could not parse vest date "${vestDateRaw}" for grant ${grantNumber} period ${vestPeriod}`);
          }
        }
      } else {
        errors.push(`No Tax Withholding row found after Vest Schedule for grant ${grantNumber} period ${vestPeriod}`);
      }
    }
  }

  return { vests, errors };
}

function parseEspp(sheet: XLSX.WorkSheet): {
  purchases: RawEsppPurchase[];
  errors: string[];
} {
  const rows: (string | number | null)[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: null,
  });

  const purchases: RawEsppPurchase[] = [];
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const recordType = String(row[0] || '').trim();

    if (recordType === 'Purchase') {
      const purchaseDateRaw = String(row[2] || '');
      const purchasePrice = Number(row[3]) || 0;
      const purchasedQty = Number(row[4]) || 0;
      const taxCollectionShares = Number(row[5]) || 0;
      const netShares = Number(row[6]) || 0;
      const discountPercentRaw = String(row[10] || '15%');
      const discountPercent = parseFloat(discountPercentRaw.replace('%', '')) || 15;
      const grantDateFmv = Number(row[11]) || 0;
      const purchaseDateFmvRaw = String(row[12] || '');
      const purchaseDateFmv = parseFloat(purchaseDateFmvRaw.replace(/[$,]/g, '')) || 0;

      const purchaseDate = parseSpreadsheetDate(purchaseDateRaw);

      if (purchaseDate && purchasePrice > 0 && purchasedQty > 0) {
        let normPrice = purchasePrice;
        let normQty = purchasedQty;
        let normTaxShares = taxCollectionShares;
        let normNetShares = netShares;
        let normGrantFmv = grantDateFmv;
        let normPurchFmv = purchaseDateFmv;

        if (isPreSplit(purchaseDate)) {
          if (!isEsppAlreadySplitAdjusted(purchaseDate, purchasePrice)) {
            normQty = purchasedQty * SPLIT_RATIO;
            normPrice = purchasePrice / SPLIT_RATIO;
            normTaxShares = taxCollectionShares * SPLIT_RATIO;
            normNetShares = netShares * SPLIT_RATIO;
            normGrantFmv = grantDateFmv / SPLIT_RATIO;
            normPurchFmv = purchaseDateFmv / SPLIT_RATIO;
          }
        }


        purchases.push({
          purchaseDate,
          purchasePrice: normPrice,
          purchasedQty: normQty,
          taxCollectionShares: normTaxShares,
          netShares: normNetShares,
          discountPercent,
          grantDateFmv: normGrantFmv,
          purchaseDateFmv: normPurchFmv,
        });
      } else {
        errors.push(`Could not parse ESPP purchase: date="${purchaseDateRaw}" price=${purchasePrice} qty=${purchasedQty}`);
      }
    }
  }

  return { purchases, errors };
}

// Handles MM/DD/YYYY, DD-MON-YYYY, and Excel serial numbers
function parseSpreadsheetDate(raw: string | number): string | null {
  if (typeof raw === 'number') {
    const date = excelSerialToDate(raw);
    return formatDate(date);
  }

  const s = String(raw).trim();
  if (!s) return null;

  const mdyMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyMatch) {
    const [, mm, dd, yyyy] = mdyMatch;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }

  const dmonMatch = s.match(/^(\d{1,2})-([A-Z]{3})-(\d{4})$/i);
  if (dmonMatch) {
    const [, dd, mon, yyyy] = dmonMatch;
    const monthNum = monthToNum(mon.toUpperCase());
    if (monthNum) {
      return `${yyyy}-${monthNum}-${dd.padStart(2, '0')}`;
    }
  }

  return null;
}

function excelSerialToDate(serial: number): Date {
  const utcDays = Math.floor(serial) - 25569;
  const date = new Date(utcDays * 86400 * 1000);
  return date;
}

function formatDate(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const MONTHS: Record<string, string> = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04',
  MAY: '05', JUN: '06', JUL: '07', AUG: '08',
  SEP: '09', OCT: '10', NOV: '11', DEC: '12',
};

function monthToNum(mon: string): string | null {
  return MONTHS[mon] || null;
}
