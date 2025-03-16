import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function GET(request: Request) {
  try {
    console.log("Fetching distinct asset symbols from Supabase...");
    const { data: symbolsData, error: symbolsError } = await supabase
      .from("stocks")
      .select("symbol, count()");

    if (symbolsError) throw symbolsError;
    if (!symbolsData || symbolsData.length === 0) {
      return NextResponse.json({ error: "No symbols found" }, { status: 404 });
    }

    const distinctSymbols = symbolsData.map(({ symbol }) =>
      symbol.replace("USDT", "")
    );
    // Return the distinct symbols only
    return handleResponse(distinctSymbols);
  } catch (error) {
    console.error("Error fetching asset data:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset data" },
      { status: 500 }
    );
  }
}

const handleResponse = (symbols: string[]) => {
  return NextResponse.json(symbols);
};
