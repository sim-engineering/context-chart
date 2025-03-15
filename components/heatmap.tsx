"use client";
import { Asset, PerformanceRating, assetTypes } from "@/types/types";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface HeatmapProps {
  data: Asset[];
  onAssetClick: (asset: Asset) => void;
  isQuilted?: boolean;
  type?: string | null;
}

const Heatmap: React.FC<HeatmapProps> = ({
  data,
  onAssetClick,
  isQuilted = false,
  type = null,
}) => {
  const [groupedData, setGroupedData] = useState<GroupedData>({});

  useEffect(() => {
    const grouped = data.reduce(
      (acc: { [key: string]: Asset[] }, item: Asset) => {
        if (!acc[item.type]) {
          acc[item.type] = [];
        }
        acc[item.type].push(item);
        return acc;
      },
      {}
    );
    setGroupedData(grouped);
  }, [data]);

  const getColorIntensity = (change: number) => {
    const absChange = Math.abs(change);
    let intensity = 0;

    if (absChange < 1) intensity = 2;
    else if (absChange < 3) intensity = 4;
    else if (absChange < 5) intensity = 5;
    else if (absChange < 10) intensity = 50;
    else if (absChange < 15) intensity = 70;
    else intensity = 90;

    return intensity;
  };

  const getBackgroundColor = (change: number) => {
    return change >= 0 ? `bg-teal-800` : `bg-red-700`;
  };

  const calculateSize = (asset: Asset, maxMarketCap: number) => {
    let baseSize = Math.max(
      1,
      Math.min(3, Math.ceil((3 * asset.marketCap) / maxMarketCap))
    );

    if (asset.price < 10) {
      baseSize = Math.max(1, baseSize - 2);
    } else if (asset.price < 100) {
      baseSize = Math.max(1, baseSize - 1);
    } else if (asset.price < 500) {
      baseSize = Math.max(1, baseSize);
    } else if (asset.price < 1000) {
      baseSize = Math.min(5, baseSize + 1);
    }

    return baseSize;
  };

  const maxMarketCap = isQuilted
    ? Math.max(...data.map((asset: Asset) => asset.marketCap))
    : 0;

  if (isQuilted) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg sm:text-[15px] truncate block">{type}</h1>
        <div className="grid grid-cols-6 gap-1 auto-rows-[20px] sm:scale-100 md:scale-20 lg:grid-cols-12 lg:gap-2 lg:auto-rows-[60px] grid-auto-flow-dense">
          {data.map((asset: Asset) => {
            const size = calculateSize(asset, maxMarketCap);
            return (
              <div
                key={asset.id}
                className={`${getBackgroundColor(
                  asset.change
                )} p-2 rounded-lg cursor-pointer transition-all hover:shadow-lg flex flex-col justify-between overflow-hidden`}
                onClick={() => onAssetClick(asset)}
                style={{
                  gridColumn: `span ${size} / span ${size}`,
                  gridRow: `span ${size} / span ${size}`,
                }}
              >
                <div className="flex justify-between items-start w-full">
                  <div className="overflow-hidden">
                    <h4
                      className={`font-medium truncate ${
                        size === 1
                          ? "text-xs sm:text-[10px]"
                          : "text-sm sm:text-xs"
                      }`}
                      title={asset.name}
                    >
                      {asset.symbol}
                    </h4>
                    {size && (
                      <span className="text-xs sm:text-[10px] text-muted-foreground truncate block">
                        {asset.type}
                      </span>
                    )}
                  </div>
                  <span
                    className={`${
                      size === 1
                        ? "text-[10px] sm:text-xs"
                        : "text-xs sm:text-[10px]"
                    } font-medium text-white`}
                  >
                    {asset.change >= 0 ? "+" : ""}
                    {asset.change.toFixed(2)}%
                  </span>
                </div>

                <div className="mt-auto">
                  {size && (
                    <p
                      className="text-xs sm:text-[10px] text-muted-foreground truncate"
                      title={asset.name}
                    >
                      {asset.name}
                    </p>
                  )}
                  <p
                    className={`${
                      size === 1
                        ? "text-xs sm:text-[10px]"
                        : "text-sm sm:text-xs"
                    } font-medium ${size === 1 ? "mt-0" : "mt-1"}`}
                  >
                    $
                    {asset.price < 1
                      ? asset.price.toFixed(1)
                      : asset.price.toFixed(size === 1 ? 0 : 2)}
                  </p>
                  {size && (
                    <p className="text-xs sm:text-[10px] text-muted-foreground mt-1">
                      Market Cap: ${(asset.marketCap / 1000000000).toFixed(1)}B
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  type GroupedData = {
    [type: string]: Asset[];
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedData).map(([type, assets]) => (
        <div key={type} className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            {type}
            <Badge variant="outline" className="ml-2">
              {assets.length} assets
            </Badge>
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className={`${getBackgroundColor(
                  asset.change
                )} p-2 sm:p-3 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg`}
                onClick={() => onAssetClick(asset)}
              >
                <div className="flex justify-between items-start mb-1 sm:mb-2">
                  <h4
                    className="text-xs sm:text-sm font-medium truncate"
                    title={asset.name}
                  >
                    {asset.symbol}
                  </h4>
                  <span
                    className={`text-[10px] sm:text-xs font-medium ${
                      asset.change >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {asset.change >= 0 ? "+" : ""}
                    {asset.change.toFixed(2)}%
                  </span>
                </div>
                <p
                  className="text-[10px] sm:text-xs text-muted-foreground truncate"
                  title={asset.name}
                >
                  {asset.name}
                </p>
                <p className="text-xs sm:text-sm font-medium mt-1">
                  ${asset.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Heatmap;
