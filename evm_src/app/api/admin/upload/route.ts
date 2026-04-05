import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { verifyAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('image') as unknown as File;
    const adminToken = req.headers.get("x-admin-token");

    // Enforce basic admin verification
    const auth = await verifyAdmin(adminToken);
    if (!auth) {
        return NextResponse.json({ success: false, message: "Unauthorized access." }, { status: 403 });
    }

    if (!file) {
      return NextResponse.json({ success: false, message: "No image file provided." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save strictly to public directory so it can be served
    const ext = path.extname(file.name);
    const uniqueName = `cand_${Date.now()}_${Math.random().toString(36).substring(7)}${ext || '.png'}`;
    const targetPath = path.join(process.cwd(), 'public', 'uploads', uniqueName);

    await writeFile(targetPath, buffer);

    // Return the URL
    return NextResponse.json({ success: true, url: `/uploads/${uniqueName}` });

  } catch (error) {
    console.error("🔥 Error saving file:", error);
    return NextResponse.json({ success: false, message: "Failed to upload image." }, { status: 500 });
  }
}
