import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { PricePoint, NormalizedTransaction } from './types';

interface StockChartProps {
  prices: PricePoint[];
  transactions: NormalizedTransaction[];
}

export function StockChart({ prices, transactions }: StockChartProps) {
  if (prices.length === 0) return null;

  const buysByDate: Record<string, number> = {};
  const sellsByDate: Record<string, number> = {};

  for (const tx of transactions) {
    if (tx.type === 'vest' || tx.type === 'espp_purchase') {
      buysByDate[tx.date] = (buysByDate[tx.date] || 0) + tx.quantity;
    } else {
      sellsByDate[tx.date] = (sellsByDate[tx.date] || 0) + tx.quantity;
    }
  }

  const sortedTx = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  const sharesHeldByDate: Record<string, number> = {};
  let runningShares = 0;
  for (const tx of sortedTx) {
    if (tx.type === 'vest' || tx.type === 'espp_purchase') {
      runningShares += tx.quantity;
    } else {
      runningShares -= tx.quantity;
    }
    sharesHeldByDate[tx.date] = runningShares;
  }

  const priceByDate: Record<string, number> = {};
  for (const p of prices) {
    priceByDate[p.date] = p.close;
  }

  function nearestPrice(date: string): number | null {
    if (priceByDate[date]) return priceByDate[date];
    const d = new Date(date + 'T12:00:00Z');
    for (let offset = 1; offset <= 5; offset++) {
      const back = new Date(d);
      back.setUTCDate(back.getUTCDate() - offset);
      const backStr = back.toISOString().slice(0, 10);
      if (priceByDate[backStr]) return priceByDate[backStr];
      const fwd = new Date(d);
      fwd.setUTCDate(fwd.getUTCDate() + offset);
      const fwdStr = fwd.toISOString().slice(0, 10);
      if (priceByDate[fwdStr]) return priceByDate[fwdStr];
    }
    return null;
  }

  const dataMap: Record<string, {
    date: string;
    close: number | null;
    acquired: number | null;
    sold: number | null;
    sharesHeld: number | null;
  }> = {};

  for (const p of prices) {
    dataMap[p.date] = {
      date: p.date,
      close: p.close,
      acquired: buysByDate[p.date] || null,
      sold: sellsByDate[p.date] ? -(sellsByDate[p.date]) : null,
      sharesHeld: null,
    };
  }

  const allTxDates = new Set([...Object.keys(buysByDate), ...Object.keys(sellsByDate)]);
  for (const txDate of allTxDates) {
    if (!dataMap[txDate]) {
      dataMap[txDate] = {
        date: txDate,
        close: nearestPrice(txDate),
        acquired: buysByDate[txDate] || null,
        sold: sellsByDate[txDate] ? -(sellsByDate[txDate]) : null,
        sharesHeld: null,
      };
    }
  }

  const chartData = Object.values(dataMap).sort((a, b) => a.date.localeCompare(b.date));

  let currentHeld = 0;
  const txDates = Object.keys(sharesHeldByDate).sort();
  let txIdx = 0;
  for (const point of chartData) {
    while (txIdx < txDates.length && txDates[txIdx] <= point.date) {
      currentHeld = sharesHeldByDate[txDates[txIdx]];
      txIdx++;
    }
    point.sharesHeld = currentHeld;
  }

  const displayData =
    chartData.length > 600
      ? chartData.filter(
          (d, i) =>
            i % Math.ceil(chartData.length / 600) === 0 ||
            d.acquired !== null ||
            d.sold !== null,
        )
      : chartData;

  const maxQty = Math.max(
    ...Object.values(buysByDate),
    ...Object.values(sellsByDate),
    1,
  );

  const maxShares = Math.max(...Object.values(sharesHeldByDate), 1);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">ANET Stock Price & Transactions</h3>
      <ResponsiveContainer width="100%" height={450}>
        <ComposedChart data={displayData} margin={{ left: 20, right: 60, top: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(d: string) => {
              const [y, m] = d.split('-');
              return `${m}/${y.slice(2)}`;
            }}
            interval={Math.floor(displayData.length / 8)}
            padding={{ left: 20, right: 20 }}
          />
          <YAxis
            yAxisId="price"
            tick={{ fontSize: 11, fill: '#3b82f6' }}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
            domain={['auto', 'auto']}
            label={{
              value: 'Price (USD)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#3b82f6', fontWeight: 600 },
              offset: -5,
            }}
          />
          <YAxis
            yAxisId="qty"
            orientation="right"
            tick={{ fontSize: 11, fill: '#6366f1' }}
            domain={[-(maxQty * 1.5), Math.max(maxQty * 1.5, maxShares * 1.2)]}
            tickFormatter={(v: number) => (v === 0 ? '0' : `${Math.abs(Math.round(v))}`)}
            width={50}
            label={{
              value: 'Shares',
              angle: 90,
              position: 'insideRight',
              style: { fontSize: 12, fill: '#6366f1', fontWeight: 600 },
              offset: 10,
            }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white border border-gray-200 rounded shadow-lg p-2 text-xs">
                  <p className="font-medium">{label}</p>
                  {payload.map((p, i) => {
                    if (p.value == null) return null;
                    const val = Number(p.value);
                    if (val === 0 && p.dataKey !== 'sharesHeld') return null;
                    if (p.dataKey === 'close')
                      return <p key={i} className="text-blue-600">ANET: ${val.toFixed(2)} USD</p>;
                    if (p.dataKey === 'acquired')
                      return <p key={i} className="text-green-600">Acquired: {val} shares</p>;
                    if (p.dataKey === 'sold')
                      return <p key={i} className="text-red-600">Sold: {Math.abs(val)} shares</p>;
                    if (p.dataKey === 'sharesHeld')
                      return <p key={i} className="text-gray-600">Holding: {val} shares</p>;
                    return null;
                  })}
                </div>
              );
            }}
          />
          <Legend
            verticalAlign="bottom"
            formatter={(value: string) => {
              if (value === 'close') return 'ANET Price (USD)';
              if (value === 'acquired') return 'Acquired (Vest/ESPP)';
              if (value === 'sold') return 'Sold';
              if (value === 'sharesHeld') return 'Shares Held';
              return value;
            }}
          />
          <Area
            yAxisId="qty"
            type="stepAfter"
            dataKey="sharesHeld"
            fill="#e0e7ff"
            stroke="#a5b4fc"
            strokeWidth={1}
            fillOpacity={0.4}
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="close"
            stroke="#3b82f6"
            dot={false}
            strokeWidth={1.5}
          />
          <Bar
            yAxisId="qty"
            dataKey="acquired"
            fill="#22c55e"
            opacity={0.9}
            barSize={8}
          />
          <Bar
            yAxisId="qty"
            dataKey="sold"
            fill="#ef4444"
            opacity={0.9}
            barSize={8}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
