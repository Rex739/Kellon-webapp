import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface QuickActionProps {
  icon: ReactNode
  label: string
  onClick?: () => void
}

export default function QuickAction({
  icon,
  label,
  onClick,
}: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full flex-col items-center outline-none md:rounded-lg md:border md:border-input text-black dark:text-white md:bg-white md:p-4 md:text-left md:shadow-sm md:transition md:hover:-translate-y-0.5 md:hover:border-gray-60 md:dark:bg-secondary-20 md:dark:hover:border-white/20"
    >
      <div
        className={cn(
          // Changed w-20 to w-full to allow dynamic expansion
          "flex h-16 w-full flex-col items-center justify-center space-y-1.5 rounded-xl border border-black/5 bg-white px-1 transition-all duration-300 transform",
          "group-hover:shadow-lg group-active:scale-95 md:h-11 md:w-11 md:rounded-lg md:group-hover:shadow-none",
          "dark:border-white/10 dark:bg-secondary-50  dark:group-hover:border-primary-70/40 dark:group-hover:text-primary-90",
        )}
      >
        <span className="shrink-0 ">{icon}</span>
        <span className="text-[7px] xs:text-[9px]  tracking-tight transition-colors group-hover:text-cryptoNight  dark:group-hover:text-white md:hidden">
          {label}
        </span>
      </div>

      {/* Label for Desktop (Hidden on mobile to keep the mobile UI compact) */}
      <span className="mt-2 hidden text-xs font-medium md:block">{label}</span>
    </button>
  )
}