import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity, 
  DollarSign,
  Zap,
  Calendar,
  Download,
  Eye,
  Heart,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Clock,
  Sparkles
} from "lucide-react";

export default function AnalyticsPage() {
  const metrics = [
    {
      title: "Content Repurposed",
      value: "1,247",
      change: "+87 this month",
      trend: "up",
      icon: Sparkles,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Engagement",
      value: "45.2K",
      change: "+12.5% from last month",
      trend: "up",
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Reach",
      value: "128.7K",
      change: "+8.3% from last month",
      trend: "up",
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Time Saved",
      value: "127h",
      change: "This month",
      trend: "up",
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const platformPerformance = [
    {
      platform: "LinkedIn",
      posts: 45,
      engagement: "2.3K",
      reach: "15.2K",
      growth: "+15.2%",
      trend: "up",
      icon: "in",
      color: "text-blue-700",
      bg: "bg-blue-50"
    },
    {
      platform: "Twitter",
      posts: 67,
      engagement: "1.8K",
      reach: "8.7K",
      growth: "+8.7%",
      trend: "up",
      icon: "𝕏",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      platform: "Instagram",
      posts: 23,
      engagement: "3.1K",
      reach: "12.4K",
      growth: "+22.1%",
      trend: "up",
      icon: "📷",
      color: "text-pink-600",
      bg: "bg-pink-50"
    },
    {
      platform: "Email",
      posts: 12,
      engagement: "45.2%",
      reach: "2.1K",
      growth: "+5.4%",
      trend: "up",
      icon: "✉️",
      color: "text-green-600",
      bg: "bg-green-50"
    }
  ];

  const topPerformingContent = [
    {
      title: "AI Trends 2024: What You Need to Know",
      platform: "LinkedIn",
      engagement: "2.3K",
      reach: "15.2K",
      date: "2 hours ago",
      status: "published",
      icon: "in",
      color: "text-blue-700",
      bg: "bg-blue-50"
    },
    {
      title: "Content Strategy Tips for 2024",
      platform: "Twitter",
      engagement: "1.8K",
      reach: "8.7K",
      date: "1 day ago",
      status: "published",
      icon: "𝕏",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Visual Storytelling Best Practices",
      platform: "Instagram",
      engagement: "3.1K",
      reach: "12.4K",
      date: "2 days ago",
      status: "published",
      icon: "📷",
      color: "text-pink-600",
      bg: "bg-pink-50"
    },
    {
      title: "Weekly Newsletter - Industry Insights",
      platform: "Email",
      engagement: "45.2%",
      reach: "2.1K",
      date: "3 days ago",
      status: "published",
      icon: "✉️",
      color: "text-green-600",
      bg: "bg-green-50"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Content Analytics</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Track your content performance and engagement across all platforms
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 days
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`w-10 h-10 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{metric.value}</div>
              <div className="flex items-center gap-2">
                {metric.trend === "up" && <ArrowUpRight className="h-4 w-4 text-green-600" />}
                {metric.trend === "down" && <ArrowDownRight className="h-4 w-4 text-red-600" />}
                <p className="text-sm text-muted-foreground">
                  <span className={metric.trend === "up" ? "text-green-600" : metric.trend === "down" ? "text-red-600" : "text-muted-foreground"}>
                    {metric.change}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Performance & Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Platform Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Platform Performance</CardTitle>
            <CardDescription>
              Engagement and reach across all platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformPerformance.map((platform) => (
                <div key={platform.platform} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${platform.bg} flex items-center justify-center text-lg font-bold ${platform.color}`}>
                      {platform.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{platform.platform}</h4>
                      <p className="text-xs text-muted-foreground">{platform.posts} posts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{platform.engagement}</p>
                      <p className="text-xs text-muted-foreground">Engagement</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{platform.reach}</p>
                      <p className="text-xs text-muted-foreground">Reach</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">{platform.growth}</p>
                      <p className="text-xs text-muted-foreground">Growth</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engagement Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Engagement Trend</CardTitle>
            <CardDescription>
              Last 7 days performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Engagement Chart</p>
                <p className="text-sm text-muted-foreground">
                  Chart visualization coming soon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Top Performing Content</CardTitle>
              <CardDescription>
                Your best performing posts across all platforms
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformingContent.map((content, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${content.bg} flex items-center justify-center text-lg font-bold ${content.color}`}>
                    {content.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{content.title}</h4>
                    <p className="text-xs text-muted-foreground">{content.platform} • {content.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-semibold">{content.engagement}</p>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{content.reach}</p>
                    <p className="text-xs text-muted-foreground">Reach</p>
                  </div>
                  <Badge variant="default">
                    {content.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
