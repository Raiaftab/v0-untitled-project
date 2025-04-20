import { requireAuth } from "@/lib/auth"
import { ReportTable } from "@/components/report-table"
import { Package } from "lucide-react"

export default async function ReportsPage() {
  // This will redirect to login if not authenticated
  await requireAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <Package className="mr-2 h-6 w-6 text-indigo-600" />
          Stock Management Reports
        </h1>
        <ReportTable />
      </div>
    </div>
  )
}
