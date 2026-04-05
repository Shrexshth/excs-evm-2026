import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt'; // Assuming you are hashing passwords!

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: "Missing credentials" }, { status: 400 });
    }

    // 1. Find the User by their roll number
    // Adjust "rollNumber" to match exactly what your DB column is named
    const result = await sql`
      SELECT id, "hasVoted", "passwordHash" 
      FROM "User" 
      WHERE "rollNumber" = ${identifier}
    `;

    const user = result[0];

    if (!user) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 401 });
    }

    // 2. Check if they already voted
    if (user.hasVoted) {
      return NextResponse.json({ success: false, message: "This student has already voted." }, { status: 403 });
    }

    // 3. Verify the password
    // If you are storing plain text passwords (NOT RECOMMENDED), change this to:
    // const isMatch = user.passwordHash === password;
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Incorrect password" }, { status: 401 });
    }

    // 4. Secure Login: Set the HTTP-Only cookie
    const cookieStore = await cookies();
    cookieStore.set('voter_session', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 5, // 5 minute voting window
      path: '/',
    });

    return NextResponse.json({ success: true, userId: user.id });

  } catch (error) {
    console.error("Manual login error:", error);
    return NextResponse.json({ success: false, message: "Server error during login." }, { status: 500 });
  }
}