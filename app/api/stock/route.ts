import { NextResponse } from "next/server";
import axios from "axios";

const CACHE: { [key: string]: { data?: any; lastFetched?: string } } = {};

const fetchStockData = async (symbol: string): Promise<any> => {
  const url =
    "https://financialmodelingprep.com/stable/historical-price-eod/light";
  const accessKey = process.env.NEXT_PUBLIC_FMP_API_KEY; // Ensure the API key is correctly set

  const params = {
    apikey: accessKey,
    symbol: symbol,
  };

  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    throw error;
  }
};

const getCachedData = (date: string) => {
  if (CACHE[date] && CACHE[date].lastFetched === date) {
    return CACHE[date].data;
  }
  return null;
};

const cacheData = (date: string, data: any) => {
  CACHE[date] = {
    data,
    lastFetched: date,
  };
};

// Function to add delay between requests (if needed)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedDate = searchParams.get("date");

  // Use the provided date or default to today's date
  const today = requestedDate || new Date().toISOString().split("T")[0];

  // Check if data for this date is cached
  const cachedData = getCachedData(today);
  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  // Define the symbols to fetch data for
  const symbols = [
    "^GSPC",
    "^DJI",
    "^IXIC",
    "^RUT",
    "^FTSE",
    "^N225",
    "^HSI",
    "^STOXX50E",
    "^VIX",
  ];

  try {
    // Fetch data for all symbols one by one
    const stockDataPromises = symbols.map(async (symbol) => {
      console.log(`Fetching data for ${symbol} on ${today}`);
      return fetchStockData(symbol);
    });

    // Wait for all the fetch requests to finish
    const stockDataResults = await Promise.all(stockDataPromises);

    // Combine the results for all symbols into one array
    const combinedData = symbols.reduce((acc, symbol, index) => {
      const data = stockDataResults[index];
      acc[symbol] = data;
      return acc;
    }, {} as Record<string, any>);

    // Cache the fetched data for the given date
    cacheData(today, combinedData);

    // Transform the data for the requested date
    const transformedData = transformData(combinedData, today);
    return NextResponse.json(transformedData);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stock data" });
  }
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

function transformData(
  inputData: Record<string, Entry[]>,
  requestedDate: string
): Record<
  string,
  { currencies: { symbol: string; price: number; change: number | null }[] }
> {
  const result: Record<
    string,
    { currencies: { symbol: string; price: number; change: number | null }[] }
  > = {};

  // Initialize the result for the requested date
  const dateMap: {
    [symbol: string]: { price: number; change: number | null };
  } = {};

  // Loop through all symbols and their respective data
  for (const symbol in inputData) {
    const data = inputData[symbol];

    // Sort the data by date in descending order
    const sortedData = data.sort((a, b) => (a.date > b.date ? -1 : 1));

    // Process the sorted data for the requested date
    for (const entry of sortedData) {
      const { date, price } = entry;

      // Only process the requested date
      if (date === requestedDate) {
        const prevEntry = sortedData.find(
          (e) => e.symbol === symbol && e.date === date
        );
        const prevPrice = prevEntry ? prevEntry.price : null;

        // Store the price and change for each symbol
        dateMap[symbol] = {
          price,
          change:
            prevPrice !== null ? ((price - prevPrice) / prevPrice) * 100 : null,
        };
      }
    }
  }

  // Consolidate the result into the format with requested date as the key
  result[requestedDate] = {
    currencies: Object.keys(dateMap).map((symbol) => ({
      symbol,
      price: dateMap[symbol].price,
      change: dateMap[symbol].change,
    })),
  };

  return result;
}
