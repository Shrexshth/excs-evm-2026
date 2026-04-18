// src/app/actions/auth-actions.ts
'use server'

import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import QRCode from 'qrcode';

// Initialize Neon Database
const sql = neon(process.env.DATABASE_URL!);

// ─── 1. QR SCANNER LOGIN LOGIC ──────────────────────────────────────────
export async function processQRScan(scannedText: string) {
  try {
    // Clean the scanned text just in case the camera picked up spaces
    const cleanId = scannedText.trim().toUpperCase();

    // Search the database for this exact Roll Number
    const userCheck = await sql`
      SELECT id, name, "isVerified", status 
      FROM "User" 
      WHERE "enrollmentNumber" = ${cleanId}
      LIMIT 1
    `;

    // If no student matches that Roll Number
    if (userCheck.length === 0) {
      return { success: false, message: "❌ Invalid QR Code: Student not found in registry." };
    }

    const voter = userCheck[0];

    // Security Check: Did they already vote? 
    // (Assuming isVerified = true means they voted)
    if (voter.isVerified) {
      return { success: false, message: `❌ Access Denied: ${voter.name} has already voted.` };
    }

    // Success! Create the secure session cookie using their database ID
    const cookieStore = await cookies();
    cookieStore.set('voter_session', String(voter.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 5 // 5 minutes to cast their vote
    });

    // 🚨 FIX APPLIED HERE: Sending the userName back to the frontend!
    return { 
      success: true, 
      message: `✅ Verified: Welcome, ${voter.name}!`,
      userName: voter.name 
    };

  } catch (error: any) {
    console.error("QR Scan Error:", error);
    return { success: false, message: `Server Error: ${error.message}` };
  }
}

// ─── 2. SERVER-SIDE QR GENERATOR (Optional/Backup) ──────────────────────
export async function generateQRForUser(userId: string) {
  try {
    // Verify the student actually exists in the database
    const userCheck = await sql`
      SELECT id, "enrollmentNumber" 
      FROM "User" 
      WHERE "enrollmentNumber" = ${userId}
    `;

    if (userCheck.length === 0) {
      return { 
        success: false, 
        error: `Student with Roll Number ${userId} not found in registry.` 
      };
    }

    // Generate the QR Image directly using their exact Roll Number
    const qrImageUrl = await QRCode.toDataURL(userId);
    
    return { success: true, qrImageUrl };

  } catch (error: any) {
    console.error("QR Generation Crash:", error);
    return { 
      success: false, 
      error: `Server Error: ${error.message}` 
    };
  }
}