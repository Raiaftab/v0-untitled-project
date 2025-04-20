"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Notification } from "@/components/ui/notification"
import { Package, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", variant: "default" as const })

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/user")
        if (response.ok) {
          // User is already logged in, redirect to dashboard
          router.push("/")
        }
      } catch (error) {
        // Ignore errors, user will stay on login page
      }
    }

    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log(`Attempting to login with username: ${username}`)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setNotification({
          show: true,
          message: "Login successful! Redirecting...",
          variant: "success",
        })

        console.log("Login successful, redirecting to dashboard")

        // Short delay before redirect for better UX
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 1000)
      } else {
        console.error("Login failed:", data.error)

        // Show a more helpful message
        if (username === "admin" || username === "user") {
          setNotification({
            show: true,
            message: `For default users, try username: ${username}, password: ${username === "admin" ? "admin123" : "user123"}`,
            variant: "error",
          })
        } else {
          setNotification({
            show: true,
            message: data.error || "Login failed. Please check your credentials and try again.",
            variant: "error",
          })
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setNotification({
        show: true,
        message: "Connection error. Please check your network and try again.",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Package className="h-10 w-10 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Stock Management System</CardTitle>
          <CardDescription>Enter your credentials to sign in</CardDescription>
          <CardDescription className="text-sm text-gray-500 mt-2 font-bold">
            Use admin/admin123 or user/user123 to login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Notification
        show={notification.show}
        message={notification.message}
        variant={notification.variant}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />
    </div>
  )
}
