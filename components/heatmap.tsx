"use client";
import { Asset } from "@/types/types";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

interface HeatmapProps {
  onAssetClick: (asset: Asset) => void;
  type?: string | null;
  date: string | null;
  changeDays: string;
  assetType: "stocks" | "crypto";
}

const AssetHeatmap: React.FC<HeatmapProps> = ({
  onAssetClick,
  type = null,
  date = null,
  changeDays = "1d",
  assetType = "crypto",
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<Asset[] | null>(null);
  const [sortedData, setSortedData] = useState<Asset[] | null>(null);

  useEffect(() => {
    setLoading(true);

    const fetchData = () => {
      const endpoint = `/api/${assetType}?date=${date}`;

      fetch(endpoint)
        .then((res) => {
          if (!res.ok) {
            setData([]);
            setLoading(false);
          }
          return res.json();
        })
        .then((data) => {
          setData(data);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          console.error(`Error fetching ${assetType} data`, err);
        });
    };

    fetchData();
  }, [date, assetType]);

  useEffect(() => {
    if (data && data[date] && data[date].currencies) {
      // Sort by market cap & volume for better visual grouping
      const sorted = [...data[date].currencies].sort((a, b) => {
        // First by absolute value of change (to group similar performing assets)
        const changeA = Math.abs(getChangeField(a, changeDays));
        const changeB = Math.abs(getChangeField(b, changeDays));

        if (Math.abs(changeA - changeB) > 2) {
          return changeB - changeA;
        }

        // Then by volume
        return b.volume - a.volume;
      });

      setSortedData(sorted);
    }
  }, [data, date, changeDays]);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-full py-12">
        <Spinner />
      </div>
    );
  }

  // Premium gradient color system
  const getBackgroundColor = (change: number) => {
    // Positive changes - blue/cyan gradient
    if (change >= 10) return "bg-gradient-to-br from-blue-500 to-cyan-600";
    if (change >= 5) return "bg-gradient-to-br from-blue-600 to-cyan-700";
    if (change >= 2) return "bg-gradient-to-br from-blue-700 to-cyan-800";
    if (change >= 0) return "bg-gradient-to-br from-blue-800 to-cyan-900";

    // Negative changes - magenta/purple gradient
    if (change >= -2) return "bg-gradient-to-br from-purple-700 to-pink-800";
    if (change >= -5) return "bg-gradient-to-br from-purple-800 to-pink-900";
    if (change >= -10) return "bg-gradient-to-br from-purple-900 to-pink-950";
    return "bg-gradient-to-br from-fuchsia-900 to-purple-950";
  };

  // Get text color based on change value
  const getTextColor = (change: number) => {
    return change >= 0 ? "text-cyan-100" : "text-pink-100";
  };

  // Advanced treemap-style sizing algorithm
  const calculateSize = (
    asset: Asset,
    maxVolume: number,
    totalAssets: number
  ) => {
    // Base size using square root scaling for better distribution
    const volumeRatio = maxVolume > 0 ? Math.sqrt(asset.volume / maxVolume) : 0;

    // Calculate importance score
    const changeValue = Math.abs(getChangeField(asset, changeDays));
    const changeImportance = Math.min(1, changeValue / 10); // Max boost at 10%

    // Compute base size (1-6 range)
    const baseScore = volumeRatio * 4.5 + changeImportance * 1.5;

    // Add randomization factor to avoid perfect grid alignments (+/- 0.5)
    const variation = (asset.symbol.charCodeAt(0) % 10) / 10 - 0.5;

    // Calculate final size with constraints
    const rawSize = baseScore + variation * 0.8;

    // Ensure proper distribution - limit large tiles when we have many assets
    const maxAllowedSize = totalAssets > 50 ? 4 : totalAssets > 30 ? 5 : 6;

    // Round to integer and apply constraints
    return Math.max(1, Math.min(maxAllowedSize, Math.round(rawSize)));
  };

  // Get change value based on selected time period
  const getChangeField = (asset: Asset, change: string) => {
    if (change === "1d") return asset.change_1d || 0;
    if (change === "7d") return asset.change_7d || 0;
    if (change === "1m") return asset.change_1m || 0;
    if (change === "3m") return asset.change_3m || 0;
    if (change === "1y") return asset.change_1y || 0;
    return asset.change_1d || 0;
  };

  // Format price with appropriate decimal places
  const formatPrice = (price: number, size: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    if (price < 10000) return price.toFixed(1);
    return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  // Format volume with appropriate suffix
  const formatVolume = (volume: number) => {
    if (volume >= 1e12) return `$${(volume / 1e12).toFixed(1)}T`;
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
    return `$${volume.toLocaleString()}`;
  };

  let maxVolume = 0;
  let currencies: Asset[] = [];

  if (sortedData && sortedData.length > 0) {
    currencies = sortedData;
    maxVolume = Math.max(...currencies.map((asset: Asset) => asset.volume));
  } else if (
    data &&
    date &&
    data[date] &&
    Array.isArray(data[date].currencies)
  ) {
    currencies = data[date].currencies;
    maxVolume =
      currencies.length > 0
        ? Math.max(...currencies.map((asset: Asset) => asset.volume))
        : 0;
  }

  return (
    <div className="space-y-3 bg-slate-900 rounded-lg p-4 shadow-xl scale-[0.9]">
      <div className="flex justify-between items-center border-b border-slate-700 pb-3">
        <h1 className="text-lg font-bold text-white">
          {type ||
            (assetType === "crypto" ? "Cryptocurrency Market" : "Stock Market")}
        </h1>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="px-2 py-1 bg-slate-800 rounded-full">
            {currencies.length} assets
          </span>
          <span className="px-2 py-1 bg-slate-800 rounded-full">
            {changeDays} change
          </span>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-1 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-20 xl:grid-cols-24">
        {currencies.length > 0 ? (
          currencies.map((asset: Asset) => {
            const changeValue = getChangeField(asset, changeDays);
            const size = calculateSize(asset, maxVolume, currencies.length);

            return (
              <div
                key={asset.symbol}
                className={`${getBackgroundColor(changeValue)} 
                  rounded overflow-hidden cursor-pointer 
                  shadow-lg hover:shadow-xl hover:scale-[1.02] 
                  transition-all duration-200 flex flex-col justify-between
                  border border-slate-700 backdrop-filter backdrop-blur-sm`}
                onClick={() => onAssetClick(asset)}
                style={{
                  gridColumn: `span ${size} / span ${size}`,
                  gridRow: `span ${size} / span ${size}`,
                }}
              >
                <div className="flex justify-between items-start p-2 w-full bg-black bg-opacity-25">
                  <div className="overflow-hidden">
                    <h4
                      className={`font-bold truncate ${
                        size === 1
                          ? "text-[10px]"
                          : size === 2
                          ? "text-xs"
                          : size >= 5
                          ? "text-base"
                          : "text-sm"
                      } text-white`}
                      title={asset.name}
                    >
                      {asset.symbol}
                    </h4>
                    {size > 1 && (
                      <span
                        className={`${
                          size <= 3 ? "text-[9px]" : "text-xs"
                        } text-slate-300 opacity-80 truncate block`}
                      >
                        {asset.name}
                      </span>
                    )}
                  </div>
                  <span
                    className={`${
                      size === 1
                        ? "text-[9px]"
                        : size === 2
                        ? "text-xs"
                        : "text-sm"
                    } font-bold ${getTextColor(
                      changeValue
                    )} px-1.5 py-0.5 rounded-full bg-black bg-opacity-30`}
                  >
                    {changeValue >= 0 ? "+" : ""}
                    {changeValue?.toFixed(1)}%
                  </span>
                </div>

                {size > 1 && (
                  <div className="p-2 mt-auto">
                    <p
                      className={`font-bold ${
                        size <= 2
                          ? "text-xs"
                          : size === 3
                          ? "text-sm"
                          : size >= 5
                          ? "text-lg"
                          : "text-base"
                      } text-white`}
                    >
                      ${formatPrice(asset.price, size)}
                    </p>

                    {size >= 3 && (
                      <div className="flex justify-between items-center mt-1">
                        <p
                          className={`${
                            size <= 3 ? "text-[9px]" : "text-xs"
                          } text-slate-300`}
                        >
                          {formatVolume(asset.volume)}
                        </p>
                        {size >= 4 && asset.type && (
                          <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                            {asset.type}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {size === 1 && (
                  <p className="text-[9px] font-bold p-1 text-white text-center">
                    ${formatPrice(asset.price, 1)}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-6 bg-slate-800 rounded-lg text-center">
            <p className="text-sm text-slate-400">
              No {assetType} data available for {date}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetHeatmap;
