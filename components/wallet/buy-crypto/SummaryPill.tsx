"use client"

import Image from "next/image"
import { ChevronRight } from "lucide-react"
import ChainIcon from "@/components/wallet/ChainIcon"

interface SummaryPillProps {
  asset: string | null
  selectedChain?: { name: string } | null
  amount?: string
  fiatCurrency?: string
}

export default function SummaryPill({
  asset,
  selectedChain,
  amount,
  fiatCurrency,
}: SummaryPillProps) {
  if (!asset) return null

  return (
    <div className="mb-6 flex items-center justify-center gap-2 rounded-full bg-white border border-black/5  px-4 py-2 backdrop-blur-sm dark:bg-secondary-50 dark:border-white/10  md:mb-10 md:gap-3 md:px-5 md:py-2.5 max-w-sm mx-auto">
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary-70/20 blur-sm" />
          <Image
            src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${asset?.toLowerCase()}.png`}
            alt=""
            width={16}
            height={16}
            className="relative rounded-full md:h-5 md:w-5"
          />
        </div>
        <span className="text-[11px] font-bold uppercase md:text-xs">
          {asset}
        </span>
      </div>
      <ChevronRight className="h-3 w-3 text-gray-400 md:h-4 md:w-4" />
      <div className="flex items-center gap-1.5">
        {selectedChain && <ChainIcon name={selectedChain.name} size={14} />}
        <span className="text-[11px] font-medium text-gray-500 md:text-xs">
          {selectedChain?.name}
        </span>
      </div>
      {amount && (
        <>
          <ChevronRight className="h-3 w-3 text-gray-400 md:h-4 md:w-4" />
          <span className="text-[11px] font-bold text-primary-60 md:text-xs">
            {amount} {fiatCurrency}
          </span>
        </>
      )}
    </div>
  )
}
