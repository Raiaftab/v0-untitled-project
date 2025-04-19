import { neon } from "@neondatabase/serverless"

// Create a SQL client with the pooled connection
export const sql = neon(process.env.DATABASE_URL!)

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
