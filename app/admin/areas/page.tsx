import { requireAdmin } from "@/lib/auth"
import { AreaManager } from "@/components/admin/area-manager"

export default async function AreasPage() {
  // This will redirect if the user is not an admin
  await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Area Management</h1>
        <AreaManager />
      </div>
    </div>
  )
}
