import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

/**
 * This function takes in a pdf file and returns a newline separated string of the text contents
 * It does not differentiate between pages, altho you could easily modify it to allow for sending an array
 * of pages of text
 *
 * @param {File} file the pdf file to parse
 * @return {*}  {Promise<string>} a promise that returns a string once the worker is done processing the pdf file
 */
export const pdfToText = async (file: File): Promise<string> => {
    const url = URL.createObjectURL(file);
    const pdf = await pdfjs.getDocument(url).promise;
    const pageList = await Promise.all(Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1)));

    const pageTextList = await Promise.all(pageList.map((p) => p.getTextContent()));

    const textStr = await pageTextList.map(({ items }) => items.map(({ str }) => str).join("\n")).join("");
    return textStr;
};
