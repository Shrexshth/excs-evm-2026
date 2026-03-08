import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // 1. We ask the database for 3 numbers: Total Voters, Total Votes, and Total Candidates
    const counts = await sql`
      SELECT 
        (SELECT COUNT(*) FROM "User" WHERE role = 'VOTER') as eligible,
        (SELECT COUNT(*) FROM "Vote") as cast,
        (SELECT COUNT(*) FROM "Candidate") as candidates
    `;

    // 2. We ask for the live leaderboard (Who is winning?)
    const tallies = await sql`
      SELECT 
        c.id, c.name, c.symbol,
        COUNT(v.id) as votes,
        ROUND((COUNT(v.id)::numeric / NULLIF((SELECT COUNT(*) FROM "Vote"), 0)) * 100, 1) as pct
      FROM "Candidate" c
      LEFT JOIN "Vote" v ON c.id = v."candidateId"
      GROUP BY c.id
      ORDER BY votes DESC;
    `;

    // 3. We send all this info back to your Admin Page
    return NextResponse.json({
      counts: counts[0],
      tallies: tallies
    });
  } catch (error) {
    console.error("Master Stats Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}