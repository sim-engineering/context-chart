"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export default function Heatmap({ data, onAssetClick, isQuilted = false }) {
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
    let baseSize = Math.max(
      1,
      Math.min(4, Math.ceil((4 * asset.marketCap) / maxMarketCap))
    );
    if (asset.price < 10) baseSize = Math.max(1, baseSize - 2);
    else if (asset.price < 500) baseSize = Math.max(1, baseSize - 1);

    return baseSize;
  };

  const maxMarketCap = isQuilted
    ? Math.max(...data.map((asset) => asset.marketCap))
    : 0;

  if (isQuilted) {
    return (
      <div className="space-y-6 border p-4">
        <div className="grid grid-cols-12 gap-2 auto-rows-[80px]">
          {data.map((asset) => {
            const size = calculateSize(asset, maxMarketCap);
            return (
              <div
                key={asset.id}
                className={`${getBackgroundColor(
                  asset.change
                )} ${getFlashingClass(
                  asset.change
                )} rounded-lg cursor-pointer transition-all hover:shadow-lg flex flex-col justify-between overflow-hidden relative p-2`}
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
                {size === 1 ? (
                  /* Special compact layout for tiny boxes */
                  <div className="h-full flex flex-col justify-between">
                    <div className="font-bold text-xs mb-auto text-center">
                      {asset.symbol}
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium">
                        $
                        {asset.price < 10
                          ? asset.price.toFixed(1)
                          : Math.round(asset.price)}
                      </div>
                      <div
                        className={`text-[10px] font-medium ${
                          asset.change >= 0 ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {asset.change >= 0 ? "+" : ""}
                        {asset.change.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Normal layout for larger boxes */
                  <>
                    <div className="flex justify-between items-start w-full">
                      <div className="overflow-hidden">
                        <h4
                          className={`font-medium truncate ${
                            size <= 2 ? "text-xs" : "text-sm"
                          } min-w-[40px]`}
                          title={asset.name}
                        >
                          {asset.symbol}
                        </h4>
                        {size > 1 && (
                          <span className="text-xs text-muted-foreground truncate block">
                            {asset.type}
                          </span>
                        )}
                      </div>
                      <span
                        className={`${
                          size <= 2 ? "text-xs" : "text-sm"
                        } font-medium ${
                          asset.change >= 0 ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {asset.change >= 0 ? "+" : ""}
                        {asset.change.toFixed(2)}%
                      </span>
                    </div>

                    <div className="mt-auto">
                      {size > 1 && (
                        <p
                          className="text-xs text-muted-foreground truncate"
                          title={asset.name}
                        >
                          {size <= 2
                            ? asset.name.length > 10
                              ? asset.name.substring(0, 10) + "..."
                              : asset.name
                            : asset.name}
                        </p>
                      )}
                      <p
                        className={`${
                          size <= 2 ? "text-xs" : "text-sm"
                        } font-medium ${size === 1 ? "mt-0" : "mt-1"}`}
                      >
                        $
                        {asset.price < 1
                          ? asset.price.toFixed(1)
                          : asset.price.toFixed(size === 1 ? 0 : 2)}
                      </p>
                      {size > 2 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Market Cap: $
                          {(asset.marketCap / 1000000000).toFixed(1)}B
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className={`${getBackgroundColor(
                  asset.change
                )} ${getFlashingClass(
                  asset.change
                )} p-3 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg`}
                onClick={() => onAssetClick(asset)}
                title={`${asset.name} (${asset.symbol}): $${asset.price.toFixed(
                  2
                )} | ${asset.change >= 0 ? "+" : ""}${asset.change.toFixed(
                  2
                )}%`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4
                    className="font-medium truncate min-w-[40px]"
                    title={asset.name}
                  >
                    {asset.symbol}
                  </h4>
                  <span
                    className={`text-xs font-medium ${
                      asset.change >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {asset.change >= 0 ? "+" : ""}
                    {asset.change.toFixed(2)}%
                  </span>
                </div>
                <p
                  className="text-xs text-muted-foreground truncate"
                  title={asset.name}
                >
                  {asset.name}
                </p>
                <p className="text-sm font-medium mt-1">
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
