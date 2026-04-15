"use client"

import { FC, ReactNode } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

interface DropdownItemProps {
  icon: ReactNode
  label: string
  subLabel?: string
  href?: string
  onClick?: () => void
  isExternal?: boolean
}

export const DropdownItem: FC<DropdownItemProps> = ({
  icon,
  label,
  subLabel,
  href,
  onClick,
  isExternal,
}) => {
  const content = (
    <div className="flex items-center w-full">
      <div className="mr-3 text-primary-50 dark:text-primary-10">{icon}</div>
      <div className="flex flex-col flex-1">
        <span className="text-sm font-medium text-black dark:text-white">
          {label}
        </span>
        {subLabel && (
          <span className="text-[10px] text-gray-20 dark:text-secondary-90 mt-0.5">
            {subLabel}
          </span>
        )}
      </div>
      <ChevronRight className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
    </div>
  )

  const className =
    "focus:bg-primary-95 dark:focus:bg-secondary-70 focus:text-primary-50 cursor-pointer py-3 px-3 rounded-xl transition-colors group outline-none"

  if (href) {
    return (
      <DropdownMenuItem asChild className={className}>
        {isExternal ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {content}
          </a>
        ) : (
          <Link href={href}>{content}</Link>
        )}
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenuItem onClick={onClick} className={className}>
      {content}
    </DropdownMenuItem>
  )
}
