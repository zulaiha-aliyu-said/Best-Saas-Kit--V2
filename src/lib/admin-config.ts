// Admin configuration
// Preferred: set ADMIN_EMAILS in environment (.env.local) as a comma-separated list.
// Fallback: use the default list below.
const DEFAULT_ADMIN_EMAILS = [
  'zainulabedeen0002@gmail.com',
  'zain@bestsaaskit.com',
  '42023640+zainulabedeen123@users.noreply.github.com', // Author's GitHub email
];

function parseAdminEmailsFromEnv(): string[] {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export const ADMIN_EMAILS: string[] = (() => {
  const fromEnv = parseAdminEmailsFromEnv();
  if (fromEnv.length > 0) return fromEnv;
  return DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase());
})();

// Check if an email is an admin email (case-insensitive)
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Admin permissions
export const ADMIN_PERMISSIONS = {
  VIEW_USERS: 'view_users',
  DELETE_USERS: 'delete_users',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SYSTEM: 'manage_system',
  MANAGE_DISCOUNTS: 'manage_discounts',
} as const;

export type AdminPermission = typeof ADMIN_PERMISSIONS[keyof typeof ADMIN_PERMISSIONS];

// Get admin permissions for an email (all admins have all permissions for now)
export function getAdminPermissions(email: string | null | undefined): AdminPermission[] {
  if (!isAdminEmail(email)) return [];
  return Object.values(ADMIN_PERMISSIONS);
}

// Check if admin has specific permission
export function hasAdminPermission(
  email: string | null | undefined,
  permission: AdminPermission
): boolean {
  const permissions = getAdminPermissions(email);
  return permissions.includes(permission);
}
