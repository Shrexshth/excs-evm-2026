import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
  try {
    const result = await sql`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'User';
    `;
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

checkSchema();
