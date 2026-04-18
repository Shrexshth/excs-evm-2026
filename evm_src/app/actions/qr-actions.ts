'use server'

import QRCode from 'qrcode';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function generateQRForUser(userId: string) {
  try {
    // 1. Verify the student actually exists in the database
    // We don't need to UPDATE anything, just confirm they are registered.
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

    // 2. Generate the QR Image directly using their exact Roll Number
    // (e.g., it will encode "VIT25/SC/00002" directly into the image)
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