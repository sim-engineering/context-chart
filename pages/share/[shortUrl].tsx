// pages/share/[shortUrl].tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase"; // Adjust this based on your project structure

const ShortUrlRedirect = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { shortUrl } = router.query;

  useEffect(() => {
    const fetchLongUrl = async () => {
      if (!shortUrl) return; // Skip if no shortUrl is available in the query

      try {
        const query = supabase
          .from("url_shortener")
          .select("long_url")
          .eq("short_url", encodeURIComponent(window.location.href))
          .limit(1)
          .single();
        const { data, error } = await query;

        if (error) {
          setError("Failed to find the long URL");
          setLoading(false);
          return;
        }

        if (data) {
          // Redirect to the long URL
          window.location.href = data.long_url;
        } else {
          setError("Short URL not found");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching long URL:", error);
        setError("An error occurred while fetching the long URL");
        setLoading(false);
      }
    };

    fetchLongUrl();
  }, [shortUrl]);

  // Handle loading and error states
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return null; // No UI is needed here, as the page is used for redirection
};

export default ShortUrlRedirect;
