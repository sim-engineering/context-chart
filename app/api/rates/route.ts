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
    const { data, error } = await supabase
      .from("rates")
      .select("*")
      .gte("price_date", formattedStartDate)
      .lte("price_date", formattedEndDate);
    if (error) throw error;

    return handleResponse(data, requestedDate);
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
        source: string;
        rate: number;
        change?: number | null;
        change_1m: number | null;
        change_3m: number | null;
        change_6m: number | null;
        change_1y: number | null;
      }[];
    }
  > = {};

  data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  data.forEach(
    ({
      price_date,
      source,
      rate,
      change_1m,
      change_3m,
      change_6m,
      change_1y,
    }) => {
      const formattedDate = price_date.split("T")[0];
      if (!result[formattedDate]) {
        result[formattedDate] = { currencies: [] };
      }

      result[formattedDate].currencies.push({
        source,
        rate,
        change_1m,
        change_3m,
        change_6m,
        change_1y,
      });
    }
  );

  return result;
};
