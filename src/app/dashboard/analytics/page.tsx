import { Button } from "@/components/ui/button";
import { UserPredictionAnalytics } from "@/components/ai/user-prediction-analytics";
import { UserRepurposedContentAnalytics } from "@/components/repurpose/user-repurposed-content-analytics";
import { UserScheduleAnalytics } from "@/components/schedule/user-schedule-analytics";
import { UserOptimizationAnalytics } from "@/components/platform/user-optimization-analytics";
import { 
  Calendar,
  Download
} from "lucide-react";

export default function AnalyticsPage() {
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

      {/* Repurposed Content Analytics Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Repurposed Content Analytics</h2>
          <p className="text-muted-foreground">
            Track your content repurposing activity and performance
          </p>
        </div>
        <UserRepurposedContentAnalytics />
      </div>

      {/* Schedule Analytics Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Schedule Analytics</h2>
          <p className="text-muted-foreground">
            Track your content scheduling performance and patterns
          </p>
        </div>
        <UserScheduleAnalytics />
      </div>

      {/* AI Prediction Analytics Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Prediction Analytics</h2>
          <p className="text-muted-foreground">
            Track your AI-powered content performance predictions
          </p>
        </div>
        <UserPredictionAnalytics />
      </div>

      {/* Platform Optimization Analytics Section */}
      <UserOptimizationAnalytics />
    </div>
  );
}
