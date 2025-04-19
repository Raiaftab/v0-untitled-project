"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockForm } from "@/components/stock-form"
import { IssueForm } from "@/components/issue-form"
import { StockTable } from "@/components/stock-table"
import { TransactionHistory } from "@/components/transaction-history"
import { Package, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Package className="mr-2 h-6 w-6 text-indigo-600" />
              Stock Management System
            </h1>
            <Button variant="outline" asChild>
              <a href="/reports" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Tabs defaultValue="add">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="add">Add Stock</TabsTrigger>
                <TabsTrigger value="issue">Issue Stock</TabsTrigger>
              </TabsList>
              <TabsContent value="add">
                <StockForm onStockAdded={handleRefresh} />
              </TabsContent>
              <TabsContent value="issue">
                <IssueForm onStockIssued={handleRefresh} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <StockTable key={`stock-${refreshKey}`} onRefresh={handleRefresh} />
            <TransactionHistory key={`transactions-${refreshKey}`} />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">Stock Management System Created By Rai Aftab Ameer &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
