"use client";

import { useState } from "react";
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
import { ChevronDown, Grid2X2, LayoutGrid, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function Home() {
  const [timeRange, setTimeRange] = useState(30);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isQuilted, setIsQuilted] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    crypto: true,
    indices: true,
    commodities: true,
    bonds: true,
    forex: true,
  });

  const data = generateDummyData(timeRange, selectedFilters);

  const indexData = generateDummyData(timeRange, {
    crypto: false,
    indices: true,
    commodities: false,
    bonds: false,
    forex: false,
  });
  const comData = generateDummyData(timeRange, {
    crypto: false,
    indices: false,
    commodities: true,
    bonds: false,
    forex: false,
  });
  const cryptoData = generateDummyData(timeRange, {
    crypto: true,
    indices: false,
    commodities: false,
    bonds: false,
    forex: false,
  });
  const fxData = generateDummyData(timeRange, {
    crypto: false,
    indices: false,
    commodities: false,
    bonds: false,
    forex: true,
  });

  const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
    setOpenDialog(true);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilters({
      ...selectedFilters,
      [filter]: !selectedFilters[filter],
    });
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
                {/* <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Asset Classes <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                      checked={selectedFilters.crypto}
                      onCheckedChange={() => handleFilterChange("crypto")}
                    >
                      Cryptocurrencies
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedFilters.indices}
                      onCheckedChange={() => handleFilterChange("indices")}
                    >
                      Indices
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedFilters.commodities}
                      onCheckedChange={() => handleFilterChange("commodities")}
                    >
                      Commodities
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedFilters.bonds}
                      onCheckedChange={() => handleFilterChange("bonds")}
                    >
                      Bonds
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedFilters.forex}
                      onCheckedChange={() => handleFilterChange("forex")}
                    >
                      Forex
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu> */}
                <Tabs defaultValue="1d" className="w-full sm:w-auto">
                  <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="1d" onClick={() => setTimeRange(1)}>
                      1D
                    </TabsTrigger>
                    <TabsTrigger value="7d" onClick={() => setTimeRange(7)}>
                      7D
                    </TabsTrigger>
                    <TabsTrigger value="30d" onClick={() => setTimeRange(30)}>
                      30D
                    </TabsTrigger>
                    <TabsTrigger value="90d" onClick={() => setTimeRange(90)}>
                      90D
                    </TabsTrigger>
                    <TabsTrigger value="1y" onClick={() => setTimeRange(365)}>
                      1Y
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Time Range: {timeRange} days
                </span>
                <span className="text-sm text-muted-foreground">
                  {timeRange} days
                </span>
              </div>
              <Slider
                value={[timeRange]}
                min={1}
                max={365}
                step={1}
                onValueChange={(value) => setTimeRange(value[0])}
                className="w-full"
              />
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
            {!isQuilted ? (
              <Heatmap
                data={data}
                onAssetClick={handleAssetClick}
                isQuilted={isQuilted}
              />
            ) : (
              <div className="sm:transform sm:scale-10">
                <div className="flex gap-6">
                  {" "}
                  {/* Adds a gap between the individual heatmap items */}
                  <Heatmap
                    data={indexData}
                    onAssetClick={handleAssetClick}
                    isQuilted={isQuilted}
                    type={"Indeces"}
                  />
                  <div className="border-t-4 border-gray-500 my-6"></div>
                  <Heatmap
                    data={cryptoData}
                    onAssetClick={handleAssetClick}
                    isQuilted={isQuilted}
                    type={"Crypto"}
                  />
                </div>
                <div className="my-6">
                  <div className="border-t border-gray-300"></div>
                </div>
                <div className="flex gap-6">
                  {" "}
                  {/* Adds a gap between the individual heatmap items */}
                  <Heatmap
                    data={comData}
                    onAssetClick={handleAssetClick}
                    isQuilted={isQuilted}
                    type={"Commodities"}
                  />
                  <div className="border-t-4 border-gray-500 my-6"></div>
                  <Heatmap
                    data={fxData}
                    onAssetClick={handleAssetClick}
                    isQuilted={isQuilted}
                    type={"Forex"}
                  />
                </div>
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
                    selectedAsset.change >= 0 ? "success" : "destructive"
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
