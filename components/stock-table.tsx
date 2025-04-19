"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Notification } from "@/components/ui/notification"
import { Edit, Trash2, RefreshCw, Search } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type StockItem = {
  id: number
  branch_id: number
  branch_name: string
  area_id: number
  area_name: string
  item_id: number
  item_name: string
  quantity: number
  last_updated: string
}

type StockTableProps = {
  onRefresh: () => void
  onEdit?: (item: StockItem) => void
}

export function StockTable({ onRefresh, onEdit }: StockTableProps) {
  const [stock, setStock] = useState<StockItem[]>([])
  const [filteredStock, setFilteredStock] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [notification, setNotification] = useState({ show: false, message: "", variant: "default" as const })
  const [lastSynced, setLastSynced] = useState<Date | null>(null)

  const fetchStock = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/stock")
      const data = await response.json()
      setStock(data)
      setFilteredStock(data)
      setLastSynced(new Date())
    } catch (error) {
      console.error("Error fetching stock:", error)
      setNotification({
        show: true,
        message: "Failed to fetch stock data",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStock()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStock(stock)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredStock(
        stock.filter(
          (item) =>
            item.area_name.toLowerCase().includes(term) ||
            item.branch_name.toLowerCase().includes(term) ||
            item.item_name.toLowerCase().includes(term),
        ),
      )
    }
  }, [searchTerm, stock])

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return
    }

    try {
      const response = await fetch(`/api/stock?id=${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setStock((prev) => prev.filter((item) => item.id !== id))
        setNotification({
          show: true,
          message: "Item deleted successfully",
          variant: "success",
        })
      } else {
        setNotification({
          show: true,
          message: data.error || "Failed to delete item",
          variant: "error",
        })
      }
    } catch (error) {
      console.error("Error deleting item:", error)
      setNotification({
        show: true,
        message: "An error occurred while deleting the item",
        variant: "error",
      })
    }
  }

  const handleRefresh = () => {
    fetchStock()
    onRefresh()
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Stock Inventory</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search items..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {lastSynced && (
              <span className="text-xs text-gray-500">
                Last synced: {formatDistanceToNow(lastSynced, { addSuffix: true })}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading stock data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredStock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStock.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.area_name}</TableCell>
                      <TableCell>{item.branch_name}</TableCell>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatDistanceToNow(new Date(item.last_updated), { addSuffix: true })}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {onEdit && (
                            <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
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
    </>
  )
}
