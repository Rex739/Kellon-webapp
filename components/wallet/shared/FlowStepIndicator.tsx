"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlowStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function FlowStepIndicator({
  currentStep,
  totalSteps,
}: FlowStepIndicatorProps) {
  return (
    <div className="mx-auto mb-10 flex w-full max-w-sm items-center justify-between px-12">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;

        return (
          <Fragment key={i}>
            <div className="relative flex items-center justify-center">
              {isActive && (
                <div className="absolute inset-0 -m-1 animate-pulse rounded-full border border-primary-70/30" />
              )}

              <div
                className={cn(
                  "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-500",
                  isCompleted || isActive
                    ? "border-primary-60 bg-primary-60"
                    : "border-slate-300 bg-transparent dark:border-secondary-60",
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5 text-white stroke-[4]" />
                ) : isActive ? (
                  <div className="flex h-full w-full items-center justify-center rounded-full border border-white/20">
                    <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,1)]" />
                  </div>
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-secondary-60" />
                )}
              </div>
            </div>

            {i < totalSteps - 1 && (
              <div
                className={cn(
                  "h-[1px] flex-1 transition-all duration-700 ease-in-out",
                  i < currentStep
                    ? "bg-primary-60"
                    : "bg-slate-200 dark:bg-secondary-60/40",
                )}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
