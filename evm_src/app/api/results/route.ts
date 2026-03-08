// src/app/api/results/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Check if the Super Admin has published the results
    const sysRes = await sql`SELECT election_status as status, "resultsPublished" FROM "SystemSettings" LIMIT 1`;
    const settings = sysRes[0];

    // 🛡️ SECURITY BLOCK: Do not leak votes if results are hidden
    if (!settings?.resultsPublished) {
      return NextResponse.json({ 
        success: true, 
        published: false, 
        status: settings?.status || 'SCHEDULED' 
      });
    }

    // 2. Fetch the live tally for public consumption
    const candidatesRes = await sql`
      SELECT c.id, c.name, c.symbol, c.color, COUNT(v.id) as votes
      FROM "Candidate" c
      LEFT JOIN "Vote" v ON c.id = v."candidateId"
      WHERE c.status != 'DISQUALIFIED'
      GROUP BY c.id, c.name, c.symbol, c.color
      ORDER BY votes DESC
    `;

    const totalVotesRes = await sql`SELECT COUNT(*) as count FROM "Vote"`;
    const totalVotes = parseInt(totalVotesRes[0].count);

    return NextResponse.json({
      success: true,
      published: true,
      status: settings.status,
      totalVotes,
      results: candidatesRes.map(c => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        color: c.color || '#888888',
        votes: parseInt(c.votes)
      }))
    });

  } catch (error) {
    console.error("🚨 Results API Error:", error);
    return NextResponse.json({ success: false, message: "Failed to load results." }, { status: 500 });
  }
}