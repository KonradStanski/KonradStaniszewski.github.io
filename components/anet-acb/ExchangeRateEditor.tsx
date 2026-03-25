import { useState } from 'react';
import type { ExchangeRateCache } from './types';

interface ExchangeRateEditorProps {
  dates: string[];
  rates: ExchangeRateCache;
  onSetRate: (date: string, rate: number) => void;
}

export function ExchangeRateEditor({ dates, rates, onSetRate }: ExchangeRateEditorProps) {
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const missingDates = dates.filter((d) => !rates[d]);
  const hasMissing = missingDates.length > 0;

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">
        Exchange Rates (USD/CAD)
        {hasMissing && (
          <span className="ml-2 text-sm text-red-600 font-normal">
            {missingDates.length} missing
          </span>
        )}
      </h3>

      {hasMissing && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
          Missing exchange rates for: {missingDates.join(', ')}. Enter them manually below.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">Date</th>
              <th className="border px-3 py-2 text-right">USD/CAD Rate</th>
              <th className="border px-3 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {dates.map((date) => (
              <tr
                key={date}
                className={`hover:bg-gray-50 ${!rates[date] ? 'bg-red-50' : ''}`}
              >
                <td className="border px-3 py-1">{date}</td>
                <td className="border px-3 py-1 text-right">
                  {editingDate === date ? (
                    <input
                      type="number"
                      step="0.0001"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = parseFloat(editValue);
                          if (!isNaN(val) && val > 0) {
                            onSetRate(date, val);
                            setEditingDate(null);
                          }
                        } else if (e.key === 'Escape') {
                          setEditingDate(null);
                        }
                      }}
                      className="w-24 px-1 py-0.5 border rounded text-right"
                      autoFocus
                    />
                  ) : rates[date] ? (
                    rates[date].toFixed(4)
                  ) : (
                    <span className="text-red-500">missing</span>
                  )}
                </td>
                <td className="border px-3 py-1 text-center">
                  {editingDate === date ? (
                    <button
                      onClick={() => {
                        const val = parseFloat(editValue);
                        if (!isNaN(val) && val > 0) {
                          onSetRate(date, val);
                          setEditingDate(null);
                        }
                      }}
                      className="text-xs px-2 py-0.5 bg-green-100 hover:bg-green-200 rounded"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingDate(date);
                        setEditValue(rates[date]?.toFixed(4) || '');
                      }}
                      className="text-xs px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
