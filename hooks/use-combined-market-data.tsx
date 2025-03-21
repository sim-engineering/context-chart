import { useState, useEffect } from "react";
import { Asset } from "@/types/types";

interface MarketDataOptions {
  dateFrom: string;
  dateTo: string;
  cryptoTickers: string[];
  stockTickers: string[];
}

export function useCombinedMarketData({
  dateFrom,
  dateTo,
  cryptoTickers,
  stockTickers,
}: MarketDataOptions) {
  const [mergedData, setMergedData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!cryptoTickers.length && !stockTickers.length) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const requests = [];

        if (cryptoTickers.length > 0) {
          requests.push(
            fetch(
              `/api/prices/crypto?dateFrom=${dateFrom}&dateTo=${dateTo}&tickers=${cryptoTickers.join(
                ","
              )}`
            ).then((res) => res.json())
          );
        } else {
          requests.push(Promise.resolve({}));
        }

        if (stockTickers.length > 0) {
          requests.push(
            fetch(
              `/api/prices/stocks?dateFrom=${dateFrom}&dateTo=${dateTo}&tickers=${stockTickers.join(
                ","
              )}`
            ).then((res) => res.json())
          );
        } else {
          requests.push(Promise.resolve({}));
        }

        const [cryptoData, stocksData] = await Promise.all(requests);

        const allDates = new Set([
          ...Object.keys(cryptoData),
          ...Object.keys(stocksData),
        ]);

        const combinedData: Record<string, any> = {};

        allDates.forEach((date) => {
          const cryptoCurrencies = cryptoData[date]?.currencies || [];
          const stockCurrencies = stocksData[date]?.currencies || [];

          const mergedCurrencies = [
            ...cryptoCurrencies.map((currency: Asset) => ({
              ...currency,
              type: "crypto",
            })),
            ...stockCurrencies.map((currency: Asset) => ({
              ...currency,
              type: "stock",
            })),
          ];

          combinedData[date] = { currencies: mergedCurrencies };
        });

        setMergedData(combinedData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };

    fetchData();
  }, [dateFrom, dateTo, cryptoTickers, stockTickers]);

  return { data: mergedData, loading, error };
}
