// src/app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 🛡️ Note: In production, verify the adminToken from headers here

    // 1. Get Election Status
    const sysRes = await sql`SELECT election_status FROM "SystemSettings" LIMIT 1`;
    const status = sysRes[0]?.election_status || 'SCHEDULED';

    // 2. Crunch Voter Stats
    const totalVotersRes = await sql`SELECT COUNT(*) as count FROM "User" WHERE role = 'VOTER'`;
    const votedVotersRes = await sql`SELECT COUNT(*) as count FROM "User" WHERE role = 'VOTER' AND "isVerified" = true`;
    const flaggedVotersRes = await sql`SELECT COUNT(*) as count FROM "User" WHERE role = 'VOTER' AND status = 'FLAGGED'`;
    
    // We assume 1 vote per voter for total votes cast
    const totalVotesRes = await sql`SELECT COUNT(*) as count FROM "Vote"`;

    const totalVoters = parseInt(totalVotersRes[0].count);
    const votedVoters = parseInt(votedVotersRes[0].count);
    const flaggedVoters = parseInt(flaggedVotersRes[0].count);
    const totalVotes = parseInt(totalVotesRes[0].count);
    
    const pendingVoters = totalVoters - votedVoters;
    const turnoutPct = totalVoters > 0 ? Math.round((votedVoters / totalVoters) * 100) : 0;

    // 3. Tally the Candidates (Left Join to get all candidates, even those with 0 votes)
    const candidatesRes = await sql`
      SELECT c.id, c.name, c.symbol, c.color, COUNT(v.id) as votes
      FROM "Candidate" c
      LEFT JOIN "Vote" v ON c.id = v."candidateId"
      WHERE c.status != 'DISQUALIFIED'
      GROUP BY c.id, c.name, c.symbol, c.color
      ORDER BY votes DESC
    `;

    // 4. Construct the precise JSON payload your frontend expects
    const dashboardData = {
      election: {
        id: "VIT2025-SC", 
        name: "Student Council Election 2025", 
        status: status,
        constituency: "Vidyalankar Institute of Technology", 
        pollingHours: "09:00 AM - 05:00 PM", 
        resultsPublished: status === "COMPLETED"
      },
      stats: {
        totalVotes, 
        votedVoters, 
        totalVoters,
        pendingVoters, 
        flaggedVoters, 
        todayAlerts: flaggedVoters,
        turnoutPct, 
        totalRegistered: totalVoters,
        total: 1, // Booth Stats
        active: 1, 
        offline: 0
      },
      topCandidates: candidatesRes.map(c => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        color: c.color || "#888888",
        party: null, // Resolving party abbreviations can be added if needed
        votes: parseInt(c.votes)
      })),
      recentActivity: [] // Skipped to prevent infinite logging loop and database bloating
    };

    return NextResponse.json({ success: true, dashboard: dashboardData });

  } catch (error) {
    console.error("🚨 Dashboard Data Fetch Error:", error);
    return NextResponse.json({ success: false, message: "Failed to load dashboard data." }, { status: 500 });
  }
}