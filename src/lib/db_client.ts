import { Pool, QueryResult } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __diabotDbPool: Pool | undefined;
}

const connectionString = process.env.DIABOT_DB_URL;

if (!connectionString) {
  throw new Error(
    "DIABOT_DB_URL environment variable is required to connect to the Postgres database."
  );
}

const pool = globalThis.__diabotDbPool ?? new Pool({ connectionString });

if (!globalThis.__diabotDbPool) {
  globalThis.__diabotDbPool = pool;
}

export { pool };

export function query<T>(text: string, params?: any[]): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}
