"use client"

import { FC, HtmlHTMLAttributes } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { isActive } from "@/lib/is-active-link"

interface CustomUiSlabProps extends HtmlHTMLAttributes<HTMLSpanElement> {
  href: string
}

const Slab: FC<CustomUiSlabProps> = ({ className, href }) => {
  const pathname = usePathname()

  return (
    <span
      className={cn(
        "flex h-1 w-20 bg-primary-50 rounded-b-sm invisible",
        className,
        isActive(href, pathname) && "visible",
      )}
    ></span>
  )
}

export default Slab
