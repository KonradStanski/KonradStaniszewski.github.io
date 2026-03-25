export function DownloadInstructions() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 text-sm space-y-4">
      <h3 className="font-semibold text-gray-900 text-base">How to Download Your Data from E*TRADE</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">
            Trade Confirmation PDFs (sell transactions)
          </h4>
          <ol className="list-decimal ml-5 space-y-1 text-gray-600">
            <li>
              Go to{' '}
              <a
                href="https://us.etrade.com/etx/pxy/accountdocs#/documents"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                E*TRADE Documents
              </a>
            </li>
            <li>Select your Stock Plan account</li>
            <li>Filter by &quot;Trade Confirmations&quot;</li>
            <li>
              <strong>Bulk download:</strong> Select all confirmations using the checkbox at the top,
              then click &quot;Download&quot; to get a ZIP of all PDFs
            </li>
            <li>Unzip and drop all PDF files here</li>
          </ol>
          <div className="bg-amber-50 border border-amber-200 rounded p-2 mt-2 text-xs text-amber-800">
            <strong>Warning:</strong> E*Trade has a 12-file download limit per batch. Trades from
            the same day share the same filename prefix (with _1, _2, etc. suffixes). If you split
            downloads across multiple batches, same-day files may overwrite each other. Verify you
            have one PDF per sell order — check the count against your order history.
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">
            BenefitHistory.xlsx (vest & ESPP data)
          </h4>
          <ol className="list-decimal ml-5 space-y-1 text-gray-600">
            <li>
              Go to{' '}
              <a
                href="https://us.etrade.com/etx/sp/stockplan#/myAccount/benefitHistory"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                E*TRADE Benefit History
              </a>
            </li>
            <li>
              Click the <strong>+</strong> button next to each RSU grant and ESPP entry to
              expand all sections
            </li>
            <li>
              Once all sections are expanded, click{' '}
              <strong>&quot;Download All Expanded&quot;</strong> to export as XLSX
            </li>
            <li>Drop the downloaded BenefitHistory.xlsx file here</li>
          </ol>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        All processing happens locally in your browser. No data is uploaded or sent anywhere.
      </p>
    </div>
  );
}
