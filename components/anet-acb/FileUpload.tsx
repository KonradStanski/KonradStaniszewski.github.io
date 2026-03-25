import { useCallback, useState } from 'react';

interface FileUploadProps {
  onPdfsSelected: (files: File[]) => void;
  onXlsxSelected: (file: File) => void;
  pdfCount: number;
  hasXlsx: boolean;
  parsingProgress: { parsed: number; total: number } | null;
}

export function FileUpload({
  onPdfsSelected,
  onXlsxSelected,
  pdfCount,
  hasXlsx,
  parsingProgress,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const pdfs: File[] = [];
      let xlsx: File | null = null;

      for (const file of Array.from(files)) {
        if (file.name.endsWith('.pdf')) {
          pdfs.push(file);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          xlsx = file;
        }
      }

      if (pdfs.length > 0) onPdfsSelected(pdfs);
      if (xlsx) onXlsxSelected(xlsx);
    },
    [onPdfsSelected, onXlsxSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const isParsing = parsingProgress !== null;

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => {
          if (isParsing) return;
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = true;
          input.accept = '.pdf,.xlsx,.xls';
          input.onchange = () => {
            if (input.files) handleFiles(input.files);
          };
          input.click();
        }}
      >
        <div className="text-gray-500">
          <p className="text-lg font-medium">
            Drop trade confirmation PDFs and BenefitHistory.xlsx here
          </p>
          <p className="text-sm mt-1">or click to browse</p>
        </div>
      </div>

      {isParsing && (
        <div className="flex items-center gap-3">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
          <span className="text-sm text-blue-700">
            Parsing PDFs... {parsingProgress.parsed} / {parsingProgress.total}
          </span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${(parsingProgress.parsed / parsingProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-4 text-sm text-gray-600">
        <span className={pdfCount > 0 ? 'text-green-600 font-medium' : ''}>
          {isParsing
            ? `${pdfCount} PDF${pdfCount !== 1 ? 's' : ''} parsed so far...`
            : pdfCount > 0
              ? `${pdfCount} PDF${pdfCount !== 1 ? 's' : ''} loaded`
              : 'No PDFs'}
        </span>
        <span className={hasXlsx ? 'text-green-600 font-medium' : ''}>
          {hasXlsx ? 'BenefitHistory.xlsx loaded' : 'No XLSX'}
        </span>
      </div>
    </div>
  );
}
