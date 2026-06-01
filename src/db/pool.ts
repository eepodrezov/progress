import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Missing DATABASE_URL env var");
  }
  return url;
}

export function getPool(): Pool {
  if (process.env.NODE_ENV !== "production") {
    if (!global.__pgPool) {
      global.__pgPool = new Pool({
        connectionString: getDatabaseUrl(),
        max: 5,
      });
    }
    return global.__pgPool;
  }

  return new Pool({
    connectionString: getDatabaseUrl(),
    max: 5,
  });
}

