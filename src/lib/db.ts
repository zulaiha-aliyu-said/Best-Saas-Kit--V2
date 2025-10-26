// Simple alias for database.ts (Edge-compatible)
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;






