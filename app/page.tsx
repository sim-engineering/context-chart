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
import Stockmap from "@/components/stockmap";
import CurrencyChart from "@/components/currency-chart";
import CurrencyBar from "@/components/currencies";
import IndecesBar from "@/components/indexes";
import Comap from "@/components/comap";
import { Button } from "@/components/ui/button";

function daysAgoToDate(days: number): string {
  const today = new Date();
  today.setDate(today.getDate() - days - 1);

  const dayOfWeek = today.getDay();
  if (dayOfWeek === 6) today.setDate(today.getDate() - 1);
  if (dayOfWeek === 0) today.setDate(today.getDate() - 2);

  return today.toISOString().split("T")[0];
}

// Example data in the required format with multiple currencies
const sampleData = {
  "2023-01-01": {
    currencies: [
      { symbol: "BTC", price: 42000, change_1d: 2.5, change_7d: -1.2 },
      { symbol: "ETH", price: 2200, change_1d: 1.8, change_7d: 3.5 },
      { symbol: "DOGE", price: 0.08, change_1d: 5.2, change_7d: -2.1 },
      { symbol: "PEPE", price: 0.000001, change_1d: 12.5, change_7d: 25.8 },
    ],
  },
  "2023-01-02": {
    currencies: [
      { symbol: "BTC", price: 43050, change_1d: 2.5, change_7d: -0.8 },
      { symbol: "ETH", price: 2240, change_1d: 1.8, change_7d: 4.2 },
      { symbol: "DOGE", price: 0.082, change_1d: 2.5, change_7d: -1.5 },
      { symbol: "PEPE", price: 0.0000012, change_1d: 20.0, change_7d: 30.2 },
    ],
  },
  "2023-01-03": {
    currencies: [
      { symbol: "BTC", price: 42500, change_1d: -1.3, change_7d: -0.5 },
      { symbol: "ETH", price: 2280, change_1d: 1.8, change_7d: 5.1 },
      { symbol: "DOGE", price: 0.079, change_1d: -3.7, change_7d: -0.8 },
      { symbol: "PEPE", price: 0.0000011, change_1d: -8.3, change_7d: 22.5 },
    ],
  },
  "2023-01-04": {
    currencies: [
      { symbol: "BTC", price: 43200, change_1d: 1.6, change_7d: 0.2 },
      { symbol: "ETH", price: 2310, change_1d: 1.3, change_7d: 5.8 },
      { symbol: "DOGE", price: 0.081, change_1d: 2.5, change_7d: -0.2 },
      { symbol: "PEPE", price: 20000, change_1d: 18.2, change_7d: 25.1 },
    ],
  },
  "2023-01-05": {
    currencies: [
      { symbol: "BTC", price: 44100, change_1d: 2.1, change_7d: 1.5 },
      { symbol: "ETH", price: 2350, change_1d: 1.7, change_7d: 6.2 },
      { symbol: "DOGE", price: 0.085, change_1d: 4.9, change_7d: 1.2 },
      { symbol: "PEPE", price: 20000, change_1d: 15.4, change_7d: 28.3 },
    ],
  },
  "2023-01-06": {
    currencies: [
      { symbol: "BTC", price: 43800, change_1d: -0.7, change_7d: 2.1 },
      { symbol: "ETH", price: 2330, change_1d: -0.9, change_7d: 5.5 },
      { symbol: "DOGE", price: 0.083, change_1d: -2.4, change_7d: 2.5 },
      { symbol: "PEPE", price: 0.0000014, change_1d: -6.7, change_7d: 27.2 },
    ],
  },
  "2023-01-07": {
    currencies: [
      { symbol: "BTC", price: 44500, change_1d: 1.6, change_7d: 2.8 },
      { symbol: "ETH", price: 2380, change_1d: 2.1, change_7d: 6.8 },
      { symbol: "DOGE", price: 0.086, change_1d: 3.6, change_7d: 3.8 },
      { symbol: "PEPE", price: 0.0000016, change_1d: 14.3, change_7d: 30.5 },
    ],
  },
};

// Example news events
const sampleNewsEvents = [
  {
    date: "2023-01-02",
    title: "Major Exchange Adds New Trading Pairs",
    content:
      "A leading cryptocurrency exchange announced the addition of several new trading pairs, expanding options for traders.",
    impact: 6,
    sentiment: "positive",
    source: "CryptoNews",
  },
  {
    date: "2023-01-04",
    title: "PEPE Meme Coin Gains Popularity",
    content:
      "The PEPE meme coin has seen a surge in popularity on social media platforms, driving increased trading volume.",
    impact: 7,
    sentiment: "positive",
    source: "MemeWatch",
  },
  {
    date: "2023-01-05",
    title: "Regulatory Framework Announced",
    content:
      "Government officials unveiled a new regulatory framework for cryptocurrencies, providing more clarity for institutional investors.",
    impact: 8,
    sentiment: "positive",
    source: "Financial Times",
  },
  {
    date: "2023-01-06",
    title: "Network Congestion Issues",
    content:
      "The Bitcoin network experienced significant congestion, leading to higher transaction fees and slower confirmation times.",
    impact: 7,
    sentiment: "negative",
    source: "Blockchain Monitor",
  },
];

const getChangeField = (asset: Asset, change: string) => {
  if (change === "1d") return asset.change_1d;
  if (change === "7d") return asset.change_7d;
  if (change === "1m") return asset.change_1m;
  if (change === "3m") return asset.change_3m;
  if (change === "1y") return asset.change_1y;
  return asset.change_1d;
};

export default function Home() {
  const [timeRange, setTimeRange] = useState(1);
  const [change, setChange] = useState("1d");
  const [debouncedTimeRange, setDebouncedTimeRange] = useState(timeRange);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [showCom, setShowCom] = useState(false);
  const [showIndex, setShowIndex] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);

  const toggleIndex = () => {
    setShowIndex(!showIndex);
  };

  const toggleComms = () => {
    setShowCom(!showCom);
  };

  const toggleCurrenct = () => {
    setShowCurrency(!showCurrency);
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

  return (
    <div className="min-h-screen flex flex-col bg-background dark">
      <link rel="icon" href="/favicon.ico" sizes="any" />

      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
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
              <div className="flex justify-between mb-5">
                <span className="text-sm text-muted-foreground">
                  Date: {daysAgoToDate(timeRange)}
                </span>
              </div>
              <Slider
                value={[debouncedTimeRange]}
                min={2}
                max={365}
                step={1}
                onValueChange={handleSliderChange}
                className="w-full"
              />
            </div>

            {showCurrency ? (
              <div className="w-full h-full animate-fade-in">
                <div
                  className="relative my-2 w-full h-full"
                  onClick={toggleCurrenct}
                >
                  <CurrencyBar date={daysAgoToDate(timeRange)} />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCurrenct}
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

            <div className="flex flex-col sm:flex-row gap-6 w-full h-full">
              <div className="flex-1">
                <Heatmap
                  onAssetClick={handleAssetClick}
                  type="Crypto"
                  date={daysAgoToDate(timeRange)}
                  changeDays={change}
                />
              </div>
              <div className="flex-1">
                <Stockmap
                  onAssetClick={handleAssetClick}
                  type="Stocks"
                  date={daysAgoToDate(timeRange)}
                  changeDays={change}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 min-h-screen">
              <CurrencyChart
                data={sampleData}
                newsEvents={sampleNewsEvents}
                title="Cryptocurrency Performance"
                description="Multi-currency price chart with market events"
                defaultCurrencies={["BTC", "ETH", "DOGE", "PEPE"]}
              />
            </div>
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
                  : selectedAsset.close.toFixed(2)}
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
