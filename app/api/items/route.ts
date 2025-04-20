import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    const items = await sql`SELECT * FROM items ORDER BY name`
    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is admin
    await requireAdmin()

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO items (name)
      VALUES (${name})
      RETURNING id, name
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating item:", error)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}
