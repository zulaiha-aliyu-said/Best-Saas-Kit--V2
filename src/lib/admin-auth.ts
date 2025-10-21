import { auth } from "./auth";
import { isAdminEmail, hasAdminPermission, type AdminPermission } from "./admin-config";
import { redirect } from "next/navigation";

// Check if current user is admin
export async function isCurrentUserAdmin(): Promise<boolean> {
  const session = await auth();
  return isAdminEmail(session?.user?.email);
}

// Check if an email is admin (synchronous version for direct email checks)
export function isAdmin(email: string | null | undefined): boolean {
  return isAdminEmail(email);
}

// Get current admin user or null
export async function getCurrentAdminUser() {
  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) {
    return null;
  }
  return session.user;
}

// Require admin access - redirect if not admin
export async function requireAdminAccess() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }
  
  if (!isAdminEmail(session.user.email)) {
    redirect("/dashboard?error=unauthorized");
  }
  
  return session.user;
}

// Require specific admin permission
export async function requireAdminPermission(permission: AdminPermission) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }
  
  if (!hasAdminPermission(session.user.email, permission)) {
    redirect("/dashboard?error=insufficient_permissions");
  }
  
  return session.user;
}

// Check admin access without redirect (for API routes)
export async function checkAdminAccess(): Promise<{ isAdmin: boolean; user: any | null }> {
  const session = await auth();
  
  if (!session?.user) {
    return { isAdmin: false, user: null };
  }
  
  const isAdmin = isAdminEmail(session.user.email);
  return { isAdmin, user: session.user };
}
