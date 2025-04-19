import { NextResponse } from "next/server"
import { issueStock } from "@/lib/data"

export async function POST(request: Request) {
  try {
    const { branchId, itemId, quantity, personName, date } = await request.json()

    if (!branchId || !itemId || !quantity || !personName || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const success = await issueStock(branchId, itemId, quantity, personName, date)

    if (!success) {
      return NextResponse.json({ error: "Not enough stock available" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error issuing stock:", error)
    return NextResponse.json({ error: "Failed to issue stock" }, { status: 500 })
  }
}
