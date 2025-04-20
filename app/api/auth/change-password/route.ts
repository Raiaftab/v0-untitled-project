import { NextResponse } from "next/server"
import { changePassword, getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    // Validate new password
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long" }, { status: 400 })
    }

    const result = await changePassword(currentUser.username, currentPassword, newPassword)

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message })
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Password change error:", error)
    return NextResponse.json({ error: "An error occurred while changing password" }, { status: 500 })
  }
}
