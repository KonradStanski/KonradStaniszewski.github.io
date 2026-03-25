export function TaxInfoPanel() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm space-y-3">
      <h3 className="font-semibold text-amber-900">Canadian Tax Reporting Reference</h3>

      <div className="space-y-2 text-amber-800">
        <div>
          <p className="font-medium">Adjusted Cost Base (ACB) - Average Cost Method</p>
          <p>
            Canada uses the average cost method for identical properties. Each acquisition (RSU vest or
            ESPP purchase) adds to your total ACB pool. Each disposition (sell) reduces the pool
            proportionally based on the average ACB per share at the time of sale.
          </p>
        </div>

        <div>
          <p className="font-medium">Capital Gains Formula</p>
          <p>Capital Gain = Proceeds of Disposition (CAD) - ACB of Shares Sold (CAD) - Selling Expenses (CAD)</p>
          <p>Taxable Capital Gain = 50% of Capital Gain</p>
        </div>

        <div>
          <p className="font-medium">Schedule 3 - Capital Gains</p>
          <ul className="list-disc ml-5 space-y-0.5">
            <li>Part 3 - Publicly traded shares, mutual fund units, etc.</li>
            <li>Line 13199 - Proceeds of disposition</li>
            <li>Line 13200 - Adjusted cost base + outlays and expenses</li>
            <li>Net gain flows to Line 12700 on T1</li>
          </ul>
        </div>

        <div>
          <p className="font-medium">RSU Employment Income</p>
          <p>
            The employment benefit at vesting (FMV at vest date) is already included on your T4
            (Box 14 / Box 38). The ACB of vested RSU shares = FMV at vest date in CAD.
          </p>
        </div>

        <div>
          <p className="font-medium">ESPP Treatment</p>
          <p>
            The discount on ESPP shares is a taxable employment benefit (reported on T4). The ACB
            of ESPP shares = the discounted purchase price you paid, in CAD.
          </p>
        </div>

        <div>
          <p className="font-medium">ANET 4:1 Stock Split (Dec 6, 2024)</p>
          <p>
            Pre-split transactions are automatically normalized: quantities multiplied by 4,
            prices divided by 4. This does not affect total dollar amounts.
          </p>
        </div>

        <div>
          <p className="font-medium">Superficial Loss Rule</p>
          <p>
            A capital loss may be denied if you acquire the same stock within 30 days before or
            after the disposition and still hold it. Flagged with &quot;!&quot; but not auto-adjusted.
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-amber-200">
        <p className="font-medium text-amber-900">Data Sources</p>
        <ul className="list-disc ml-5 text-amber-800 space-y-1">
          <li>
            Trade Confirmations (PDFs):{' '}
            <a
              href="https://us.etrade.com/etx/pxy/accountdocs"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-amber-600"
            >
              E*TRADE Documents
            </a>
          </li>
          <li>
            BenefitHistory.xlsx:{' '}
            <a
              href="https://us.etrade.com/etx/sp/stockplan#/myAccount/benefitHistory"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-amber-600"
            >
              E*TRADE Benefit History
            </a>
          </li>
        </ul>
      </div>

      <p className="text-xs text-amber-600 italic">
        This tool is for informational purposes only. Consult a tax professional for your specific situation.
        All processing happens in your browser - no data leaves your machine.
      </p>
    </div>
  );
}
