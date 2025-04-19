"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DateRangePicker } from "@/components/date-range-picker"
import { format } from "date-fns"
import { Printer, Download, Loader2 } from "lucide-react"

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

export function ReportTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" })
  const printRef = useRef<HTMLDivElement>(null)

  const fetchReportData = async (startDate: string, endDate: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`)
      const data = await response.json()
      setTransactions(data)
      setDateRange({ startDate, endDate })
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const originalContents = document.body.innerHTML
    const printContents = printContent.innerHTML

    document.body.innerHTML = `
      <div class="p-8">
        <h1 class="text-2xl font-bold mb-4">Stock Transaction Report</h1>
        <p class="mb-4">Period: ${format(new Date(dateRange.startDate), "MMMM d, yyyy")} - ${format(
          new Date(dateRange.endDate),
          "MMMM d, yyyy",
        )}</p>
        ${printContents}
      </div>
    `

    window.print()
    document.body.innerHTML = originalContents
    window.location.reload()
  }

  const exportToCsv = () => {
    if (transactions.length === 0) return

    const headers = ["Date", "Area", "Branch", "Item", "Quantity", "Type", "Person", "Remarks"]

    const csvRows = [
      headers.join(","),
      ...transactions.map((t) => {
        return [
          format(new Date(t.transaction_date), "yyyy-MM-dd"),
          t.area_name,
          t.branch_name,
          `"${t.item_name}"`, // Wrap in quotes to handle commas in item names
          t.quantity,
          t.transaction_type === "add" ? "Added" : "Issued",
          t.person_name || "",
          `"${t.remarks || ""}"`, // Wrap in quotes to handle commas in remarks
        ].join(",")
      }),
    ]

    const csvString = csvRows.join("\n")
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `stock-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <CardTitle className="text-xl font-semibold">Stock Transaction Report</CardTitle>
        <DateRangePicker onDateRangeChange={fetchReportData} />
      </CardHeader>
      <CardContent>
        {transactions.length > 0 && (
          <div className="flex justify-end space-x-2 mb-4">
            <Button variant="outline" onClick={handlePrint} disabled={loading}>
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </Button>
            <Button variant="outline" onClick={exportToCsv} disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        )}

        <div className="rounded-md border" ref={printRef}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Person</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading report data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    {dateRange.startDate
                      ? "No transactions found for the selected date range"
                      : "Select a date range to generate a report"}
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(new Date(transaction.transaction_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{transaction.area_name}</TableCell>
                    <TableCell>{transaction.branch_name}</TableCell>
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {transactions.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Total Transactions: {transactions.length} | Period:{" "}
              {format(new Date(dateRange.startDate), "MMMM d, yyyy")} -{" "}
              {format(new Date(dateRange.endDate), "MMMM d, yyyy")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
