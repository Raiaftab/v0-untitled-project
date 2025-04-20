import { requireAuth } from "@/lib/auth"
import { ProfileForm } from "@/components/profile-form"

export default async function ProfilePage() {
  // This will redirect to login if not authenticated
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">User Profile</h1>
        <ProfileForm user={user} />
      </div>
    </div>
  )
}
