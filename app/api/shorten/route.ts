import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

// Generate a random short URL
const generateShortUrl = (): string => {
  return Math.random().toString(36).substring(2, 8); // Generates a 6-character short URL
};
//http://localhost:3001/api/shorten?long_url=http%3A%2F%2Flocalhost%3A3001%3FdateFrom%3D2025-02-03%26dateTo%3D2025-03-18%26stock%3DAMZN%2CMSFT%2CCVX%2CNVDA%2CPG%2CTSLA%2CABBV%2CGOOGL%2CNVO%2CCRM%2CMETA%2CABNB%2CBAC%2CKO%2CAAPL%2CMA%2CNFLX%2CWMT%2CCOST%2CDE%26crypto%3DADA%2CBNB%2CSOL%2CAVAX%2CXRP%2CDOT%2CLINK%2CDOGE%2CETH
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const longUrl = searchParams.get("long_url");

  // Validate the URL
  if (!longUrl || !isValidUrl(longUrl)) {
    return handleError("Invalid URL provided.", 400);
  }

  console.log("Long url: ", longUrl);
  try {
    const decodedLongUrl = decodeURIComponent(longUrl);

    // Generate a new short URL
    const shortUrl = generateShortUrl();

    const encodedShortUrl = encodeURIComponent(`${BASE_URL}/share/${shortUrl}`);

    // Insert the long URL and short URL into the database
    const { data, error } = await supabase.from("url_shortener").insert([
      {
        long_url: decodedLongUrl,
        short_url: encodedShortUrl,
      },
    ]);

    if (error) {
      return handleError("Failed to save URL in database.", 500);
    }

    return NextResponse.json({
      url: `${BASE_URL}/share/${shortUrl}`,
    });
  } catch (error) {
    console.error("Error shortening URL:", error);
    return handleError("Failed to shorten URL", 500);
  }
}

// Check if the URL is valid
const isValidUrl = (url: string): boolean => {
  const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  return regex.test(url);
};

const handleError = (message: string, status: number) => {
  console.error(message);
  return new Response(message, { status });
};
