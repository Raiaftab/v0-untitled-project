import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    await requireAdmin()

    const id = Number.parseInt(params.id)
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Area name is required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE areas
      SET name = ${name}
      WHERE id = ${id}
      RETURNING id, name
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating area:", error)
    return NextResponse.json({ error: "Failed to update area" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    await requireAdmin()

    const id = Number.parseInt(params.id)

    // First, check if the area exists
    const area = await sql`SELECT id FROM areas WHERE id = ${id}`

    if (area.length === 0) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 })
    }

    // Delete the area (cascading delete will handle branches and stock)
    await sql`DELETE FROM areas WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting area:", error)
    return NextResponse.json({ error: "Failed to delete area" }, { status: 500 })
  }
}
