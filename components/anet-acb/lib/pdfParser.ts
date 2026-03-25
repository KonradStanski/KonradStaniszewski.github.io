import * as pdfjsLib from 'pdfjs-dist/webpack.mjs';
import type { RawSellTransaction } from '../types';
import { parseFormat1 } from './pdfParserFormat1';
import { parseFormat2 } from './pdfParserFormat2';

async function extractText(data: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    textParts.push(pageText);
  }

  return textParts.join('\n');
}

function detectAndParse(text: string, filename: string): RawSellTransaction | null {
  // Format 2: E*TRADE Stock Plan (2-digit year dates, "SELL" keyword)
  if (text.includes('Stock Plan') || text.includes('TRADE CONFIRMATION')) {
    const result = parseFormat2(text, filename);
    if (result) return result;
  }

  // Format 1: Morgan Stanley (4-digit year dates)
  if (text.includes('ARISTA NETWORKS') || text.includes('ANET')) {
    const result = parseFormat1(text, filename);
    if (result) return result;
  }

  return null;
}

export async function parsePdf(file: File): Promise<RawSellTransaction | null> {
  const buffer = await file.arrayBuffer();
  const text = await extractText(buffer);
  return detectAndParse(text, file.name);
}

export async function parsePdfs(
  files: File[],
  onProgress?: (parsed: number, total: number, latest: RawSellTransaction | null) => void,
): Promise<{
  transactions: RawSellTransaction[];
  errors: string[];
}> {
  const transactions: RawSellTransaction[] = [];
  const errors: string[] = [];
  let completed = 0;

  const results = await Promise.all(
    files.map(async (file) => {
      try {
        const result = await parsePdf(file);
        if (!result) {
          errors.push(`Could not parse ${file.name}: unrecognized format`);
        }
        onProgress?.(++completed, files.length, result);
        return result;
      } catch (err) {
        errors.push(`Error parsing ${file.name}: ${err instanceof Error ? err.message : String(err)}`);
        onProgress?.(++completed, files.length, null);
        return null;
      }
    }),
  );

  for (const r of results) {
    if (r) transactions.push(r);
  }

  return { transactions, errors };
}
