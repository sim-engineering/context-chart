"use client";
import { Asset } from "@/types/types";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

interface HeatmapProps {
  onAssetClick: () => void;
  type?: string | null;
  initialDate: string; // Initial date prop in YYYY-MM-DD format
  changeDays: string;
  assetType: "stocks" | "crypto";
  data: { [key: string]: { currencies: Asset[] } }; // Data for multiple days
}

const AssetHeatmap: React.FC<HeatmapProps> = ({
  onAssetClick,
  type = null,
  initialDate,
  changeDays = "1d",
  assetType = "crypto",
  data, // Data for multiple days
}) => {
  const [sortedData, setSortedData] = useState<Asset[] | null>(data);

  // Get change value based on selected time period
  const getChangeField = (asset: Asset, change: string) => {
    if (change === "1d") return asset.change_1d || 0;
    if (change === "7d") return asset.change_7d || 0;
    if (change === "1m") return asset.change_1m || 0;
    if (change === "3m") return asset.change_3m || 0;
    if (change === "1y") return asset.change_1y || 0;
    return asset.change_1d || 0;
  };

  // Handle background color based on change value
  const getBackgroundColor = (change: number) => {
    if (change >= 10) return "bg-gradient-to-br from-blue-500 to-cyan-600";
    if (change >= 5) return "bg-gradient-to-br from-blue-600 to-cyan-700";
    if (change >= 2) return "bg-gradient-to-br from-blue-700 to-cyan-800";
    if (change >= 0) return "bg-gradient-to-br from-blue-800 to-cyan-900";
    if (change >= -2) return "bg-gradient-to-br from-purple-700 to-pink-800";
    if (change >= -5) return "bg-gradient-to-br from-purple-800 to-pink-900";
    if (change >= -10) return "bg-gradient-to-br from-purple-900 to-pink-950";
    return "bg-gradient-to-br from-fuchsia-900 to-purple-950";
  };

  // Get text color based on change value
  const getTextColor = (change: number) => {
    return change >= 0 ? "text-cyan-100" : "text-pink-100";
  };

  // Format price with appropriate decimal places
  const formatPrice = (price: number) => {
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
    initialDate &&
    initialDate &&
    data[initialDate] &&
    Array.isArray(data[initialDate].currencies)
  ) {
    currencies = data[initialDate].currencies;
    maxVolume =
      currencies.length > 0
        ? Math.max(...currencies.map((asset: Asset) => asset.volume))
        : 0;
  }

  return (
    <div className="space-y-2 bg-slate-900 rounded-lg p-4 shadow-xl scale-[0.9]">
      <div className="flex justify-between items-center border-b border-slate-700 pb-3">
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
                  gridColumn: `span 2`,
                  gridRow: `span 2`,
                }}
              >
                <div className="flex justify-between items-start p-2 w-full bg-black bg-opacity-25">
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-white">{asset.symbol}</h4>
                    <span className="text-slate-300 opacity-80 truncate block">
                      {asset.name}
                    </span>
                  </div>
                  <span
                    className={`font-bold ${getTextColor(
                      changeValue
                    )} px-1.5 py-0.5 rounded-full bg-black bg-opacity-30`}
                  >
                    {changeValue >= 0 ? "+" : ""}
                    {changeValue?.toFixed(1)}%
                  </span>
                </div>

                <div className="p-2 mt-auto">
                  <p className="font-bold text-white">
                    ${formatPrice(asset.price)}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-slate-300">
                      {formatVolume(asset.volume)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-6 bg-slate-800 rounded-lg text-center">
            <p className="text-sm text-slate-400">
              No {assetType} data available for {initialDate}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetHeatmap;
