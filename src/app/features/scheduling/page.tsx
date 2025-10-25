import { FeatureDetailTemplate } from "@/components/features/FeatureDetailTemplate";
import { Calendar, Clock, Zap, BarChart3, Bell, Globe, CheckCircle2, TrendingUp } from "lucide-react";

export const metadata = {
  title: 'Content Scheduling | Features | RepurposeAI',
  description: 'Plan and automate your content distribution across all platforms with intelligent scheduling.',
};

export default function SchedulingPage() {
  return (
    <FeatureDetailTemplate
      badge="Essential"
      badgeColor="bg-indigo-600"
      title="Content Scheduling"
      description="Plan, schedule, and automate your content distribution across multiple platforms. Set optimal posting times, manage content calendars, and ensure consistent presence without manual effort. Schedule directly from the repurpose page or manage all scheduled content in one place."
      heroIcon={Calendar}
      heroGradient="from-indigo-500 to-purple-500"
      ctaPrimary="Start Scheduling"
      ctaPrimaryLink="/dashboard/schedule"

      benefits={[
        {
          icon: Clock,
          title: "Optimal Timing",
          description: "Schedule posts at the best times for maximum engagement on each platform"
        },
        {
          icon: Zap,
          title: "Automated Publishing",
          description: "Set it and forget it - your content publishes automatically"
        },
        {
          icon: Globe,
          title: "Multi-Platform",
          description: "Manage content for Twitter, LinkedIn, Instagram, and Email in one place"
        },
        {
          icon: BarChart3,
          title: "Performance Tracking",
          description: "Track scheduled and published content performance"
        }
      ]}

      howItWorks={[
        {
          step: "1",
          title: "Create Content",
          description: "Generate or write your content using the repurpose tool",
          color: "from-indigo-500 to-purple-500"
        },
        {
          step: "2",
          title: "Schedule Post",
          description: "Click schedule, select platform, date, and optimal time",
          color: "from-purple-500 to-pink-500"
        },
        {
          step: "3",
          title: "Review Calendar",
          description: "View all scheduled posts in your content calendar",
          color: "from-pink-500 to-rose-500"
        },
        {
          step: "4",
          title: "Auto-Publish",
          description: "Content publishes automatically at the scheduled time",
          color: "from-rose-500 to-red-500"
        }
      ]}

      features={[
        "Multi-Platform Scheduling",
        "Calendar View",
        "Optimal Time Suggestions",
        "Date & Time Picker",
        "Schedule from Repurpose Page",
        "Bulk Scheduling",
        "Draft Management",
        "Schedule History",
        "Edit Scheduled Posts",
        "Delete/Reschedule Options",
        "Platform-Specific Settings",
        "Content Preview",
        "Automated Publishing",
        "Status Tracking (Scheduled/Published/Failed)",
        "Email Notifications",
        "Time Zone Support"
      ]}

      useCases={[
        {
          title: "Busy Professionals",
          description: "Schedule content in advance to maintain consistent presence"
        },
        {
          title: "Marketing Teams",
          description: "Coordinate multi-platform campaigns with precise timing"
        },
        {
          title: "Content Creators",
          description: "Plan content calendars weeks or months in advance"
        },
        {
          title: "Global Brands",
          description: "Schedule content for different time zones automatically"
        },
        {
          title: "Agencies",
          description: "Manage scheduling for multiple clients efficiently"
        },
        {
          title: "Solopreneurs",
          description: "Automate social presence while focusing on other tasks"
        }
      ]}

      ctaTitle="Ready to Automate Your Content?"
      ctaDescription="Start scheduling and never miss the perfect posting time again."
    />
  );
}
