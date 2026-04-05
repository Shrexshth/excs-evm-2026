import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { logAction } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    // 1. PHASE CONTROL: Check System Settings
    const systemCheck = await sql`SELECT election_status FROM "SystemSettings" LIMIT 1`;
    const currentStatus = systemCheck[0]?.election_status || 'PAUSED';

    if (currentStatus !== 'LIVE') {
      return NextResponse.json({
        success: false,
        message: `Voting is currently ${currentStatus}.`
      }, { status: 403 });
    }

    // 2. Parse incoming data
    const body = await req.json();
    const incomingVoterId = body.voterId || body.userId || body.id || body.enrollmentNumber;

    // Handle NOTA (candidateId = null) or a specific ID
    const candidateId = body.candidateId !== undefined ? body.candidateId : null;

    if (!incomingVoterId) {
      return NextResponse.json({ success: false, message: "Missing Voter ID." }, { status: 400 });
    }

    // 3. THE ATOMIC TRANSACTION
    // This CTE handles everything in one go:
    // a) Finds the user and updates isVerified only if it was false.
    // b) Inserts the vote only if the user update succeeded.
    const result = await sql`
      WITH updated_user AS (
        UPDATE "User"
        SET "isVerified" = true
        WHERE ("enrollmentNumber" = ${incomingVoterId} OR username = ${incomingVoterId} OR id::text = ${incomingVoterId})
          AND "isVerified" = false
        RETURNING id
      )
      INSERT INTO "Vote" ("voterId", "candidateId")
      SELECT id, ${candidateId}
      FROM updated_user
      RETURNING id;
    `;

    // 4. Verify Success
    // If result is empty, it means the WHERE clause failed (User already voted or ID wrong)
    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Vote failed: Student not found or you have already cast your vote."
      }, { status: 403 });
    }

    // 5. Create Forensic Log
    await logAction({
      action: 'VOTE_CAST',
      endpoint: '/api/vote',
      userRole: 'VOTER',
      details: { voterId: incomingVoterId }
    });

    return NextResponse.json({
      success: true,
      message: "Vote successfully recorded!",
      receiptId: Math.floor(Math.random() * 900000 + 100000)
    });

  } catch (error: any) {
    console.error("🚨 Voting API Crash:", error);
    return NextResponse.json({
      success: false,
      message: `Server error: ${error.message}`
    }, { status: 500 });
  }
}