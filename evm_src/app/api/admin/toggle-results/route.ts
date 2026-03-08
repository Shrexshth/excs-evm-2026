import { NextResponse } from 'next/server';
import { logAction } from '../../../../lib/logger'; // Using your forensic logger

export async function PATCH(req: Request) {
  try {
    const { published } = await req.json();
    
    // Log the action securely in the database
    await logAction({
      action: published ? 'PUBLISHED_RESULTS' : 'HIDDEN_RESULTS',
      endpoint: '/api/admin/toggle-results',
      details: { status: published }
    });

    return NextResponse.json({ success: true, published });
  } catch (error) {
    return NextResponse.json({ error: "Toggle failed" }, { status: 500 });
  }
}