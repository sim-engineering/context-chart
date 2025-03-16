"use client";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Asset } from "@/types/types";

const getChangeField = (asset: Asset, change: string) => {
  if (change === "1d") return asset.change_1d;
  if (change === "7d") return asset.change_7d;
  if (change === "1m") return asset.change_1m;
  if (change === "3m") return asset.change_3m;
  if (change === "1y") return asset.change_1y;
  return asset.change_1d;
};

const IndexComponent = ({ indexData, size, changeDays }) => {
  const { symbol, close } = indexData;

  const changeColor =
    getChangeField(indexData, changeDays) > 0
      ? "text-green-500"
      : "text-red-500";

  const sizeClasses = size === "lg" ? "w-44 p-2" : "w-36 p-1";
  const textSize = size === "lg" ? "text-sm" : "text-xs";
  const fontSize = size === "lg" ? "font-medium" : "font-semibold";

  return (
    <div
      className={`flex items-center justify-between rounded-lg shadow-md bg-gray-800 ${sizeClasses}`}
    >
      <div className="flex flex-col items-start">
        <span className={`text-white ${textSize} ${fontSize} font-normal`}>
          {symbol}
        </span>
        <span className={`text-white ${textSize} font-mono`}>
          {close.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <div className="flex flex-col justify-between h-full items-end">
          <span
            className={`w-2 h-2 rounded-full ${
              getChangeField(indexData, changeDays) > 0
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          />
          <div className="h-3"></div>
          <span className={`${textSize} ${changeColor} font-mono`}>
            {getChangeField(indexData, changeDays).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
};

const IndecesBar = ({ date, changeDays }) => {
  const [cardSize, setCardSize] = useState<"small" | "lg">("small");

  const [indexData, setIndexData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIndexData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/index?date=${date}`);
        const data = await response.json();
        console.log("Hello: ", data);
        setIndexData(data);
      } catch (error) {
        console.error("Error fetching index data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIndexData();
  }, [date]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setCardSize("lg");
      } else {
        setCardSize("small");
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>
      <div className="absolute left-1 top-1/2 -translate-y-1/2 bg-gray-800/70 text-white text-[10px] px-1 py-0.5 rounded-full shadow-md pointer-events-none">
        ◀
      </div>

      <div
        className="flex gap-1 overflow-x-auto scrollbar-hide px-4 md:px-6 justify-start sm:justify-center items-center"
        style={{ height: "100px" }}
      >
        {isLoading ? (
          <div
            className="flex justify-center items-center"
            style={{ height: "100%" }}
          >
            <Spinner size="sm" />
          </div>
        ) : (
          indexData[date]?.currencies?.map((index) => (
            <IndexComponent
              changeDays={changeDays}
              key={index.symbol}
              indexData={index}
              size={cardSize}
            />
          ))
        )}
      </div>

      <div className="absolute right-1 top-1/2 -translate-y-1/2 bg-gray-800/70 text-white text-[10px] px-1 py-0.5 rounded-full shadow-md pointer-events-none">
        ▶
      </div>
    </div>
  );
};

export default IndecesBar;
