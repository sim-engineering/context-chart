import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function GET(
  request: Request,
  { params }: { params: { ticker: string } }
) {
  // this is monkey patch to fix nextjs error
  const param = await params;
  const ticker = param.ticker;

  if (!ticker || !["stocks", "crypto"].includes(ticker)) {
    return handleError(
      "The 'table' parameter is required and must be 'stocks' or 'crypto'.",
      400
    );
  }

  try {
    const { data, error } = await supabase
      .from(ticker)
      .select("symbol, count()");

    if (error) {
      return handleError(`Failed to fetch symbols from Supabase`, 500);
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No symbols found in the specified table." },
        { status: 404 }
      );
    }

    return NextResponse.json({ symbols: data.map((item) => item.symbol) });
  } catch (error) {
    console.error("Error fetching symbols:", error);
    return handleError("Failed to fetch symbols", 500);
  }
}

const handleError = (message: string, status: number) => {
  console.error(message);
  return NextResponse.json({ error: message }, { status });
};
