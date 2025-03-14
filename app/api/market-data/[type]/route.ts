import { NextResponse } from "next/server"
import { generateDummyData } from "@/lib/dummy-data"

/**
 * @swagger
 * /api/market-data/{type}:
 *   get:
 *     summary: Get market data for a specific asset type
 *     description: Returns market data for a specific asset type based on the specified time period
 *     parameters:
 *       - in: path
 *         name: type
 *         schema:
 *           type: string
 *           enum: [crypto, indices, commodities, bonds, forex]
 *         required: true
 *         description: Asset type
 *       - in: query
 *         name: period
 *         schema:
 *           type: integer
 *         description: Time period in days (1-365)
 *         required: false
 *         default: 30
 *     responses:
 *       200:
 *         description: A list of market data for the specified type
 *       404:
 *         description: Asset type not found
 */
export async function GET(request: Request, { params }: { params: { type: string } }) {
  const { searchParams } = new URL(request.url)
  const period = Number.parseInt(searchParams.get("period") || "30")

  // Map route parameter to asset type
  const typeMap: Record<string, string> = {
    crypto: "crypto",
    indices: "indices",
    commodities: "commodities",
    bonds: "bonds",
    forex: "forex",
  }

  const assetType = typeMap[params.type]

  if (!assetType) {
    return NextResponse.json({ error: "Asset type not found" }, { status: 404 })
  }

  // Create filters with only the requested type enabled
  const filters = {
    crypto: assetType === "crypto",
    indices: assetType === "indices",
    commodities: assetType === "commodities",
    bonds: assetType === "bonds",
    forex: assetType === "forex",
  }

  // Generate data based on parameters
  const allData = generateDummyData(period, filters)

  return NextResponse.json({ data: allData })
}

