import { NextResponse } from "next/server";
import axios from "axios";

const CACHE: { [key: string]: { data?: any; lastFetched?: string } } = {};

const fetchStockData = async (
  symbol: string,
  dateFrom: string,
  dateTo: string
): Promise<any> => {
  const url =
    "https://financialmodelingprep.com/stable/historical-price-eod/light";
  const accessKey = process.env.NEXT_PUBLIC_FMP_API_KEY; // Set the API key in environment variables

  console.log(`Fetching data for ${symbol}`);
  const params = {
    apikey: accessKey,
    symbol: symbol,
  };

  console.log(url, params);
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    throw error;
  }
};

const getCachedData = (symbol: string, today: string) => {
  if (CACHE[symbol] && CACHE[symbol].lastFetched === today) {
    console.log(`Returning cached data for ${symbol}`);
    return CACHE[symbol].data;
  }
  return null;
};

const cacheData = (symbol: string, data: any, today: string) => {
  CACHE[symbol] = {
    data,
    lastFetched: today,
  };
};

// Function to add delay between requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = (
    searchParams.get("symbols") ||
    "^GSPC,^DJI,^IXIC,^RUT,^FTSE,^N225,^HSI,^STOXX50E,^VIX"
  ).split(",");
  const dateFrom = searchParams.get("date_from") || "2024-03-05";
  const dateTo = searchParams.get("date_to") || "2025-03-15";
  const today = new Date().toISOString().split("T")[0];

  const result: { [key: string]: any } = {};

  // Loop through each symbol and fetch data one by one
  for (const symbol of symbols) {
    const cachedData = getCachedData(symbol, today);

    if (cachedData) {
      result[symbol] = cachedData;
    } else {
      try {
        console.log(`Fetching new data for ${symbol}`);
        const stockData = await fetchStockData(symbol, dateFrom, dateTo);
        cacheData(symbol, stockData, today);
        result[symbol] = stockData;

        // Add delay of 1 second (1000ms) between requests
        await delay(1000);
      } catch (error) {
        result[symbol] = { error: `Failed to fetch data for ${symbol}` };
      }
    }
  }

  const stockData = transformData(result);
  return NextResponse.json(stockData);
}
type Entry = {
  symbol: string;
  date: string;
  price: number;
  volume: number;
};

type TransformedEntry = {
  date: string;
  currencies: {
    symbol: string;
    price: number;
    change: number | null;
  }[];
};

function transformData(inputData: Record<string, Entry[]>): TransformedEntry[] {
  const result: TransformedEntry[] = [];

  for (const index in inputData) {
    const data = inputData[index];

    const sortedData = data.sort((a, b) => (a.date > b.date ? -1 : 1));

    let dateMap: Record<
      string,
      { [symbol: string]: { price: number; change: number | null } }
    > = {};

    for (let i = 0; i < sortedData.length; i++) {
      const entry = sortedData[i];
      const { date, symbol, price } = entry;

      if (!dateMap[date]) {
        dateMap[date] = {};
      }

      const prevEntry = i > 0 ? sortedData[i - 1] : null;
      const prevPrice = prevEntry?.symbol === symbol ? prevEntry.price : null;

      dateMap[date][symbol] = {
        price,
        change:
          prevPrice !== null ? ((price - prevPrice) / prevPrice) * 100 : null,
      };
    }

    for (const date in dateMap) {
      const currencies = Object.keys(dateMap[date]).map((symbol) => ({
        symbol,
        price: dateMap[date][symbol].price,
        change: dateMap[date][symbol].change,
      }));

      result.push({
        date,
        currencies,
      });
    }
  }

  return result;
}
