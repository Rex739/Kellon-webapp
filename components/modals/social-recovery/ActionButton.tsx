import { FC } from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActionButtonProps {
  icon: LucideIcon
  title: string
  description: string
  variant?: "pink" | "orange" | "dark"
  onClick?: () => void
}

export const ActionButton: FC<ActionButtonProps> = ({
  icon: Icon,
  title,
  description,
  variant = "dark",
  onClick,
}) => {
  const variants = {
    pink: "bg-primary-20 hover:bg-primary-20/90 text-white border-none",
    orange: "bg-orange-10 hover:bg-orange-10/90 text-white border-none",
    dark: "bg-secondary-60 dark:bg-secondary-60 border border-gray-80 dark:border-secondary-40 text-white",
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-[20px] transition-all text-left cursor-pointer",
        variants[variant],
      )}
    >
      <Icon className="w-6 h-6 shrink-0" />
      <div className="flex flex-col">
        <span className="text-sm font-bold mb-1">{title}</span>
        <span className="text-[11px] opacity-80 leading-tight">
          {description}
        </span>
      </div>
    </button>
  )
}
