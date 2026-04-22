"use client"

import { FC, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface GuardianListItemProps {
  id: string
  label: string // e.g., "Progress Ojemeh"
  status: string // e.g., "ACTIVE" or "PENDING"
  showAcceptButton?: boolean
  onAccept?: () => Promise<void>
}

export const GuardianListItem: FC<GuardianListItemProps> = ({
  label,
  status,
  showAcceptButton,
  onAccept,
}) => {
  const [isAccepting, setIsAccepting] = useState(false)

  // Generate initials for the avatar (e.g., "Progress Ojemeh" -> "PO")
  const initials = label
    ? label
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  const handleAcceptClick = async () => {
    if (!onAccept) return
    setIsAccepting(true)
    try {
      await onAccept()
    } catch {
      toast.error("Failed to accept invitation")
    } finally {
      setIsAccepting(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-transparent border border-gray-80 dark:border-secondary-60 rounded-[24px] transition-all">
      <div className="flex items-center gap-4">
        {/* Avatar Circle */}
        <Avatar className="w-12 h-12 bg-primary-70 border-none">
          <AvatarFallback className="bg-primary-70 text-white font-bold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col text-left">
          <span className="text-sm font-bold text-black dark:text-white leading-tight">
            {label}
          </span>
          <span
            className={cn(
              "text-[10px] font-bold mt-1 tracking-wide",
              status === "ACTIVE" || status === "ACCEPTED"
                ? "text-green-500"
                : "text-orange-500",
            )}
          >
            {status}{" "}
            {status === "ACTIVE" &&
              `(${new Date().toISOString().split("T")[0]})`}
          </span>
        </div>
      </div>

      {showAcceptButton && status === "PENDING" && (
        <Button
          onClick={handleAcceptClick}
          disabled={isAccepting}
          className="bg-primary-20 hover:bg-primary-20/90 text-white text-xs h-9 px-5 rounded-xl font-bold transition-all"
        >
          {isAccepting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Accept"
          )}
        </Button>
      )}
    </div>
  )
}
