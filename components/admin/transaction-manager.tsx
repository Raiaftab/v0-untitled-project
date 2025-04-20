"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Notification } from "@/components/ui/notification"
import { Loader2, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"

type Transaction = {
  id: number
  branch_id: number
  branch_name: string
  area_id: number
  area_name: string
  item_id: number
  item_name: string
  quantity: number
  transaction_type: "add" | "issue"
  person_name: string | null
  transaction_date: string
  created_at: string
  remarks: string | null
}

export function TransactionManager() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [notification, setNotification] = useState({ show: false, message: "", variant: "default" as const })

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTransactions(transactions)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredTransactions(
        transactions.filter(
          (transaction) =>
            transaction.area_name.toLowerCase().includes(term) ||
            transaction.branch_name.toLowerCase().includes(term) ||
            transaction.item_name.toLowerCase().includes(term) ||
            (transaction.person_name && transaction.person_name.toLowerCase().includes(term)) ||
            (transaction.remarks && transaction.remarks.toLowerCase().includes(term)),
        ),
      )
    }
  }, [searchTerm, transactions])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/transactions")
      const data = await response.json()
      setTransactions(data)
      setFilteredTransactions(data)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setNotification({
        show: true,
        message: "Failed to fetch transactions",
        variant: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNotification({
          show: true,
          message: "Transaction deleted successfully",
          variant: "success",
        })
        fetchTransactions()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete transaction")
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
      setNotification({
        show: true,
        message: error instanceof Error ? error.message : "An error occurred",
        variant: "error",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search transactions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Area/Branch</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Person</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{format(new Date(transaction.transaction_date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        {transaction.area_name} / {transaction.branch_name}
                      </TableCell>
                      <TableCell>{transaction.item_name}</TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>
                        {transaction.transaction_type === "add" ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Added
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Issued
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{transaction.person_name || "-"}</TableCell>
                      <TableCell>{transaction.remarks || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleDeleteTransaction(transaction.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
