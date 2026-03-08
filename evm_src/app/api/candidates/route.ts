import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch all candidates injected during your master setup
    const candidates = await sql`SELECT id, name, party, symbol FROM "Candidate" ORDER BY name ASC`;
    return NextResponse.json({ success: true, candidates });
  } catch (error) {
    console.error("🚨 Error fetching candidates:", error);
    return NextResponse.json({ success: false, error: "Failed to load candidates." }, { status: 500 });
  }
}