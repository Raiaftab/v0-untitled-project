import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const result = await sql`SELECT * FROM items WHERE id = ${id}`

    if (result.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching item:", error)
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    await requireAdmin()

    const id = Number.parseInt(params.id)
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE items
      SET name = ${name}
      WHERE id = ${id}
      RETURNING id, name
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating item:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    await requireAdmin()

    const id = Number.parseInt(params.id)

    // First, check if the item exists
    const item = await sql`SELECT id FROM items WHERE id = ${id}`

    if (item.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Delete the item (cascading delete will handle stock and transactions)
    await sql`DELETE FROM items WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting item:", error)
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
