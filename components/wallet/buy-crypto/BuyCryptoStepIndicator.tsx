"use client"

import { cn } from "@/lib/utils"
import { Fragment } from "react"
import { Check } from "lucide-react"

interface StepIndicatorProps {
  currentStep: number // 0-indexed
  totalSteps: number
}

export default function StepIndicator({
  currentStep,
  totalSteps,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-sm mx-auto mb-10 px-12">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isCompleted = i < currentStep
        const isActive = i === currentStep

        return (
          <Fragment key={i}>
            {/* Step Circle */}
            <div className="relative flex items-center justify-center">
              {/* Active Outer Glow/Ring (Only visible on Active) */}
              {isActive && (
                <div className="absolute inset-0 -m-1 rounded-full border border-primary-70/30 animate-pulse" />
              )}

              <div
                className={cn(
                  "relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                  isCompleted || isActive
                    ? "border-primary-60 bg-primary-60"
                    : "border-slate-300 dark:border-secondary-60 bg-transparent",
                )}
              >
                {isCompleted ? (
                  // Completed: Matches checkmark in screenshot
                  <Check className="w-3.5 h-3.5 text-white stroke-[4]" />
                ) : isActive ? (
                  // Active: Dot within a ring effect
                  <div className="w-full h-full rounded-full border border-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,1)]" />
                  </div>
                ) : (
                  // Future: Small muted dot
                  <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-secondary-60 rounded-full" />
                )}
              </div>
            </div>

            {/* Connecting Line: Scalable based on totalSteps */}
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
        )
      })}
    </div>
  )
}
