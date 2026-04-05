import { sql } from '@/lib/db';

export async function verifyAdmin(token: string | null) {
  if (!token) return null;

  try {
    const users = await sql`
      SELECT id, role, name, username
      FROM "User"
      WHERE "authToken" = ${token} AND (role = 'ADMIN' OR role = 'SUPER_ADMIN')
      LIMIT 1
    `;

    if (users.length === 0) {
      return null;
    }

    return users[0];
  } catch (error) {
    console.error("Auth verification failed:", error);
    return null;
  }
}
