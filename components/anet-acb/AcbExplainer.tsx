export function AcbExplainer() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-sm space-y-3">
      <h3 className="font-semibold text-slate-800 text-base">How ACB is Calculated</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-slate-700">
        <div className="space-y-2">
          <div>
            <p className="font-medium text-slate-900">1. Acquisitions add to your ACB pool</p>
            <p>
              When RSU shares vest, their <strong>Fair Market Value (FMV)</strong> at vest date
              (in CAD) is added to your ACB. For ESPP, the <strong>discounted purchase price</strong> you
              actually paid (in CAD) is your ACB.
            </p>
          </div>

          <div>
            <p className="font-medium text-slate-900">2. Average cost per share</p>
            <p>
              ACB per share = Total ACB / Total shares held. Canada uses the{' '}
              <strong>average cost method</strong> for identical properties - all ANET shares
              (RSU + ESPP) go into one pool.
            </p>
          </div>

          <div>
            <p className="font-medium text-slate-900">3. Dispositions reduce proportionally</p>
            <p>
              When you sell, the ACB of shares sold = ACB per share x quantity sold.
              The remaining pool&apos;s per-share ACB stays the same.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="bg-white border border-slate-200 rounded p-3 font-mono text-xs space-y-1">
            <p className="font-semibold text-slate-900 font-sans text-sm">Capital Gain Formula</p>
            <p>Proceeds&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= Gross sale amount (CAD)</p>
            <p>ACB Sold&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= ACB/share x qty sold (CAD)</p>
            <p>Expenses&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= Commission + fees (CAD)</p>
            <p className="border-t border-slate-200 pt-1 font-semibold">
              Capital Gain = Proceeds - ACB Sold - Expenses
            </p>
            <p className="font-semibold text-green-700">
              Taxable&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= 50% of Capital Gain
            </p>
          </div>

          <div>
            <p className="font-medium text-slate-900">USD to CAD conversion</p>
            <p>
              All amounts are converted using the USD/CAD exchange rate on the
              transaction date from the <strong>Bank of Canada Valet API</strong> (CRA-compliant).
              If the rate isn&apos;t available for the exact date (weekends/holidays),
              the most recent prior business day is used (up to 7 days back, per ITA s.261(1.4)).
              Rates can be manually overridden.
            </p>
          </div>

          <div>
            <p className="font-medium text-slate-900">Stock split handling</p>
            <p>
              ANET&apos;s 4:1 split (Dec 6, 2024) is automatically normalized:
              pre-split quantities &times;4, prices &divide;4.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded p-4 mt-2">
        <p className="font-semibold text-amber-900 text-sm mb-2">Superficial Loss Rule (ITA s.40(2)(g)(i))</p>
        <div className="text-slate-700 space-y-2">
          <p>
            When you sell shares at a loss and acquire identical shares within a <strong>61-day
            window</strong> (30 days before to 30 days after the settlement date), the CRA may deny
            all or part of the capital loss. This prevents &quot;wash sale&quot; tax loss harvesting.
          </p>
          <p>
            The denied portion is calculated as:
          </p>
          <div className="bg-white border border-amber-200 rounded p-2 font-mono text-xs">
            <p>denied = |loss| &times; MIN(shares_sold, shares_acquired_in_window, shares_held_at_end) / shares_sold</p>
          </div>
          <p>
            The denied amount is <strong>not lost</strong> — it is added back to the ACB of the remaining
            shares, increasing your cost base and reducing future capital gains. Transactions
            affected by this rule show the denied amount in the <strong>SfL Adj.</strong> column of the ACB ledger.
          </p>
          <p className="text-xs text-amber-700">
            Reference: CRA IT-259R4, Income Tax Act s.40(2)(g)(i). Window uses settlement dates per CRA guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
