import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const status = await sql`SELECT election_status FROM "SystemSettings" LIMIT 1`;
    return NextResponse.json({ success: true, status: status[0]?.election_status || 'PAUSED' });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action, adminToken } = await req.json();

    // 🛡️ STRICT ROLE CHECK: Only the Super Admin can flip this switch
    if (adminToken !== 'superadmin') {
      return NextResponse.json({ error: "UNAUTHORIZED: Only Super Admin can change election phases." }, { status: 403 });
    }

    let newStatus = 'PAUSED';
    if (action === 'START') newStatus = 'ACTIVE';
    if (action === 'KILL') newStatus = 'COMPLETED'; // Remote Kill Switch

    await sql`UPDATE "SystemSettings" SET election_status = ${newStatus}`;

    return NextResponse.json({ success: true, newStatus });
  } catch (error) {
    return NextResponse.json({ error: "System override failed." }, { status: 500 });
  }
}