"use client";

import Image from "next/image";
import ChainIcon from "@/components/wallet/ChainIcon";
import { cn } from "@/lib/utils";

interface AssetNetworkIconProps {
  symbol: string;
  network?: string | null;
  size?: "sm" | "md";
  className?: string;
}

const iconSizes = {
  sm: {
    asset: "h-10 w-10 sm:h-11 sm:w-11",
    network: "h-4 w-4 sm:h-5 sm:w-5",
    networkSize: 18,
    imageSize: "40px",
  },
  md: {
    asset: "h-12 w-12",
    network: "h-6 w-6",
    networkSize: 24,
    imageSize: "48px",
  },
};

export default function AssetNetworkIcon({
  symbol,
  network,
  size = "sm",
  className,
}: AssetNetworkIconProps) {
  const sizes = iconSizes[size];

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-full border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-secondary-50",
          sizes.asset,
        )}
      >
        <Image
          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase()}.png`}
          alt={symbol}
          fill
          sizes={sizes.imageSize}
          className="object-contain"
        />
      </div>

      {network ? (
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full border-2 border-gray-95 bg-secondary-50 shadow-sm dark:border-secondary-50 dark:bg-secondary-60",
            sizes.network,
          )}
        >
          <ChainIcon name={network} size={sizes.networkSize} />
        </div>
      ) : null}
    </div>
  );
}
