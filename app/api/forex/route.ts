import { NextResponse } from "next/server";
import axios from "axios";

type TimeseriesResponse = any;

const CACHE: { data?: TimeseriesResponse; lastFetched?: string } = {};

const fetchTimeseriesData = async (): Promise<TimeseriesResponse> => {
  const today = new Date().toISOString().split("T")[0];
  const url = "https://api.currencybeacon.com/v1/timeseries";

  const params = {
    api_key: process.env.NEXT_PUBLIC_CURRENCY_BEACON_API_KEY,
    base: "USD",
    start_date: "2023-01-01",
    end_date: today,
    symbols: [
      "JPY",
      "EUR",
      "GBP",
      "CAD",
      "AUD",
      "CNY",
      "SAR",
      "THB",
      "ZAR",
    ].join(","),
  };

  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching time series data:", error);
    throw error;
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedDate = searchParams.get("date");
  const today = new Date().toISOString().split("T")[0];

  if (CACHE.data && CACHE.lastFetched === today) {
    console.log("Returning cached forex data");
    return handleResponse(CACHE.data.response, requestedDate);
  }

  try {
    console.log("Fetching new forex data");
    const forexData = await fetchTimeseriesData();

    CACHE.data = forexData;
    CACHE.lastFetched = today;

    return handleResponse(forexData.response, requestedDate);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch forex data" },
      { status: 500 }
    );
  }
}

const handleResponse = (
  data: Record<string, Record<string, number>>,
  requestedDate: string | null
) => {
  const transformedData = transformForexData(data);

  if (requestedDate) {
    const filteredData = transformedData.find(
      (entry) => entry.date === requestedDate
    );
    if (!filteredData) {
      return NextResponse.json(
        { error: "No data available for this date" },
        { status: 404 }
      );
    }
    return NextResponse.json(filteredData);
  }

  return NextResponse.json(transformedData);
};

const transformForexData = (data: Record<string, Record<string, number>>) => {
  const dates = Object.keys(data).sort();

  return dates.map((date, index) => {
    const todayRates = data[date];
    const yesterdayRates = index > 0 ? data[dates[index - 1]] : null;

    const currencies = Object.entries(todayRates).map(([symbol, price]) => {
      const prevPrice = yesterdayRates?.[symbol] || null;
      const change = prevPrice ? ((price - prevPrice) / prevPrice) * 100 : null;

      return {
        symbol: `USD/${symbol}`,
        price,
        change: change !== null ? parseFloat(change.toFixed(2)) : null,
      };
    });

    return { date, currencies };
  });
};
