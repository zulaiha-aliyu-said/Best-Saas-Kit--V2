"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  Target,
  Clock
} from "lucide-react";
import Link from "next/link";

interface OptimizationSuggestion {
  type: "success" | "warning" | "info" | "tip";
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  actionUrl?: string;
}

const ICON_MAP: Record<string, any> = {
  AlertCircle,
  CheckCircle2,
  Target,
  TrendingUp,
  Clock,
  Sparkles,
};

export function CreditOptimizationWidget() {
  const [credits, setCredits] = useState(0);
  const [tier, setTier] = useState(1);
  const [usageData, setUsageData] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [creditsRes, tierRes, suggestionsRes] = await Promise.all([
        fetch('/api/credits'),
        fetch('/api/user/tier'),
        fetch('/api/credits/suggestions')
      ]);

      if (creditsRes.ok) {
        const data = await creditsRes.json();
        setCredits(data.credits || 0);
      }

      if (tierRes.ok) {
        const data = await tierRes.json();
        setTier(data.tier || 1);
      }

      if (suggestionsRes.ok) {
        const data = await suggestionsRes.json();
        setSuggestions(data.suggestions || []);
        setUsageData(data.usageData);
      }
    } catch (error) {
      console.error('Error fetching optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Credit Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Sparkles className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const monthlyCredits = tier === 1 ? 100 : tier === 2 ? 300 : tier === 3 ? 750 : 2000;
  const usagePercent = (credits / monthlyCredits) * 100;
  const remainingPercent = 100 - usagePercent;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>💡 Credit Optimization</span>
          <Badge variant={remainingPercent > 50 ? "default" : "destructive"}>
            {credits} left
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">This month's usage</span>
            <span className="font-medium">{Math.round(100 - remainingPercent)}%</span>
          </div>
          <Progress value={100 - remainingPercent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {monthlyCredits - credits} of {monthlyCredits} credits used
          </p>
        </div>

        {/* Suggestions */}
        <div className="space-y-3">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => {
              const Icon = ICON_MAP[suggestion.icon] || Sparkles;
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    suggestion.type === "success"
                      ? "bg-green-50 border-green-200 dark:bg-green-950/20"
                      : suggestion.type === "warning"
                      ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20"
                      : "bg-blue-50 border-blue-200 dark:bg-blue-950/20"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={`w-4 h-4 mt-0.5 ${
                      suggestion.type === "success"
                        ? "text-green-600"
                        : suggestion.type === "warning"
                        ? "text-yellow-600"
                        : "text-blue-600"
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {suggestion.description}
                      </p>
                      {suggestion.actionText && suggestion.actionUrl && (
                        <Button
                          asChild
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-1 text-xs"
                        >
                          <Link href={suggestion.actionUrl}>
                            {suggestion.actionText} →
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p>You're using credits efficiently! 🎉</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

