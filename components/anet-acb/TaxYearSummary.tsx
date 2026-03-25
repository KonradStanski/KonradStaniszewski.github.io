import type { TaxYearSummary as TaxYearSummaryType, AcbEntry } from './types';
import { exportTaxYearsToCsv, generateAuditReport } from './lib/exportUtils';
import { fmt, downloadFile } from './lib/format';

interface TaxYearSummaryProps {
  summaries: TaxYearSummaryType[];
  acbEntries: AcbEntry[];
}

export function TaxYearSummary({ summaries, acbEntries }: TaxYearSummaryProps) {
  if (summaries.length === 0) return null;

  const hasSfl = summaries.some((s) => s.totalSuperficialLossDeniedCad > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold">Tax Year Summary</h3>
          <p className="text-sm text-gray-500">
            Schedule 3, Part 3 - Publicly traded shares (ANET)
          </p>
        </div>
        <button
          onClick={() => downloadFile(exportTaxYearsToCsv(summaries), 'tax-year-summary.csv', 'text/csv')}
          className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="bg-blue-50">
              <th className="border border-blue-200 px-3 py-2 text-left">Tax Year</th>
              <th className="border border-blue-200 px-3 py-2 text-right"># Sales</th>
              <th className="border border-blue-200 px-3 py-2 text-right"># Acquisitions</th>
              <th className="border border-blue-200 px-3 py-2 text-right">
                <div>Proceeds (CAD)</div>
                <div className="text-xs font-normal text-blue-600">Line 13199</div>
              </th>
              <th className="border border-blue-200 px-3 py-2 text-right">
                <div>ACB + Expenses (CAD)</div>
                <div className="text-xs font-normal text-blue-600">Line 13200</div>
              </th>
              <th className="border border-blue-200 px-3 py-2 text-right">
                <div>Capital Gains (CAD)</div>
                <div className="text-xs font-normal text-blue-600">After SfL adjustment</div>
              </th>
              {hasSfl && (
                <th className="border border-amber-200 bg-amber-50 px-3 py-2 text-right">
                  <div>SfL Denied (CAD)</div>
                  <div className="text-xs font-normal text-amber-600">Added back to ACB</div>
                </th>
              )}
              <th className="border border-blue-200 px-3 py-2 text-right">
                <div>Taxable (50%) (CAD)</div>
                <div className="text-xs font-normal text-blue-600">Line 12700 (T1)</div>
              </th>
              <th className="border border-blue-200 px-3 py-2 text-center">Audit</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((s) => (
              <tr key={s.year} className="hover:bg-gray-50">
                <td className="border px-3 py-2 font-medium text-base">{s.year}</td>
                <td className="border px-3 py-2 text-right">{s.dispositionCount}</td>
                <td className="border px-3 py-2 text-right">{s.acquisitionCount}</td>
                <td className="border px-3 py-2 text-right">${fmt(s.totalProceedsCad)}</td>
                <td className="border px-3 py-2 text-right">
                  ${fmt(s.totalAcbOfSharesSoldCad + s.totalSellingExpensesCad)}
                </td>
                <td className={`border px-3 py-2 text-right font-semibold ${
                  s.totalCapitalGainsCad < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  ${fmt(s.totalCapitalGainsCad)}
                </td>
                {hasSfl && (
                  <td className="border border-amber-200 bg-amber-50 px-3 py-2 text-right text-amber-700 font-medium">
                    {s.totalSuperficialLossDeniedCad > 0 ? `$${fmt(s.totalSuperficialLossDeniedCad)}` : ''}
                  </td>
                )}
                <td className={`border px-3 py-2 text-right font-semibold text-base ${
                  s.totalTaxableCapitalGainsCad < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  ${fmt(s.totalTaxableCapitalGainsCad)}
                </td>
                <td className="border px-3 py-2 text-center">
                  {s.dispositionCount > 0 && (
                    <button
                      onClick={() =>
                        downloadFile(
                          generateAuditReport(s.year, acbEntries),
                          `anet-capital-gains-${s.year}-audit.txt`,
                        )
                      }
                      className="text-xs px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded transition-colors whitespace-nowrap"
                    >
                      Export Audit Report
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td className="border px-3 py-2">Total</td>
              <td className="border px-3 py-2 text-right">
                {summaries.reduce((s, y) => s + y.dispositionCount, 0)}
              </td>
              <td className="border px-3 py-2 text-right">
                {summaries.reduce((s, y) => s + y.acquisitionCount, 0)}
              </td>
              <td className="border px-3 py-2 text-right">
                ${fmt(summaries.reduce((s, y) => s + y.totalProceedsCad, 0))}
              </td>
              <td className="border px-3 py-2 text-right">
                ${fmt(summaries.reduce((s, y) => s + y.totalAcbOfSharesSoldCad + y.totalSellingExpensesCad, 0))}
              </td>
              <td className={`border px-3 py-2 text-right font-semibold ${
                summaries.reduce((s, y) => s + y.totalCapitalGainsCad, 0) < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                ${fmt(summaries.reduce((s, y) => s + y.totalCapitalGainsCad, 0))}
              </td>
              {hasSfl && (
                <td className="border border-amber-200 bg-amber-50 px-3 py-2 text-right text-amber-700 font-semibold">
                  ${fmt(summaries.reduce((s, y) => s + y.totalSuperficialLossDeniedCad, 0))}
                </td>
              )}
              <td className="border px-3 py-2 text-right">
                ${fmt(summaries.reduce((s, y) => s + y.totalTaxableCapitalGainsCad, 0))}
              </td>
              <td className="border px-3 py-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
