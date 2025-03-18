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
import { Slider } from "@/components/ui/slider";
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

import { sampleNewsEvents } from "@/types/mock";
import {
  daysAgoToDate,
  getChangeField,
  getCurrencyColor,
} from "@/utils/helpers";

export default function Home() {
  const [timeRange, setTimeRange] = useState(1);
  const [change, setChange] = useState("1d");
  const [debouncedTimeRange, setDebouncedTimeRange] = useState(timeRange);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [showCom, setShowCom] = useState(false);
  const [showIndex, setShowIndex] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [mergedData, setMergedData] = useState({});

  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [availableCrypto, setAvailableCrypto] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState<string[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);

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

  const toggleIndex = () => {
    setShowIndex((prevShowIndex) => !prevShowIndex);
  };

  const toggleComms = () => {
    setShowCom((prevShowCom) => !prevShowCom);
  };

  const toggleCurrency = () => {
    setShowCurrency((prevShowCurrency) => !prevShowCurrency);
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setOpenDialog(true);
  };

  const handleSliderChange = useCallback((value: number[]) => {
    setDebouncedTimeRange(value[0]);
  }, []);

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

          const mergedCurrencies = [...cryptoCurrencies, ...stockCurrencies];

          combinedData[date] = { currencies: mergedCurrencies };
        });

        setMergedData(combinedData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [selectedCrypto, selectedCurrencies, timeRange]);

  const selectCrypto = (currency: string) => {
    setSelectedCrypto((prevSelected) =>
      prevSelected.includes(currency)
        ? prevSelected.filter((item) => item !== currency)
        : [...prevSelected, currency]
    );
  };

  const selectCurrencies = (currency: string) => {
    setSelectedCurrencies((prevSelected) =>
      prevSelected.includes(currency)
        ? prevSelected.filter((item) => item !== currency)
        : [...prevSelected, currency]
    );
  };

  return (
    <div className="flex container flex-col bg-background dark">
      <link rel="icon" href="/favicon.ico" sizes="any" />

      <Header />
      <main className="flex-1 mx-auto px-1 py-6">
        <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Market Heatmap
                </CardTitle>
                <CardDescription>
                  Performance visualization across different asset classes
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
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
                                backgroundColor: getCurrencyColor(currency),
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
                          onCheckedChange={() => selectCurrencies(currency)}
                          className="bg-black hover:bg-secondary"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: getCurrencyColor(currency),
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

              <div className="w-full flex justify-end"></div>
              <div className="flex justify-between mb-5">
                <span className="text-sm text-muted-foreground">
                  Date: {daysAgoToDate(timeRange)}
                </span>
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

            <div className="flex flex-wrap w-full h-full md:flex-nowrap">
              <div className="w-full md:w-1/2">
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
              <div className="w-full md:w-1/2 p-4 bg-slate-950">
                <CurrencyChart
                  data={mergedData}
                  newsEvents={sampleNewsEvents}
                  defaultCurrencies={availableCrypto.concat(
                    availableCurrencies
                  )}
                />
              </div>
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
          </CardContent>
        </Card>
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
