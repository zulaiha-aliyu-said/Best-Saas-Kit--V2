import { checkAdminAccess } from "@/lib/admin-auth";
import { AdminClient } from "@/components/admin/admin-client";
import { redirect } from "next/navigation";

export const runtime = 'edge';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user has admin access
  const adminUser = await checkAdminAccess();
  
  // Redirect to dashboard if not admin
  if (!adminUser) {
    redirect('/dashboard');
  }

  return <AdminClient adminUser={adminUser}>{children}</AdminClient>;
}
