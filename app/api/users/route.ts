import { NextResponse } from "next/server"
import { getAllUsers, createUser, requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    // Check if user is admin
    await requireAdmin()

    const users = await getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is admin
    await requireAdmin()

    const { username, password, name, role } = await request.json()

    if (!username || !password || !name || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (role !== "admin" && role !== "user") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const result = await createUser(username, password, name, role)

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message, user: result.user })
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
