import { NextResponse } from "next/server"
import { generateDummyData } from "@/lib/dummy-data"

/**
 * @swagger
 * /api/market-data:
 *   get:
 *     summary: Get market data for all asset types
 *     description: Returns market data for all asset types based on the specified time period and filters
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: integer
 *         description: Time period in days (1-365)
 *         required: false
 *         default: 30
 *       - in: query
 *         name: crypto
 *         schema:
 *           type: boolean
 *         description: Include cryptocurrency data
 *         required: false
 *         default: true
 *       - in: query
 *         name: indices
 *         schema:
 *           type: boolean
 *         description: Include indices data
 *         required: false
 *         default: true
 *       - in: query
 *         name: commodities
 *         schema:
 *           type: boolean
 *         description: Include commodities data
 *         required: false
 *         default: true
 *       - in: query
 *         name: bonds
 *         schema:
 *           type: boolean
 *         description: Include bonds data
 *         required: false
 *         default: true
 *       - in: query
 *         name: forex
 *         schema:
 *           type: boolean
 *         description: Include forex data
 *         required: false
 *         default: true
 *     responses:
 *       200:
 *         description: A list of market data
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Parse query parameters
  const period = Number.parseInt(searchParams.get("period") || "30")

  const filters = {
    crypto: searchParams.get("crypto") !== "false",
    indices: searchParams.get("indices") !== "false",
    commodities: searchParams.get("commodities") !== "false",
    bonds: searchParams.get("bonds") !== "false",
    forex: searchParams.get("forex") !== "false",
  }

  // Generate data based on parameters
  const data = generateDummyData(period, filters)

  return NextResponse.json({ data })
}

