import { neon, neonConfig } from "@neondatabase/serverless"

// Configure neon with retries and timeout
neonConfig.fetchConnectionCache = true
neonConfig.fetchRetryTimeout = 5000 // 5 seconds timeout
neonConfig.fetchRetryCount = 3 // Retry 3 times

// Create a SQL client with better error handling
const createSqlClient = () => {
  try {
    // Ensure DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not defined")
    }

    return neon(process.env.DATABASE_URL)
  } catch (error) {
    console.error("Failed to create database client:", error)
    // Return a function that will throw an error when called
    return () => {
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

export const sql = createSqlClient()

// Types for our database entities
export type Area = {
  id: number
  name: string
}

export type Branch = {
  id: number
  name: string
  area_id: number
}

export type Item = {
  id: number
  name: string
}

export type Stock = {
  id: number
  branch_id: number
  item_id: number
  quantity: number
  last_updated: Date
}

export type StockWithDetails = {
  id: number
  branch_id: number
  branch_name: string
  area_id: number
  area_name: string
  item_id: number
  item_name: string
  quantity: number
  last_updated: Date
}

export type Transaction = {
  id: number
  branch_id: number
  item_id: number
  quantity: number
  transaction_type: "add" | "issue"
  person_name: string | null
  transaction_date: Date
  created_at: Date
  remarks: string | null
}

export type TransactionWithDetails = {
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
  transaction_date: Date
  created_at: Date
  remarks: string | null
}

export type User = {
  id: number
  username: string
  password_hash: string
  name: string
  role: "admin" | "user"
  created_at: Date
}

export type Session = {
  id: string
  user_id: number
  expires_at: Date
  created_at: Date
}
