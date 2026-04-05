import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

async function checkUsers() {
  const users = await sql`SELECT id, username, role, password FROM "User" WHERE role IN ('SUPER_ADMIN', 'ADMIN')`;
  
  for (const u of users) {
    const isSuper69 = await bcrypt.compare('superadmin69', u.password);
    const isCEC = await bcrypt.compare('CEC_Master_Global_2026', u.password);
    const isEXCSA = await bcrypt.compare(process.env.ADMIN_EXCSA_PASS || '', u.password);

    console.log(`User: ${u.username} | Role: ${u.role} | superadmin69: ${isSuper69} | CEC_Master: ${isCEC} | EXCSA_PASS: ${isEXCSA}`);
  }
}

checkUsers();
