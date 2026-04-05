import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Grab 'identifier' to perfectly match your frontend code
    const identifier = body.identifier;
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json({ success: false, message: "Missing credentials." }, { status: 400 });
    }

    // 🎓 CHECK DATABASE FOR ALL USERS (Students, Dept Admins, Super Admin)
    const users = await sql`
      SELECT id, username, "enrollmentNumber", password, role, name 
      FROM "User" 
      WHERE "enrollmentNumber" = ${identifier} OR username = ${identifier} 
      LIMIT 1
    `;
    
    if (users.length === 0) {
      return NextResponse.json({ success: false, message: "Identifier not found in registry." }, { status: 404 });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Incorrect password." }, { status: 401 });
    }

    // Generate a secure UUID for the session token
    const token = crypto.randomUUID();

    // Update the user's secure token in the Database so the backend can verify it later
    await sql`
      UPDATE "User" 
      SET "authToken" = ${token}
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ 
      success: true, 
      accessToken: token,
      user: {
        id: user.username || user.enrollmentNumber,
        role: user.role,
        name: user.name
      }
    });

  } catch (error) {
    console.error("🚨 Login API Error:", error);
    return NextResponse.json({ success: false, message: "Server crashed during login." }, { status: 500 });
  }
}