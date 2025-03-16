"use client";

import { useState, useEffect, useCallback, memo, useMemo } from "react";
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
import { Info, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { Asset } from "@/types/types";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Heatmap from "@/components/heatmap";
import Stockmap from "@/components/stockmap";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CurrencyBar from "@/components/currencies";
import IndecesBar from "@/components/indexes";
import Comap from "@/components/comap";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Flexible date calculation with optional weekend adjustment
function daysAgoToDate(days, adjustWeekends = true) {
  const today = new Date();
  today.setDate(today.getDate() - days - 1);

  if (adjustWeekends) {
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 6) today.setDate(today.getDate() - 1); // Saturday
    if (dayOfWeek === 0) today.setDate(today.getDate() - 2); // Sunday
  }

  return today.toISOString().split("T")[0];
}

// Format date to be more readable
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Format large numbers with K, M, B suffixes
function formatCurrency(value) {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

// Memoized components to prevent unnecessary re-renders
const MemoizedHeatmap = memo(Heatmap);
const MemoizedStockmap = memo(Stockmap);
const MemoizedComap = memo(Comap);
const MemoizedCurrencyBar = memo(CurrencyBar);
const MemoizedIndecesBar = memo(IndecesBar);

// Component for displaying loading spinner that takes full width and height
const LoadingSpinner = () => (
  <div className="w-full h-full min-h-[600px] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading market data...</p>
    </div>
  </div>
);

export default function Home() {
  const [timeRange, setTimeRange] = useState(1);
  const [change, setChange] = useState("1d");
  const [debouncedTimeRange, setDebouncedTimeRange] = useState(timeRange);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("all"); // New state for view toggle

  // Calculate dates only when dependencies change
  const currentDate = useMemo(
    () => daysAgoToDate(debouncedTimeRange, true),
    [debouncedTimeRange]
  );

  const cryptoDate = useMemo(
    () => daysAgoToDate(debouncedTimeRange, false),
    [debouncedTimeRange]
  );

  const handleAssetClick = useCallback((asset) => {
    setSelectedAsset(asset);
    setOpenDialog(true);
  }, []);

  const handleSliderChange = useCallback((value) => {
    setDebouncedTimeRange(value[0]);
  }, []);

  const handleChangeTab = useCallback((value) => {
    setChange(value);
  }, []);

  // Debounce the timeRange update
  useEffect(() => {
    const handler = setTimeout(() => {
      setTimeRange(debouncedTimeRange);
    }, 300);
    return () => clearTimeout(handler);
  }, [debouncedTimeRange]);

  // Set loading state when important parameters change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800); // Increased time for demo purposes
    return () => clearTimeout(timer);
  }, [timeRange, change, view]);

  const tabOptions = [
    { value: "15m", label: "15min", disabled: true },
    { value: "1d", label: "1D" },
    { value: "7d", label: "7D" },
    { value: "1m", label: "1M" },
    { value: "3m", label: "3M" },
    { value: "1y", label: "1Y" },
  ];

  const viewOptions = [
    { value: "all", label: "All Assets" },
    { value: "crypto", label: "Crypto" },
    { value: "stocks", label: "Stocks" },
    { value: "commodities", label: "Commodities" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background dark">
      <link rel="icon" href="/favicon.ico" sizes="any" />

      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Card className="border-border/40 bg-card/30 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Market Heatmap
                </CardTitle>
                <CardDescription>
                  Performance visualization across different asset classes
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Tabs
                  defaultValue="1d"
                  value={change}
                  onValueChange={handleChangeTab}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="grid grid-cols-6 w-full">
                    {tabOptions.map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        disabled={tab.disabled}
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            {/* Enhanced Date Slider with Tooltip */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatDate(currentDate)}{" "}
                    {change === "1d" ? "(24h change)" : `(${change} change)`}
                  </span>
                </div>

                {/* View Toggle Buttons */}
                <div className="flex gap-2">
                  {viewOptions.map((option) => (
                    <Button
                      key={option.value}
                      size="sm"
                      variant={view === option.value ? "default" : "outline"}
                      onClick={() => setView(option.value)}
                      className="h-8"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Slider
                        value={[debouncedTimeRange]}
                        min={2}
                        max={365}
                        step={1}
                        onValueChange={handleSliderChange}
                        className="w-full"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Slide to adjust the historical date range</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Recent</span>
                <span>1 Year Ago</span>
              </div>
            </div>

            {/* Loading State or Content */}
            {isLoading ? (
              <LoadingSpinner /> // Full-width and full-height loading spinner
            ) : (
              <div className="space-y-6">
                {(view === "all" || view === "commodities") && (
                  <>
                    <MemoizedCurrencyBar
                      date={currentDate}
                      key={`currency-${currentDate}`}
                    />
                    <MemoizedComap
                      onAssetClick={handleAssetClick}
                      type="Commodities"
                      date={currentDate}
                      changeDays={change}
                      key={`commodities-${currentDate}-${change}`}
                    />
                    <MemoizedIndecesBar
                      date={currentDate}
                      changeDays={change}
                      key={`indices-${currentDate}-${change}`}
                    />
                  </>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full h-full">
                  {(view === "all" || view === "crypto") && (
                    <MemoizedHeatmap
                      onAssetClick={handleAssetClick}
                      type="Crypto"
                      date={cryptoDate}
                      changeDays={change}
                      key={`crypto-${cryptoDate}-${change}`}
                    />
                  )}

                  {(view === "all" || view === "stocks") && (
                    <MemoizedStockmap
                      onAssetClick={handleAssetClick}
                      type="Stocks"
                      date={currentDate}
                      changeDays={change}
                      key={`stocks-${currentDate}-${change}`}
                    />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />

      {/* Enhanced Asset Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        {selectedAsset && (
          <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm border-border/40">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedAsset.name}
                <Badge
                  variant={
                    selectedAsset.change >= 0 ? "default" : "destructive"
                  }
                  className="ml-2"
                >
                  {selectedAsset.change >= 0 ? "+" : ""}
                  {selectedAsset.change.toFixed(2)}%
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {selectedAsset.type} • Current Price: $
                {selectedAsset.price.toFixed(2)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="font-medium">
                    {formatCurrency(selectedAsset.volume)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">24h High/Low</p>
                  <p className="font-medium">
                    ${selectedAsset.high?.toFixed(2) || "N/A"} / $
                    {selectedAsset.low?.toFixed(2) || "N/A"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Performance ({change})
                  </p>
                  <p className="font-medium">
                    {selectedAsset.change >= 0 ? "Up" : "Down"} by{" "}
                    {Math.abs(selectedAsset.change).toFixed(2)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="font-medium">
                    {formatCurrency(selectedAsset.marketCap || 0)}
                  </p>
                </div>
              </div>

              {/* Additional Historical Data Section */}
              <div className="mt-2 pt-2 border-t border-border/40">
                <h4 className="text-sm font-medium mb-2">
                  Historical Performance
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {["1W", "1M", "1Y"].map((period) => (
                    <div
                      key={period}
                      className="bg-background/50 rounded-md p-2"
                    >
                      <p className="text-xs text-muted-foreground">{period}</p>
                      <p
                        className={`text-sm font-medium ${
                          Math.random() > 0.5
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {Math.random() > 0.5 ? "+" : "-"}
                        {(Math.random() * 20).toFixed(2)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
