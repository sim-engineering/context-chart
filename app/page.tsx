"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { format, subDays, isAfter, isValid, parseISO } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

import { Card } from "@/components/ui/card";
import DateSlider from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Asset } from "@/types/types";
import CurrencyChart from "@/components/currency-chart";
import { DateRangePicker } from "@/components/date-range-picker";
import Footer from "@/components/footer";
import Header from "@/components/header";
import AssetHeatmap from "@/components/map";
import ShortenUrl from "@/components/shorten-url";

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0]; // Extract YYYY-MM-DD
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const today = useMemo(() => new Date(), []);
  const sevenDaysAgo = useMemo(() => subDays(today, 7), [today]);

  const [loading, setLoading] = useState(true);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);
  const [availableCrypto, setAvailableCrypto] = useState<string[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<string[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [mergedData, setMergedData] = useState<
    Record<string, { currencies: Asset[] }>
  >({});

  const [dateFrom, setDateFrom] = useState<string>(
    searchParams.get("dateFrom") || formatDate(sevenDaysAgo)
  );
  const [dateTo, setDateTo] = useState<string>(
    searchParams.get("dateTo") || formatDate(today)
  );
  const [selectedDate, setSelectedDate] = useState(formatDate(today));

  // Track URL updates separately to avoid render-time updates
  const [pendingUrlUpdate, setPendingUrlUpdate] = useState<Record<
    string,
    string | null
  > | null>(null);

  // Memoized formatted dates to avoid repeated calculations
  const formattedToday = useMemo(() => format(today, "yyyy-MM-dd"), [today]);
  const formattedSevenDaysAgo = useMemo(
    () => format(sevenDaysAgo, "yyyy-MM-dd"),
    [sevenDaysAgo]
  );

  const isValidDate = useCallback((dateStr: string) => {
    if (!dateStr) return false;
    const parsedDate = parseISO(dateStr);
    return isValid(parsedDate);
  }, []);

  const isNotFutureDate = useCallback(
    (dateStr: string) => {
      if (!dateStr) return false;
      const parsedDate = parseISO(dateStr);
      return !isAfter(parsedDate, today);
    },
    [today]
  );

  // This function now queues URL updates instead of performing them directly
  const queueUrlUpdate = useCallback(
    (params: Record<string, string | null>) => {
      setPendingUrlUpdate(params);
    },
    []
  );

  // Process URL updates in a separate effect to avoid render-time router updates
  useEffect(() => {
    if (pendingUrlUpdate === null) return;

    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(pendingUrlUpdate).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    const urlWithCommas = `?${newParams.toString().replace(/%2C/g, ",")}`;
    router.push(urlWithCommas, { scroll: false });

    // Clear the pending update after processing
    setPendingUrlUpdate(null);
  }, [pendingUrlUpdate, router, searchParams]);

  // Fetch tickers data only once on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stocksResponse, cryptoResponse] = await Promise.all([
          fetch("/api/tickers/stocks"),
          fetch("/api/tickers/crypto"),
        ]);

        const stocksData = await stocksResponse.json();
        const cryptoData = await cryptoResponse.json();

        setAvailableCurrencies(stocksData.symbols || []);
        setAvailableCrypto(cryptoData.symbols || []);
      } catch (error) {
        console.error("Error fetching available tickers:", error);
      }
    };

    fetchData();
  }, []);

  // Process URL parameters once tickers are loaded
  useEffect(() => {
    if (availableCurrencies.length === 0 && availableCrypto.length === 0)
      return;

    // Decode and extract valid stocks & crypto from URL
    const urlStocks = (searchParams.get("stock") || "")
      .split(",")
      .filter(Boolean);
    const urlCrypto = (searchParams.get("crypto") || "")
      .split(",")
      .filter(Boolean);

    const validStocks = urlStocks.filter((ticker) =>
      availableCurrencies.includes(ticker)
    );
    const validCrypto = urlCrypto.filter((ticker) =>
      availableCrypto.includes(ticker)
    );

    // Set default selections if none are valid from URL
    const stocksToSet = validStocks.length > 0 ? validStocks : [];
    const cryptoToSet = validCrypto.length > 0 ? validCrypto : [];

    const urlDateFrom = searchParams.get("dateFrom");
    const urlDateTo = searchParams.get("dateTo");

    // Validate URL dates
    let validDateFrom =
      isValidDate(urlDateFrom) && isNotFutureDate(urlDateFrom)
        ? urlDateFrom
        : formattedSevenDaysAgo;

    let validDateTo =
      isValidDate(urlDateTo) && isNotFutureDate(urlDateTo)
        ? urlDateTo
        : formattedToday;

    // Ensure dateFrom is not later than dateTo
    if (new Date(validDateFrom) > new Date(validDateTo)) {
      validDateFrom = formattedSevenDaysAgo;
      validDateTo = formattedToday;
    }

    setSelectedCurrencies(stocksToSet);
    setSelectedCrypto(cryptoToSet);
    setDateFrom(validDateFrom);
    setDateTo(validDateTo);

    // Update URL if parameters needed correction
    if (
      validDateFrom !== urlDateFrom ||
      validDateTo !== urlDateTo ||
      stocksToSet.join(",") !== urlStocks.join(",") ||
      cryptoToSet.join(",") !== urlCrypto.join(",")
    ) {
      queueUrlUpdate({
        stock: stocksToSet.length > 0 ? stocksToSet.join(",") : null,
        crypto: cryptoToSet.length > 0 ? cryptoToSet.join(",") : null,
        dateFrom: validDateFrom,
        dateTo: validDateTo,
      });
    }
  }, [
    availableCurrencies,
    availableCrypto,
    searchParams,
    formattedToday,
    formattedSevenDaysAgo,
    isValidDate,
    isNotFutureDate,
    queueUrlUpdate,
  ]);

  // Update URL when date range changes
  useEffect(() => {
    queueUrlUpdate({
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
    });
  }, [dateFrom, dateTo, queueUrlUpdate]);

  const handleDateChange = useCallback((selectedDate: string) => {
    setSelectedDate(selectedDate);
  }, []);

  const toggleSelection = useCallback(
    (ticker: string, isCrypto = false) => {
      if (isCrypto) {
        setSelectedCrypto((prev) => {
          const newCrypto = prev.includes(ticker)
            ? prev.filter((item) => item !== ticker)
            : [...prev, ticker];

          queueUrlUpdate({
            crypto: newCrypto.length > 0 ? newCrypto.join(",") : null,
          });
          return newCrypto;
        });
      } else {
        setSelectedCurrencies((prev) => {
          const newStocks = prev.includes(ticker)
            ? prev.filter((item) => item !== ticker)
            : [...prev, ticker];

          queueUrlUpdate({
            stock: newStocks.length > 0 ? newStocks.join(",") : null,
          });
          return newStocks;
        });
      }
    },
    [queueUrlUpdate]
  );

  // Fetch price data when selection or date range changes
  useEffect(() => {
    if (
      (!selectedCrypto || selectedCrypto.length === 0) &&
      (!selectedCurrencies || selectedCurrencies.length === 0)
    ) {
      setLoading(false);
      setMergedData({});
      return;
    }

    setLoading(true);

    const fetchData = async () => {
      try {
        const requests = [];

        if (selectedCrypto.length > 0) {
          requests.push(
            fetch(
              `/api/prices/crypto?dateFrom=${dateFrom}&dateTo=${dateTo}&tickers=${selectedCrypto.join(
                ","
              )}`
            ).then((res) => res.json())
          );
        } else {
          requests.push(Promise.resolve({}));
        }

        if (selectedCurrencies.length > 0) {
          requests.push(
            fetch(
              `/api/prices/stocks?dateFrom=${dateFrom}&dateTo=${dateTo}&tickers=${selectedCurrencies.join(
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

        const combinedData: Record<string, { currencies: Asset[] }> = {};

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

          if (mergedCurrencies.length > 0) {
            combinedData[date] = { currencies: mergedCurrencies };
          }
        });

        setMergedData(combinedData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateFrom, dateTo, selectedCrypto, selectedCurrencies]);

  // Memoize selected ticker buttons to avoid unnecessary re-renders
  const stockButtons = useMemo(
    () => (
      <div className="flex flex-wrap gap-2">
        {availableCurrencies.map((ticker) => (
          <button
            key={ticker}
            className={`px-3 py-1.5 text-sm rounded-full transition-all transform duration-200 ease-in-out shadow-md text-white font-medium ${
              selectedCurrencies.includes(ticker)
                ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                : "bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            } hover:scale-105 active:scale-95`}
            onClick={() => toggleSelection(ticker)}
          >
            {ticker}
          </button>
        ))}
      </div>
    ),
    [availableCurrencies, selectedCurrencies, toggleSelection]
  );

  const cryptoButtons = useMemo(
    () => (
      <div className="flex flex-wrap gap-2">
        {availableCrypto.map((ticker) => (
          <button
            key={ticker}
            className={`px-3 py-1.5 text-sm rounded-full transition-all transform duration-200 ease-in-out shadow-md text-white font-medium ${
              selectedCrypto.includes(ticker)
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                : "bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            } hover:scale-105 active:scale-95`}
            onClick={() => toggleSelection(ticker, true)}
          >
            {ticker}
          </button>
        ))}
      </div>
    ),
    [availableCrypto, selectedCrypto, toggleSelection]
  );

  // Combine available tickers for chart default props
  const allAvailableTickers = useMemo(
    () => [...availableCrypto, ...availableCurrencies],
    [availableCrypto, availableCurrencies]
  );

  return (
    <div className="flex flex-col min-h-screen bg-background dark">
      <link rel="icon" href="/favicon.ico" sizes="any" />

      <Header />
      <main className="flex-1 px-1 py-6 scale-[1] origin-top mx-auto w-full max-w-7xl">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : (
          <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
            <DateRangePicker
              initialDateFrom={dateFrom}
              initialDateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
            />
            <div className="p-2 space-y-6">
              <DateSlider
                minDate={dateFrom}
                maxDate={dateTo}
                onDateChange={handleDateChange}
              />
              <div className="flex flex-col lg:flex-row">
                <div className="w-full lg:w-1/2">
                  <div className="flex flex-wrap gap-4">{stockButtons}</div>
                </div>
                <div className="w-full lg:w-1/2">
                  <div className="flex flex-wrap gap-4">{cryptoButtons}</div>
                </div>
              </div>
              {/* <ShortenUrl /> */}
              {Object.keys(mergedData).length > 0 ? (
                <div className="flex flex-col lg:flex-row">
                  <div className="w-full lg:w-1/2">
                    <CurrencyChart
                      data={mergedData}
                      newsEvents={[]}
                      defaultCurrencies={allAvailableTickers}
                    />
                  </div>
                  <div className="w-full lg:w-1/2">
                    <AssetHeatmap
                      onAssetClick={() => {}} // Asset click handler
                      initialDate={selectedDate} // Pass the current date
                      changeDays="1d" // The change period (e.g., 1 day)
                      assetType="crypto" // Set asset type (e.g., crypto or stocks)
                      data={mergedData} // Pass the data for multiple days
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-gray-400">
                  No data available. Please select at least one ticker.
                </div>
              )}
            </div>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
