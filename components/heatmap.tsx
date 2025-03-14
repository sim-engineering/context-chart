"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export default function Heatmap({ data, onAssetClick, isQuilted = false }) {
  const [groupedData, setGroupedData] = useState({});
  const [isExpanded, setIsExpanded] = useState({});

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

    // Initialize expansion state for each type
    const expandedState = Object.keys(grouped).reduce((acc, type) => {
      acc[type] = true; // Default to expanded on mobile
      return acc;
    }, {});
    setIsExpanded(expandedState);
  }, [data]);

  const getColorIntensity = (change) => {
    const absChange = Math.abs(change);
    let intensity = 0;

    if (absChange < 1) intensity = 10;
    else if (absChange < 3) intensity = 20;
    else if (absChange < 5) intensity = 30;
    else if (absChange < 10) intensity = 50;
    else if (absChange < 15) intensity = 70;
    else intensity = 90;

    return intensity;
  };

  const getBackgroundColor = (change) => {
    const intensity = getColorIntensity(change);
    return change >= 0
      ? `bg-green-500/${intensity}`
      : `bg-red-500/${intensity}`;
  };

  const getFlashingClass = (change) => {
    const absChange = Math.abs(change);
    if (absChange >= 10) {
      return "flashing"; // Flashing effect if the change is 10% or more
    }
    return "";
  };

  const calculateSize = (asset, maxMarketCap) => {
    // Significantly reduced size for mobile
    const maxSize = 2; // Limit to 2 units max on mobile

    let baseSize = Math.max(
      1,
      Math.min(maxSize, Math.ceil((maxSize * asset.marketCap) / maxMarketCap))
    );

    // Most tiles should be size 1 on mobile
    if (asset.marketCap < maxMarketCap * 0.5) {
      baseSize = 1;
    }

    return baseSize;
  };

  const toggleExpand = (type) => {
    setIsExpanded((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const maxMarketCap = isQuilted
    ? Math.max(...data.map((asset) => asset.marketCap))
    : 0;

  if (isQuilted) {
    return (
      <div className="space-y-2 border p-1 sm:p-4">
        <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1 sm:gap-2 auto-rows-[40px] sm:auto-rows-[80px]">
          {data.map((asset) => {
            const size = calculateSize(asset, maxMarketCap);
            return (
              <div
                key={asset.id}
                className={`${getBackgroundColor(
                  asset.change
                )} ${getFlashingClass(
                  asset.change
                )} rounded-lg cursor-pointer transition-all active:scale-95 hover:shadow-lg flex flex-col justify-between overflow-hidden relative touch-manipulation`}
                onClick={() => onAssetClick(asset)}
                style={{
                  gridColumn: `span ${size} / span ${size}`,
                  gridRow: `span ${size} / span ${size}`,
                }}
                title={`${asset.name} (${asset.symbol}): $${asset.price.toFixed(
                  2
                )} | ${asset.change >= 0 ? "+" : ""}${asset.change.toFixed(
                  2
                )}%`}
              >
                {/* Extremely simplified mobile layout */}
                <div className="h-full w-full flex flex-col justify-between p-1 sm:p-2">
                  <div className="flex justify-between items-start w-full">
                    <div className="font-medium text-[10px] sm:text-sm">
                      {asset.symbol}
                    </div>
                    <div
                      className={`text-[8px] sm:text-xs font-medium ${
                        asset.change >= 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {asset.change >= 0 ? "+" : ""}
                      {asset.change.toFixed(1)}%
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="text-[10px] sm:text-sm font-medium">
                      $
                      {asset.price < 10
                        ? asset.price.toFixed(1)
                        : Math.round(asset.price)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Object.entries(groupedData).map(([type, assets]) => (
        <div key={type} className="space-y-1 border rounded-lg p-2">
          <h3
            className="text-sm sm:text-lg font-medium flex items-center justify-between cursor-pointer"
            onClick={() => toggleExpand(type)}
          >
            <div className="flex items-center">
              {type}
              <Badge variant="outline" className="ml-2 text-xs">
                {assets.length}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {isExpanded[type] ? "↑" : "↓"}
            </span>
          </h3>

          {isExpanded[type] && (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 sm:gap-2">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className={`${getBackgroundColor(
                    asset.change
                  )} ${getFlashingClass(
                    asset.change
                  )} p-1 sm:p-3 rounded-lg cursor-pointer transition-all active:scale-95 hover:shadow-lg touch-manipulation`}
                  onClick={() => onAssetClick(asset)}
                  title={`${asset.name} (${
                    asset.symbol
                  }): $${asset.price.toFixed(2)} | ${
                    asset.change >= 0 ? "+" : ""
                  }${asset.change.toFixed(2)}%`}
                >
                  <div className="flex justify-between items-start">
                    <h4
                      className="font-medium truncate text-xs sm:text-sm"
                      title={asset.name}
                    >
                      {asset.symbol}
                    </h4>
                    <span
                      className={`text-[8px] sm:text-xs font-medium ${
                        asset.change >= 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {asset.change >= 0 ? "+" : ""}
                      {asset.change.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[8px] sm:text-xs text-muted-foreground truncate mt-1">
                    {asset.name.length > 8
                      ? asset.name.substring(0, 8) + "..."
                      : asset.name}
                  </p>
                  <p className="text-xs sm:text-sm font-medium mt-1">
                    $
                    {asset.price < 10
                      ? asset.price.toFixed(1)
                      : Math.round(asset.price)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
