import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    await requireAdmin()

    const id = Number.parseInt(params.id)

    // First, check if the transaction exists
    const transaction = await sql`SELECT id FROM stock_transactions WHERE id = ${id}`

    if (transaction.length === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Delete the transaction
    await sql`DELETE FROM stock_transactions WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 })
  }
}
