import {
  sql,
  type Area,
  type Branch,
  type Item,
  type Stock,
  type StockWithDetails,
  type TransactionWithDetails,
} from "./db"

// Areas
export async function getAreas(): Promise<Area[]> {
  const result = await sql<Area[]>`SELECT * FROM areas ORDER BY name`
  return result
}

// Branches
export async function getBranches(): Promise<Branch[]> {
  const result = await sql<Branch[]>`SELECT * FROM branches ORDER BY name`
  return result
}

export async function getBranchesByArea(areaId: number): Promise<Branch[]> {
  const result = await sql<Branch[]>`
    SELECT * FROM branches 
    WHERE area_id = ${areaId} 
    ORDER BY name
  `
  return result
}

// Items
export async function getItems(): Promise<Item[]> {
  const result = await sql<Item[]>`SELECT * FROM items ORDER BY name`
  return result
}

// Stock
export async function getStockWithDetails(): Promise<StockWithDetails[]> {
  const result = await sql<StockWithDetails[]>`
    SELECT 
      s.id, 
      s.branch_id, 
      b.name as branch_name, 
      b.area_id, 
      a.name as area_name, 
      s.item_id, 
      i.name as item_name, 
      s.quantity, 
      s.last_updated
    FROM stock s
    JOIN branches b ON s.branch_id = b.id
    JOIN areas a ON b.area_id = a.id
    JOIN items i ON s.item_id = i.id
    ORDER BY a.name, b.name, i.name
  `
  return result
}

export async function getStockByBranchAndItem(branchId: number, itemId: number): Promise<Stock | null> {
  const result = await sql<Stock[]>`
    SELECT * FROM stock 
    WHERE branch_id = ${branchId} AND item_id = ${itemId}
  `
  return result.length > 0 ? result[0] : null
}

export async function addStock(branchId: number, itemId: number, quantity: number, date: string): Promise<void> {
  // Check if stock entry exists
  const existingStock = await getStockByBranchAndItem(branchId, itemId)

  if (existingStock) {
    // Update existing stock
    await sql`
      UPDATE stock 
      SET quantity = quantity + ${quantity}, last_updated = CURRENT_TIMESTAMP 
      WHERE id = ${existingStock.id}
    `
  } else {
    // Create new stock entry
    await sql`
      INSERT INTO stock (branch_id, item_id, quantity) 
      VALUES (${branchId}, ${itemId}, ${quantity})
    `
  }

  // Record transaction
  await sql`
    INSERT INTO stock_transactions 
    (branch_id, item_id, quantity, transaction_type, transaction_date) 
    VALUES (${branchId}, ${itemId}, ${quantity}, 'add', ${date})
  `
}

export async function updateStock(stockId: number, quantity: number): Promise<void> {
  await sql`
    UPDATE stock 
    SET quantity = ${quantity}, last_updated = CURRENT_TIMESTAMP 
    WHERE id = ${stockId}
  `
}

export async function issueStock(
  branchId: number,
  itemId: number,
  quantity: number,
  personName: string,
  date: string,
): Promise<boolean> {
  // Check if enough stock is available
  const stock = await getStockByBranchAndItem(branchId, itemId)

  if (!stock || stock.quantity < quantity) {
    return false
  }

  // Update stock
  await sql`
    UPDATE stock 
    SET quantity = quantity - ${quantity}, last_updated = CURRENT_TIMESTAMP 
    WHERE id = ${stock.id}
  `

  // Record transaction
  await sql`
    INSERT INTO stock_transactions 
    (branch_id, item_id, quantity, transaction_type, person_name, transaction_date) 
    VALUES (${branchId}, ${itemId}, ${quantity}, 'issue', ${personName}, ${date})
  `

  return true
}

export async function deleteStock(stockId: number): Promise<void> {
  await sql`DELETE FROM stock WHERE id = ${stockId}`
}

// Transactions
export async function getTransactionsWithDetails(): Promise<TransactionWithDetails[]> {
  const result = await sql<TransactionWithDetails[]>`
    SELECT 
      t.id, 
      t.branch_id, 
      b.name as branch_name, 
      b.area_id, 
      a.name as area_name, 
      t.item_id, 
      i.name as item_name, 
      t.quantity, 
      t.transaction_type, 
      t.person_name, 
      t.transaction_date, 
      t.created_at
    FROM stock_transactions t
    JOIN branches b ON t.branch_id = b.id
    JOIN areas a ON b.area_id = a.id
    JOIN items i ON t.item_id = i.id
    ORDER BY t.created_at DESC
  `
  return result
}
