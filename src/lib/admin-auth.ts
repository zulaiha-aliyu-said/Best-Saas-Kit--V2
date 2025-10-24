/**
 * Admin Access Control
 * Email whitelist-based admin authentication
 */

import { auth } from './auth';
import { pool } from './database';

// Admin email whitelist
const ADMIN_EMAILS = [
  'saasmamu@gmail.com',
  'zulaihaaliyu440@gmail.com',
  // Add more admin emails here
];

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

/**
 * Check if the current user has admin access
 * @returns Admin user object or null
 */
export async function checkAdminAccess(): Promise<AdminUser | null> {
  try {
    const session = await auth();
    
    if (!session?.user?.id || !session?.user?.email) {
      return null;
    }

    // Check if email is in whitelist
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return null;
    }

    // Verify user exists and has admin role in database
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, name, role FROM users WHERE id = $1 AND role = $2',
        [session.user.id, 'admin']
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0] as AdminUser;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error checking admin access:', error);
    return null;
  }
}

/**
 * Require admin access or return error response
 * Use in API routes
 */
export async function requireAdminAccess() {
  const admin = await checkAdminAccess();
  
  if (!admin) {
    return {
      success: false as const,
      error: 'Unauthorized: Admin access required',
      status: 403,
    };
  }

  return {
    success: true as const,
    admin,
    user: admin, // Alias for backwards compatibility
  };
}

/**
 * Check if an email has admin access
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email);
}

