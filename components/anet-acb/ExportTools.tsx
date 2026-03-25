import { useState } from 'react';
import type { AcbEntry } from './types';
import { exportForAcbTool, generateTamperMonkeyScript } from './lib/exportUtils';
import { downloadFile } from './lib/format';

interface ExportToolsProps {
  acbEntries: AcbEntry[];
  years: number[];
}

export function ExportTools({ acbEntries, years }: ExportToolsProps) {
  const [expanded, setExpanded] = useState(false);
  const [scriptYear, setScriptYear] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const yearsWithSells = years.filter((y) =>
    acbEntries.some(
      (e) => e.type === 'sell' && parseInt(e.date.substring(0, 4), 10) === y,
    ),
  );

  const selectedYear = scriptYear ?? yearsWithSells[yearsWithSells.length - 1] ?? null;
  const script = selectedYear ? generateTamperMonkeyScript(acbEntries, selectedYear) : '';

  const handleCopyScript = async () => {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (acbEntries.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div>
          <h3 className="text-lg font-semibold">Export Tools</h3>
          <p className="text-sm text-gray-500">
            Download a CSV compatible with the{' '}
            <span className="font-medium">acb</span> calculator at{' '}
            <span className="font-medium">acb.ts0.ca</span> to cross-validate capital gains
            with Bank of Canada rates, or generate a TamperMonkey userscript to auto-fill
            your dispositions into WealthSimple Tax
          </p>
        </div>
        <span className="text-gray-400 text-xl">{expanded ? '\u25B2' : '\u25BC'}</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-6">
          {/* ACB Tool CSV Export */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-800">ACB Tool CSV Export</h4>
              <button
                onClick={() =>
                  downloadFile(exportForAcbTool(acbEntries), 'anet-acb-tool.csv', 'text/csv')
                }
                className="text-sm px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors"
              >
                Download CSV
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Export all transactions in a format compatible with the{' '}
              <a
                href="https://github.com/tsiemens/acb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                ACB calculator CLI
              </a>
              . You can paste this CSV into the web-hosted version at{' '}
              <a
                href="https://acb.ts0.ca/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                acb.ts0.ca
              </a>{' '}
              to cross-validate your capital gains calculations using an independent
              implementation that uses Bank of Canada exchange rates.
            </p>
            <div className="mt-2 text-sm text-gray-500">
              <p className="font-medium text-gray-600 mb-1">How to compare:</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Click &quot;Download CSV&quot; above</li>
                <li>
                  Open{' '}
                  <a
                    href="https://acb.ts0.ca/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    acb.ts0.ca
                  </a>{' '}
                  and paste the CSV contents into the input
                </li>
                <li>
                  Compare the ACB per share and capital gains values — small differences are
                  expected due to exchange rate sources (Yahoo Finance vs Bank of Canada)
                </li>
              </ol>
            </div>
          </div>

          {/* WealthSimple Tax Auto-Fill */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">
              WealthSimple Tax Auto-Fill Script
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Generate a TamperMonkey userscript that auto-fills your capital gains into
              WealthSimple Tax. This replicates the behaviour of the{' '}
              <a
                href="https://github.com/tsiemens/auto-typer/tree/main/apps/wealthsimple-tax"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                auto-typer
              </a>{' '}
              tool, but runs directly in your browser via the TamperMonkey extension — no
              Linux or sudo required.
            </p>

            {yearsWithSells.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                No sell transactions found. Upload trade confirmation PDFs to generate a script.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <label className="text-sm font-medium text-gray-700">Tax Year:</label>
                  <select
                    value={selectedYear ?? ''}
                    onChange={(e) => setScriptYear(Number(e.target.value))}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    {yearsWithSells.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <button
                    onClick={handleCopyScript}
                    className="absolute top-2 right-2 text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors z-10"
                  >
                    {copied ? 'Copied!' : 'Copy Script'}
                  </button>
                  <pre className="bg-gray-900 text-gray-300 text-xs p-4 rounded-lg overflow-x-auto max-h-64 overflow-y-auto">
                    {script}
                  </pre>
                </div>

                <div className="mt-3 text-sm text-gray-500">
                  <p className="font-medium text-gray-600 mb-1">How to use:</p>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>
                      Install the{' '}
                      <a
                        href="https://www.tampermonkey.net/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        TamperMonkey
                      </a>{' '}
                      browser extension
                    </li>
                    <li>Click &quot;Copy Script&quot; above</li>
                    <li>
                      Open TamperMonkey dashboard, click the &quot;+&quot; tab to create a new script, clear
                      the template, and paste
                    </li>
                    <li>Save the script (Ctrl+S / Cmd+S)</li>
                    <li>
                      Navigate to WealthSimple Tax, go to the Capital Gains / Losses section
                    </li>
                    <li>
                      Click into the first empty row&apos;s &quot;Type&quot; dropdown field
                    </li>
                    <li>
                      Click &quot;Start Auto-Fill&quot; on the floating panel that appears in the top-right
                    </li>
                    <li>
                      The script will fill each row automatically — you can click &quot;Stop&quot; at any
                      time
                    </li>
                  </ol>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
