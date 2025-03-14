import { createSwaggerSpec as createSpec } from "next-swagger-doc"

export const createSwaggerSpec = () => {
  const spec = createSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "ContextChart API Documentation",
        version: "1.0.0",
        description: "API documentation for ContextChart market data",
        contact: {
          name: "API Support",
          email: "support@contextchart.com",
        },
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
          description: "ContextChart API Server",
        },
      ],
      tags: [
        {
          name: "Market Data",
          description: "Market data operations",
        },
      ],
      components: {
        schemas: {
          Asset: {
            type: "object",
            properties: {
              id: { type: "integer" },
              symbol: { type: "string" },
              name: { type: "string" },
              price: { type: "number" },
              change: { type: "number" },
              high: { type: "number" },
              low: { type: "number" },
              volume: { type: "number" },
              marketCap: { type: "number" },
              type: { type: "string" },
              performance: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  week: { type: "number" },
                  month: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
  })
  return spec
}

