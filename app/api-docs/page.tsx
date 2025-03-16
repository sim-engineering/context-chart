"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import SwaggerUI with no SSR to avoid hydration issues
const SwaggerUI = dynamic(
  () => import("swagger-ui-react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    ),
  }
);

export default function ApiDocs() {
  const [spec, setSpec] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    fetch("/api/docs")
      .then((response) => response.json())
      .then((data) => setSpec(data))
      .catch((error) => console.error("Error loading API docs:", error));
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        ContextCharts API Documentation
      </h1>

      {isClient && spec ? (
        // Only render SwaggerUI on the client side
        <>
          <style jsx global>{`
            .swagger-ui .opblock .opblock-summary-path-description-wrapper {
              align-items: center;
              display: flex;
              flex-wrap: wrap;
              gap: 0 10px;
              max-width: 100%;
              word-break: break-word;
              padding: 0 10px;
            }
            .swagger-ui {
              color: #3b4151;
              background: white;
              padding: 20px;
              border-radius: 8px;
            }
            .swagger-ui .btn {
              background: transparent;
            }
          `}</style>
          <SwaggerUI spec={spec} />
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}
