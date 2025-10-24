'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, TrendingUp, Calendar, RefreshCw, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CreditData {
  credits: number;
  monthly_limit: number;
  rollover: number;
  reset_date: string;
  percentage_used: number;
}

export function CreditUsageWidget() {
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreditData();
  }, []);

  const fetchCreditData = async () => {
    try {
      const response = await fetch('/api/ltd/credits');
      if (response.ok) {
        const data = await response.json();
        setCreditData(data);
      }
    } catch (error) {
      console.error('Error fetching credit data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!creditData) {
    return null;
  }

  const creditsUsed = creditData.monthly_limit - creditData.credits;
  const resetDate = new Date(creditData.reset_date);
  const daysUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Credits
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={fetchCreditData}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh credits</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Your monthly credit usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Credits */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-bold">{creditData.credits.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">
              / {creditData.monthly_limit.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={(creditData.credits / creditData.monthly_limit) * 100} 
            className="h-3"
          />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{creditsUsed.toLocaleString()} used</span>
            <span>{creditData.percentage_used}% of monthly limit</span>
          </div>
        </div>

        {/* Rollover Credits */}
        {creditData.rollover > 0 && (
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-semibold">Rollover Credits</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Unused credits that will be added to your next month&apos;s allocation.
                      Rollover credits are valid for 12 months.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-2xl font-bold text-primary">
              +{creditData.rollover.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Will be added at reset
            </div>
          </div>
        )}

        {/* Reset Date */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Next Reset</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">
              {resetDate.toLocaleDateString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''} remaining
            </div>
          </div>
        </div>

        {/* Low Credits Warning */}
        {creditData.percentage_used >= 80 && (
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                  Low Credits
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  You&apos;ve used {creditData.percentage_used}% of your monthly credits.
                  Consider stacking codes for more credits!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}







