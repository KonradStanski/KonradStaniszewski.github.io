import type { RawSellTransaction, ExchangeRateCache } from './types';
import { isPreSplit, normalizeQuantity, normalizePrice } from './lib/stockSplit';
import { fmt } from './lib/format';

interface DispositionsTableProps {
  sells: RawSellTransaction[];
  exchangeRates: ExchangeRateCache;
}

export function DispositionsTable({ sells, exchangeRates }: DispositionsTableProps) {
  if (sells.length === 0) return null;

  const sorted = [...sells].sort((a, b) => a.tradeDate.localeCompare(b.tradeDate));

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">
        Dispositions from PDFs ({sells.length})
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-2 text-left">Trade Date</th>
              <th className="border px-2 py-2 text-left">Type</th>
              <th className="border px-2 py-2 text-right">Qty</th>
              <th className="border px-2 py-2 text-right">Price (USD)</th>
              <th className="border px-2 py-2 text-right">Principal (USD)</th>
              <th className="border px-2 py-2 text-right">Comm. (USD)</th>
              <th className="border px-2 py-2 text-right">Fee (USD)</th>
              <th className="border px-2 py-2 text-right">Net (USD)</th>
              <th className="border px-2 py-2 text-right">USD/CAD Rate</th>
              <th className="border px-2 py-2 text-right">Principal (CAD)</th>
              <th className="border px-2 py-2 text-right">Net (CAD)</th>
              <th className="border px-2 py-2 text-left text-xs">Source</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => {
              const rate = exchangeRates[s.tradeDate];
              const pre = isPreSplit(s.tradeDate);
              const qty = pre ? normalizeQuantity(s.quantity, s.tradeDate) : s.quantity;
              const price = pre ? normalizePrice(s.price, s.tradeDate) : s.price;
              const principal = price * qty;
              return (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border px-2 py-1.5">{s.tradeDate}</td>
                  <td className="border px-2 py-1.5 text-xs">{s.transactionType}</td>
                  <td className="border px-2 py-1.5 text-right">{qty}</td>
                  <td className="border px-2 py-1.5 text-right">${price.toFixed(4)}</td>
                  <td className="border px-2 py-1.5 text-right">${fmt(principal)}</td>
                  <td className="border px-2 py-1.5 text-right">
                    {s.commission > 0 ? `$${s.commission.toFixed(2)}` : '-'}
                  </td>
                  <td className="border px-2 py-1.5 text-right">
                    {s.fee > 0 ? `$${s.fee.toFixed(2)}` : '-'}
                  </td>
                  <td className="border px-2 py-1.5 text-right">${fmt(s.netAmount)}</td>
                  <td className="border px-2 py-1.5 text-right text-gray-500">
                    {rate ? rate.toFixed(4) : <span className="text-red-500">?</span>}
                  </td>
                  <td className="border px-2 py-1.5 text-right">
                    {rate ? `$${fmt(principal * rate)}` : '-'}
                  </td>
                  <td className="border px-2 py-1.5 text-right font-medium">
                    {rate ? `$${fmt(s.netAmount * rate)}` : '-'}
                  </td>
                  <td className="border px-2 py-1.5 text-xs text-gray-500 max-w-[150px] truncate">
                    {s.source}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-medium">
              <td className="border px-2 py-1.5" colSpan={2}>Totals</td>
              <td className="border px-2 py-1.5 text-right">
                {sorted.reduce((sum, s) => {
                  const pre = isPreSplit(s.tradeDate);
                  return sum + (pre ? normalizeQuantity(s.quantity, s.tradeDate) : s.quantity);
                }, 0)}
              </td>
              <td className="border px-2 py-1.5"></td>
              <td className="border px-2 py-1.5 text-right">
                ${fmt(sorted.reduce((sum, s) => sum + s.principal, 0))}
              </td>
              <td className="border px-2 py-1.5 text-right">
                ${sorted.reduce((sum, s) => sum + s.commission, 0).toFixed(2)}
              </td>
              <td className="border px-2 py-1.5 text-right">
                ${sorted.reduce((sum, s) => sum + s.fee, 0).toFixed(2)}
              </td>
              <td className="border px-2 py-1.5 text-right">
                ${fmt(sorted.reduce((sum, s) => sum + s.netAmount, 0))}
              </td>
              <td className="border px-2 py-1.5"></td>
              <td className="border px-2 py-1.5 text-right">
                ${fmt(
                  sorted.reduce((sum, s) => {
                    const rate = exchangeRates[s.tradeDate];
                    const pre = isPreSplit(s.tradeDate);
                    const qty = pre ? normalizeQuantity(s.quantity, s.tradeDate) : s.quantity;
                    const price = pre ? normalizePrice(s.price, s.tradeDate) : s.price;
                    return sum + (rate ? price * qty * rate : 0);
                  }, 0),
                )}
              </td>
              <td className="border px-2 py-1.5 text-right font-medium">
                ${fmt(
                  sorted.reduce((sum, s) => {
                    const rate = exchangeRates[s.tradeDate];
                    return sum + (rate ? s.netAmount * rate : 0);
                  }, 0),
                )}
              </td>
              <td className="border px-2 py-1.5"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
