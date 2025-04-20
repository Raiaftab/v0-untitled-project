import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("session_id")?.value
  const userRole = request.cookies.get("user_role")?.value
  const { pathname } = request.nextUrl

  // Debug logs
  console.log("Middleware running for path:", pathname)
  console.log("Session ID:", sessionId ? "exists" : "missing")
  console.log("User role:", userRole || "missing")

  // Public paths that don't require authentication
  const publicPaths = ["/login"]

  // Admin paths that require admin role
  const adminPaths = [
    "/admin",
    "/admin/areas",
    "/admin/branches",
    "/admin/items",
    "/admin/transactions",
    "/admin/users",
  ]

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // Check if the path is admin-only
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path))

  // If the path is public, allow access
  if (isPublicPath) {
    // If user is already logged in and trying to access login page, redirect to home
    if (sessionId && pathname === "/login") {
      console.log("User already logged in, redirecting to home")
      return NextResponse.redirect(new URL("/", request.url))
    }
    console.log("Allowing access to public path")
    return NextResponse.next()
  }

  // For static files and API routes, let them pass through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".") ||
    pathname.startsWith("/api/")
  ) {
    console.log("Allowing access to static file or API route")
    return NextResponse.next()
  }

  // If no session, redirect to login
  if (!sessionId) {
    const loginUrl = new URL("/login", request.url)
    console.log("No session found, redirecting to:", loginUrl.toString())
    return NextResponse.redirect(loginUrl)
  }

  // For admin paths, check role
  if (isAdminPath && userRole !== "admin") {
    console.log("User is not admin, redirecting to home")
    return NextResponse.redirect(new URL("/", request.url))
  }

  // For all other paths, allow access if authenticated
  console.log("User is authenticated, allowing access")
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
