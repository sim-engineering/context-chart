import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedDate = searchParams.get("date");

  const today = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(today.getFullYear() - 2);
  const formattedStartDate = twoYearsAgo.toISOString().split("T")[0];
  const formattedEndDate = today.toISOString().split("T")[0];

  try {
    console.log("Fetching distinct asset symbols from Supabase...");
    const { data: symbolsData, error: symbolsError } = await supabase
      .from("crypto")
      .select("symbol, count()");

    if (symbolsError) throw symbolsError;
    if (!symbolsData || symbolsData.length === 0) {
      return NextResponse.json({ error: "No symbols found" }, { status: 404 });
    }

    const assetPromises = symbolsData.map(
      async ({ symbol }: { symbol: string }) => {
        const { data, error } = await supabase
          .from("crypto")
          .select("*")
          .eq("symbol", symbol)
          .gte("date", formattedStartDate)
          .lte("date", formattedEndDate);
        if (error) throw error;
        return data;
      }
    );

    const assetResults = await Promise.all(assetPromises);

    const mergedData = assetResults.flat();

    return handleResponse(mergedData, requestedDate);
  } catch (error) {
    console.error("Error fetching asset data:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset data" },
      { status: 500 }
    );
  }
}

const handleResponse = (data: any[], requestedDate: string | null) => {
  const result = transformAssetData(data);

  if (requestedDate) {
    const filteredResult = Object.keys(result).reduce((acc, date) => {
      if (date.startsWith(requestedDate)) {
        acc[date] = result[date];
      }
      return acc;
    }, {} as typeof result);

    if (Object.keys(filteredResult).length === 0) {
      return NextResponse.json(
        { error: "No data available for this date" },
        { status: 404 }
      );
    }

    return NextResponse.json(filteredResult);
  }

  return NextResponse.json(result);
};
const transformAssetData = (data: any[]) => {
  const result: Record<
    string,
    {
      currencies: {
        symbol: string;
        close: number;
        volume: number;
        change?: number | null;
        change_1d: number | null;
        change_7d: number | null;
        change_1m: number | null;
        change_3m: number | null;
        change_1y: number | null;
      }[];
    }
  > = {};

  data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  data.forEach(
    ({
      date,
      symbol,
      close,
      volume,
      change_1d,
      change_7d,
      change_1m,
      change_3m,
      change_1y,
    }) => {
      if (!result[date]) {
        result[date] = { currencies: [] };
      }

      result[date].currencies.push({
        symbol: symbol.replace("USDT", ""),
        close,
        volume,
        change_1d,
        change_7d,
        change_1m,
        change_3m,
        change_1y,
      });
    }
  );

  return result;
};
