import * as pdfjsLib from 'pdfjs-dist/webpack.mjs';

interface TextItemLike {
  str: string;
  hasEOL?: boolean;
  transform?: number[];
}

function isTextItem(item: unknown): item is TextItemLike {
  return typeof item === 'object' && item !== null && 'str' in item;
}

export interface ExtractedPdfText {
  text: string;
  lines: string[];
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function flushLine(target: string[], parts: string[]) {
  const line = cleanText(parts.join(' '));
  if (line) {
    target.push(line);
  }
  parts.length = 0;
}

function extractLinesFromItems(items: TextItemLike[]): string[] {
  const lines: string[] = [];
  const current: string[] = [];

  for (const item of items) {
    const text = cleanText(item.str || '');
    if (text) {
      current.push(text);
    }

    if (item.hasEOL) {
      flushLine(lines, current);
    }
  }

  flushLine(lines, current);

  if (lines.length > 0) {
    return lines;
  }

  return extractLinesByPosition(items);
}

function extractLinesByPosition(items: TextItemLike[]): string[] {
  const positioned = items
    .filter((item) => cleanText(item.str).length > 0 && Array.isArray(item.transform))
    .map((item) => ({
      text: cleanText(item.str),
      x: item.transform?.[4] ?? 0,
      y: item.transform?.[5] ?? 0,
    }))
    .sort((a, b) => {
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > 2) return yDiff;
      return a.x - b.x;
    });

  const grouped: { y: number; parts: { x: number; text: string }[] }[] = [];

  for (const item of positioned) {
    const bucket = grouped.find((line) => Math.abs(line.y - item.y) <= 2);
    if (bucket) {
      bucket.parts.push({ x: item.x, text: item.text });
    } else {
      grouped.push({ y: item.y, parts: [{ x: item.x, text: item.text }] });
    }
  }

  return grouped
    .sort((a, b) => b.y - a.y)
    .map((line) =>
      cleanText(
        line.parts
          .sort((a, b) => a.x - b.x)
          .map((part) => part.text)
          .join(' '),
      ),
    )
    .filter(Boolean);
}

export async function extractPdfText(data: ArrayBuffer): Promise<ExtractedPdfText> {
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const lines: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageItems = content.items.filter(isTextItem) as TextItemLike[];
    const pageLines = extractLinesFromItems(pageItems);

    if (lines.length > 0 && pageLines.length > 0) {
      lines.push('');
    }
    lines.push(...pageLines);
  }

  return {
    lines,
    text: lines.filter(Boolean).join('\n'),
  };
}
