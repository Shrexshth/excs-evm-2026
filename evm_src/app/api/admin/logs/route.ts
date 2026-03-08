import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const logs = await sql`SELECT * FROM "AuditLog" ORDER BY timestamp DESC LIMIT 50`;
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Logs Error:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}