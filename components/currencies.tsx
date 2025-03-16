"use client";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import CurrencyCard from "@/components/currency";

const CurrencyBar = ({ date }) => {
  const [cardSize, setCardSize] = useState<"small" | "lg">("small");

  const [fxData, setFxData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchForexData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/forex?date=${date}`);
        const data = await response.json();
        setFxData(data);
      } catch (error) {
        console.error("Error fetching forex data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForexData();
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
          fxData?.currencies?.map((fx) => (
            <CurrencyCard key={fx.symbol} currencyData={fx} size={cardSize} />
          ))
        )}
      </div>

      <div className="absolute right-1 top-1/2 -translate-y-1/2 bg-gray-800/70 text-white text-[10px] px-1 py-0.5 rounded-full shadow-md pointer-events-none">
        ▶
      </div>
    </div>
  );
};

export default CurrencyBar;
