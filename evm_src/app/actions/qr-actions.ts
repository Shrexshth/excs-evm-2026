'use server'

import { randomBytes } from 'crypto';
import QRCode from 'qrcode';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function generateQRForUser(userId: string) {
  try {
    // 1. Generate a secure random token
    const token = randomBytes(16).toString('hex');

    // 2. Update the User table using your EXACT column names
    const result = await sql`
      UPDATE "User" 
      SET "qrToken" = ${token} 
      WHERE "enrollmentNumber" = ${userId}
      RETURNING id
    `;

    // 3. Check if the user was actually found
    if (result.length === 0) {
      return { 
        success: false, 
        error: `Student with ID ${userId} not found in "enrollmentNumber" column.` 
      };
    }

    // 4. Create the QR Image
    const qrImageUrl = await QRCode.toDataURL(token);
    
    return { success: true, qrImageUrl };
  } catch (error: any) {
    console.error("QR Generation Crash:", error);
    return { 
      success: false, 
      error: `Database Error: ${error.message}` 
    };
  }
}