"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Notification } from "@/components/ui/notification"
import { Loader2, Pencil, Trash } from "lucide-react"

type Area = {
  id: number
  name: string
}

export function AreaManager() {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [areaName, setAreaName] = useState("")
  const [editingArea, setEditingArea] = useState<Area | null>(null)
  const [notification, setNotification] = useState({ show: false, message: "", variant: "default" as const })

  useEffect(() => {
    fetchAreas()
  }, [])

  const fetchAreas = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/areas")
      const data = await response.json()
      setAreas(data)
    } catch (error) {
      console.error("Error fetching areas:", error)
      setNotification({
        show: true,
        message: "Failed to fetch areas",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!areaName.trim()) {
      setNotification({
        show: true,
        message: "Area name is required",
        variant: "error",
      })
      return
    }

    setLoading(true)

    try {
      if (editingArea) {
        // Update existing area
        const response = await fetch(`/api/areas/${editingArea.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: areaName }),
        })

        if (response.ok) {
          setNotification({
            show: true,
            message: "Area updated successfully",
            variant: "success",
          })
          setEditingArea(null)
        } else {
          const data = await response.json()
          throw new Error(data.error || "Failed to update area")
        }
      } else {
        // Create new area
        const response = await fetch("/api/areas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: areaName }),
        })

        if (response.ok) {
          setNotification({
            show: true,
            message: "Area created successfully",
            variant: "success",
          })
        } else {
          const data = await response.json()
          throw new Error(data.error || "Failed to create area")
        }
      }

      setAreaName("")
      fetchAreas()
    } catch (error) {
      console.error("Error saving area:", error)
      setNotification({
        show: true,
        message: error instanceof Error ? error.message : "An error occurred",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (area: Area) => {
    setEditingArea(area)
    setAreaName(area.name)
  }

  const handleDelete = async (id: number) => {
    if (
      !confirm("Are you sure you want to delete this area? This will also delete all associated branches and stock.")
    ) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/areas/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNotification({
          show: true,
          message: "Area deleted successfully",
          variant: "success",
        })
        fetchAreas()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete area")
      }
    } catch (error) {
      console.error("Error deleting area:", error)
      setNotification({
        show: true,
        message: error instanceof Error ? error.message : "An error occurred",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingArea(null)
    setAreaName("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingArea ? "Edit Area" : "Add New Area"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="areaName">Area Name</Label>
              <Input
                id="areaName"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="Enter area name"
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingArea ? "Update" : "Add"}
              </Button>
              {editingArea && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && !areas.length ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : areas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      No areas found
                    </TableCell>
                  </TableRow>
                ) : (
                  areas.map((area) => (
                    <TableRow key={area.id}>
                      <TableCell>{area.id}</TableCell>
                      <TableCell>{area.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(area)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(area.id)}>
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
