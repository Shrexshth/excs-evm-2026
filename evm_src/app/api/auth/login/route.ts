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

    // 👑 2. CHECK .ENV CREDENTIALS FOR SUPER ADMIN
    if (identifier === 'superadmin') {
      // It checks your .env file first, with a fallback just in case
      if (password === process.env.SUPERADMIN_PASS || password === 'superadmin69') {
        return NextResponse.json({ 
          success: true, 
          accessToken: "vip-admin-token", 
          user: {
            id: "superadmin",
            role: "SUPER_ADMIN",
            name: "Commander"
          }
        });
      } else {
        return NextResponse.json({ success: false, message: "Invalid Super Admin password." }, { status: 401 });
      }
    }

    // 🎓 3. CHECK DATABASE FOR STUDENTS
    const users = await sql`
      SELECT id, username, "enrollmentNumber", password, role, name 
      FROM "User" 
      WHERE "enrollmentNumber" = ${identifier} OR username = ${identifier} 
      LIMIT 1
    `;
    
    if (users.length === 0) {
      return NextResponse.json({ success: false, message: "Student ID not found in registry." }, { status: 404 });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Incorrect password." }, { status: 401 });
    }

    // Success for Student
    return NextResponse.json({ 
      success: true, 
      accessToken: "student-auth-token",
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