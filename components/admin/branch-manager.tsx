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
import { Loader2, Pencil, Trash } from "lucide-react"

type Area = {
  id: number
  name: string
}

type Branch = {
  id: number
  name: string
  area_id: number
  area_name?: string
}

export function BranchManager() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [branchName, setBranchName] = useState("")
  const [areaId, setAreaId] = useState("")
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [notification, setNotification] = useState({ show: false, message: "", variant: "default" as const })

  useEffect(() => {
    fetchBranches()
    fetchAreas()
  }, [])

  const fetchBranches = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/branches?includeAreaName=true")
      const data = await response.json()
      setBranches(data)
    } catch (error) {
      console.error("Error fetching branches:", error)
      setNotification({
        show: true,
        message: "Failed to fetch branches",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAreas = async () => {
    try {
      const response = await fetch("/api/areas")
      const data = await response.json()
      setAreas(data)
    } catch (error) {
      console.error("Error fetching areas:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!branchName.trim() || !areaId) {
      setNotification({
        show: true,
        message: "Branch name and area are required",
        variant: "error",
      })
      return
    }

    setLoading(true)

    try {
      if (editingBranch) {
        // Update existing branch
        const response = await fetch(`/api/branches/${editingBranch.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: branchName, area_id: Number(areaId) }),
        })

        if (response.ok) {
          setNotification({
            show: true,
            message: "Branch updated successfully",
            variant: "success",
          })
          setEditingBranch(null)
        } else {
          const data = await response.json()
          throw new Error(data.error || "Failed to update branch")
        }
      } else {
        // Create new branch
        const response = await fetch("/api/branches", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: branchName, area_id: Number(areaId) }),
        })

        if (response.ok) {
          setNotification({
            show: true,
            message: "Branch created successfully",
            variant: "success",
          })
        } else {
          const data = await response.json()
          throw new Error(data.error || "Failed to create branch")
        }
      }

      setBranchName("")
      setAreaId("")
      fetchBranches()
    } catch (error) {
      console.error("Error saving branch:", error)
      setNotification({
        show: true,
        message: error instanceof Error ? error.message : "An error occurred",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch)
    setBranchName(branch.name)
    setAreaId(branch.area_id.toString())
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this branch? This will also delete all associated stock.")) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/branches/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNotification({
          show: true,
          message: "Branch deleted successfully",
          variant: "success",
        })
        fetchBranches()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete branch")
      }
    } catch (error) {
      console.error("Error deleting branch:", error)
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
    setEditingBranch(null)
    setBranchName("")
    setAreaId("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingBranch ? "Edit Branch" : "Add New Branch"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="branchName">Branch Name</Label>
              <Input
                id="branchName"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="Enter branch name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Select value={areaId} onValueChange={setAreaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Area" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id.toString()}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingBranch ? "Update" : "Add"}
              </Button>
              {editingBranch && (
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
          <CardTitle>Branches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && !branches.length ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : branches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No branches found
                    </TableCell>
                  </TableRow>
                ) : (
                  branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>{branch.id}</TableCell>
                      <TableCell>{branch.name}</TableCell>
                      <TableCell>{branch.area_name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(branch)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(branch.id)}>
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
