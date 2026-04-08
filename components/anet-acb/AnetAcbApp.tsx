import { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { DownloadInstructions } from './DownloadInstructions';
import { AcquisitionsTable } from './AcquisitionsTable';
import { DispositionsTable } from './DispositionsTable';
import { AcbExplainer } from './AcbExplainer';
import { AcbResultsTable } from './AcbResultsTable';
import { TaxYearSummary } from './TaxYearSummary';
import { TaxYearFilter } from './TaxYearFilter';
import { StockChart } from './StockChart';
import { TaxInfoPanel } from './TaxInfoPanel';
import { ExchangeRateEditor } from './ExchangeRateEditor';
import { ExportTools } from './ExportTools';
import { useTransactions } from './hooks/useTransactions';
import { useAcbCalculation } from './hooks/useAcbCalculation';
import { useYahooFinance } from './hooks/useYahooFinance';
import { parsePdfs } from './lib/pdfParser';
import { exportAcbToCsv } from './lib/exportUtils';
import { downloadFile } from './lib/format';

interface AnetAcbAppProps {
  etradeDownloadScript: string;
}

function AnetAcbApp({ etradeDownloadScript }: AnetAcbAppProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [parsingProgress, setParsingProgress] = useState<{
    parsed: number;
    total: number;
  } | null>(null);

  const {
    sells,
    vests,
    esppPurchases,
    normalized,
    exchangeRates: txExchangeRates,
    allDates,
    addSells,
    addVests,
    addEsppPurchases,
    updateExchangeRates,
    clearAll,
  } = useTransactions();

  const {
    exchangeRates,
    stockPrices,
    loading: fxLoading,
    error: fxError,
    loadExchangeRates,
    loadStockPrices,
    setManualRate,
  } = useYahooFinance();

  const { acbEntries, taxYearSummaries, years } = useAcbCalculation(normalized);

  useEffect(() => {
    if (Object.keys(exchangeRates).length > 0) {
      updateExchangeRates(exchangeRates);
    }
  }, [exchangeRates, updateExchangeRates]);

  useEffect(() => {
    if (allDates.length > 0) {
      loadExchangeRates(allDates);
    }
  }, [allDates, loadExchangeRates]);

  useEffect(() => {
    if (allDates.length > 0) {
      const earliest = allDates[0];
      const latest = allDates[allDates.length - 1];
      loadStockPrices(earliest, latest);
    }
  }, [allDates, loadStockPrices]);

  const handlePdfsSelected = useCallback(
    async (files: File[]) => {
      setLoading(true);
      setErrors([]);
      setParsingProgress({ parsed: 0, total: files.length });
      try {
        const {
          sells: newSells,
          vests: newVests,
          esppPurchases: newEspp,
          errors: parseErrors,
        } = await parsePdfs(
          files,
          (parsed, total) => {
            setParsingProgress({ parsed, total });
          },
        );
        addSells(newSells);
        addVests(newVests);
        addEsppPurchases(newEspp);
        if (parseErrors.length > 0) {
          setErrors((prev) => [...prev, ...parseErrors]);
        }
      } catch (err) {
        setErrors((prev) => [
          ...prev,
          `PDF parsing error: ${err instanceof Error ? err.message : String(err)}`,
        ]);
      } finally {
        setLoading(false);
        setParsingProgress(null);
      }
    },
    [addEsppPurchases, addSells, addVests],
  );

  const handleManualRate = useCallback(
    (date: string, rate: number) => {
      setManualRate(date, rate);
      updateExchangeRates({ [date]: rate });
    },
    [setManualRate, updateExchangeRates],
  );

  const hasData = sells.length > 0 || vests.length > 0 || esppPurchases.length > 0;
  const hasResults = acbEntries.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="px-3 py-1.5 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 rounded transition-colors"
        >
          {showInfo ? 'Hide' : 'Show'} Tax Reference
        </button>
        {hasData && (
          <button
            onClick={() => {
              clearAll();
            }}
            className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {showInfo && <TaxInfoPanel />}

      <DownloadInstructions etradeDownloadScript={etradeDownloadScript} />

      <div className="bg-white rounded-lg shadow p-4">
        <FileUpload
          onPdfsSelected={handlePdfsSelected}
          sellCount={sells.length}
          benefitPdfCount={vests.length + esppPurchases.length}
          parsingProgress={parsingProgress}
        />
      </div>

      {hasResults && (
        <ExportTools acbEntries={acbEntries} years={years} />
      )}

      {(errors.length > 0 || fxError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-800 mb-1">Warnings</h3>
          <ul className="list-disc ml-5 text-sm text-red-700 space-y-0.5">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
            {fxError && <li>{fxError}</li>}
          </ul>
        </div>
      )}

      {fxLoading && (
        <div className="text-center py-4 text-gray-500">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
          Fetching exchange rates...
        </div>
      )}

      {hasData && (
        <div className="space-y-6">
          {hasResults && <AcbExplainer />}

          {hasResults && (
            <div className="bg-white rounded-lg shadow p-4">
              <TaxYearSummary summaries={taxYearSummaries} acbEntries={acbEntries} />
            </div>
          )}

          {hasResults && (
            <div className="bg-white rounded-lg shadow p-4 space-y-3">
              <div className="flex items-center justify-between">
                <TaxYearFilter
                  years={years}
                  selectedYear={selectedYear}
                  onSelectYear={setSelectedYear}
                />
                <button
                  onClick={() => {
                    downloadFile(exportAcbToCsv(acbEntries), 'acb-ledger.csv', 'text/csv');
                  }}
                  className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Export ACB CSV
                </button>
              </div>
              <AcbResultsTable entries={acbEntries} selectedYear={selectedYear} />
            </div>
          )}

          {stockPrices.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <StockChart prices={stockPrices} transactions={normalized} />
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-4">
            <AcquisitionsTable
              vests={vests}
              esppPurchases={esppPurchases}
              exchangeRates={txExchangeRates}
              normalizedTransactions={normalized}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <DispositionsTable sells={sells} exchangeRates={txExchangeRates} />
          </div>

          {allDates.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <ExchangeRateEditor
                dates={allDates}
                rates={txExchangeRates}
                onSetRate={handleManualRate}
              />
            </div>
          )}
        </div>
      )}

      {!hasData && !loading && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">
            Upload your E*TRADE trade confirmation PDFs and stock plan confirmation PDFs
            to get started
          </p>
          <p className="text-sm mt-2">
            All processing happens in your browser - no data leaves your machine
          </p>
        </div>
      )}
    </div>
  );
}

export default AnetAcbApp;
