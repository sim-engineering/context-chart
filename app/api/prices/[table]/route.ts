import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function GET(
  request: Request,
  { params }: { params: { table: string } }
) {
  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const tickersParam = searchParams.get("tickers");
  // this is monkey patch to fix nextjs error
  const param = await params;
  const table = param.table;

  if (!isValidDateFormat(dateFrom) || !isValidDateFormat(dateTo)) {
    return handleError("Invalid date format. Please use YYYY-MM-DD.", 500);
  }

  if (!table || !["stocks", "crypto"].includes(table)) {
    return handleError(
      "The 'table' parameter is required and must be 'stocks' or 'crypto'.",
      400
    );
  }

  let stocks: string[] = [];

  if (tickersParam) {
    stocks = tickersParam
      .split(",")
      .map((symbol) => symbol.trim().toUpperCase())
      .filter(Boolean);
  }

  if (!dateFrom || !dateTo || !isValidDate(dateFrom) || !isValidDate(dateTo)) {
    return handleError("Invalid or missing date parameters", 500);
  }

  const formattedStartDate = new Date(dateFrom).toISOString().split("T")[0];
  const formattedEndDate = new Date(dateTo).toISOString().split("T")[0];

  try {
    let query = supabase
      .from(table) // Dynamic table selection
      .select("*")
      .gte("price_date", formattedStartDate)
      .lte("price_date", formattedEndDate);

    if (stocks.length > 0) {
      query = query.in("symbol", stocks);
    }

    const { data, error } = await query;

    if (error) {
      return handleError(`Failed to fetch asset data from Supabase`, 500);
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No data found for the given symbols" },
        { status: 404 }
      );
    }

    return handleResponse(data);
  } catch (error) {
    console.error("Error fetching asset data:", error);
    return handleError("Failed to fetch asset data", 500);
  }
}

const isValidDateFormat = (date: string | null): boolean => {
  if (!date) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(date);
};

const isValidDate = (date: string): boolean => {
  const parsedDate = Date.parse(date);
  return !isNaN(parsedDate);
};

const handleError = (message: string, status: number) => {
  console.error(message);
  return NextResponse.json({ error: message }, { status });
};

const handleResponse = (data: any[]) => {
  const result = transformAssetData(data);
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
        change_1d: number | null;
        change_7d: number | null;
        change_1m: number | null;
        change_3m: number | null;
        change_1y: number | null;
      }[];
    }
  > = {};

  data.sort(
    (a, b) =>
      new Date(a.price_date).getTime() - new Date(b.price_date).getTime()
  );

  data.forEach(
    ({
      price_date,
      symbol,
      price,
      volume,
      change_1d,
      change_7d,
      change_1m,
      change_3m,
      change_1y,
    }) => {
      const formattedDate = price_date.split("T")[0]; // Strip time
      if (!result[formattedDate]) {
        result[formattedDate] = { currencies: [] };
      }

      result[formattedDate].currencies.push({
        symbol: symbol.replace("USDT", ""),
        price,
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
