"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Notification } from "@/components/ui/notification"
import { Loader2, User, Key } from "lucide-react"

type ProfileFormUser = {
  id: number
  username: string
  name: string
  role: "admin" | "user"
}

type ProfileFormProps = {
  user: ProfileFormUser
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", variant: "default" as const })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setNotification({
        show: true,
        message: "New passwords do not match",
        variant: "error",
      })
      return
    }

    if (newPassword.length < 6) {
      setNotification({
        show: true,
        message: "New password must be at least 6 characters long",
        variant: "error",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setNotification({
          show: true,
          message: data.message || "Password changed successfully",
          variant: "success",
        })

        // Clear form
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setNotification({
          show: true,
          message: data.error || "Failed to change password",
          variant: "error",
        })
      }
    } catch (error) {
      console.error("Error changing password:", error)
      setNotification({
        show: true,
        message: "An error occurred while changing password",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">Username: {user.username}</p>
                <p className="text-sm text-gray-500">Role: {user.role}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Changing Password
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" /> Change Password
                </>
              )}
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
