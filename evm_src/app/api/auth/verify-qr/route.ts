import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 400 });
    }

    // Query your User table
    const result = await sql`
      SELECT id, "isVerified" 
      FROM "User" 
      WHERE "qrToken" = ${token}
    `;

    const user = result[0];

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid QR Code" }, { status: 401 });
    }

    if (user.hasVoted) {
      return NextResponse.json({ success: false, message: "This student has already voted." }, { status: 403 });
    }

    // FIX: Must await cookies() in Next.js 15 to prevent the 500 Server Error
    const cookieStore = await cookies();
    cookieStore.set('voter_session', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 5, // 5 minute voting window
      path: '/',
    });

    return NextResponse.json({ success: true, userId: user.id });

  } catch (error) {
    console.error("Verification error:", error);
    // Returning the actual error message helps with debugging
    return NextResponse.json({ success: false, message: "Server error during verification." }, { status: 500 });
  }
}