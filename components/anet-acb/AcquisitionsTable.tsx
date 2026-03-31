import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { RawVestEvent, RawEsppPurchase, ExchangeRateCache, NormalizedTransaction } from './types';
import { fmt } from './lib/format';

interface AcquisitionsTableProps {
  vests: RawVestEvent[];
  esppPurchases: RawEsppPurchase[];
  exchangeRates: ExchangeRateCache;
  normalizedTransactions: NormalizedTransaction[];
}

const GRANT_COLORS: Record<string, string> = {};
const PALETTE = [
  '#3b82f6', '#8b5cf6', '#22c55e', '#f97316', '#ef4444',
  '#06b6d4', '#ec4899', '#eab308', '#14b8a6', '#6366f1',
];

function getGrantColor(grant: string): string {
  if (!GRANT_COLORS[grant]) {
    GRANT_COLORS[grant] = PALETTE[Object.keys(GRANT_COLORS).length % PALETTE.length];
  }
  return GRANT_COLORS[grant];
}

export function AcquisitionsTable({ vests, esppPurchases, exchangeRates, normalizedTransactions }: AcquisitionsTableProps) {
  if (vests.length === 0 && esppPurchases.length === 0) return null;

  const sortedVests = [...vests].sort((a, b) => a.vestDate.localeCompare(b.vestDate));
  const sortedEspp = [...esppPurchases].sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));

  const totalSharesSold = normalizedTransactions
    .filter((tx) => tx.type === 'sell')
    .reduce((s, tx) => s + tx.quantity, 0);

  const grantNumbers = [...new Set(sortedVests.map((v) => v.grantNumber))].sort();

  const vestByDate: Record<string, Record<string, number>> = {};
  const vestDetailByDate: Record<string, { grant: string; qty: number; fmv: number; period: number; totalUsd: number; totalCad: number | null }[]> = {};

  for (const v of sortedVests) {
    const totalUsd = v.fmvPerShare * v.vestedQty;
    const rate = exchangeRates[v.vestDate];
    if (!vestByDate[v.vestDate]) vestByDate[v.vestDate] = {};
    vestByDate[v.vestDate][v.grantNumber] = (vestByDate[v.vestDate][v.grantNumber] || 0) + totalUsd;
    if (!vestDetailByDate[v.vestDate]) vestDetailByDate[v.vestDate] = [];
    vestDetailByDate[v.vestDate].push({
      grant: v.grantNumber,
      qty: v.vestedQty,
      fmv: v.fmvPerShare,
      period: v.vestPeriod,
      totalUsd,
      totalCad: rate ? totalUsd * rate : null,
    });
  }

  const vestChartData = Object.keys(vestByDate)
    .sort()
    .map((date) => ({
      date,
      ...vestByDate[date],
    }));

  const esppChartData = sortedEspp.map((p) => {
    const rate = exchangeRates[p.purchaseDate];
    const totalUsd = p.purchasePrice * p.purchasedQty;
    return {
      label: p.purchaseDate,
      qty: p.purchasedQty,
      price: p.purchasePrice,
      totalUsd,
      totalCad: rate ? totalUsd * rate : null,
      fmv: p.purchaseDateFmv,
      marketValueUsd: p.purchaseDateFmv * p.purchasedQty,
      discount: p.discountPercent,
    };
  });

  const grantSummaries = grantNumbers.map((grant) => {
    const grantVests = sortedVests.filter((v) => v.grantNumber === grant);
    const totalQty = grantVests.reduce((s, v) => s + v.vestedQty, 0);
    const totalUsd = grantVests.reduce((s, v) => s + v.fmvPerShare * v.vestedQty, 0);
    const totalCad = grantVests.reduce((s, v) => {
      const r = exchangeRates[v.vestDate];
      return s + (r ? v.fmvPerShare * v.vestedQty * r : 0);
    }, 0);
    const dateRange = grantVests.length > 0
      ? `${grantVests[0].vestDate} to ${grantVests[grantVests.length - 1].vestDate}`
      : '';
    return { grant, totalQty, totalUsd, totalCad, periods: grantVests.length, dateRange };
  });

  const esppTotalPurchased = sortedEspp.reduce((s, p) => s + p.purchasedQty, 0);
  const rsuTotalVested = grantSummaries.reduce((s, g) => s + g.totalQty, 0);
  const totalAcquired = rsuTotalVested + esppTotalPurchased;
  const currentHolding = totalAcquired - totalSharesSold;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Acquisitions (from stock plan confirmation PDFs)</h3>

      {(sortedVests.length > 0 || sortedEspp.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-md font-semibold mb-3">Share Holdings Summary</h4>
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse">
              <thead>
                <tr className="bg-blue-100">
                  <th className="border border-blue-200 px-3 py-1.5 text-left">Source</th>
                  <th className="border border-blue-200 px-3 py-1.5 text-left">Date Range</th>
                  <th className="border border-blue-200 px-3 py-1.5 text-right">Periods</th>
                  <th className="border border-blue-200 px-3 py-1.5 text-right">Shares Acquired</th>
                  <th className="border border-blue-200 px-3 py-1.5 text-right">Total (USD)</th>
                  <th className="border border-blue-200 px-3 py-1.5 text-right">Total (CAD)</th>
                </tr>
              </thead>
              <tbody>
                {grantSummaries.map((gs) => (
                  <tr key={gs.grant}>
                    <td className="border border-blue-200 px-3 py-1.5">
                      <span style={{ color: getGrantColor(gs.grant) }} className="font-medium">RSU {gs.grant}</span>
                    </td>
                    <td className="border border-blue-200 px-3 py-1.5 text-gray-500 text-xs">{gs.dateRange}</td>
                    <td className="border border-blue-200 px-3 py-1.5 text-right">{gs.periods}</td>
                    <td className="border border-blue-200 px-3 py-1.5 text-right">{gs.totalQty}</td>
                    <td className="border border-blue-200 px-3 py-1.5 text-right">${fmt(gs.totalUsd)}</td>
                    <td className="border border-blue-200 px-3 py-1.5 text-right">${fmt(gs.totalCad)}</td>
                  </tr>
                ))}
                {sortedEspp.length > 0 && (
                  <tr>
                    <td className="border border-blue-200 px-3 py-1.5">
                      <span className="font-medium text-purple-600">ESPP</span>
                    </td>
                    <td className="border border-blue-200 px-3 py-1.5 text-gray-500 text-xs">
                      {sortedEspp[0].purchaseDate} to {sortedEspp[sortedEspp.length - 1].purchaseDate}
                    </td>
                    <td className="border border-blue-200 px-3 py-1.5 text-right">{sortedEspp.length}</td>
                    <td className="border border-blue-200 px-3 py-1.5 text-right">{esppTotalPurchased}</td>
                    <td className="border border-blue-200 px-3 py-1.5 text-right">
                      ${fmt(sortedEspp.reduce((s, p) => s + p.purchasePrice * p.purchasedQty, 0))}
                    </td>
                    <td className="border border-blue-200 px-3 py-1.5 text-right">
                      ${fmt(sortedEspp.reduce((s, p) => {
                        const r = exchangeRates[p.purchaseDate];
                        return s + (r ? p.purchasePrice * p.purchasedQty * r : 0);
                      }, 0))}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-blue-100 font-semibold">
                  <td className="border border-blue-200 px-3 py-1.5" colSpan={3}>Total Acquired</td>
                  <td className="border border-blue-200 px-3 py-1.5 text-right">{totalAcquired}</td>
                  <td className="border border-blue-200 px-3 py-1.5" colSpan={2}></td>
                </tr>
                <tr className="font-semibold">
                  <td className="border border-blue-200 px-3 py-1.5" colSpan={3}>Total Sold (from PDFs)</td>
                  <td className="border border-blue-200 px-3 py-1.5 text-right text-red-600">-{totalSharesSold}</td>
                  <td className="border border-blue-200 px-3 py-1.5" colSpan={2}></td>
                </tr>
                <tr className="font-bold text-lg bg-blue-100">
                  <td className="border border-blue-200 px-3 py-2" colSpan={3}>Estimated Current Holdings</td>
                  <td className="border border-blue-200 px-3 py-2 text-right">{currentHolding}</td>
                  <td className="border border-blue-200 px-3 py-2" colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {sortedVests.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-medium">RSU Vests ({sortedVests.length} events across {grantNumbers.length} grants)</h4>

          <div className="bg-gray-50 rounded p-3">
            <p className="text-sm text-gray-500 mb-2">RSU Vest Value by Date (Stacked by Grant)</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vestChartData} margin={{ bottom: 50, left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9 }}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  dy={10}
                />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length || !label) return null;
                    const details = vestDetailByDate[label as string] || [];
                    return (
                      <div className="bg-white border rounded shadow-lg p-2 text-xs max-w-xs">
                        <p className="font-medium mb-1">{label}</p>
                        {details.map((d, i) => (
                          <div key={i} className="mb-1 pl-2 border-l-2" style={{ borderColor: getGrantColor(d.grant) }}>
                            <p className="font-medium">{d.grant} Period {d.period}</p>
                            <p>{d.qty} shares @ ${d.fmv.toFixed(2)} USD = ${fmt(d.totalUsd)} USD</p>
                            {d.totalCad != null && <p className="text-gray-500">${fmt(d.totalCad)} CAD</p>}
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend />
                {grantNumbers.map((grant) => (
                  <Bar
                    key={grant}
                    dataKey={grant}
                    name={grant}
                    stackId="vests"
                    fill={getGrantColor(grant)}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-2 text-left">Vest Date</th>
                  <th className="border px-3 py-2 text-left">Grant</th>
                  <th className="border px-3 py-2 text-left">Source</th>
                  <th className="border px-3 py-2 text-right">Period</th>
                  <th className="border px-3 py-2 text-right">Qty</th>
                  <th className="border px-3 py-2 text-right">FMV/Share (USD)</th>
                  <th className="border px-3 py-2 text-right">Total (USD)</th>
                  <th className="border px-3 py-2 text-right">USD/CAD Rate</th>
                  <th className="border px-3 py-2 text-right">FMV/Share (CAD)</th>
                  <th className="border px-3 py-2 text-right">Total (CAD)</th>
                  <th className="border px-3 py-2 text-right">Taxes Paid (USD)</th>
                </tr>
              </thead>
              <tbody>
                {sortedVests.map((v, i) => {
                  const rate = exchangeRates[v.vestDate];
                  const totalUsd = v.fmvPerShare * v.vestedQty;
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border px-3 py-1.5">{v.vestDate}</td>
                      <td className="border px-3 py-1.5">
                        <span style={{ color: getGrantColor(v.grantNumber) }} className="font-medium">
                          {v.grantNumber}
                        </span>
                      </td>
                      <td className="border px-3 py-1.5 text-xs">{v.source}</td>
                      <td className="border px-3 py-1.5 text-right">{v.vestPeriod}</td>
                      <td className="border px-3 py-1.5 text-right">{v.vestedQty}</td>
                      <td className="border px-3 py-1.5 text-right">${v.fmvPerShare.toFixed(2)}</td>
                      <td className="border px-3 py-1.5 text-right">${fmt(totalUsd)}</td>
                      <td className="border px-3 py-1.5 text-right text-gray-500">
                        {rate ? rate.toFixed(4) : <span className="text-red-500">?</span>}
                      </td>
                      <td className="border px-3 py-1.5 text-right">
                        {rate ? `$${(v.fmvPerShare * rate).toFixed(2)}` : '-'}
                      </td>
                      <td className="border px-3 py-1.5 text-right font-medium">
                        {rate ? `$${fmt(totalUsd * rate)}` : '-'}
                      </td>
                      <td className="border px-3 py-1.5 text-right">${fmt(v.totalTaxesPaid)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-medium">
                  <td className="border px-3 py-1.5" colSpan={4}>Totals</td>
                  <td className="border px-3 py-1.5 text-right">
                    {sortedVests.reduce((s, v) => s + v.vestedQty, 0)}
                  </td>
                  <td className="border px-3 py-1.5"></td>
                  <td className="border px-3 py-1.5 text-right">
                    ${fmt(sortedVests.reduce((s, v) => s + v.fmvPerShare * v.vestedQty, 0))}
                  </td>
                  <td className="border px-3 py-1.5" colSpan={2}></td>
                  <td className="border px-3 py-1.5 text-right font-medium">
                    ${fmt(
                      sortedVests.reduce((s, v) => {
                        const r = exchangeRates[v.vestDate];
                        return s + (r ? v.fmvPerShare * v.vestedQty * r : 0);
                      }, 0),
                    )}
                  </td>
                  <td className="border px-3 py-1.5 text-right">
                    ${fmt(sortedVests.reduce((s, v) => s + v.totalTaxesPaid, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {sortedEspp.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-medium">ESPP Purchases ({sortedEspp.length})</h4>

          <div className="bg-gray-50 rounded p-3">
            <p className="text-sm text-gray-500 mb-2">ESPP Purchase Cost vs Market Value (USD)</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={esppChartData} margin={{ bottom: 50, left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9 }}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  dy={10}
                />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border rounded shadow-lg p-2 text-xs">
                        <p className="font-medium">{d.label}</p>
                        <p>{d.qty} shares @ ${d.price.toFixed(4)} USD/share ({d.discount}% discount)</p>
                        <p>Purchase cost: ${fmt(d.totalUsd)} USD</p>
                        <p>Market value: ${fmt(d.marketValueUsd)} USD</p>
                        <p>Discount saved: ${fmt(d.marketValueUsd - d.totalUsd)} USD</p>
                        {d.totalCad != null && <p>Purchase cost: ${fmt(d.totalCad)} CAD</p>}
                      </div>
                    );
                  }}
                />
                <Legend />
                <Bar dataKey="totalUsd" name="Purchase Cost (USD)" fill="#8b5cf6" />
                <Bar dataKey="marketValueUsd" name="Market Value (USD)" fill="#c4b5fd" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-2 text-left">Purchase Date</th>
                  <th className="border px-3 py-2 text-left">Source</th>
                  <th className="border px-3 py-2 text-right">Qty</th>
                  <th className="border px-3 py-2 text-right">Price (USD)</th>
                  <th className="border px-3 py-2 text-right">Total Cost (USD)</th>
                  <th className="border px-3 py-2 text-right">FMV/Share (USD)</th>
                  <th className="border px-3 py-2 text-right">Discount</th>
                  <th className="border px-3 py-2 text-right">USD/CAD Rate</th>
                  <th className="border px-3 py-2 text-right">Price (CAD)</th>
                  <th className="border px-3 py-2 text-right">Total Cost (CAD)</th>
                  <th className="border px-3 py-2 text-right">Tax Shares</th>
                  <th className="border px-3 py-2 text-right">Net Shares</th>
                </tr>
              </thead>
              <tbody>
                {sortedEspp.map((p, i) => {
                  const rate = exchangeRates[p.purchaseDate];
                  const totalUsd = p.purchasePrice * p.purchasedQty;
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border px-3 py-1.5">{p.purchaseDate}</td>
                      <td className="border px-3 py-1.5 text-xs">{p.source}</td>
                      <td className="border px-3 py-1.5 text-right">{p.purchasedQty}</td>
                      <td className="border px-3 py-1.5 text-right">${p.purchasePrice.toFixed(4)}</td>
                      <td className="border px-3 py-1.5 text-right">${fmt(totalUsd)}</td>
                      <td className="border px-3 py-1.5 text-right">${p.purchaseDateFmv.toFixed(2)}</td>
                      <td className="border px-3 py-1.5 text-right">{p.discountPercent}%</td>
                      <td className="border px-3 py-1.5 text-right text-gray-500">
                        {rate ? rate.toFixed(4) : <span className="text-red-500">?</span>}
                      </td>
                      <td className="border px-3 py-1.5 text-right">
                        {rate ? `$${(p.purchasePrice * rate).toFixed(4)}` : '-'}
                      </td>
                      <td className="border px-3 py-1.5 text-right font-medium">
                        {rate ? `$${fmt(totalUsd * rate)}` : '-'}
                      </td>
                      <td className="border px-3 py-1.5 text-right">{p.taxCollectionShares}</td>
                      <td className="border px-3 py-1.5 text-right">{p.netShares}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-medium">
                  <td className="border px-3 py-1.5" colSpan={2}>Totals</td>
                  <td className="border px-3 py-1.5 text-right">
                    {sortedEspp.reduce((s, p) => s + p.purchasedQty, 0)}
                  </td>
                  <td className="border px-3 py-1.5"></td>
                  <td className="border px-3 py-1.5 text-right">
                    ${fmt(sortedEspp.reduce((s, p) => s + p.purchasePrice * p.purchasedQty, 0))}
                  </td>
                  <td className="border px-3 py-1.5" colSpan={2}></td>
                  <td className="border px-3 py-1.5"></td>
                  <td className="border px-3 py-1.5"></td>
                  <td className="border px-3 py-1.5 text-right font-medium">
                    ${fmt(
                      sortedEspp.reduce((s, p) => {
                        const rate = exchangeRates[p.purchaseDate];
                        return s + (rate ? p.purchasePrice * p.purchasedQty * rate : 0);
                      }, 0),
                    )}
                  </td>
                  <td className="border px-3 py-1.5 text-right">
                    {sortedEspp.reduce((s, p) => s + p.taxCollectionShares, 0)}
                  </td>
                  <td className="border px-3 py-1.5 text-right">
                    {sortedEspp.reduce((s, p) => s + p.netShares, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
