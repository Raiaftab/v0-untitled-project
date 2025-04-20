import { NextResponse } from "next/server"
import { getUserById, updateUser, deleteUser, requireAdmin } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    await requireAdmin()

    const id = Number.parseInt(params.id)
    const user = await getUserById(id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    await requireAdmin()

    const id = Number.parseInt(params.id)
    const { name, role, password } = await request.json()

    // Validate role if provided
    if (role && role !== "admin" && role !== "user") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const result = await updateUser(id, { name, role, password })

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message, user: result.user })
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    await requireAdmin()

    const id = Number.parseInt(params.id)
    const result = await deleteUser(id)

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message })
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
