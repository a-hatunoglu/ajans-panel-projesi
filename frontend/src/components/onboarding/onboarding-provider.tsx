"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "@/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { getOnboardingSteps, OnboardingStep } from "@/lib/onboarding-steps";
import { OnboardingOverlay } from "@/components/onboarding/onboarding-overlay";

type OnboardingContextType = {
  isOnboarding: boolean;
  startTour: () => void;
};

const OnboardingContext = createContext<OnboardingContextType>({
  isOnboarding: false,
  startTour: () => {},
});

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, updateUser } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);

  // Auto-trigger tour for first-time users
  useEffect(() => {
    if (!user) return;
    if (user.hasCompletedOnboarding) return;
    if (user.forcePasswordChange) return;

    const tourSteps = getOnboardingSteps(
      user.role,
      user.companyRoles ?? [],
    );
    if (tourSteps.length === 0) return;

    // Small delay so dashboard renders fully before tour starts
    const timer = setTimeout(() => {
      setSteps(tourSteps);
      setIsActive(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [user]);

  const markComplete = useCallback(async () => {
    setIsActive(false);
    setSteps([]);

    try {
      await apiClient("/users/me/onboarding-complete", { method: "PUT" });
      updateUser({ hasCompletedOnboarding: true });
    } catch {
      // Silent — the tour won't show again on next refresh because the flag is set
      // If the API call fails, worst case the tour appears once more
    }
  }, [updateUser]);

  const handleComplete = useCallback(() => {
    markComplete();
  }, [markComplete]);

  const handleSkip = useCallback(() => {
    markComplete();
  }, [markComplete]);

  const startTour = useCallback(() => {
    if (!user) return;
    const tourSteps = getOnboardingSteps(
      user.role,
      user.companyRoles ?? [],
    );
    if (tourSteps.length === 0) return;
    setSteps(tourSteps);
    setIsActive(true);
  }, [user]);

  return (
    <OnboardingContext.Provider value={{ isOnboarding: isActive, startTour }}>
      {children}
      {isActive && steps.length > 0 && (
        <OnboardingOverlay
          steps={steps}
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      )}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);
