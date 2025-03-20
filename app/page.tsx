"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DateSlider from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Asset } from "@/types/types";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Heatmap from "@/components/heatmap";
import CurrencyChart from "@/components/currency-chart";
import CurrencyBar from "@/components/currencies";
import IndecesBar from "@/components/indexes";
import Comap from "@/components/comap";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { format, subDays, isAfter, isValid, parseISO } from "date-fns";
import { DateRangePicker } from "@/components/date-range-picker";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

const CRYPTO_OPTIONS = ["BTC", "ETH", "XRP", "ADA", "SOL"];
const STOCK_OPTIONS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"];

import { sampleNewsEvents } from "@/types/mock";
import {
  daysAgoToDate,
  getChangeField,
  getCurrencyColor,
} from "@/utils/helpers";
import { Spinner } from "@/components/ui/spinner";

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0]; // Extract YYYY-MM-DD
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const stockParam = searchParams.get("stock");
  const cryptoParam = searchParams.get("crypto");
  const dateFromParam = searchParams.get("dateFrom");
  const dateToParam = searchParams.get("dateTo");

  const [timeRange, setTimeRange] = useState(1);
  const [change, setChange] = useState("1d");
  const [debouncedTimeRange, setDebouncedTimeRange] = useState(timeRange);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [loading, setLoading] = useState(true);

  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [availableCrypto, setAvailableCrypto] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState<string[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [mergedData, setMergedData] = useState([]);

  const [dateFrom, setDateFrom] = useState<string>(formatDate(sevenDaysAgo));
  const [dateTo, setDateTo] = useState<string>(formatDate(today));
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

    let validDateFrom = isValidDate(urlDateFrom) ? urlDateFrom : null;
    let validDateTo =
      isValidDate(urlDateTo) && isNotFutureDate(urlDateTo) ? urlDateTo : null;

    if (
      validDateFrom &&
      validDateTo &&
      new Date(validDateFrom) > new Date(validDateTo)
    ) {
      validDateFrom = null;
      validDateTo = null;
    }

    if (validDateFrom && new Date(validDateFrom) > new Date(today)) {
      validDateFrom = sevenDaysAgo;
    }

    if (validDateTo && new Date(validDateTo) > new Date(today)) {
      validDateTo = today;
    }

    if (!validDateFrom) validDateFrom = sevenDaysAgo;
    if (!validDateTo) validDateTo = today;

    setSelectedCurrencies(validStocks);
    setSelectedCrypto(validCrypto);
    setDateFrom(validDateFrom);
    setDateTo(validDateTo);

    if (validDateFrom !== urlDateFrom || validDateTo !== urlDateTo) {
      updateUrl({
        stock: validStocks.length > 0 ? validStocks.join(",") : null,
        crypto: validCrypto.length > 0 ? validCrypto.join(",") : null,
        dateFrom: validDateFrom,
        dateTo: validDateTo,
      });
    }
  }, [availableCurrencies, availableCrypto]);

  const handleDateChange = (selectedDate: string) => {
    setSelectedDate(selectedDate);
  };

  useEffect(() => {
    const fetchAvailableCurrencies = async () => {
      try {
        const response = await fetch("/api/stocks/list");
        const data = await response.json();
        setAvailableCurrencies(data);
        setSelectedCurrencies(data);
      } catch (error) {
        console.error("Error fetching available currencies:", error);
      }
    };

    const fetchAvailableCrypto = async () => {
      try {
        const response = await fetch("/api/crypto/list");
        const data = await response.json();
        setAvailableCrypto(data);
        setSelectedCrypto(data);
      } catch (error) {
        console.error("Error fetching available crypto:", error);
      }
    };

    fetchAvailableCurrencies();
    fetchAvailableCrypto();
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
    const handler = setTimeout(() => {
      setTimeRange(debouncedTimeRange);
    }, 300);

    return () => clearTimeout(handler);
  }, [debouncedTimeRange]);

  useEffect(() => {
    if (!selectedCrypto || !selectedCurrencies) return;

    const fetchData = async () => {
      try {
        const [cryptoResponse, stocksResponse] = await Promise.all([
          fetch(`/api/crypto?from=${daysAgoToDate(timeRange)}`),
          fetch(`/api/stocks?from=${daysAgoToDate(timeRange)}`),
        ]);

        const cryptoData = await cryptoResponse.json();
        const stocksData = await stocksResponse.json();

        const allDates = new Set([
          ...Object.keys(cryptoData),
          ...Object.keys(stocksData),
        ]);
        const combinedData = {};

        allDates.forEach((date) => {
          const cryptoCurrencies = cryptoData[date]?.currencies || [];
          const stockCurrencies = stocksData[date]?.currencies || [];

          const mergedCurrencies = [
            ...cryptoCurrencies.map((currency) => ({
              ...currency,
              type: "crypto",
            })),
            ...stockCurrencies.map((currency) => ({
              ...currency,
              type: "stock",
            })),
          ];

          combinedData[date] = { currencies: mergedCurrencies };
        });

        setMergedData(combinedData);
        console.log(combinedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCrypto, selectedCurrencies, timeRange]);

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
            </div>
            {/* <CardContent>
              <div className="mb-2">
                <div className="w-full flex justify-end"></div>
                <div className="flex w-full justify-between mb-5">
                  <div className="flex w-full flex-col sm:flex-row gap-2">
                    <Tabs defaultValue="1d" className="w-full sm:w-auto">
                      <TabsList className="grid grid-cols-6 w-full">
                        <TabsTrigger disabled value="15m">
                          15min
                        </TabsTrigger>
                        <TabsTrigger value="1d" onClick={() => setChange("1d")}>
                          1D
                        </TabsTrigger>
                        <TabsTrigger value="7d" onClick={() => setChange("7d")}>
                          7D
                        </TabsTrigger>
                        <TabsTrigger value="1m" onClick={() => setChange("1m")}>
                          1M
                        </TabsTrigger>
                        <TabsTrigger value="3m" onClick={() => setChange("3m")}>
                          3M
                        </TabsTrigger>
                        <TabsTrigger value="1y" onClick={() => setChange("1y")}>
                          1Y
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <div className="w-full flex justify-end">
                      <div className="mr-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                              <span>Crypto</span>
                              <Badge>{selectedCrypto.length}</Badge>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuSeparator />
                            {availableCrypto.map((currency) => (
                              <DropdownMenuCheckboxItem
                                key={currency}
                                checked={selectedCrypto.includes(currency)}
                                onCheckedChange={() => selectCrypto(currency)}
                                className="bg-black hover:bg-secondary"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor:
                                        getCurrencyColor(currency),
                                    }}
                                  />
                                  {currency}
                                </div>
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                              <span>Currencies</span>
                              <Badge>{selectedCurrencies.length}</Badge>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuSeparator />
                            {availableCurrencies.map((currency) => (
                              <DropdownMenuCheckboxItem
                                key={currency}
                                checked={selectedCurrencies.includes(currency)}
                                onCheckedChange={() =>
                                  selectCurrencies(currency)
                                }
                                className="bg-black hover:bg-secondary"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor:
                                        getCurrencyColor(currency),
                                    }}
                                  />
                                  {currency}
                                </div>
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
                <Slider
                  value={[debouncedTimeRange]}
                  min={5}
                  max={365}
                  step={6}
                  onValueChange={handleSliderChange}
                  className="w-full"
                />
              </div>
              <CurrencyChart
                data={mergedData}
                newsEvents={sampleNewsEvents}
                defaultCurrencies={availableCrypto.concat(availableCurrencies)}
              />
              <div className="flex w-full">
                <Heatmap
                  onAssetClick={handleAssetClick}
                  type="Crypto"
                  date={daysAgoToDate(timeRange)}
                  changeDays={change}
                  assetType="crypto"
                />
                <Heatmap
                  onAssetClick={handleAssetClick}
                  type="Stocks"
                  date={daysAgoToDate(timeRange)}
                  changeDays={change}
                  assetType="stocks"
                />
              </div>

              {showCurrency ? (
                <div className="w-full h-full animate-fade-in">
                  <div
                    className="relative my-2 w-full h-full"
                    onClick={toggleCurrency}
                  >
                    <CurrencyBar date={daysAgoToDate(timeRange)} />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleCurrency}
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    Show Currency
                  </Button>
                </div>
              )}

              {showCom ? (
                <div
                  className="w-full h-full animate-fade-in"
                  onClick={toggleComms}
                >
                  <Comap
                    onAssetClick={handleAssetClick}
                    type="Commodities"
                    date={daysAgoToDate(timeRange)}
                    changeDays={change}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleComms}
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    Show Commodities
                  </Button>
                </div>
              )}

              {showIndex ? (
                <div className="w-full h-full animate-fade-in">
                  <div
                    className="relative my-2 w-full h-full cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={toggleIndex}
                  >
                    <IndecesBar
                      date={daysAgoToDate(timeRange)}
                      changeDays={change}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleIndex}
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    Show Indices
                  </Button>
                </div>
              )}
            </CardContent> */}
          </Card>
        )}
      </main>
      <Footer />
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        {selectedAsset && (
          <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm border-border/40">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedAsset.name}
                <Badge
                  variant={
                    getChangeField(selectedAsset, change) >= 0
                      ? "default"
                      : "destructive"
                  }
                  className="ml-2"
                >
                  {getChangeField(selectedAsset, change) >= 0 ? "+" : ""}
                  {getChangeField(selectedAsset, change).toFixed(2)}%
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {selectedAsset.type} • Current Price: $
                {selectedAsset.price
                  ? selectedAsset.price.toFixed(2)
                  : selectedAsset.price.toFixed(2)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="font-medium">
                    ${(selectedAsset.volume / 1000000).toFixed(2)}M
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Performance</p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
