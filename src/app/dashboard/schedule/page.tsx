"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

export default function SchedulePage(){
  const [date, setDate] = useState<Date | undefined>(undefined);
  useEffect(() => {
    // Set on client to avoid hydration mismatch with SSR time differences
    setDate(new Date());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Scheduler</h1>
        <p className="text-muted-foreground">Schedule posts at the optimal time</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-soft-shadow">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          </CardContent>
        </Card>

        <Card className="card-soft-shadow">
          <CardHeader>
            <CardTitle>Upcoming Posts</CardTitle>
            <CardDescription>List of scheduled posts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4"/> Oct 20, 10:30 AM — Twitter/X Thread</div>
            <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4"/> Oct 21, 08:00 PM — LinkedIn Post</div>
            <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4"/> Oct 22, 01:00 PM — Instagram Caption</div>
            <Button className="mt-4">Add Scheduled Post</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="card-soft-shadow">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Best Time Recommendation</CardTitle>
            <CardDescription>Based on your past engagement</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4"/> 6:00 PM – High engagement</div>
        </CardHeader>
      </Card>
    </div>
  )
}