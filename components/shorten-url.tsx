import { useState, useEffect } from "react";

const ShortenUrl = () => {
  const [shortUrl, setShortUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchShortUrl = async () => {
      const currentUrl = window.location.href; // Get the current page URL
      const encodedUrl = encodeURIComponent(currentUrl); // URL encode the current URL

      setLoading(true);
      try {
        const response = await fetch("/api/shorten", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ long_url: encodedUrl }), // Pass the encoded URL
        });

        const data = await response.json();

        if (response.ok) {
          setShortUrl(data.short_url);
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error("Error shortening URL:", error);
        alert("Error shortening URL");
      }
      setLoading(false);
    };

    fetchShortUrl(); // Shorten the current URL when the component mounts
  }, []);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(shortUrl)
        .then(() => {
          alert("Shortened URL copied to clipboard!");
        })
        .catch((err) => {
          console.error("Error copying to clipboard: ", err);
          alert("Failed to copy shortened URL");
        });
    } else {
      alert("Clipboard API not supported");
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading shortened URL...</p>
      ) : (
        shortUrl && (
          <div>
            <p>
              Shortened URL:{" "}
              <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                {shortUrl}
              </a>
            </p>
            <button onClick={handleShare}>Copy to Clipboard</button>
          </div>
        )
      )}
    </div>
  );
};

export default ShortenUrl;
