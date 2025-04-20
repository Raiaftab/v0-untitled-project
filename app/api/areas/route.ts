import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    const areas = await sql`SELECT * FROM areas ORDER BY name`
    return NextResponse.json(areas)
  } catch (error) {
    console.error("Error fetching areas:", error)
    return NextResponse.json({ error: "Failed to fetch areas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is admin
    await requireAdmin()

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Area name is required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO areas (name)
      VALUES (${name})
      RETURNING id, name
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating area:", error)
    return NextResponse.json({ error: "Failed to create area" }, { status: 500 })
  }
}
