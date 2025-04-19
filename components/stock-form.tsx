"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Notification } from "@/components/ui/notification"
import { Loader2, Save, X } from "lucide-react"

type Area = {
  id: number
  name: string
}

type Branch = {
  id: number
  name: string
  area_id: number
}

type Item = {
  id: number
  name: string
}

type StockFormProps = {
  onStockAdded: () => void
}

export function StockForm({ onStockAdded }: StockFormProps) {
  const [areas, setAreas] = useState<Area[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", variant: "default" as const })

  const [formData, setFormData] = useState({
    areaId: "",
    branchId: "",
    itemId: "",
    quantity: "",
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    // Fetch areas
    fetch("/api/areas")
      .then((res) => res.json())
      .then((data) => setAreas(data))
      .catch((err) => console.error("Error fetching areas:", err))

    // Fetch items
    fetch("/api/items")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error fetching items:", err))
  }, [])

  useEffect(() => {
    if (formData.areaId) {
      // Fetch branches for selected area
      fetch(`/api/branches?areaId=${formData.areaId}`)
        .then((res) => res.json())
        .then((data) => setBranches(data))
        .catch((err) => console.error("Error fetching branches:", err))
    } else {
      setBranches([])
    }
  }, [formData.areaId])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.areaId || !formData.branchId || !formData.itemId || !formData.quantity || !formData.date) {
      setNotification({
        show: true,
        message: "Please fill all fields",
        variant: "error",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          branchId: Number.parseInt(formData.branchId),
          itemId: Number.parseInt(formData.itemId),
          quantity: Number.parseInt(formData.quantity),
          date: formData.date,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setNotification({
          show: true,
          message: "Stock added successfully",
          variant: "success",
        })

        // Reset form
        setFormData({
          areaId: "",
          branchId: "",
          itemId: "",
          quantity: "",
          date: new Date().toISOString().split("T")[0],
        })

        // Notify parent component
        onStockAdded()
      } else {
        setNotification({
          show: true,
          message: data.error || "Failed to add stock",
          variant: "error",
        })
      }
    } catch (error) {
      setNotification({
        show: true,
        message: "An error occurred",
        variant: "error",
      })
      console.error("Error adding stock:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setFormData({
      areaId: "",
      branchId: "",
      itemId: "",
      quantity: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <span className="mr-2">Add Stock</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Select value={formData.areaId} onValueChange={(value) => handleChange("areaId", value)}>
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

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select
                value={formData.branchId}
                onValueChange={(value) => handleChange("branchId", value)}
                disabled={!formData.areaId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item">Item</Label>
              <Select value={formData.itemId} onValueChange={(value) => handleChange("itemId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Item
              </Button>
              <Button type="button" variant="outline" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Notification
        show={notification.show}
        message={notification.message}
        variant={notification.variant}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />
    </>
  )
}
