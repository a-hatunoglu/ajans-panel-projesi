"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import type { OnboardingStep } from "@/lib/onboarding-steps";
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";

interface OnboardingOverlayProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip: () => void;
}

type Rect = { top: number; left: number; width: number; height: number };

function getTooltipPosition(
  targetRect: Rect,
  position: OnboardingStep["position"],
  tooltipWidth: number,
  tooltipHeight: number,
) {
  const gap = 12;
  let top = 0;
  let left = 0;

  switch (position) {
    case "right":
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.left + targetRect.width + gap;
      break;
    case "left":
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.left - tooltipWidth - gap;
      break;
    case "bottom":
      top = targetRect.top + targetRect.height + gap;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      break;
    case "top":
      top = targetRect.top - tooltipHeight - gap;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      break;
  }

  // Viewport clamping
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (left < 12) left = 12;
  if (left + tooltipWidth > vw - 12) left = vw - tooltipWidth - 12;
  if (top < 12) top = 12;
  if (top + tooltipHeight > vh - 12) top = vh - tooltipHeight - 12;

  return { top, left };
}

export function OnboardingOverlay({
  steps,
  onComplete,
  onSkip,
}: OnboardingOverlayProps) {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const step = steps[currentStep];

  const measureTarget = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.targetSelector);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const padding = 4;
    setTargetRect({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });
  }, [step]);

  // Measure target on step change
  useEffect(() => {
    // Small delay for DOM to settle
    const timer = setTimeout(() => {
      measureTarget();
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep, measureTarget]);

  // Position tooltip after target is measured
  useEffect(() => {
    if (!targetRect || !tooltipRef.current || !step) return;
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const pos = getTooltipPosition(
      targetRect,
      step.position,
      tooltipRect.width,
      tooltipRect.height,
    );
    setTooltipPos(pos);
  }, [targetRect, step]);

  // Recalculate on resize
  useEffect(() => {
    const handleResize = () => measureTarget();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [measureTarget]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsVisible(false);
      setTimeout(() => setCurrentStep((s) => s + 1), 150);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsVisible(false);
      setTimeout(() => setCurrentStep((s) => s - 1), 150);
    }
  };

  if (!step || !targetRect) return null;

  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  return (
    <div className="fixed inset-0 z-[9999]" aria-modal="true" role="dialog">
      {/* Overlay — uses CSS clip-path for spotlight cutout */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        style={{
          background: "rgba(0, 0, 0, 0.72)",
          clipPath: `polygon(
            0% 0%, 0% 100%, 
            ${targetRect.left}px 100%, 
            ${targetRect.left}px ${targetRect.top}px, 
            ${targetRect.left + targetRect.width}px ${targetRect.top}px, 
            ${targetRect.left + targetRect.width}px ${targetRect.top + targetRect.height}px, 
            ${targetRect.left}px ${targetRect.top + targetRect.height}px, 
            ${targetRect.left}px 100%, 
            100% 100%, 100% 0%
          )`,
        }}
        onClick={onSkip}
      />

      {/* Spotlight ring */}
      <div
        className={cn(
          "absolute rounded-lg border border-blue-500/40 pointer-events-none transition-all duration-300",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        style={{
          top: targetRect.top,
          left: targetRect.left,
          width: targetRect.width,
          height: targetRect.height,
          boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.15)",
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={cn(
          "absolute w-80 rounded-xl border border-white/10 bg-zinc-900 p-5 shadow-2xl transition-all duration-300",
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2",
        )}
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Close tour"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Welcome badge on first step */}
        {isFirst && (
          <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            {t("onboarding.welcome")}
          </div>
        )}

        {/* Title */}
        <h3 className="text-sm font-semibold text-white mb-1.5 pr-6">
          {t(step.titleKey as Parameters<typeof t>[0])}
        </h3>

        {/* Description */}
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          {t(step.descriptionKey as Parameters<typeof t>[0])}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Step counter */}
          <span className="text-xs text-zinc-600">
            {currentStep + 1} / {steps.length}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft className="h-3 w-3" />
                {t("onboarding.previous")}
              </button>
            )}
            {isFirst && (
              <button
                onClick={onSkip}
                className="rounded-md px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {t("onboarding.skipTour")}
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
            >
              {isLast ? t("onboarding.finish") : t("onboarding.next")}
              {!isLast && <ChevronRight className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
