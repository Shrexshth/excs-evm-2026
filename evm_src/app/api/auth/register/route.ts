import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, mobile, email, aadhar, dob, password } = body;

    // 1. Validation
    if (!firstName || !lastName || !mobile || !aadhar || !password || !email) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // 2. 🕵️ Grab the user's IP Address
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown IP';

    // 3. 🛡️ Prevent Duplicates (Check if Aadhaar or Email already exists)
    const existingUser = await sql`
      SELECT id FROM "User" WHERE aadhar = ${aadhar} OR email = ${email} LIMIT 1
    `;
    
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "A student with this Aadhaar or Email is already registered." }, { status: 409 });
    }

    // 4. Hash Password & Generate ID
    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${firstName} ${lastName}`;
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const voterId = `VIT-26-${randomNum}`;

    // 5. Save everything to the Neon Database
    await sql`
      INSERT INTO "User" (
        username, "enrollmentNumber", password, role, name, "isVerified",
        email, aadhar, mobile, dob, ip_address
      )
      VALUES (
        ${voterId}, ${voterId}, ${hashedPassword}, 'VOTER', ${fullName}, false,
        ${email}, ${aadhar}, ${mobile}, ${dob}, ${ip}
      )
    `;

    return NextResponse.json({ success: true, data: { voter_id: voterId } });

  } catch (error: any) {
    console.error("🚨 Registration API Error:", error);
    // Double-check for database-level unique constraint violations
    if (error.code === '23505') {
      return NextResponse.json({ error: "Duplicate record detected. You are already registered." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
  }
}