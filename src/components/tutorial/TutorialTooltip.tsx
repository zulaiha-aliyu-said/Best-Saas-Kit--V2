"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft, Target } from "lucide-react";

interface TutorialTooltipProps {
  isVisible: boolean;
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  targetElement?: string; // CSS selector
  position?: "top" | "bottom" | "left" | "right";
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

export function TutorialTooltip({
  isVisible,
  step,
  totalSteps,
  title,
  description,
  position = "bottom",
  onNext,
  onPrevious,
  onSkip,
  onComplete,
}: TutorialTooltipProps) {
  if (!isVisible) return null;

  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={onSkip}
          />

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-[70]"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Card className="w-[400px] shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{title}</h3>
                      <p className="text-xs text-muted-foreground">
                        Step {step + 1} of {totalSteps}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -mr-2 -mt-2"
                    onClick={onSkip}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mb-6">{description}</p>

                {/* Progress dots */}
                <div className="flex items-center gap-1 mb-6">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 rounded-full transition-all ${
                        index === step
                          ? "w-8 bg-primary"
                          : index < step
                          ? "w-1 bg-primary/50"
                          : "w-1 bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSkip}
                    className="text-xs"
                  >
                    Skip tour
                  </Button>

                  <div className="flex gap-2">
                    {!isFirst && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onPrevious}
                        className="gap-1"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        Back
                      </Button>
                    )}

                    <Button
                      size="sm"
                      onClick={isLast ? onComplete : onNext}
                      className="gap-1"
                    >
                      {isLast ? "Finish" : "Next"}
                      {!isLast && <ArrowRight className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}






