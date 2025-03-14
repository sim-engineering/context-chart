import { NextResponse } from "next/server"
import { createSwaggerSpec } from "@/lib/swagger"

export async function GET() {
  const spec = createSwaggerSpec()
  return NextResponse.json(spec)
}

