"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, X, TrendingUp, Zap, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProTipBannerProps {
  tipId: string;
  title: string;
  description: string;
  icon?: "lightbulb" | "trending" | "zap" | "target";
  variant?: "default" | "success" | "warning" | "info";
}

const ICONS = {
  lightbulb: Lightbulb,
  trending: TrendingUp,
  zap: Zap,
  target: Target,
};

const VARIANTS = {
  default: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200",
    icon: "text-blue-600",
    text: "text-blue-900 dark:text-blue-100",
  },
  success: {
    bg: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-200",
    icon: "text-green-600",
    text: "text-green-900 dark:text-green-100",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    border: "border-yellow-200",
    icon: "text-yellow-600",
    text: "text-yellow-900 dark:text-yellow-100",
  },
  info: {
    bg: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-200",
    icon: "text-purple-600",
    text: "text-purple-900 dark:text-purple-100",
  },
};

export function ProTipBanner({
  tipId,
  title,
  description,
  icon = "lightbulb",
  variant = "default",
}: ProTipBannerProps) {
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem(`tip-dismissed-${tipId}`);
    }
    return false;
  });
  const Icon = ICONS[icon];
  const colors = VARIANTS[variant];

  const handleDismiss = async () => {
    setIsDismissed(true);
    localStorage.setItem(`tip-dismissed-${tipId}`, "true");

    // Also save to database
    try {
      await fetch("/api/tips/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipId }),
      });
    } catch (error) {
      console.error("Error dismissing tip:", error);
    }
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
      >
        <Card className={`${colors.bg} ${colors.border} border-2 mb-6`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`${colors.icon} mt-0.5`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${colors.text} mb-1`}>{title}</h4>
                <p className={`text-sm ${colors.text} opacity-90`}>{description}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mr-2 -mt-1"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}






