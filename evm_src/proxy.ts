import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function proxy(req: NextRequest) {
  // 🚨 The database-destroying fetch loop has been completely REMOVED.
  // The middleware now safely lets all traffic pass without spamming Neon.
  
  return NextResponse.next();
}