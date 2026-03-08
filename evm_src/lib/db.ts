import { neon } from '@neondatabase/serverless';
import 'dotenv/config'; // Ensures env variables load

// Failsafe to catch missing env variables immediately
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from your .env file!");
}

// Export the raw SQL connection
export const sql = neon(process.env.DATABASE_URL);