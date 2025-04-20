"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Package, FileText, Users, Map, Building, LogOut, Menu, X, Home, Database, History, User } from 'lucide-react'

type UserType = {
  id: number
  username: string
  name: string
  role: "admin" | "user"
}

type NavbarProps = {
  user: UserType
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })
      
      if (response.ok) {
        // Handle redirection on the client side
        router.push("/login")
        router.refresh()
      } else {
        console.error("Logout failed:", await response.text())
      }
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Package className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Stock Management</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link
                href="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <Home className="mr-1 h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/reports"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <FileText className="mr-1 h-4 w-4" />
                Reports
              </Link>

              {user.role === "admin" && (
                <>
                  <Link
                    href="/admin/areas"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <Map className="mr-1 h-4 w-4" />
                    Areas
                  </Link>
                  <Link
                    href="/admin/branches"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <Building className="mr-1 h-4 w-4" />
                    Branches
                  </Link>
                  <Link
                    href="/admin/items"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <Database className="mr-1 h-4 w-4" />
                    Items
                  </Link>
                  <Link
                    href="/admin/transactions"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <History className="mr-1 h-4 w-4" />
                    Transactions
                  </Link>
                  <Link
                    href="/admin/users"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <Users className="mr-1 h-4 w-4" />
                    Users
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative flex items-center space-x-4">
              <Link href="/profile" className="text-gray-500 hover:text-gray-700 flex items-center">
                <User className="mr-1 h-4 w-4" />
                <span className="text-sm font-medium">{user.name}</span>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button variant="ghost" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="inline-block mr-2 h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/reports"
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FileText className="inline-block mr-2 h-4 w-4" />
              Reports
            </Link>

            {user.role === "admin" && (
              <>
                <Link
                  href="/admin/areas"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Map className="inline-block mr-2 h-4 w-4" />
                  Areas
                </Link>
                <Link
                  href="/admin/branches"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Building className="inline-block mr-2 h-4 w-4" />
                  Branches
                </Link>
                <Link
                  href="/admin/items"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Database className="inline-block mr-2 h-4 w-4" />
                  Items
                </Link>
                <Link
                  href="/admin/transactions"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <History className="inline-block mr-2 h-4 w-4" />
                  Transactions
                </Link>
                <Link
                  href="/admin/users"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="inline-block mr-2 h-4 w-4" />
                  Users
                </Link>
              </>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user.name}</div>
                <div className="text-sm font-medium text-gray-500">Role: {user.role}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/profile"
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="inline-block mr-2 h-4 w-4" />
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="w-full text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium"
              >
                <LogOut className="inline-block mr-2 h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
