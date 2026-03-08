import 'dotenv/config';
import { sql } from './lib/db';
import bcrypt from 'bcryptjs';

async function masterSetup() {
  try {
    console.log("💣 1. Obliterating old conflicting tables (fixing UUID issue)...");
    // CASCADE ensures it deletes any lingering relationships tied to the old tables
    await sql`DROP TABLE IF EXISTS "Vote", "Candidate", "User", "AuditLog" CASCADE;`;

    console.log("🛠️ 2. Building fresh Database Tables...");

    await sql`
      CREATE TABLE "User" (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        "enrollmentNumber" VARCHAR(255) UNIQUE,
        password TEXT NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'VOTER',
        name VARCHAR(255),
        "isVerified" BOOLEAN DEFAULT FALSE
      );
    `;

    await sql`
      CREATE TABLE "Candidate" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        party VARCHAR(255),
        symbol VARCHAR(50)
      );
    `;

    await sql`
      CREATE TABLE "Vote" (
        id SERIAL PRIMARY KEY,
        "voterId" INTEGER REFERENCES "User"(id),
        "candidateId" INTEGER REFERENCES "Candidate"(id),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE "AuditLog" (
        id SERIAL PRIMARY KEY,
        action VARCHAR(255),
        endpoint VARCHAR(255),
        details JSONB,
        "userRole" VARCHAR(50),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("✅ Tables built successfully!");

    console.log("👑 3. Creating Super Admin...");
    const adminHash = await bcrypt.hash('CEC_Master_Global_2026', 10);
    await sql`
      INSERT INTO "User" (username, password, role, name, "isVerified")
      VALUES ('superadmin', ${adminHash}, 'SUPER_ADMIN', 'Chief Commissioner', TRUE);
    `;

    console.log("👔 4. Injecting 3 Candidates...");
    await sql`
      INSERT INTO "Candidate" (name, party, symbol) VALUES 
      ('Aditya Rane', 'B.Tech CSE', '🧑🏾‍💼'),
      ('Sneha Patil', 'B.Com Accounting', '👩🏽‍🎓'),
      ('Rahul Desai', 'B.Sc IT', '👨🏾‍🏆');
    `;

    console.log("🎓 5. Injecting 1 Test Student...");
    const studentHash = await bcrypt.hash('2004-01-01', 10); 
    await sql`
      INSERT INTO "User" (username, "enrollmentNumber", password, role, name, "isVerified")
      VALUES ('VIT-25-001', 'VIT-25-001', ${studentHash}, 'VOTER', 'Test Student 1', false);
    `;

    console.log("🎉 MASTER SETUP COMPLETE!");

  } catch (error) {
    console.error("❌ SETUP FAILED:", error);
  }
}

masterSetup();