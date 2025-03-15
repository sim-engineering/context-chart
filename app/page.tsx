"use client";

import { useState, useEffect } from "react";
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
import { Grid2X2, LayoutGrid, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Asset } from "@/types/types";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Heatmap from "@/components/heatmap";
import { generateDummyData } from "@/lib/dummy-data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";

const CurrencyCard = ({ currencyData }: { currencyData: Asset }) => {
  const { symbol, price, change } = currencyData;

  const changeColor = change > 0 ? "text-green-500" : "text-red-500";

  return (
    <div className="flex items-center justify-between rounded-lg shadow-md p-2 w-40 bg-gray-800">
      <div className="flex flex-col items-start">
        <span className="text-xs font-semibold text-white font-mono">
          {symbol}
        </span>
        <span className="text-xs text-white font-mono">
          ${price.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span className={`text-xs font-bold ${changeColor} mt-1 font-mono`}>
          {change.toFixed(2)}%
        </span>
        <span
          className={`w-2 h-2 rounded-full ${
            change > 0 ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </div>
    </div>
  );
};

function daysAgoToDate(days: number): string {
  const today = new Date();
  today.setDate(today.getDate() - days);
  return today.toISOString().split("T")[0]; // Formats as YYYY-MM-DD
}

export default function Home() {
  const [timeRange, setTimeRange] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isQuilted, setIsQuilted] = useState(true);
  const [data, setData] = useState<Asset[] | null>(null);
  const [indexData, setIndexData] = useState<Asset[] | null>(null);
  const [comData, setComData] = useState<Asset[] | null>(null);
  const [cryptoData, setCryptoData] = useState<Asset[] | null>(null);
  const [fxData, setFxData] = useState<Asset[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    crypto: true,
    indices: true,
    commodities: true,
    bonds: true,
    forex: true,
  });

  const [isLoadingData, setIsLoadingData] = useState({
    fx: false,
    crypto: false,
    indices: false,
    commodities: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Update loading state for specific sections
        setIsLoadingData({
          fx: true,
          crypto: true,
          indices: true,
          commodities: true,
        });

        const results = await Promise.all([
          [],
          [],
          [],
          [],
          fetch(`/api/forex?date=${daysAgoToDate(timeRange)}`)
            .then((res) => res.json())
            .then((data) => data)
            .catch((err) => {
              console.error("Error fetching forex data:", err);
              return [];
            }),
        ]);

        const [d, i, c, crypto, fx] = results as [
          Asset[],
          Asset[],
          Asset[],
          Asset[],
          Asset[]
        ];

        setData(d);
        setIndexData(i);
        setComData(c);
        setCryptoData(crypto);
        setFxData(fx);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setIsLoadingData({
          fx: false,
          crypto: false,
          indices: false,
          commodities: false,
        });
      }
    };

    fetchData();
  }, [timeRange, selectedFilters]);

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setOpenDialog(true);
  };

  const toggleViewMode = () => {
    setIsQuilted(!isQuilted);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background dark">
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
                <Button
                  variant="outline"
                  className="w-full sm:w-auto flex items-center gap-2"
                  onClick={toggleViewMode}
                >
                  {isQuilted ? (
                    <>
                      <Grid2X2 className="h-4 w-4" />
                      <span>Grid View</span>
                    </>
                  ) : (
                    <>
                      <LayoutGrid className="h-4 w-4" />
                      <span>Quilted View</span>
                    </>
                  )}
                </Button>

                <Tabs defaultValue="1d" className="w-full sm:w-auto">
                  <TabsList className="grid grid-cols-6 w-full">
                    <TabsTrigger value="1d" onClick={() => setTimeRange(1)}>
                      1D
                    </TabsTrigger>
                    <TabsTrigger value="7d" onClick={() => setTimeRange(7)}>
                      7D
                    </TabsTrigger>
                    <TabsTrigger value="30d" onClick={() => setTimeRange(30)}>
                      1M
                    </TabsTrigger>
                    <TabsTrigger value="90d" onClick={() => setTimeRange(90)}>
                      3M
                    </TabsTrigger>
                    <TabsTrigger value="1y" onClick={() => setTimeRange(365)}>
                      1Y
                    </TabsTrigger>
                    <TabsTrigger value="2y" onClick={() => setTimeRange(730)}>
                      2Y
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between mb-5">
                <span className="text-sm text-muted-foreground">
                  Date: {daysAgoToDate(timeRange)}
                </span>
              </div>
              <Slider
                value={[timeRange]}
                min={1}
                max={730}
                step={1}
                onValueChange={(value) => setTimeRange(value[0])}
                className="w-full"
              />
            </div>
            <div>
              <div className="relative my-8">
                <div className="absolute left-1 top-1/2 -translate-y-1/2 bg-gray-800/70 text-white text-[10px] px-1 py-0.5 rounded-full shadow-md pointer-events-none">
                  ◀
                </div>

                <div
                  className="flex gap-1 overflow-x-auto scrollbar-hide px-6 justify-center items-center"
                  style={{ height: "100px" }}
                >
                  {/* Show loading spinner while fetching fxData */}
                  {isLoadingData.fx ? (
                    <div
                      className="flex justify-center items-center"
                      style={{ height: "100%" }}
                    >
                      <Spinner size="sm" />
                    </div>
                  ) : (
                    fxData?.currencies.map((fx) => (
                      <CurrencyCard key={fx.symbol} currencyData={fx} />
                    ))
                  )}
                </div>

                <div className="absolute right-1 top-1/2 -translate-y-1/2 bg-gray-800/70 text-white text-[10px] px-1 py-0.5 rounded-full shadow-md pointer-events-none">
                  ▶
                </div>
              </div>
            </div>
            {isQuilted && (
              <div className="mb-4 flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Quilted view: Box sizes represent market capitalization and
                  price
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Assets below $10 appear smaller, assets below $500
                        appear slightly smaller, and higher-priced assets
                        maintain their relative size based on market cap.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            {/* {!isQuilted ? (
              <Heatmap
                data={data}
                onAssetClick={handleAssetClick}
                isQuilted={isQuilted}
              />
            ) : (
              <div className="sm:transform sm:scale-10">
                <div className="flex gap-6">
                  <Heatmap
                    data={indexData}
                    onAssetClick={handleAssetClick}
                    isQuilted={isQuilted}
                    type={"Indeces"}
                    isLoading={isLoadingData.indices}
                  />
                  <div className="border-t-4 border-gray-500 my-6"></div>
                  <Heatmap
                    data={cryptoData}
                    onAssetClick={handleAssetClick}
                    isQuilted={isQuilted}
                    type={"Crypto"}
                    isLoading={isLoadingData.crypto}
                  />
                </div>
                <div className="my-6">
                  <div className="border-t border-gray-300"></div>
                </div>
                <Heatmap
                  data={comData}
                  onAssetClick={handleAssetClick}
                  isQuilted={isQuilted}
                  type={"Commodities"}
                  isLoading={isLoadingData.commodities}
                />
              </div>
            )} */}
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
                    ${(selectedAsset.volume / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="font-medium">
                    ${(selectedAsset.marketCap / 1000000000).toFixed(2)}B
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">52w High</p>
                  <p className="font-medium">
                    ${selectedAsset.high.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">52w Low</p>
                  <p className="font-medium">${selectedAsset.low.toFixed(2)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Performance</p>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    className={`p-2 rounded-md text-center ${
                      selectedAsset.performance.day >= 0
                        ? "bg-green-500/20"
                        : "bg-red-500/20"
                    }`}
                  >
                    <p className="text-xs text-muted-foreground">1D</p>
                    <p className="font-medium">
                      {selectedAsset.performance.day >= 0 ? "+" : ""}
                      {selectedAsset.performance.day.toFixed(2)}%
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-md text-center ${
                      selectedAsset.performance.week >= 0
                        ? "bg-green-500/20"
                        : "bg-red-500/20"
                    }`}
                  >
                    <p className="text-xs text-muted-foreground">7D</p>
                    <p className="font-medium">
                      {selectedAsset.performance.week >= 0 ? "+" : ""}
                      {selectedAsset.performance.week.toFixed(2)}%
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-md text-center ${
                      selectedAsset.performance.month >= 0
                        ? "bg-green-500/20"
                        : "bg-red-500/20"
                    }`}
                  >
                    <p className="text-xs text-muted-foreground">30D</p>
                    <p className="font-medium">
                      {selectedAsset.performance.month >= 0 ? "+" : ""}
                      {selectedAsset.performance.month.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
