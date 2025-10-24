"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Calendar,
  Brain,
  Users,
  ArrowRight,
  CheckCircle2,
  Gift
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';
import { useRouter } from "next/navigation";

interface WelcomeModalProps {
  isOpen: boolean;
  onComplete: () => void;
  userTier: number;
  userName?: string;
  isNewUser?: boolean;
}

const TIER_FEATURES = {
  1: [
    { icon: Sparkles, text: "100 credits/month", color: "text-blue-600" },
    { icon: TrendingUp, text: "Content Repurposing", color: "text-green-600" },
    { icon: Zap, text: "15 Premium Templates", color: "text-purple-600" },
  ],
  2: [
    { icon: Sparkles, text: "300 credits/month", color: "text-blue-600" },
    { icon: TrendingUp, text: "Viral Hook Generator", color: "text-green-600" },
    { icon: Calendar, text: "Content Scheduling", color: "text-purple-600" },
    { icon: Zap, text: "40+ Templates", color: "text-orange-600" },
  ],
  3: [
    { icon: Sparkles, text: "750 credits/month", color: "text-blue-600" },
    { icon: Brain, text: "AI Chat Assistant", color: "text-green-600" },
    { icon: TrendingUp, text: "Performance Predictions", color: "text-purple-600" },
    { icon: Calendar, text: "Advanced Scheduling", color: "text-orange-600" },
  ],
  4: [
    { icon: Sparkles, text: "2,000 credits/month", color: "text-blue-600" },
    { icon: Users, text: "Team Collaboration", color: "text-green-600" },
    { icon: Brain, text: "Unlimited AI Chat", color: "text-purple-600" },
    { icon: Zap, text: "API Access", color: "text-orange-600" },
  ],
};

const STEPS = [
  {
    title: "Welcome to RepurposeAI!",
    description: "Let's get you started with your lifetime deal",
  },
  {
    title: "Your Features",
    description: "Here's what you've unlocked",
  },
  {
    title: "Quick Setup",
    description: "Let's create your first content",
  },
];

export function WelcomeModal({ isOpen, onComplete, userTier, userName, isNewUser = true }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = async () => {
    try {
      await fetch('/api/onboarding/skip', { method: 'POST' });
      onComplete();
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      onComplete();
    }
  };

  const handleComplete = async () => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    try {
      await fetch('/api/onboarding/complete', { method: 'POST' });
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }

    onComplete();
  };

  const handleGetStarted = () => {
    handleComplete();
    router.push('/dashboard/repurpose');
  };

  const tierFeatures = TIER_FEATURES[userTier as keyof typeof TIER_FEATURES] || TIER_FEATURES[1];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                {currentStep === 0 && <Gift className="w-6 h-6 text-primary" />}
                {STEPS[currentStep].title}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {STEPS[currentStep].description}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip Tour
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            Step {currentStep + 1} of {STEPS.length}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {currentStep === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 py-4"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {isNewUser ? `Welcome${userName ? `, ${userName}` : ''}! 🎉` : 'Welcome Back!'}
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    You're now part of the RepurposeAI family with{' '}
                    <Badge className="mx-1" variant="secondary">Tier {userTier}</Badge>
                    lifetime access!
                  </p>
                </div>
              </div>

              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="font-semibold text-primary">🎁 What You Get</p>
                    <p className="text-2xl font-bold">
                      {userTier === 1 && '100 credits/month'}
                      {userTier === 2 && '300 credits/month'}
                      {userTier === 3 && '750 credits/month'}
                      {userTier === 4 && '2,000 credits/month'}
                    </p>
                    <p className="text-sm text-muted-foreground">Refreshes monthly, forever! 🔄</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Features */}
          {currentStep === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 py-4"
            >
              <div className="grid grid-cols-2 gap-4">
                {tierFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-muted ${feature.color}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{feature.text}</p>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {userTier < 4 && (
                <Card className="border-dashed border-2 border-primary/30">
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      💡 Want more features? You can upgrade anytime to unlock{' '}
                      <span className="font-semibold text-primary">Tier {userTier + 1}</span> perks!
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Step 3: Quick Start */}
          {currentStep === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 py-4"
            >
              <div className="space-y-4">
                <Card className="border-2 hover:border-primary/50 transition-all cursor-pointer" onClick={handleGetStarted}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Repurpose Content</p>
                          <p className="text-sm text-muted-foreground">
                            Turn 1 piece into 10+ platform-specific posts
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                {userTier >= 2 && (
                  <Card className="border-2 hover:border-primary/50 transition-all cursor-pointer" onClick={() => {
                    handleComplete();
                    router.push('/dashboard/viral-hooks');
                  }}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Generate Viral Hooks</p>
                            <p className="text-sm text-muted-foreground">
                              Create engaging hooks with 50+ proven patterns
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {userTier >= 3 && (
                  <Card className="border-2 hover:border-primary/50 transition-all cursor-pointer" onClick={() => {
                    handleComplete();
                    router.push('/dashboard/chat');
                  }}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Brain className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold">AI Chat Assistant</p>
                            <p className="text-sm text-muted-foreground">
                              Brainstorm ideas and get content suggestions
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Click any card to get started, or click "Complete Setup" below</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button onClick={handleNext} className="gap-2">
            {currentStep === STEPS.length - 1 ? (
              <>
                Complete Setup
                <CheckCircle2 className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}






