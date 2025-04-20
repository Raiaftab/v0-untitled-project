"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Notification } from "@/components/ui/notification"
import { Badge } from "@/components/ui/badge"
import { Loader2, Pencil, Trash, UserPlus, Save, X, Key } from "lucide-react"

type User = {
  id: number
  username: string
  name: string
  role: "admin" | "user"
}

export function UserManager() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({ show: false, message: "", variant: "default" as const })

  // Form states
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  // Add user form
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newName, setNewName] = useState("")
  const [newRole, setNewRole] = useState<"admin" | "user">("user")

  // Edit user form
  const [editName, setEditName] = useState("")
  const [editRole, setEditRole] = useState<"admin" | "user">("user")

  // Change password form
  const [newUserPassword, setNewUserPassword] = useState("")
  const [confirmUserPassword, setConfirmUserPassword] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      setNotification({
        show: true,
        message: "Failed to fetch users",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          name: newName,
          role: newRole,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setNotification({
          show: true,
          message: "User created successfully",
          variant: "success",
        })

        // Reset form
        setNewUsername("")
        setNewPassword("")
        setNewName("")
        setNewRole("user")
        setShowAddForm(false)

        // Refresh users
        fetchUsers()
      } else {
        setNotification({
          show: true,
          message: data.error || "Failed to create user",
          variant: "error",
        })
      }
    } catch (error) {
      console.error("Error creating user:", error)
      setNotification({
        show: true,
        message: "An error occurred while creating user",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingUser) return

    setLoading(true)

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
          role: editRole,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setNotification({
          show: true,
          message: "User updated successfully",
          variant: "success",
        })

        // Reset form
        setEditingUser(null)

        // Refresh users
        fetchUsers()
      } else {
        setNotification({
          show: true,
          message: data.error || "Failed to update user",
          variant: "error",
        })
      }
    } catch (error) {
      console.error("Error updating user:", error)
      setNotification({
        show: true,
        message: "An error occurred while updating user",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingUser) return

    if (newUserPassword !== confirmUserPassword) {
      setNotification({
        show: true,
        message: "Passwords do not match",
        variant: "error",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: newUserPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setNotification({
          show: true,
          message: "Password changed successfully",
          variant: "success",
        })

        // Reset form
        setNewUserPassword("")
        setConfirmUserPassword("")
        setShowPasswordForm(false)

        // Refresh users
        fetchUsers()
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

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        setNotification({
          show: true,
          message: "User deleted successfully",
          variant: "success",
        })

        // Refresh users
        fetchUsers()
      } else {
        setNotification({
          show: true,
          message: data.error || "Failed to delete user",
          variant: "error",
        })
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      setNotification({
        show: true,
        message: "An error occurred while deleting user",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (user: User) => {
    setEditingUser(user)
    setEditName(user.name)
    setEditRole(user.role)
    setShowPasswordForm(false)
  }

  const startChangePassword = (user: User) => {
    setEditingUser(user)
    setShowPasswordForm(true)
    setNewUserPassword("")
    setConfirmUserPassword("")
  }

  const cancelEdit = () => {
    setEditingUser(null)
    setShowPasswordForm(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{showAddForm ? "Add New User" : "User Management"}</CardTitle>
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showAddForm ? (
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newRole} onValueChange={(value) => setNewRole(value as "admin" | "user")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="user">Regular User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save User
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          ) : editingUser ? (
            showPasswordForm ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmUserPassword}
                    onChange={(e) => setConfirmUserPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
                    Change Password
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleEditUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={editingUser.username} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={editRole} onValueChange={(value) => setEditRole(value as "admin" | "user")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="user">Regular User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Update User
                  </Button>
                  <Button type="button" variant="outline" onClick={() => startChangePassword(editingUser)}>
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </form>
            )
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "outline"}>
                            {user.role === "admin" ? "Administrator" : "Regular User"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => startEdit(user)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => startChangePassword(user)}>
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
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
