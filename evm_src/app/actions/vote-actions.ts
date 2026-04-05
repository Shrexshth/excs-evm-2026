'use server'

import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';

const sql = neon(process.env.DATABASE_URL!);

// Accept number for candidates, or null for NOTA
export async function castVote(candidateId: number | null) {
  try {
    // 🛑 1. PHASE CONTROL: Check if the election is actually running!
    const systemCheck = await sql`SELECT election_status FROM "SystemSettings" LIMIT 1`;
    const currentStatus = systemCheck[0]?.election_status || 'PAUSED';

    // If it's anything other than LIVE, bounce them immediately.
    if (currentStatus !== 'LIVE') {
      return { success: false, message: `Voting is currently ${currentStatus}.` };
    }

    // 2. Get the securely logged-in user from the httpOnly cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('voter_session');

    if (!sessionCookie || !sessionCookie.value) {
      return { success: false, message: "Unauthorized. Please scan your QR code again." };
    }

    const internalUserId = sessionCookie.value;

    // 3. The Atomic SQL Query
    const result = await sql`
      WITH updated_user AS (
        UPDATE "User"
        SET "isVerified" = true
        WHERE id::text = ${internalUserId} AND "isVerified" = false
        RETURNING id
      )
      INSERT INTO "Vote" ("voterId", "candidateId")
      SELECT id, ${candidateId}
      FROM updated_user
      RETURNING id;
    `;

    // 4. Check if the query actually did anything
    if (result.length === 0) {
      return { success: false, message: "Vote failed: User has already voted or does not exist." };
    }

    // 5. Destroy the session cookie immediately
    cookieStore.delete('voter_session');

    return { success: true, message: "Vote cast successfully!" };

  } catch (error: any) {
    console.error("Voting transaction failed:", error);
    return { success: false, message: `DB Error: ${error.message}` };
  }
}