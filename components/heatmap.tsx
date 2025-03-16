"use client";
import { Asset } from "@/types/types";

import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

interface HeatmapProps {
  onAssetClick: (asset: Asset) => void;
  type?: string | null;
  date: string | null;
}

const Heatmap: React.FC<HeatmapProps> = ({
  onAssetClick,
  type = null,
  date = null,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<Asset[] | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setLoading(true);

    const fetchData = (attempt: number) => {
      fetch(`/api/assets?date=${date}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch data");
          return res.json();
        })
        .then((data) => {
          setData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(`Error fetching forex data (attempt ${attempt}):`, err);

          if (attempt < 1) {
            setTimeout(() => {
              setRetry((prev) => prev + 1);
            }, 500);
          } else {
            setData([]);
            setLoading(false);
          }
        });
    };

    fetchData(retry);
  }, [date, retry]);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <Spinner />
      </div>
    );
  }

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

  const calculateSize = (asset: Asset, maxVolume: number) => {
    if (asset.volume === 0) {
      return 1;
    }

    let baseSize = Math.max(
      1,
      Math.min(3, Math.ceil((3 * asset.volume) / maxVolume))
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

  let maxVolume = 0;

  if (data && date) {
    maxVolume =
      data &&
      data[date] &&
      Array.isArray(data[date].currencies) &&
      data[date].currencies.length > 0
        ? Math.max(...data[date].currencies.map((asset: Asset) => asset.volume))
        : 0;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg sm:text-[15px] truncate block">{type}</h1>
      <div className="grid grid-cols-6 gap-1 auto-rows-[20px] sm:scale-100 md:scale-20 lg:grid-cols-12 lg:gap-2 lg:auto-rows-[60px] grid-auto-flow-dense">
        {data &&
        data[date] &&
        Array.isArray(data[date].currencies) &&
        data[date].currencies.length > 0 ? (
          data[date].currencies.map((asset: Asset) => {
            let size = calculateSize(asset, maxVolume);
            if (size < 1) {
              size = 1; // Ensure there's always a minimum size
            }
            return (
              <div
                key={asset.symbol}
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
                    {asset.change && asset.change.toFixed(2)}%
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
          })
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
};

export default Heatmap;
