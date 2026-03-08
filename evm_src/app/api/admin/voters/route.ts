// src/app/api/admin/voters/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

// ── GET: Fetch Paginated & Searchable Voter List ────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search")?.toLowerCase() || "";
    const searchPattern = `%${search}%`;
    
    const voters = await sql`
      SELECT id, name, "enrollmentNumber" as "voterId", mobile, email, gender, "isVerified" as "hasVoted", status, "createdAt" as "registeredAt"
      FROM "User" 
      WHERE role = 'VOTER' 
      AND (name ILIKE ${searchPattern} OR "enrollmentNumber" ILIKE ${searchPattern})
      ORDER BY "createdAt" DESC LIMIT 100
    `;
    
    return NextResponse.json({ success: true, voters, meta: { total: voters.length, voted: 0, flagged: 0, page: 1, pages: 1 } });
  } catch (err) { 
    console.error("GET Voters Error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 }); 
  }
}

// ── POST: Manually Add Voter (Super Admin Only) ─────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, dob, gender, mobile, email, aadhar, password, adminToken } = body;

    // 🚨 SECURITY: Only Super Admin can manually register voters
    if (adminToken !== "superadmin") {
      return NextResponse.json({ success: false, message: "Only Super Admins can manually register voters." }, { status: 403 });
    }

    // 🛡️ DATA VALIDATION
    if (!firstName || !lastName || !mobile || !aadhar || !password) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }
    if (mobile.length > 255) {
      return NextResponse.json({ success: false, message: "Mobile number is too long." }, { status: 400 });
    }
    if (aadhar.length > 255) {
      return NextResponse.json({ success: false, message: "Aadhar number is too long." }, { status: 400 });
    }

    // Check for duplicate mobile
    const dupMobile = await sql`SELECT id FROM "User" WHERE mobile = ${mobile} LIMIT 1`;
    if (dupMobile.length > 0) {
      return NextResponse.json({ success: false, message: "Mobile number already registered." }, { status: 409 });
    }

    // Generate VIT Voter ID (e.g. VIT25/SC/001/000001)
    const countRes = await sql`SELECT COUNT(*) FROM "User" WHERE role = 'VOTER'`;
    const seq = String(parseInt(countRes[0].count) + 1).padStart(6, "0");
    const generatedVoterId = `VIT25/SC/001/${seq}`;

    const passwordHash = await bcrypt.hash(password, 10);
    const fullName = `${firstName} ${lastName}`.trim();

    // Insert into DB
    await sql`
      INSERT INTO "User" (
        name, "enrollmentNumber", username, password, email, mobile, dob, gender, aadhar, role, "isVerified", status, "isActive"
      ) VALUES (
        ${fullName}, ${generatedVoterId}, ${generatedVoterId}, ${passwordHash}, ${email || null}, ${mobile}, ${new Date(dob)}, ${gender}, ${aadhar}, 'VOTER', false, 'ACTIVE', true
      )
    `;

    return NextResponse.json({ success: true, voterId: generatedVoterId });
  } catch (err: any) {
    console.error("POST Voter Error:", err);
    const isUnique = err.message?.toLowerCase().includes("unique");
    return NextResponse.json({ success: false, message: isUnique ? "Duplicate entry found (Aadhar/Email might already exist)." : "Internal server error." }, { status: 500 });
  }
}

// ── DELETE: Remove Voter (Super Admin Only) ─────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const voterId = req.nextUrl.searchParams.get("id");
    const adminToken = req.headers.get("x-admin-token");

    if (adminToken !== "superadmin") {
      return NextResponse.json({ success: false, message: "Only Super Admins can remove voters." }, { status: 403 });
    }

    const voterRes = await sql`SELECT "isVerified" FROM "User" WHERE "enrollmentNumber" = ${voterId}`;
    if (voterRes.length > 0 && voterRes[0].isVerified) {
      return NextResponse.json({ success: false, message: "Cannot remove — voter has already voted." }, { status: 409 });
    }

    await sql`DELETE FROM "User" WHERE "enrollmentNumber" = ${voterId}`;
    return NextResponse.json({ success: true, message: "Voter removed." });
  } catch (err) { 
    console.error("DELETE Voter Error:", err);
    return NextResponse.json({ success: false }, { status: 500 }); 
  }
}