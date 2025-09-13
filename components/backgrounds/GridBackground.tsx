"use client"

import { FC } from "react"
import { cn } from "@/lib/utils"

interface GridBackgroundProps {
  className?: string
}

const GridBackground: FC<GridBackgroundProps> = ({ className }) => {
  return (
    <div className={cn("fixed inset-0 -z-10 overflow-hidden", className)}>
      {/* Main Grid */}
      <div className="absolute inset-0 opacity-15 dark:opacity-10">
        <svg
          width="100%"
          height="100%"
          className="text-primary-80 dark:text-secondary-80"
        >
          <defs>
            <pattern
              id="smallGrid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
            <pattern
              id="grid"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <rect width="100" height="100" fill="url(#smallGrid)" />
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating Dots */}
      <div className="absolute top-1/4 left-1/4">
        <div className="w-3 h-3 rounded-full bg-primary-50 dark:bg-secondary-80 opacity-30 dark:opacity-20 animate-bounce-slow" />
      </div>

      <div className="absolute bottom-1/3 right-1/3">
        <div className="w-2 h-2 rounded-full bg-primary-50 dark:bg-secondary-80 opacity-25 dark:opacity-15 animate-bounce-medium" />
      </div>

      <div className="absolute top-2/3 left-2/3">
        <div className="w-4 h-4 rounded-full bg-primary-50 dark:bg-secondary-80 opacity-35 dark:opacity-25 animate-bounce-fast" />
      </div>

      {/* Corner Accents */}
      <div className="absolute top-10 left-10 opacity-20 dark:opacity-10">
        <svg
          width="60"
          height="60"
          viewBox="0 0 100 100"
          className="text-primary-80 dark:text-secondary-80"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>

      <div className="absolute bottom-10 right-10 opacity-20 dark:opacity-10">
        <svg
          width="60"
          height="60"
          viewBox="0 0 100 100"
          className="text-primary-80 dark:text-secondary-80"
        >
          <rect
            x="10"
            y="10"
            width="80"
            height="80"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>
    </div>
  )
}

export default GridBackground
