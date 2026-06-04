"use client";

import AssetNetworkIcon from "@/components/wallet/AssetNetworkIcon";
import { getChainLabel } from "@/lib/chains";
import { cn } from "@/lib/utils";

interface AssetNetworkDisplayProps {
  symbol: string;
  assetName?: string | null;
  network?: string | null;
  className?: string;
  iconSize?: "sm" | "md";
  symbolClassName?: string;
  detailClassName?: string;
}

export default function AssetNetworkDisplay({
  symbol,
  assetName,
  network,
  className,
  iconSize = "sm",
  symbolClassName,
  detailClassName,
}: AssetNetworkDisplayProps) {
  const networkLabel = getChainLabel(network);
  const detail = assetName ? `${assetName} • ${networkLabel}` : networkLabel;

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <AssetNetworkIcon symbol={symbol} network={network} size={iconSize} />
      <div className="min-w-0 flex-1 text-left">
        <p
          className={cn(
            "truncate text-sm font-semibold text-black dark:text-white",
            symbolClassName,
          )}
        >
          {symbol}
        </p>
        <p
          className={cn(
            "mt-1 truncate text-xs text-gray-20 dark:text-gray-40",
            detailClassName,
          )}
          title={detail}
        >
          {detail}
        </p>
      </div>
    </div>
  );
}
