import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { logAction } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    // 🛑 1. PHASE CONTROL: Check if the election is actually running!
    const systemCheck = await sql`SELECT election_status FROM "SystemSettings" LIMIT 1`;
    const currentStatus = systemCheck[0]?.election_status || 'PAUSED';

    if (currentStatus === 'PAUSED') {
      return NextResponse.json({ success: false, message: "Voting is currently PAUSED by the Election Commission." }, { status: 403 });
    }
    if (currentStatus === 'COMPLETED') {
      return NextResponse.json({ success: false, message: "This election has CONCLUDED. Voting is permanently closed." }, { status: 403 });
    }

    // 2. Parse the incoming vote data (FLEXIBLE CATCH)
    const body = await req.json();
    
    // This catches the ID no matter what your frontend named it
    const incomingVoterId = body.voterId || body.userId || body.id || body.enrollmentNumber;
    const candidateId = body.candidateId !== undefined ? body.candidateId : body.candidate;

    if (!incomingVoterId || candidateId === undefined) {
      return NextResponse.json({ success: false, message: "Missing vote data. Please try again." }, { status: 400 });
    }

    // 3. Find the user in the database to get their actual internal UUID
    const checkUser = await sql`
      SELECT id, "isVerified" 
      FROM "User" 
      WHERE "enrollmentNumber" = ${incomingVoterId} 
         OR username = ${incomingVoterId} 
         OR id::text = ${incomingVoterId}
      LIMIT 1
    `;

    if (checkUser.length === 0) {
      return NextResponse.json({ success: false, message: "Student record not found." }, { status: 404 });
    }

    if (checkUser[0].isVerified === true) {
      return NextResponse.json({ success: false, message: "You have already cast your vote." }, { status: 403 });
    }

    const internalUserUUID = checkUser[0].id; // The safe UUID required by the database

    // 4. Insert the Vote safely
    await sql`
      INSERT INTO "Vote" ("voterId", "candidateId")
      VALUES (${internalUserUUID}, ${candidateId})
    `;

    // 5. Mark the student as 'Voted'
    await sql`
      UPDATE "User" 
      SET "isVerified" = true 
      WHERE id = ${internalUserUUID}
    `;

    // 6. Create a forensic log
    await logAction({
      action: 'VOTE_CAST',
      endpoint: '/api/vote',
      userRole: 'VOTER',
      details: { voterId: incomingVoterId } 
    });

    return NextResponse.json({ success: true, message: "Vote successfully recorded!" });

  } catch (error) {
    console.error("🚨 Voting API Crash:", error);
    return NextResponse.json({ success: false, message: "Server error processing your vote." }, { status: 500 });
  }
}