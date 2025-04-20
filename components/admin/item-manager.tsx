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

type Item = {
  id: number
  name: string
}

export function ItemManager() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [itemName, setItemName] = useState("")
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [notification, setNotification] = useState({ show: false, message: "", variant: "default" as const })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/items")
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error("Error fetching items:", error)
      setNotification({
        show: true,
        message: "Failed to fetch items",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!itemName.trim()) {
      setNotification({
        show: true,
        message: "Item name is required",
        variant: "error",
      })
      return
    }

    setLoading(true)

    try {
      if (editingItem) {
        // Update existing item
        const response = await fetch(`/api/items/${editingItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: itemName }),
        })

        if (response.ok) {
          setNotification({
            show: true,
            message: "Item updated successfully",
            variant: "success",
          })
          setEditingItem(null)
        } else {
          const data = await response.json()
          throw new Error(data.error || "Failed to update item")
        }
      } else {
        // Create new item
        const response = await fetch("/api/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: itemName }),
        })

        if (response.ok) {
          setNotification({
            show: true,
            message: "Item created successfully",
            variant: "success",
          })
        } else {
          const data = await response.json()
          throw new Error(data.error || "Failed to create item")
        }
      }

      setItemName("")
      fetchItems()
    } catch (error) {
      console.error("Error saving item:", error)
      setNotification({
        show: true,
        message: error instanceof Error ? error.message : "An error occurred",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setItemName(item.name)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item? This will also delete all associated stock.")) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNotification({
          show: true,
          message: "Item deleted successfully",
          variant: "success",
        })
        fetchItems()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete item")
      }
    } catch (error) {
      console.error("Error deleting item:", error)
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
    setEditingItem(null)
    setItemName("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingItem ? "Edit Item" : "Add New Item"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Enter item name"
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingItem ? "Update" : "Add"}
              </Button>
              {editingItem && (
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
          <CardTitle>Items</CardTitle>
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
                {loading && !items.length ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      No items found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
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
