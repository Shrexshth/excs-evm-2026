import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function alterTable() {
  try {
    await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "authToken" VARCHAR(255);`;
    console.log("Column authToken added successfully.");
  } catch (error) {
    console.error(error);
  }
}

alterTable();
