import 'dotenv/config';
import { sql } from './lib/db';
import bcrypt from 'bcryptjs';

async function secureSeed() {
  try {
    console.log("🧹 Cleaning old high-level accounts...");
    await sql`DELETE FROM "User" WHERE role IN ('SUPER_ADMIN', 'ADMIN', 'OFFICER');`;

    // 1. Super Admin
    const superHash = await bcrypt.hash(process.env.SUPERADMIN_PASS!, 10);
    await sql`
      INSERT INTO "User" (username, password, role, name, "isVerified")
      VALUES ('superadmin', ${superHash}, 'SUPER_ADMIN', 'Chief Commissioner', TRUE);
    `;

    // 2. The 4 Department Admins
    const adminConfig = [
      { user: 'EXCSA', name: 'Admin EXC Section A', pass: process.env.ADMIN_EXCSA_PASS },
      { user: 'EXCSB', name: 'Admin EXC Section B', pass: process.env.ADMIN_EXCSB_PASS },
      { user: 'EXTCA', name: 'Admin EXTC Section A', pass: process.env.ADMIN_EXTCA_PASS },
      { user: 'EXTCB', name: 'Admin EXTC Section B', pass: process.env.ADMIN_EXTCB_PASS },
    ];

    for (const adm of adminConfig) {
      const hash = await bcrypt.hash(adm.pass!, 10);
      await sql`
        INSERT INTO "User" (username, password, role, name, "isVerified")
        VALUES (${adm.user}, ${hash}, 'ADMIN', ${adm.name}, TRUE);
      `;
    }

    // 3. The 10 Polling Officers
    const offHash = await bcrypt.hash(process.env.OFFICER_GLOBAL_PASS!, 10);
    for (let i = 1; i <= 10; i++) {
      const username = `OFFICER_${i.toString().padStart(2, '0')}`;
      await sql`
        INSERT INTO "User" (username, password, role, name, "isVerified")
        VALUES (${username}, ${offHash}, 'OFFICER', ${`Polling Officer ${i}`}, TRUE);
      `;
    }

    console.log("✅ Secure Seed Complete!");
  } catch (err) {
    console.error("❌ Seed failed. Check if .env variables are set:", err);
  }
}

secureSeed();