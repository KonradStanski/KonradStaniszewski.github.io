import { Document, Page, pdfjs } from 'react-pdf';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js';
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

type pdfProps = {
  file: string;
  numPages: number;
};

const PdfViewer = (props: pdfProps): JSX.Element => {
  return (
    <div>
      <Document file={props.file} className="flex">
        {Array.from({ length: props.numPages ?? 1 }, (_, index) => (
          <Page
            className="mx-auto shadow-2xl"
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            renderAnnotationLayer={true}
            renderTextLayer={true}
          />
        ))}
      </Document>
    </div>
  );
};

export default PdfViewer;
