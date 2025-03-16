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
      .from("assets")
      .select("symbol, count()");

    if (symbolsError) throw symbolsError;
    if (!symbolsData || symbolsData.length === 0) {
      return NextResponse.json({ error: "No symbols found" }, { status: 404 });
    }

    const assetPromises = symbolsData.map(
      async ({ symbol }: { symbol: string }) => {
        const { data, error } = await supabase
          .from("assets")
          .select("*")
          .eq("symbol", symbol)
          .gte("price_date", formattedStartDate)
          .lte("price_date", formattedEndDate);
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
        price: number;
        volume: number;
        name: string;
        change?: number | null;
      }[];
    }
  > = {};

  const priceHistory: Record<string, number> = {};

  data.sort(
    (a, b) =>
      new Date(a.price_date).getTime() - new Date(b.price_date).getTime()
  );

  console.log(data);

  data.forEach(({ price_date, symbol, price, volume, name }) => {
    const formattedDate = price_date.split("T")[0];

    if (!result[formattedDate]) {
      result[formattedDate] = { currencies: [] };
    }

    let change: number | null | undefined = undefined;

    if (priceHistory[symbol] !== undefined) {
      change = ((price - priceHistory[symbol]) / priceHistory[symbol]) * 100;
    } else {
      change = 0;
    }

    priceHistory[symbol] = price;

    result[formattedDate].currencies.push({
      symbol,
      price,
      volume,
      name,
      change,
    });
  });

  return result;
};
