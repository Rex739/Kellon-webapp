"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Search, X, CheckCircle, Globe, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { ALL_SUPPORTED_COUNTRIES } from "@/lib/supported-countries"

interface CountrySelectorModalProps {
  isVisible: boolean
  onClose: () => void
  onSelect: (countryCode: string) => void
  selectedCountry?: string
  countries?: string[] // Optional: restrict to specific country codes
}

export const CountrySelectorModal: React.FC<CountrySelectorModalProps> = ({
  isVisible,
  onClose,
  onSelect,
  selectedCountry,
  countries,
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [searchQuery, setSearchQuery] = useState("")

  // Memoized list filtering logic
  const filteredCountries = useMemo(() => {
    const baseList = countries
      ? ALL_SUPPORTED_COUNTRIES.filter((c) => countries.includes(c.code))
      : ALL_SUPPORTED_COUNTRIES

    if (!searchQuery) return baseList
    const q = searchQuery.toLowerCase()
    return baseList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    )
  }, [searchQuery, countries])

  // Flag emoji helper
  const getFlag = (code: string) =>
    code
      .toUpperCase()
      .replace(/./g, (char) =>
        String.fromCodePoint(char.charCodeAt(0) + 127397),
      )

  const content = (
    <div className="px-4 pb-8 md:px-0 md:pb-0 flex flex-col h-[600px] md:h-[500px]">
      {/* Header with Back Button */}
      <div className="flex justify-start mb-6">
        <button
          onClick={onClose}
          className="p-2 bg-white dark:bg-secondary-60/50 rounded-full border border-slate-200 dark:border-none hover:opacity-80 transition-opacity outline-none"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-white" />
        </button>
      </div>

      {/* Centered Text Header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-black dark:text-white">
          Select Country
        </h2>
        <p className="text-sm text-gray-500 dark:text-secondary-90">
          Choose your residence
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search country..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-50 dark:bg-[#121324] border border-slate-200 dark:border-gray-800 rounded-2xl py-3 pl-12 pr-10 text-black dark:text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-70 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-gray-500 hover:text-black dark:hover:text-white" />
          </button>
        )}
      </div>

      {/* Country List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {filteredCountries.length > 0 ? (
          filteredCountries.map((item) => {
            // Strict comparison for selection
            const isSelected =
              selectedCountry?.toUpperCase() === item.code.toUpperCase()
            return (
              <button
                key={item.code}
                onClick={() => {
                  onSelect(item.code)
                  onClose()
                }}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl border transition-all outline-none",
                  isSelected
                    ? "bg-primary-70/10 border-primary-70"
                    : "bg-gray-50 dark:bg-[#121324] border-slate-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-700",
                )}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{getFlag(item.code)}</span>
                  <div className="text-left">
                    <p
                      className={cn(
                        "font-bold text-sm",
                        isSelected
                          ? "text-primary-70"
                          : "text-black dark:text-white",
                      )}
                    >
                      {item.name}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-tight">
                      {item.code}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-primary-70 fill-primary-70/10" />
                )}
              </button>
            )
          })
        ) : (
          <div className="py-20 text-center">
            <Globe className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No countries found</p>
          </div>
        )}
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={isVisible} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-secondary-20 border-none rounded-[32px] outline-none [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Select Country</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={isVisible} onOpenChange={onClose}>
      <DrawerContent className="bg-white dark:bg-secondary-20 border-none rounded-t-[32px] outline-none [&>button]:hidden focus:outline-none">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Select Country</DrawerTitle>
        </DrawerHeader>
        {content}
      </DrawerContent>
    </Drawer>
  )
}
