import { requireAuth } from "@/lib/auth"
import { Dashboard } from "@/components/dashboard"

export default async function Home() {
  // This will redirect to login if not authenticated
  const user = await requireAuth()

  return <Dashboard user={user} />
}
