"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserButtonClient } from "@/components/auth/user-button-client"
import { CreditsDisplay } from "@/components/credits/credits-display"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import { FeedbackButton } from "@/components/feedback/FeedbackButton"
import { cn } from "@/lib/utils"
import {
  Home,
  Settings,
  User,
  Users,
  BarChart3,
  Zap,
  Menu,
  X,
  MessageSquare,
  CreditCard,
  Calendar,
  Sparkles,
  Target,
  DollarSign,
  Wallet,
  Gift
} from "lucide-react"

// Regular user navigation items (RepurposeAI)
const regularUserItems = [
  { name: "Repurpose", href: "/dashboard/repurpose", icon: MessageSquare },
  { name: "Viral Hooks", href: "/dashboard/hooks", icon: Sparkles },
  { name: "Competitors", href: "/dashboard/competitors", icon: Target },
  { name: "Trends", href: "/dashboard/trends", icon: BarChart3 },
  { name: "Schedule", href: "/dashboard/schedule", icon: Calendar },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "History", href: "/dashboard/history", icon: Home },
  { name: "LTD Pricing", href: "/dashboard/ltd-pricing", icon: DollarSign },
  { name: "My LTD", href: "/dashboard/my-ltd", icon: Gift },
  { name: "Credits", href: "/dashboard/credits", icon: Wallet },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

// Admin user navigation items (includes everything)
const adminUserItems = [
  { name: "Repurpose", href: "/dashboard/repurpose", icon: MessageSquare },
  { name: "Viral Hooks", href: "/dashboard/hooks", icon: Sparkles },
  { name: "Competitors", href: "/dashboard/competitors", icon: Target },
  { name: "Trends", href: "/dashboard/trends", icon: BarChart3 },
  { name: "Schedule", href: "/dashboard/schedule", icon: Calendar },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "History", href: "/dashboard/history", icon: Home },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "LTD Pricing", href: "/dashboard/ltd-pricing", icon: DollarSign },
  { name: "My LTD", href: "/dashboard/my-ltd", icon: Gift },
  { name: "Credits", href: "/dashboard/credits", icon: Wallet },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface DashboardClientProps {
  children: React.ReactNode
  session: any
  isAdmin: boolean
}

export function DashboardClient({ children, session, isAdmin }: DashboardClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Determine navigation items from server-provided isAdmin to avoid hydration mismatch
  const sidebarItems = isAdmin ? adminUserItems : regularUserItems

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg repurpose-gradient">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold">RepurposeAI</span>
            </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 rounded-xl bg-secondary/60 p-4 card-soft-shadow">
            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">Quick Stats</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Content Repurposed</span><span className="font-medium">1,247</span></div>
              <div className="flex justify-between"><span>This Month</span><span className="text-green-600 font-medium">+87</span></div>
              <div className="flex justify-between"><span>Credits Left</span><span className="font-medium">342</span></div>
            </div>
          </div>

          {/* Upgrade Card */}
          <div className="mt-4 rounded-xl p-4 repurpose-gradient text-white">
            <p className="text-sm font-medium mb-2">🎁 Lifetime Deal</p>
            <p className="text-xs/5 opacity-90 mb-3">Get lifetime access with 750 credits/month from just $59</p>
            <Link href="/dashboard/ltd-pricing" className="inline-flex items-center rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-white">View Pricing</Link>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <header className="bg-background border-b border-border">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">
                Welcome back, {session.user?.name?.split(' ')[0] || "User"}!
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <CreditsDisplay showRefresh />
              <NotificationBell />
              <ThemeToggle />
              <UserButtonClient user={session.user} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
          <div className="mt-10 text-center text-xs text-muted-foreground">
            💖 Built with love by Zulaiha Aliyu — RepurposeAI © 2025.
          </div>
        </main>
      </div>

      {/* Feedback Button */}
      <FeedbackButton />
    </div>
  )
}
