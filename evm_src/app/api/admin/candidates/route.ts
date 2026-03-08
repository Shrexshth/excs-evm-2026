// src/app/api/admin/candidates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db"; 

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, dob, gender, education, bio, symbol, color, partyAbbr, adminToken } = body;

    // Security Check
    if (!adminToken || adminToken.startsWith('VIT-')) {
      return NextResponse.json({ success: false, message: "Unauthorized access." }, { status: 403 });
    }

    // 🚨 FIXED: Insert directly, saving party as pure text. No secondary table lookup required.
    const candidateRes = await sql`
      INSERT INTO "Candidate" (
        "electionId", name, dob, gender, education, bio, 
        symbol, color, party, status
      ) VALUES (
        'VIT2025-SC', ${name}, ${new Date(dob)}, ${gender}, ${education || null}, ${bio || null}, 
        ${symbol}, ${color || "#888888"}, ${partyAbbr || 'Independent'}, 'ACTIVE'
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, message: "Candidate created.", candidate: candidateRes[0] }, { status: 201 });

  } catch (err: any) {
    console.error("🚨 POST Candidate Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error. " + err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status, adminToken } = await req.json();
    if (!adminToken || adminToken.startsWith('VIT-')) return NextResponse.json({ success: false }, { status: 403 });
    const res = await sql`UPDATE "Candidate" SET status = ${status} WHERE id = ${Number(id)} RETURNING *`;
    return NextResponse.json({ success: true, candidate: res[0] });
  } catch (err) { 
    return NextResponse.json({ success: false }, { status: 500 }); 
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = Number(req.nextUrl.searchParams.get("id"));
    const adminToken = req.headers.get("x-admin-token"); 
    
    // Only Super Admin can delete
    if (adminToken !== "superadmin") return NextResponse.json({ success: false, message: "Super Admin only." }, { status: 403 });

    const voteCount = await sql`SELECT COUNT(*) as count FROM "Vote" WHERE "candidateId" = ${id}`;
    if (parseInt(voteCount[0].count) > 0) return NextResponse.json({ success: false, message: "Cannot delete. Votes exist." }, { status: 409 });

    await sql`DELETE FROM "Candidate" WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) { 
    return NextResponse.json({ success: false }, { status: 500 }); 
  }
}