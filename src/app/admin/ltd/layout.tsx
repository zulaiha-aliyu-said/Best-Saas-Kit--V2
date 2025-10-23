import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { checkAdminAccess } from '@/lib/admin-auth';
import Link from 'next/link';
import { Shield, Ticket, Users, BarChart3, Activity, TrendingUp, Mail, Inbox } from 'lucide-react';

export default async function AdminLTDLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  // Check admin access
  const admin = await checkAdminAccess();
  if (!admin) {
    redirect('/dashboard');
  }

  const navItems = [
    {
      href: '/admin/ltd/overview',
      label: 'Overview',
      icon: BarChart3,
    },
    {
      href: '/admin/ltd/codes',
      label: 'Code Management',
      icon: Ticket,
    },
    {
      href: '/admin/ltd/codes/generate',
      label: 'Generate Codes',
      icon: Shield,
    },
    {
      href: '/admin/ltd/users',
      label: 'LTD Users',
      icon: Users,
    },
    {
      href: '/admin/ltd/campaigns',
      label: 'Email Campaigns',
      icon: Mail,
    },
    {
      href: '/admin/ltd/email-analytics',
      label: 'Email Analytics',
      icon: Inbox,
    },
    {
      href: '/admin/ltd/analytics',
      label: 'Analytics',
      icon: TrendingUp,
    },
    {
      href: '/admin/ltd/logs',
      label: 'Activity Logs',
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                LTD Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage lifetime deal codes and users
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Admin: {admin.email}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

