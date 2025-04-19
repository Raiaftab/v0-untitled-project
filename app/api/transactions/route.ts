import { NextResponse } from "next/server"
import { getTransactionsWithDetails } from "@/lib/data"

export async function GET() {
  try {
    const transactions = await getTransactionsWithDetails()
    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
