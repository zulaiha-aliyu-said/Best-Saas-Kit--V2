import { useState, useEffect } from "react";

export interface TutorialStep {
  title: string;
  description: string;
  targetElement?: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function useTutorial(tourId: string, steps: TutorialStep[]) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has completed this tour
    const completed = localStorage.getItem(`tutorial-${tourId}-completed`);
    const skipped = localStorage.getItem(`tutorial-${tourId}-skipped`);
    
    if (!completed && !skipped) {
      // Show tutorial after a short delay
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tourId]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = async () => {
    localStorage.setItem(`tutorial-${tourId}-skipped`, "true");
    setIsActive(false);

    // Save to database
    try {
      await fetch("/api/tutorial/skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourId }),
      });
    } catch (error) {
      console.error("Error skipping tutorial:", error);
    }
  };

  const handleComplete = async () => {
    localStorage.setItem(`tutorial-${tourId}-completed`, "true");
    setIsActive(false);

    // Save to database
    try {
      await fetch("/api/tutorial/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourId }),
      });
    } catch (error) {
      console.error("Error completing tutorial:", error);
    }
  };

  const startTutorial = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  return {
    isActive,
    currentStep,
    totalSteps: steps.length,
    currentStepData: steps[currentStep],
    handleNext,
    handlePrevious,
    handleSkip,
    handleComplete,
    startTutorial,
  };
}






