"use client"

import { useTheme } from "next-themes"
import { FC, HtmlHTMLAttributes, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Moon, Sun } from "lucide-react"

// IMP START - Props definition for ModeToggle
interface ModeToggleProps extends HtmlHTMLAttributes<HTMLButtonElement> {
  textClassName?: string // Optional additional class for text styling
}
// IMP END - Props definition for ModeToggle

const ModeToggle: FC<ModeToggleProps> = ({ className }) => {
  // IMP START - Local state to track hydration
  const [mounted, setMounted] = useState(false)
  // IMP END - Local state to track hydration

  // IMP START - Theme control from next-themes
  const { resolvedTheme, setTheme } = useTheme()
  // IMP END - Theme control from next-themes

  // IMP START - Ensure component only renders after hydration to avoid theme mismatch
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  // IMP END - Ensure component only renders after hydration to avoid theme mismatch

  return (
    // IMP START - Theme toggle button
    <button
      className={cn(className, "cursor-pointer")}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${
        resolvedTheme === "dark" ? "light" : "dark"
      } mode`}
      title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      {/* IMP START - Hidden text for accessibility */}
      <div className="sr-only">
        Switch to {resolvedTheme === "dark" ? "light" : "dark"} mode
      </div>
      {/* IMP END - Hidden text for accessibility */}

      {/* IMP START - Icon container */}
      <div
        className={cn(
          "flex items-center space-x-2 lg:space-x-4 lg:justify-center"
        )}
      >
        {resolvedTheme === "dark" ? (
          // IMP START - Sun icon for light mode
          <div
            className="w-6 h-6 md:h-10 md:w-10 lg:w-10 lg:h-10 rounded-full  bg-secondary-60 flex justify-center items-center relative border border-input"
            aria-hidden="true"
          >
            <Sun className="w-2.5 h-2.5 md:w-4 md:h-4 lg:w-4 lg:h-4 text-white absolute" />
          </div>
        ) : (
          // IMP END - Sun icon for light mode
          // IMP START - Moon icon for dark mode
          <div
            className="w-6 h-6 md:h-10 md:w-10 lg:w-10 lg:h-10 rounded-full  bg-white flex justify-center items-center relative border dark:border-input"
            aria-hidden="true"
          >
            <Moon className="w-2.5 h-2.5 md:w-4 md:h-4 lg:w-4 lg:h-4 text-black absolute" />
          </div>
          // IMP END - Moon icon for dark mode
        )}
        {/* IMP START - Screen-reader only label */}
        <span className="sr-only" aria-hidden="true">
          Toggle dark mode
        </span>
        {/* IMP END - Screen-reader only label */}
      </div>
      {/* IMP END - Icon container */}
    </button>
    // IMP END - Theme toggle button
  )
}

export default ModeToggle
