import { NextResponse } from "next/server"
import { login } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    try {
      console.log(`Login attempt for user: ${username}`)
      const user = await login(username, password)

      if (!user) {
        console.log(`Login failed for user: ${username}`)
        return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
      }

      console.log(`Login successful for user: ${username}`)
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      })
    } catch (authError) {
      console.error("Authentication error:", authError)
      return NextResponse.json({ error: "Authentication failed. Please try again." }, { status: 500 })
    }
  } catch (error) {
    console.error("Login request error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}
