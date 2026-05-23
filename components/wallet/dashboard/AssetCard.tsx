import { FC } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AssetCardProps {
  name: string;
  symbol: string;
  amount: string;
  value: string;
  subtitle?: string;
  hideBalances?: boolean;
  isValueLoading?: boolean;
  className?: string;
}

const AssetCard: FC<AssetCardProps> = ({
  name,
  symbol,
  amount,
  value,
  subtitle,
  hideBalances,
  isValueLoading,
  className,
}) => {
  const iconUrl = `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase()}.png`;

  return (
    <div
      className={cn(
        "group flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl p-4 transition-all md:rounded-lg md:p-4 lg:p-6",
        "bg-white border border-black/5 hover:bg-gray-50",
        "dark:bg-secondary-50 dark:border-white/10 dark:hover:bg-secondary-60/50 ",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-4 lg:gap-5">
        {/* Real Crypto Icon Container */}
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/5 bg-gray-50 dark:border-white/5 dark:bg-secondary-40 lg:h-14 lg:w-14">
          <Image
            src={iconUrl}
            alt={symbol}
            width={48}
            height={48}
            className="object-contain p-2 md:p-2.5"
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-base text-black transition-colors dark:text-white lg:text-lg">
            {name}
          </p>
          <p className="truncate text-[10px] tracking-normal text-gray-500 dark:text-gray-400 lg:text-xs">
            {subtitle || `${symbol} • Multi-chain`}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-lg tracking-tight text-black dark:text-white lg:text-xl">
          {hideBalances ? "••••" : amount}
        </p>
        {isValueLoading && !hideBalances ? (
          <span className="mt-1 block h-3 w-16 animate-pulse rounded-full bg-gray-100 dark:bg-secondary-60 lg:h-3.5 lg:w-20" />
        ) : (
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 lg:text-sm">
            {hideBalances ? "••••••" : value}
          </p>
        )}
      </div>
    </div>
  );
};

export default AssetCard;
