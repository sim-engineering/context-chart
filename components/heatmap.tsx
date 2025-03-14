"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export default function Heatmap({
  data,
  onAssetClick,
  isQuilted = false,
  type = null,
}) {
  const [groupedData, setGroupedData] = useState({});

  useEffect(() => {
    // Group data by type
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {});
    setGroupedData(grouped);
  }, [data]);

  const getColorIntensity = (change) => {
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

  const getBackgroundColor = (change) => {
    const intensity = getColorIntensity(change);
    return change >= 0 ? `bg-teal-800` : `bg-red-700`;
  };

  // Calculate the relative size for quilted view based on market cap and price
  const calculateSize = (asset, maxMarketCap) => {
    // Base size calculation from market cap (1-4)
    let baseSize = Math.max(
      1,
      Math.min(5, Math.ceil((5 * asset.marketCap) / maxMarketCap)) // Max size is now 5 instead of 4
    );

    // Apply price-based adjustments
    if (asset.price < 10) {
      // Very low-priced assets (below $10) get reduced by 2 sizes (minimum 1)
      baseSize = Math.max(1, baseSize - 2);
    } else if (asset.price < 100) {
      // Low-priced assets (below $100) get reduced by 1 size (minimum 1)
      baseSize = Math.max(1, baseSize - 1);
    } else if (asset.price < 500) {
      // Medium-priced assets (between $100 and $500) get a slight reduction (but not too much)
      baseSize = Math.max(1, baseSize); // No change, still keeps the size from the base calculation
    } else if (asset.price < 1000) {
      // New price range, for assets between $500 and $1000
      baseSize = Math.min(5, baseSize + 1); // Add 1 size, but ensure it doesn't exceed the maximum size
    }

    return baseSize;
  };

  // Find max market cap across all assets for the quilted view
  const maxMarketCap = isQuilted
    ? Math.max(...data.map((asset) => asset.marketCap))
    : 0;

  // Render quilted view with all assets combined
  if (isQuilted) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg sm:text-[15px] truncate block">{type}</h1>
        <div className="grid grid-cols-6 gap-1 auto-rows-[20px] sm:scale-100 md:scale-20 lg:grid-cols-12 lg:gap-2 lg:auto-rows-[60px]">
          {data.map((asset) => {
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

  // Regular grid view grouped by asset type
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
}
