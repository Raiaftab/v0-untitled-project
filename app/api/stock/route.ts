import { NextResponse } from "next/server"
import { getStockWithDetails, addStock, updateStock, deleteStock } from "@/lib/data"

export async function GET() {
  try {
    const stock = await getStockWithDetails()
    return NextResponse.json(stock)
  } catch (error) {
    console.error("Error fetching stock:", error)
    return NextResponse.json({ error: "Failed to fetch stock" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { areaId, itemId, quantity, date, remarks } = await request.json()

    if (!areaId || !itemId || !quantity || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await addStock(areaId, itemId, quantity, date, remarks)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding stock:", error)
    return NextResponse.json({ error: "Failed to add stock" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, quantity } = await request.json()

    if (!id || quantity === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await updateStock(id, quantity)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating stock:", error)
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing stock ID" }, { status: 400 })
    }

    await deleteStock(Number.parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting stock:", error)
    return NextResponse.json({ error: "Failed to delete stock" }, { status: 500 })
  }
}
