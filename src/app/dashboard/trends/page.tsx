"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trending Topics & Hashtags 🔥</h1>
          <p className="text-muted-foreground">Discover what's hot and boost your content reach</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm">Auto-insert trending hashtags</span>
          <Switch defaultChecked />
        </div>
      </div>

      {/* Filters */}
      <Card className="card-soft-shadow">
        <CardHeader>
          <CardTitle>Filter by Platform</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {['All Platforms','Twitter','LinkedIn','Instagram','Email'].map((x,i)=> (
            <Button key={i} variant={i===0?"default":"outline"}>{x}</Button>
          ))}
        </CardContent>
      </Card>

      {/* Performance chart placeholder */}
      <Card className="card-soft-shadow">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Trending Performance Over Time</CardTitle>
            <CardDescription>See how topics perform across platforms</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">24 Hours</Button>
            <Button variant="ghost" size="sm">7 Days</Button>
            <Button variant="ghost" size="sm">30 Days</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 rounded-xl bg-secondary/50 border border-border"/>
        </CardContent>
      </Card>

      {/* Hot Topics */}
      <div className="grid gap-6 md:grid-cols-2">
        {[{title:'AI Content Revolution',views:'2.3M',growth:'+347%'},{title:'Remote Work Productivity',views:'1.8M',growth:'+289%'}].map((t,idx)=> (
          <Card key={idx} className="card-soft-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Badge className="mr-2">#{idx+1} {idx===0? 'Trending':'Rising'}</Badge>
                  <span className="text-xs text-green-600">{t.growth}</span>
                </div>
                <Button size="sm">Use Topic</Button>
              </div>
              <CardTitle className="mt-2">{t.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>• {t.views} views</span>
                <span>• #AI #ContentMarketing</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hashtags by Platform */}
      <Card className="card-soft-shadow">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Trending Hashtags by Platform</CardTitle>
          <Button size="sm">Copy All</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 text-sm text-muted-foreground">Twitter Trending</div>
            <div className="flex flex-wrap gap-2">
              {['#AIRevolution','#TechTrends','#Innovation','#ContentCreation','#RemoteWork','#Productivity'].map((h)=> (
                <Badge key={h} variant="secondary">{h}</Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm text-muted-foreground">LinkedIn Professional</div>
            <div className="flex flex-wrap gap-2">
              {['#Leadership','#CareerDevelopment','#Networking','#ThoughtLeadership','#DigitalMarketing'].map((h)=> (
                <Badge key={h} variant="secondary">{h}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Analytics placeholder */}
      <Card className="card-soft-shadow">
        <CardHeader>
          <CardTitle>Trending Engagement Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56 rounded-xl bg-secondary/50 border border-border"/>
        </CardContent>
      </Card>

      {/* Trend Alerts */}
      <Card className="card-soft-shadow">
        <CardHeader>
          <CardTitle>Trend Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between"><span>New trending topic detected: AI Ethics in Business</span><span className="text-muted-foreground">2 minutes ago</span></div>
          <div className="flex items-center justify-between"><span>Hashtag surge: #SustainableTech +456%</span><span className="text-muted-foreground">15 minutes ago</span></div>
          <div className="flex items-center justify-between"><span>Platform trend update: LinkedIn refreshed</span><span className="text-muted-foreground">1 hour ago</span></div>
        </CardContent>
      </Card>
    </div>
  )
}