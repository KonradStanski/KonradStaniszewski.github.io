import { useState, useCallback, useMemo } from 'react';
import type {
  RawSellTransaction,
  RawVestEvent,
  RawEsppPurchase,
  NormalizedTransaction,
  ExchangeRateCache,
} from '../types';
import { isPreSplit, normalizeQuantity, normalizePrice } from '../lib/stockSplit';

export function useTransactions() {
  const [sells, setSells] = useState<RawSellTransaction[]>([]);
  const [vests, setVests] = useState<RawVestEvent[]>([]);
  const [esppPurchases, setEsppPurchases] = useState<RawEsppPurchase[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateCache>({});

  const addSells = useCallback((newSells: RawSellTransaction[]) => {
    setSells((prev) => {
      const existing = new Set(
        prev.map((s) => `${s.tradeDate}|${s.quantity}|${s.price}|${s.principal}`)
      );
      const unique = newSells.filter(
        (s) => !existing.has(`${s.tradeDate}|${s.quantity}|${s.price}|${s.principal}`)
      );
      return [...prev, ...unique];
    });
  }, []);

  const addVests = useCallback((newVests: RawVestEvent[]) => {
    setVests((prev) => {
      const existing = new Set(
        prev.map((v) => `${v.vestDate}|${v.vestedQty}|${v.grantNumber}|${v.source}`)
      );
      const unique = newVests.filter(
        (v) => !existing.has(`${v.vestDate}|${v.vestedQty}|${v.grantNumber}|${v.source}`)
      );
      return [...prev, ...unique];
    });
  }, []);

  const addEsppPurchases = useCallback((newPurchases: RawEsppPurchase[]) => {
    setEsppPurchases((prev) => {
      const existing = new Set(
        prev.map((p) => `${p.purchaseDate}|${p.purchasedQty}|${p.purchasePrice}|${p.source}`)
      );
      const unique = newPurchases.filter(
        (p) => !existing.has(`${p.purchaseDate}|${p.purchasedQty}|${p.purchasePrice}|${p.source}`)
      );
      return [...prev, ...unique];
    });
  }, []);

  const updateExchangeRates = useCallback((rates: ExchangeRateCache) => {
    setExchangeRates((prev) => ({ ...prev, ...rates }));
  }, []);

  const normalized: NormalizedTransaction[] = useMemo(() => {
    const all: NormalizedTransaction[] = [];

    for (const vest of vests) {
      const rate = exchangeRates[vest.vestDate] ?? null;
      const fmvPerShare = vest.fmvPerShare;
      const totalUsd = fmvPerShare * vest.vestedQty;

      all.push({
        id: `vest-${vest.grantNumber}-${vest.vestPeriod}`,
        date: vest.vestDate,
        settlementDate: vest.vestDate,
        type: 'vest',
        quantity: vest.vestedQty,
        pricePerShareUsd: fmvPerShare,
        totalUsd,
        commissionUsd: 0,
        feeUsd: 0,
        exchangeRate: rate,
        exchangeRateManual: false,
        totalCad: rate !== null ? totalUsd * rate : null,
        commissionCad: 0,
        feeCad: 0,
        source: vest.source,
        preSplit: isPreSplit(vest.vestDate),
      });
    }

    for (const espp of esppPurchases) {
      const rate = exchangeRates[espp.purchaseDate] ?? null;
      const qty = espp.purchasedQty;
      const price = espp.purchasePrice;
      const totalUsd = price * qty;

      all.push({
        id: `espp-${espp.purchaseDate}-${espp.purchasedQty}`,
        date: espp.purchaseDate,
        settlementDate: espp.purchaseDate,
        type: 'espp_purchase',
        quantity: qty,
        pricePerShareUsd: price,
        totalUsd,
        commissionUsd: 0,
        feeUsd: 0,
        exchangeRate: rate,
        exchangeRateManual: false,
        totalCad: rate !== null ? totalUsd * rate : null,
        commissionCad: 0,
        feeCad: 0,
        source: espp.source,
        preSplit: isPreSplit(espp.purchaseDate),
      });
    }

    for (const sell of sells) {
      const rate = exchangeRates[sell.tradeDate] ?? null;
      const preSplit = isPreSplit(sell.tradeDate);
      const qty = preSplit ? normalizeQuantity(sell.quantity, sell.tradeDate) : sell.quantity;
      const price = preSplit ? normalizePrice(sell.price, sell.tradeDate) : sell.price;

      all.push({
        id: `sell-${sell.tradeDate}-${sell.quantity}-${sell.price}-${sell.source}`,
        date: sell.tradeDate,
        settlementDate: sell.settlementDate,
        type: 'sell',
        quantity: qty,
        pricePerShareUsd: price,
        totalUsd: price * qty,
        commissionUsd: sell.commission,
        feeUsd: sell.fee,
        exchangeRate: rate,
        exchangeRateManual: false,
        totalCad: rate !== null ? price * qty * rate : null,
        commissionCad: rate !== null ? sell.commission * rate : null,
        feeCad: rate !== null ? sell.fee * rate : null,
        source: sell.source,
        preSplit,
      });
    }

    all.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      const typeOrder = { vest: 0, espp_purchase: 1, sell: 2 };
      return typeOrder[a.type] - typeOrder[b.type];
    });

    return all;
  }, [sells, vests, esppPurchases, exchangeRates]);

  const allDates = useMemo(() => {
    const dates = new Set<string>();
    for (const tx of [...sells]) dates.add(tx.tradeDate);
    for (const v of vests) dates.add(v.vestDate);
    for (const e of esppPurchases) dates.add(e.purchaseDate);
    return Array.from(dates).sort();
  }, [sells, vests, esppPurchases]);

  const clearAll = useCallback(() => {
    setSells([]);
    setVests([]);
    setEsppPurchases([]);
    setExchangeRates({});
  }, []);

  return {
    sells,
    vests,
    esppPurchases,
    normalized,
    exchangeRates,
    allDates,
    addSells,
    addVests,
    addEsppPurchases,
    updateExchangeRates,
    clearAll,
  };
}
