import { sql } from './db';

// Define everything the proxy might send us
export interface LogParams {
  action: string;
  endpoint?: string;
  userRole?: string;
  details?: any;
  userId?: string | number;
  resource?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAction(params: LogParams) {
  try {
    const { 
      action, 
      endpoint = 'UNKNOWN', 
      userRole = 'GUEST', 
      details = {}, 
      userId, 
      resource, 
      ipAddress, 
      userAgent 
    } = params;

    // Pack all the extra forensic tracking data into the JSONB column
    const richDetails = {
      ...details,
      ...(userId && { userId }),
      ...(resource && { resource }),
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
    };

    // Insert ONLY the columns that actually exist in our Neon database
    await sql`
      INSERT INTO "AuditLog" (
        action, endpoint, "userRole", details
      ) VALUES (
        ${action}, ${endpoint}, ${userRole}, ${JSON.stringify(richDetails)}
      )
    `;
  } catch (error) {
    console.error("Critical Logging Failure:", error);
  }
}