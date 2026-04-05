// src/app/api/admin/election/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { logAction } from "@/lib/logger";
import { verifyAdmin } from "@/lib/auth";

// ── GET: Fetch Current System Settings ──────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const adminToken = req.headers.get("x-admin-token");
    const auth = await verifyAdmin(adminToken);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized access." }, { status: 403 });
    }

    const settingsRes = await sql`
      SELECT id, election_status as status, "resultsPublished", name, constituency, "pollingHours" 
      FROM "SystemSettings" 
      LIMIT 1
    `;

    if (settingsRes.length === 0) {
      return NextResponse.json({ success: false, message: "System configuration not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, election: settingsRes[0] });
  } catch (error) {
    console.error("🚨 GET System Settings Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}

// ── PATCH: Update Status or Results Visibility (Super Admin Only) ───────────
export async function PATCH(req: NextRequest) {
  try {
    const adminToken = req.headers.get("x-admin-token");
    
    // 🛡️ Strict Admin Check for God Mode Actions
    const auth = await verifyAdmin(adminToken);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Only Admins can alter election states." }, { status: 403 });
    }

    const body = await req.json();
    const { status, resultsPublished } = body;

    if (status) {
      // Handle Polling State Changes
      if (!["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"].includes(status)) {
        return NextResponse.json({ success: false, message: "Invalid status." }, { status: 400 });
      }

      await sql`UPDATE "SystemSettings" SET election_status = ${status}`;
      await logAction({ 
        action: `SYSTEM_STATUS_CHANGED_TO_${status}`, 
        endpoint: '/api/admin/election', 
        userRole: adminToken, 
        details: { newStatus: status } 
      });

      return NextResponse.json({ success: true, message: `System status updated to ${status}` });
    }

    if (resultsPublished !== undefined) {
      // Handle Results Visibility Changes
      await sql`UPDATE "SystemSettings" SET "resultsPublished" = ${resultsPublished}`;
      await logAction({ 
        action: `RESULTS_VISIBILITY_${resultsPublished ? 'PUBLIC' : 'HIDDEN'}`, 
        endpoint: '/api/admin/election', 
        userRole: adminToken, 
        details: { published: resultsPublished } 
      });

      return NextResponse.json({ success: true, message: "Results visibility updated." });
    }

    return NextResponse.json({ success: false, message: "No valid update parameters provided." }, { status: 400 });

  } catch (error) {
    console.error("🚨 PATCH System Settings Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}