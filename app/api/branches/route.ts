import { NextResponse } from "next/server"
import { getBranches, getBranchesByArea } from "@/lib/data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const areaId = searchParams.get("areaId")

    if (areaId) {
      const branches = await getBranchesByArea(Number.parseInt(areaId))
      return NextResponse.json(branches)
    } else {
      const branches = await getBranches()
      return NextResponse.json(branches)
    }
  } catch (error) {
    console.error("Error fetching branches:", error)
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 })
  }
}
