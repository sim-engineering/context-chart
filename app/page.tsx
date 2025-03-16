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
import { Info } from "lucide-react";
import { Asset } from "@/types/types";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Heatmap from "@/components/heatmap";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CurrencyBar from "@/components/currencies";

function daysAgoToDate(days: number): string {
  const today = new Date();
  today.setDate(today.getDate() - days - 1);

  const dayOfWeek = today.getDay();
  if (dayOfWeek === 6) today.setDate(today.getDate() - 1);
  if (dayOfWeek === 0) today.setDate(today.getDate() - 2);

  return today.toISOString().split("T")[0];
}

export default function Home() {
  const [timeRange, setTimeRange] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setOpenDialog(true);
  };

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
                min={2}
                max={730}
                step={1}
                onValueChange={(value) => setTimeRange(value[0])}
                className="w-full"
              />
            </div>

            <div className="relative my-8">
              <CurrencyBar date={daysAgoToDate(timeRange)} />
            </div>

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
                      Assets below $10 appear smaller, assets below $500 appear
                      slightly smaller, and higher-priced assets maintain their
                      relative size based on market cap.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="sm:transform sm:scale-10">
              <div className="flex gap-6">
                {" "}
                {/* Adds a gap between the individual heatmap items */}
                <Heatmap
                  onAssetClick={handleAssetClick}
                  type={"Indeces"}
                  date={daysAgoToDate(timeRange)}
                />
                <div className="border-t-4 border-gray-500 my-6"></div>
                <div></div>
              </div>
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
