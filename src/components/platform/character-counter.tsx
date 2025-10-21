"use client";

import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Platform, PLATFORM_LIMITS, countCharacters, getCharacterCountColor } from "@/lib/platform-optimizer";
import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  content: string;
  platform: Platform;
  className?: string;
}

export function CharacterCounter({ content, platform, className }: CharacterCounterProps) {
  const limits = PLATFORM_LIMITS[platform];
  const charCount = useMemo(() => countCharacters(content), [content]);
  const maxChars = 'maxChars' in limits ? limits.maxChars : limits.optimalBodyChars?.max || 500;
  const percentage = (charCount / maxChars) * 100;
  
  const color = useMemo(() => {
    if (percentage >= 100) return "text-red-600 dark:text-red-400";
    if (percentage >= 90) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  }, [percentage]);

  const progressColor = useMemo(() => {
    if (percentage >= 100) return "bg-red-600";
    if (percentage >= 90) return "bg-yellow-600";
    return "bg-green-600";
  }, [percentage]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Character Count</span>
        <span className={cn("font-mono font-semibold", color)}>
          {charCount} / {maxChars}
        </span>
      </div>
      <Progress 
        value={Math.min(percentage, 100)} 
        className="h-2"
      />
      {percentage > 100 && (
        <p className="text-xs text-red-600 dark:text-red-400">
          ⚠️ Exceeds {platform} character limit by {charCount - maxChars} characters
        </p>
      )}
      {percentage > 90 && percentage <= 100 && (
        <p className="text-xs text-yellow-600 dark:text-yellow-400">
          ⚠️ Near {platform} character limit
        </p>
      )}
    </div>
  );
}


