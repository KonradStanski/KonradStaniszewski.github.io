import type { AcbEntry } from './types';
import { Th } from './HeaderTooltip';
import { fmt } from './lib/format';

interface AcbResultsTableProps {
  entries: AcbEntry[];
  selectedYear: number | null;
}

export function AcbResultsTable({ entries, selectedYear }: AcbResultsTableProps) {
  const filtered = selectedYear
    ? entries.filter((e) => parseInt(e.date.substring(0, 4), 10) === selectedYear)
    : entries;

  if (filtered.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">
        ACB Ledger {selectedYear ? `(${selectedYear})` : '(All Years)'}
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-100">
              <Th tooltip="Transaction date: trade date for sells, vest date for RSUs, purchase date for ESPP" className="text-left">Date</Th>
              <Th tooltip="RSU = restricted stock unit vest, ESPP = employee stock purchase plan buy, SELL = disposition" className="text-left">Type</Th>
              <Th tooltip="Source document for this transaction (PDF filename or BenefitHistory.xlsx grant)" className="text-left">Source</Th>
              <Th tooltip="Number of shares acquired or sold (post-split adjusted for the 4:1 split on Dec 6, 2024)" className="text-right">Qty</Th>
              <Th tooltip="Price per share in USD as reported on the source document" className="text-right">$/Share (USD)</Th>
              <Th tooltip="Total amount in USD = qty x price per share" className="text-right">Total (USD)</Th>
              <Th tooltip="Commission + fees in USD (sell transactions only)" className="text-right">Expenses (USD)</Th>
              <Th tooltip="USD/CAD exchange rate on the transaction date from Yahoo Finance (USDCAD=X)" className="text-right">USD/CAD</Th>
              <Th tooltip="Price per share converted to CAD using the USD/CAD exchange rate on the transaction date" className="text-right">$/Share (CAD)</Th>
              <Th tooltip="For acquisitions: cost added to ACB pool in CAD. For sells: gross proceeds (principal) converted to CAD" className="text-right">Total (CAD)</Th>
              <Th tooltip="Commission + fees on sell transactions, converted to CAD using the transaction date rate. Deducted from proceeds when calculating capital gain" className="text-right">Expenses (CAD)</Th>
              <Th tooltip="Running total of ANET shares held after this transaction. Increases with vests/ESPP, decreases with sells" className="text-right">Shares Held</Th>
              <Th tooltip="Running total Adjusted Cost Base of all ANET shares held, in CAD. Increases with acquisitions, decreases proportionally with sells" className="text-right">Total ACB (CAD)</Th>
              <Th tooltip="Average cost per share in CAD = Total ACB / Shares Held. This is used to determine the cost basis when selling shares" className="text-right">ACB/Share (CAD)</Th>
              <Th tooltip="Gross sale proceeds (principal) in CAD = qty x price x USD/CAD rate. Reported on Schedule 3 Line 13199" className="text-right">Proceeds (CAD)</Th>
              <Th tooltip="Cost basis of shares sold in CAD = ACB/Share at time of sale x quantity sold. Part of Schedule 3 Line 13200" className="text-right">ACB Sold (CAD)</Th>
              <Th tooltip="Capital Gain = Proceeds - ACB Sold - Selling Expenses. A negative value is a capital loss" className="text-right">Capital Gain (CAD)</Th>
              <Th tooltip="Taxable portion = 50% of capital gain (or loss). This is the amount included in income on your T1 return, Line 12700" className="text-right">Taxable (CAD)</Th>
              <Th tooltip="CRA superficial loss rule (ITA s.40(2)(g)(i)): when identical property is acquired within 30 days before or after a sale at a loss, the loss (or a proportional portion) is denied and added back to your ACB. Formula: denied = |loss| x MIN(sold, acquired_in_window, held_at_end) / sold" className="text-center">SfL Adj. (CAD)</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => {
              const isSell = e.type === 'sell';
              const isLoss = (e.capitalGainCad ?? 0) < 0;
              const expensesUsd = e.commissionUsd + e.feeUsd;
              return (
                <tr
                  key={e.id}
                  className={`hover:bg-gray-50 ${
                    isSell
                      ? isLoss
                        ? 'bg-red-50'
                        : 'bg-green-50'
                      : ''
                  }`}
                >
                  <td className="border px-2 py-1">{e.date}</td>
                  <td className="border px-2 py-1">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                        e.type === 'vest'
                          ? 'bg-blue-100 text-blue-800'
                          : e.type === 'espp_purchase'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {e.type === 'vest' ? 'RSU' : e.type === 'espp_purchase' ? 'ESPP' : 'SELL'}
                    </span>
                  </td>
                  <td className="border px-2 py-1 text-xs max-w-[200px] truncate" title={e.source}>{e.source}</td>
                  <td className="border px-2 py-1 text-right">{e.quantity}</td>
                  <td className="border px-2 py-1 text-right">{fmt(e.pricePerShareUsd)}</td>
                  <td className="border px-2 py-1 text-right">{fmt(e.totalUsd)}</td>
                  <td className="border px-2 py-1 text-right">{expensesUsd > 0 ? fmt(expensesUsd) : ''}</td>
                  <td className="border px-2 py-1 text-right text-gray-500">{e.exchangeRate.toFixed(4)}</td>
                  <td className="border px-2 py-1 text-right">{fmt(e.pricePerShareCad)}</td>
                  <td className="border px-2 py-1 text-right">{fmt(e.totalCad)}</td>
                  <td className="border px-2 py-1 text-right">{e.sellingExpensesCad > 0 ? fmt(e.sellingExpensesCad) : ''}</td>
                  <td className="border px-2 py-1 text-right">{e.sharesHeld}</td>
                  <td className="border px-2 py-1 text-right">{fmt(e.totalAcbCad)}</td>
                  <td className="border px-2 py-1 text-right">{fmt(e.acbPerShareCad)}</td>
                  <td className="border px-2 py-1 text-right">{fmt(e.proceedsCad)}</td>
                  <td className="border px-2 py-1 text-right">{fmt(e.acbOfSharesSoldCad)}</td>
                  <td className={`border px-2 py-1 text-right font-medium ${isLoss && isSell ? 'text-red-600' : isSell ? 'text-green-600' : ''}`}>
                    {fmt(e.capitalGainCad)}
                  </td>
                  <td className="border px-2 py-1 text-right">{fmt(e.taxableCapitalGainCad)}</td>
                  <td className="border px-2 py-1 text-right">
                    {e.superficialLossFlag && e.superficialLossDeniedCad != null && (
                      <span className="text-amber-600 font-medium" title={`Raw loss: $${fmt(e.capitalGainCad! - e.superficialLossDeniedCad)}, denied: $${fmt(e.superficialLossDeniedCad)}, added back to ACB`}>
                        +{fmt(e.superficialLossDeniedCad)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
