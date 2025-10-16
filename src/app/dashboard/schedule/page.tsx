"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";

export default function SchedulePage(){
  const [date, setDate] = useState<Date | undefined>(undefined);
  useEffect(() => {
    setDate(new Date());
  }, []);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Calendar and Scheduler Section */}
      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        {/* Main Calendar */}
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">December 2024</CardTitle>
                <CardDescription className="text-xs">Click on any date to schedule posts</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-3">
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-lg" />
          </CardContent>
        </Card>

        {/* Quick Scheduler and Stats */}
        <div className="space-y-4">
          {/* Quick Content Scheduler */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Quick Content Scheduler</CardTitle>
                  <CardDescription className="text-xs">Drag & drop or paste content to schedule instantly</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-3 bg-secondary/10 hover:bg-secondary/20 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">Drop your content here</p>
                  <p className="text-xs text-muted-foreground">Or paste text, upload images, or add links</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="repurpose-gradient text-xs h-7">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Content
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Add URL
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <CardTitle className="text-sm font-semibold">Bulk Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-0 pb-3">
              {[
                { icon: '📋', title: 'Duplicate Posts', desc: 'Copy to multiple dates', color: 'bg-blue-100 text-blue-700' },
                { icon: '📅', title: 'Weekly Series', desc: 'Schedule recurring posts', color: 'bg-green-100 text-green-700' },
                { icon: '🤖', title: 'Auto-Schedule', desc: 'AI optimal timing', color: 'bg-purple-100 text-purple-700' },
              ].map((action) => (
                <div key={action.title} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${action.color} flex items-center justify-center text-sm`}>
                      {action.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-xs">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* This Week Stats */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <CardTitle className="text-sm font-semibold">This Week</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Posts</span>
                <span className="text-sm font-bold">12</span>
              </div>
              {[
                { platform: 'Twitter', count: 5, color: 'bg-blue-500' },
                { platform: 'LinkedIn', count: 4, color: 'bg-blue-700' },
                { platform: 'Instagram', count: 3, color: 'bg-pink-500' },
              ].map((stat) => (
                <div key={stat.platform} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">{stat.platform}</span>
                  </div>
                  <span className="text-xs font-semibold">{stat.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Connected Social Accounts */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Connected Social Accounts</CardTitle>
                <CardDescription className="text-xs">Manage your social media connections</CardDescription>
              </div>
            </div>
            <Button size="sm" className="repurpose-gradient text-xs h-7">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Connect New Account
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Twitter', handle: '@uxaidigital', connected: true, color: 'from-blue-500 to-blue-600', icon: '🐦' },
              { name: 'LinkedIn', handle: 'Sarah Johnson', connected: true, color: 'from-blue-600 to-blue-700', icon: '💼' },
              { name: 'Instagram', handle: '@uxai.creates', connected: true, color: 'from-pink-500 to-purple-500', icon: '📸' },
              { name: 'Email', handle: 'Not connected', connected: false, color: 'from-gray-400 to-gray-500', icon: '✉️' },
            ].map((account) => (
              <div
                key={account.name}
                className={`rounded-lg p-3 ${
                  account.connected
                    ? `bg-gradient-to-br ${account.color} text-white`
                    : 'bg-secondary/20 border-2 border-dashed border-border'
                } transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{account.icon}</span>
                    <span className="font-semibold text-sm">{account.name}</span>
                  </div>
                  {account.connected && (
                    <Badge className="bg-white/20 text-white border-0 text-xs">✓ Connected</Badge>
                  )}
                </div>
                <p className={`text-xs ${
                  account.connected ? 'text-white/80' : 'text-muted-foreground'
                }`}>
                  {account.handle}
                </p>
                {!account.connected && (
                  <Button size="sm" variant="outline" className="mt-2 text-xs h-6 w-full">
                    + Connect
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Optimal Timing Suggestions */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-yellow-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">AI Optimal Timing Suggestions</CardTitle>
                <CardDescription className="text-xs">Best times to post based on your audience engagement</CardDescription>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <div className="grid gap-3 md:grid-cols-2">
            {/* Today's Optimal Times */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <h3 className="text-sm font-semibold">Today's Optimal Times</h3>
              </div>
              {[
                { time: '9:00 AM', label: 'Peak engagement time', optimal: '94% optimal', platforms: ['🐦', '💼'], color: 'bg-green-50 border-green-200' },
                { time: '1:30 PM', label: 'Lunch break engagement', optimal: '87% optimal', platforms: ['📸', '🐦'], color: 'bg-blue-50 border-blue-200' },
                { time: '6:00 PM', label: 'Evening activity spike', optimal: '79% optimal', platforms: ['📸', '📧'], color: 'bg-purple-50 border-purple-200' },
              ].map((slot, idx) => (
                <div key={idx} className={`p-2.5 rounded-lg border ${slot.color}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{slot.time}</span>
                    <span className="text-xs font-semibold text-green-600">{slot.optimal}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1.5">{slot.label}</p>
                  <div className="flex items-center gap-1">
                    {slot.platforms.map((platform, i) => (
                      <span key={i} className="text-xs">{platform}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly Engagement Pattern */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-sm font-semibold">Weekly Engagement Pattern</h3>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/5 border border-border">
                <div className="space-y-2">
                  {[
                    { day: 'Monday', engagement: 85, color: 'bg-blue-500' },
                    { day: 'Tuesday', engagement: 92, color: 'bg-green-500' },
                    { day: 'Wednesday', engagement: 78, color: 'bg-yellow-500' },
                    { day: 'Thursday', engagement: 88, color: 'bg-purple-500' },
                    { day: 'Friday', engagement: 95, color: 'bg-pink-500' },
                    { day: 'Saturday', engagement: 65, color: 'bg-orange-500' },
                    { day: 'Sunday', engagement: 58, color: 'bg-red-500' },
                  ].map((day) => (
                    <div key={day.day} className="flex items-center gap-2">
                      <span className="text-xs font-medium w-16">{day.day}</span>
                      <div className="flex-1 h-6 bg-secondary/30 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${day.color} flex items-center justify-end pr-2 transition-all`}
                          style={{ width: `${day.engagement}%` }}
                        >
                          <span className="text-xs font-semibold text-white">{day.engagement}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Scheduling Activity */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Recent Scheduling Activity</CardTitle>
                <CardDescription className="text-xs">Latest changes to your posting schedule</CardDescription>
              </div>
            </div>
            <Button variant="link" className="text-primary text-xs p-0 h-auto">View All</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0 pb-3">
          {[
            { icon: '✅', title: 'Post successfully scheduled', desc: '"AI Content Revolution" scheduled for Twitter - Dec 15, 9:00 AM', time: '2 min ago', color: 'bg-green-50 border-green-200' },
            { icon: '✏️', title: 'Post updated', desc: 'LinkedIn post time changed to 1:30 PM for better engagement', time: '15 min ago', color: 'bg-blue-50 border-blue-200' },
            { icon: '🎯', title: 'AI optimization applied', desc: '3 posts automatically rescheduled for optimal timing', time: '1 hour ago', color: 'bg-purple-50 border-purple-200' },
            { icon: '⚠️', title: 'Scheduling conflict resolved', desc: 'Instagram post moved to avoid overlapping with Twitter', time: '2 hours ago', color: 'bg-yellow-50 border-yellow-200' },
          ].map((activity, idx) => (
            <div key={idx} className={`flex items-start justify-between p-2.5 rounded-lg border ${activity.color}`}>
              <div className="flex items-start gap-2.5">
                <span className="text-lg">{activity.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.desc}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
