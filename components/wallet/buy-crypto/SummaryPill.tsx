"use client"

import Image from "next/image"
import { ChevronRight } from "lucide-react"
import ChainIcon from "@/components/wallet/ChainIcon"
import type { ChainConfig as Chain } from "@/lib/chains"

interface SummaryPillProps {
  asset: string | null
  chain: Chain | null
  amount?: string
  className?: string
}

export default function SummaryPill({
  asset,
  chain,
  amount,
  className = "",
}: SummaryPillProps) {
  if (!asset) return null

  return (
    <div
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full
        border border-slate-200 dark:border-white/10
        bg-gray-50 dark:bg-secondary-60/30
        flex-wrap ${className}`}
    >
      <div className="flex items-center gap-2">
        <Image
          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${asset.toLowerCase()}.png`}
          alt=""
          width={18}
          height={18}
        />
        <span className="text-xs font-bold">{asset}</span>
      </div>

      {chain && (
        <>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <div className="flex items-center gap-2">
            <ChainIcon name={chain.name} size={16} />
            <span className="text-xs font-bold">{chain.name}</span>
          </div>
        </>
      )}

      {amount && (
        <>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-xs font-bold text-primary-70">{amount}</span>
        </>
      )}
    </div>
  )
}
