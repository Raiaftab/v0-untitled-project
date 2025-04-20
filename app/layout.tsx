import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { getCurrentUser } from "@/lib/auth"
import { Navbar } from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Stock Management System",
  description: "A comprehensive system for managing inventory and stock",
    generator: 'v0.dev'
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {user && <Navbar user={user} />}
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
