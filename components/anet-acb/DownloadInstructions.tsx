import { useState } from 'react';

interface DownloadInstructionsProps {
  etradeDownloadScript: string;
}

export function DownloadInstructions({ etradeDownloadScript }: DownloadInstructionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(etradeDownloadScript);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 text-sm space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-base">How to Download Your Data from E*TRADE</h3>
          <p className="text-gray-500 mt-1">
            This workflow now uses PDFs only: trade confirmations for sells, plus stock plan
            confirmations for RSU releases and ESPP purchases.
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 px-3 py-1.5 text-sm bg-gray-900 hover:bg-gray-800 text-white rounded transition-colors"
        >
          {copied ? 'Copied Script' : 'Copy Tampermonkey Script'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800 space-y-1">
        <p>
          The copied script is self-contained. Paste it into a new Tampermonkey script and save it.
        </p>
        <p>
          The toolbar works on both E*TRADE pages. Wait for each page to finish loading before you
          press <strong className="mx-1">Prepare</strong>, then wait for Prepare to finish before you
          press <strong className="mx-1">Download All PDFs</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">1. Install the Script</h4>
          <ol className="list-decimal ml-5 space-y-1 text-gray-600">
            <li>
              Install{' '}
              <a
                href="https://www.tampermonkey.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Tampermonkey
              </a>{' '}
              if you do not already have it
            </li>
            <li>Click <strong>Copy Tampermonkey Script</strong> above</li>
            <li>Create a new Tampermonkey script, replace the template, paste, and save</li>
            <li>Reload any open E*TRADE tabs after saving the script</li>
            <li>
              Confirm the toolbar appears at the top of the page with the current version number
            </li>
            <li>If your browser prompts about multiple downloads, allow them for <code>us.etrade.com</code></li>
          </ol>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">
            2. Stock Plan Page
          </h4>
          <ol className="list-decimal ml-5 space-y-1 text-gray-600">
            <li>
              Open{' '}
              <a
                href="https://us.etrade.com/etx/sp/stockplan?accountIndex=1&traxui=tsp_accountshome#/myAccount/stockPlanConfirmations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Stock Plan Confirmations
              </a>
            </li>
            <li>Wait for the page, filters, and table to fully load before clicking anything</li>
            <li>Use the toolbar page buttons if you need to jump to the correct page</li>
            <li>Click <strong>Prepare</strong></li>
            <li>
              Wait for the toolbar status to finish applying filters and loading all visible rows
            </li>
            <li>Click <strong>Download All PDFs</strong></li>
            <li>Wait for all downloads to finish before switching tabs or interacting with the page</li>
            <li>These PDFs cover RSU releases and ESPP purchases</li>
          </ol>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">
            3. Trade Docs Page
          </h4>
          <ol className="list-decimal ml-5 space-y-1 text-gray-600">
            <li>
              Open{' '}
              <a
                href="https://us.etrade.com/etx/pxy/accountdocs#/documents"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                E*TRADE Documents
              </a>
            </li>
            <li>Wait for the page, filters, and any fullscreen spinner to fully clear</li>
            <li>Use the toolbar page buttons if you need to jump to the correct page</li>
            <li>Click <strong>Prepare</strong></li>
            <li>
              Wait for the toolbar to set the ANET stock plan account, choose Trade Confirmations,
              and confirm the available timeframes
            </li>
            <li>Click <strong>Download All PDFs</strong></li>
            <li>
              Let it work through <strong>Year To Date</strong> and each prior year without
              clicking around on the page
            </li>
            <li>These PDFs cover your sell transactions / trade confirmations</li>
          </ol>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-800">4. Upload into This Page</h4>
        <ol className="list-decimal ml-5 space-y-1 text-gray-600">
          <li>Download from both E*TRADE pages</li>
          <li>Keep all PDFs, including same-day files with suffixes like <code>(1)</code> or <code>(2)</code></li>
          <li>Drag all PDFs into the upload box below</li>
          <li>
            The parser will combine trade confirmations with stock plan confirmations to build the
            ACB ledger
          </li>
        </ol>
      </div>

      <p className="text-xs text-gray-400">
        All processing happens locally in your browser. No data is uploaded or sent anywhere.
      </p>
    </div>
  );
}
