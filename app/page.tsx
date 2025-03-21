"use client";

import { useState, useEffect } from "react";
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

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0]; // Extract YYYY-MM-DD
};

export default function Home() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [loading, setLoading] = useState(true);

  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [availableCrypto, setAvailableCrypto] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState<string[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [mergedData, setMergedData] = useState([]);

  const [dateFrom, setDateFrom] = useState<string>(
    searchParams.get("dateFrom") || formatDate(sevenDaysAgo)
  );
  const [dateTo, setDateTo] = useState<string>(
    searchParams.get("dateTo") || formatDate(today)
  );
  const [selectedDate, setSelectedDate] = useState(formatDate(today));

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

    const urlDateFrom = searchParams.get("dateFrom");
    const urlDateTo = searchParams.get("dateTo");

    const today = format(new Date(), "yyyy-MM-dd");
    const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");

    const isValidDate = (dateStr: string) => {
      const parsedDate = parseISO(dateStr);
      return isValid(parsedDate);
    };

    const isNotFutureDate = (dateStr: string) => {
      const parsedDate = parseISO(dateStr);
      const todayDate = new Date();
      return !isAfter(parsedDate, todayDate);
    };

    // Validate URL dates and set defaults if invalid
    let validDateFrom =
      isValidDate(urlDateFrom) && isNotFutureDate(urlDateFrom)
        ? urlDateFrom
        : null;
    let validDateTo =
      isValidDate(urlDateTo) && isNotFutureDate(urlDateTo) ? urlDateTo : null;

    // Ensure dateFrom is not later than dateTo
    if (
      validDateFrom &&
      validDateTo &&
      new Date(validDateFrom) > new Date(validDateTo)
    ) {
      validDateFrom = null;
      validDateTo = null;
    }

    // Default to 7 days ago if dateFrom is invalid or in the future
    if (validDateFrom && new Date(validDateFrom) > new Date(today)) {
      validDateFrom = sevenDaysAgo;
    }

    // Default to today if dateTo is invalid or in the future
    if (validDateTo && new Date(validDateTo) > new Date(today)) {
      validDateTo = today;
    }

    // Ensure valid dateFrom and dateTo
    if (!validDateFrom) validDateFrom = sevenDaysAgo;
    if (!validDateTo) validDateTo = today;

    // Ensure that dateFrom is not after dateTo
    if (new Date(validDateFrom) > new Date(validDateTo)) {
      validDateFrom = validDateTo; // Correct dateFrom if it's later than dateTo
    }

    setSelectedCurrencies(validStocks);
    setSelectedCrypto(validCrypto);
    setDateFrom(validDateFrom);
    setDateTo(validDateTo);

    // Update the URL with the corrected date parameters
    if (validDateFrom !== urlDateFrom || validDateTo !== urlDateTo) {
      updateUrl({
        stock: validStocks.length > 0 ? validStocks.join(",") : null,
        crypto: validCrypto.length > 0 ? validCrypto.join(",") : null,
        dateFrom: validDateFrom,
        dateTo: validDateTo,
      });
    }
  }, [availableCurrencies, availableCrypto, searchParams]);

  const handleDateChange = (selectedDate: string) => {
    setSelectedDate(selectedDate);
  };

  useEffect(() => {
    const fetchUniqueStockTickers = async () => {
      try {
        const response = await fetch("/api/tickers/stocks");
        const data = await response.json();
        setAvailableCurrencies(data.symbols);
        setSelectedCurrencies(data.symbols);
      } catch (error) {
        console.error("Error fetching available currencies:", error);
      }
    };

    const fetchUniqueCryptoTickers = async () => {
      try {
        const response = await fetch("/api/tickers/crypto");
        const data = await response.json();
        setAvailableCrypto(data.symbols);
        setSelectedCrypto(data.symbols);
      } catch (error) {
        console.error("Error fetching available crypto:", error);
      }
    };

    fetchUniqueStockTickers();
    fetchUniqueCryptoTickers();
  }, []);

  const updateUrl = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    const urlWithCommas = `?${newParams.toString().replace(/%2C/g, ",")}`;

    router.push(urlWithCommas, { scroll: false });
  };

  useEffect(() => {
    updateUrl({
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
    });
  }, [dateFrom, dateTo]);

  const toggleSelection = (ticker: string, isCrypto = false) => {
    if (isCrypto) {
      const newCrypto = selectedCrypto.includes(ticker)
        ? selectedCrypto.filter((item) => item !== ticker)
        : [...selectedCrypto, ticker];

      setSelectedCrypto(newCrypto);
      updateUrl({ crypto: newCrypto.length > 0 ? newCrypto.join(",") : null });
    } else {
      const newStocks = selectedCurrencies.includes(ticker)
        ? selectedCurrencies.filter((item) => item !== ticker)
        : [...selectedCurrencies, ticker];

      setSelectedCurrencies(newStocks);
      updateUrl({ stock: newStocks.length > 0 ? newStocks.join(",") : null });
    }
  };

  useEffect(() => {
    if (!selectedCrypto || !selectedCurrencies) return;

    const fetchData = async () => {
      try {
        const [cryptoResponse, stocksResponse] = await Promise.all([
          fetch(
            `/api/prices/crypto?dateFrom=${dateFrom}&dateTo=${dateTo}&tickers=${selectedCrypto.join(
              ","
            )}`
          ),
          fetch(
            `/api/prices/stocks?dateFrom=${dateFrom}&dateTo=${dateTo}&tickers=${selectedCurrencies.join(
              ","
            )}`
          ),
        ]);

        const cryptoData = await cryptoResponse.json();
        const stocksData = await stocksResponse.json();

        const allDates = new Set([
          ...Object.keys(cryptoData),
          ...Object.keys(stocksData),
        ]);
        const combinedData: any = {};

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
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [dateFrom, dateTo, selectedCrypto, selectedCurrencies]);

  return (
    <div className="flex flex-col bg-background dark">
      <link rel="icon" href="/favicon.ico" sizes="any" />

      <Header />
      <main className="flex-1 px-1 py-6 scale-[1] origin-top mx-auto">
        {loading ? (
          <div>
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
            <div className="p-6 space-y-6">
              <DateSlider
                minDate={dateFrom}
                maxDate={dateTo}
                onDateChange={handleDateChange}
              />

              <h2 className="text-xl font-bold">Stock Tickers</h2>
              <div className="flex flex-wrap gap-2">
                {availableCurrencies.map((ticker) => (
                  <button
                    key={ticker}
                    className={`px-4 py-2 rounded-lg transition-all shadow-md text-white font-medium ${
                      selectedCurrencies.includes(ticker)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-500 hover:bg-gray-600"
                    }`}
                    onClick={() => toggleSelection(ticker)}
                  >
                    {ticker}
                  </button>
                ))}
              </div>

              <h2 className="text-xl font-bold mt-4">Crypto Tickers</h2>
              <div className="flex flex-wrap gap-2">
                {availableCrypto.map((ticker) => (
                  <button
                    key={ticker}
                    className={`px-4 py-2 rounded-lg transition-all shadow-md text-white font-medium ${
                      selectedCrypto.includes(ticker)
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-500 hover:bg-gray-600"
                    }`}
                    onClick={() => toggleSelection(ticker, true)}
                  >
                    {ticker}
                  </button>
                ))}
              </div>

              <CurrencyChart
                data={mergedData}
                newsEvents={[]}
                defaultCurrencies={availableCrypto.concat(availableCurrencies)}
              />
            </div>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
