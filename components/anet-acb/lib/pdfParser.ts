import type { RawEsppPurchase, RawSellTransaction, RawVestEvent } from '../types';
import { parseBenefitHistoryPdf } from './benefitPdfParser';
import { extractPdfText, type ExtractedPdfText } from './pdfText';
import { parseFormat1 } from './pdfParserFormat1';
import { parseFormat2 } from './pdfParserFormat2';

type ParsedPdfDocument =
  | { kind: 'sell'; value: RawSellTransaction }
  | { kind: 'vest'; value: RawVestEvent }
  | { kind: 'espp_purchase'; value: RawEsppPurchase };

function detectAndParse(extracted: ExtractedPdfText, filename: string): ParsedPdfDocument | null {
  const benefitDocument = parseBenefitHistoryPdf(extracted, filename);
  if (benefitDocument) {
    return benefitDocument;
  }

  const { text } = extracted;

  // Format 2: E*TRADE Stock Plan (2-digit year dates, "SELL" keyword)
  if (text.includes('Stock Plan') || text.includes('TRADE CONFIRMATION')) {
    const result = parseFormat2(text, filename);
    if (result) return { kind: 'sell', value: result };
  }

  // Format 1: Morgan Stanley (4-digit year dates)
  if (text.includes('ARISTA NETWORKS') || text.includes('ANET')) {
    const result = parseFormat1(text, filename);
    if (result) return { kind: 'sell', value: result };
  }

  return null;
}

export async function parsePdf(file: File): Promise<ParsedPdfDocument | null> {
  const buffer = await file.arrayBuffer();
  const extracted = await extractPdfText(buffer);
  return detectAndParse(extracted, file.name);
}

function assignVestPeriods(vests: RawVestEvent[]): RawVestEvent[] {
  const counts = new Map<string, number>();

  return [...vests]
    .sort((a, b) => {
      const grantCompare = a.grantNumber.localeCompare(b.grantNumber);
      if (grantCompare !== 0) return grantCompare;
      const dateCompare = a.vestDate.localeCompare(b.vestDate);
      if (dateCompare !== 0) return dateCompare;
      return a.source.localeCompare(b.source);
    })
    .map((vest) => {
      const nextPeriod = (counts.get(vest.grantNumber) ?? 0) + 1;
      counts.set(vest.grantNumber, nextPeriod);
      return {
        ...vest,
        vestPeriod: nextPeriod,
      };
    });
}

export async function parsePdfs(
  files: File[],
  onProgress?: (parsed: number, total: number) => void,
): Promise<{
  sells: RawSellTransaction[];
  vests: RawVestEvent[];
  esppPurchases: RawEsppPurchase[];
  errors: string[];
}> {
  const sells: RawSellTransaction[] = [];
  const vests: RawVestEvent[] = [];
  const esppPurchases: RawEsppPurchase[] = [];
  const errors: string[] = [];
  let completed = 0;

  const results = await Promise.all(
    files.map(async (file) => {
      try {
        const result = await parsePdf(file);
        if (!result) {
          errors.push(`Could not parse ${file.name}: unrecognized format`);
        }
        onProgress?.(++completed, files.length);
        return result;
      } catch (err) {
        errors.push(`Error parsing ${file.name}: ${err instanceof Error ? err.message : String(err)}`);
        onProgress?.(++completed, files.length);
        return null;
      }
    }),
  );

  for (const r of results) {
    if (!r) continue;
    if (r.kind === 'sell') {
      sells.push(r.value);
    } else if (r.kind === 'vest') {
      vests.push(r.value);
    } else {
      esppPurchases.push(r.value);
    }
  }

  return {
    sells,
    vests: assignVestPeriods(vests),
    esppPurchases,
    errors,
  };
}
