import { FC } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface AssetCardProps {
  name: string
  symbol: string
  amount: string
  value: string
  subtitle?: string
  hideBalances?: boolean
  className?: string
}

const AssetCard: FC<AssetCardProps> = ({
  name,
  symbol,
  amount,
  value,
  subtitle,
  hideBalances,
  className,
}) => {
  const iconUrl = `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase()}.png`

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 md:p-6 transition-all cursor-pointer group rounded-xl md:rounded-lg",
        "bg-white border border-black/5 hover:bg-gray-50",
        "dark:bg-secondary-50 dark:border-white/10 dark:hover:bg-secondary-60/50 ",
        className,
      )}
    >
      <div className="flex items-center gap-4 md:gap-5">
        {/* Real Crypto Icon Container */}
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-gray-50 dark:bg-secondary-40 overflow-hidden relative border border-black/5 dark:border-white/5">
          <Image
            src={iconUrl}
            alt={symbol}
            width={48}
            height={48}
            className="p-2 md:p-2.5 object-contain"
          />
        </div>

        <div>
          <p className=" text-base md:text-lg text-black dark:text-white transition-colors ">
            {name}
          </p>
          <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400  tracking-mid">
            {subtitle || `${symbol} • Multi-chain`}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-lg md:text-xl  tracking-tight text-black dark:text-white">
          {hideBalances ? "••••" : amount}
        </p>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">
          {hideBalances ? "••••••" : value}
        </p>
      </div>
    </div>
  )
}

export default AssetCard
