"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Tip {
  id: string;
  title: string;
  description: string;
  category: string;
}

const DEFAULT_TIPS: Tip[] = [
  {
    id: "tip-1",
    title: "Use 'Detailed' length for LinkedIn",
    description: "LinkedIn's algorithm favors longer, in-depth content. Use the 'Detailed' length option to boost engagement and reach.",
    category: "content",
  },
  {
    id: "tip-2",
    title: "Generate hooks first",
    description: "Create viral hooks before full content generation. A strong hook can increase your click-through rate by 300%!",
    category: "strategy",
  },
  {
    id: "tip-3",
    title: "Optimize posting times",
    description: "Schedule posts for peak engagement times: 9-11 AM on weekdays for LinkedIn, 1-3 PM for Twitter.",
    category: "scheduling",
  },
  {
    id: "tip-4",
    title: "Repurpose in batches",
    description: "Generate content for all platforms at once to maintain consistent messaging across your social presence.",
    category: "efficiency",
  },
  {
    id: "tip-5",
    title: "Use templates for faster creation",
    description: "Templates can save you 30% in credits and 50% in time. Browse our template library to get started!",
    category: "efficiency",
  },
];

export function TipWidget() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [tips, setTips] = useState<Tip[]>(DEFAULT_TIPS);
  const [isRotating, setIsRotating] = useState(false);

  const currentTip = tips[currentTipIndex];

  const handleNextTip = () => {
    setIsRotating(true);
    setTimeout(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
      setIsRotating(false);
    }, 200);
  };

  // Auto-rotate tips every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleNextTip();
    }, 15000);

    return () => clearInterval(interval);
  }, [currentTipIndex]);

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span>💡 Pro Tip</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextTip}
          >
            <RefreshCw className={`h-4 w-4 ${isRotating ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTip.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h4 className="font-semibold text-sm mb-1">{currentTip.title}</h4>
            <p className="text-xs text-muted-foreground">{currentTip.description}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center gap-1 mt-3">
          {tips.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTipIndex(index)}
              className={`h-1 rounded-full transition-all ${
                index === currentTipIndex
                  ? "w-6 bg-primary"
                  : "w-1 bg-primary/30 hover:bg-primary/50"
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}






