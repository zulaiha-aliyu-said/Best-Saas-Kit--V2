import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserStats } from "@/lib/database";
import {
  Users,
  Activity,
  CreditCard,
  DollarSign,
  TrendingUp,
  Zap,
  BarChart3,
  Settings,
  UserPlus,
  Calendar
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  // Get real user statistics from database
  let userStats;
  try {
    userStats = await getUserStats();
  } catch (error) {
    console.error("Error fetching user stats:", error);
    userStats = {
      totalUsers: 0,
      activeToday: 0,
      newThisWeek: 0,
      newThisMonth: 0
    };
  }

  const stats = [
    {
      title: "Total Users",
      value: userStats.totalUsers.toLocaleString(),
      change: `+${userStats.newThisMonth} this month`,
      icon: Users,
    },
    {
      title: "Active Today",
      value: userStats.activeToday.toLocaleString(),
      change: "Users logged in today",
      icon: Activity,
    },
    {
      title: "New This Week",
      value: userStats.newThisWeek.toLocaleString(),
      change: "New registrations",
      icon: UserPlus,
    },
    {
      title: "New This Month",
      value: userStats.newThisMonth.toLocaleString(),
      change: "Monthly growth",
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your AI SAAS application today.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">{stat.change}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>
              Get started with your AI-powered application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              Create New Project
            </Button>
            <Button className="w-full" variant="outline">
              View Documentation
            </Button>
            <Button className="w-full" variant="outline">
              API Integration
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">API key generated</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Profile updated</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">New user registered</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>
              Your current plan and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Plan</span>
                <span className="text-sm font-medium">Pro</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">API Calls</span>
                <span className="text-sm font-medium">8,234 / 10,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Storage</span>
                <span className="text-sm font-medium">2.1 GB / 5 GB</span>
              </div>
              <Button className="w-full mt-4" size="sm">
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
