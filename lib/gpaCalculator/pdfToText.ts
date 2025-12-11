export const pdfToText = async (file: File): Promise<string> => {
  // Dynamically import pdfjs-dist only on client side
  const pdfjsLib = await import("pdfjs-dist");

  // Configure the worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const url = URL.createObjectURL(file);
  const pdf = await pdfjsLib.getDocument(url).promise;
  const pageList = await Promise.all(
    Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1))
  );

  const pageTextList = await Promise.all(
    pageList.map((p) => p.getTextContent())
  );

  const textStr = pageTextList
    .map(({ items }) => items.map((item: any) => item.str).join("\n"))
    .join("");
  return textStr;
};
