import { Pool } from 'pg'
let pool: Pool | null = null

function getDbUrl(): string {
  const url = process.env.DIABOT_DB_URL
  if (!url) throw new Error('DIABOT_DB_URL is required at runtime')
  return url
}

// Khởi tạo TRỄ để Next build không vỡ
export function getPool(): Pool {
  if (!pool) pool = new Pool({ connectionString: getDbUrl(), max: 4 })
  return pool
}

// Tiện dùng kiểu pool.query
export async function query<T = any>(text: string, params?: any[]) {
  const db = getPool()
  return db.query<T>(text, params)
}
