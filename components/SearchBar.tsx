"use client"

import { FC } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  className?: string
}

const SearchBar: FC<SearchBarProps> = ({ className }) => {
  return (
    <div className={cn("relative w-full max-w-sm group", className)}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#a31d7e] transition-colors">
        <Search size={18} />
      </div>
      <Input
        type="search"
        placeholder="Search assets, txns, or users..."
        className="pl-10 pr-12 bg-secondary-70/50 border-input h-10 w-full focus-visible:ring-1 focus-visible:ring-[#a31d7e] rounded-md transition-all"
      />
      {/* Shortcut hint - very "SaaS" feel */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded border border-input bg-background text-[10px] font-medium text-muted-foreground pointer-events-none">
        <span className="text-[12px]">⌘</span>K
      </div>
    </div>
  )
}

export default SearchBar
