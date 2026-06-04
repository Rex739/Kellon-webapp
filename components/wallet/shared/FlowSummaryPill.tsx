"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ChainIcon from "@/components/wallet/ChainIcon";

export interface FlowSummaryPillProps {
  asset: string | null;
  assetIconUrl?: string | null;
  selectedChain?: { name?: string | null } | null;
  networkName?: string | null;
  amount?: string | number | null;
  amountCurrency?: string | null;
  fiatCurrency?: string | null;
  className?: string;
}

function getAssetIconUrl(asset: string) {
  return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${asset.toLowerCase()}.png`;
}

function getChainIconName(chainName: string) {
  const normalizedName = chainName.toLowerCase();

  if (normalizedName.includes("bnb")) return "bnb";
  return chainName
    .replace(/\s+network$/i, "")
    .replace(/\s+smart\s+chain$/i, "");
}

export default function FlowSummaryPill({
  asset,
  assetIconUrl,
  selectedChain,
  networkName,
  amount,
  amountCurrency,
  fiatCurrency,
  className,
}: FlowSummaryPillProps) {
  if (!asset) return null;

  const assetSymbol = asset.toUpperCase();
  const chainName = networkName || selectedChain?.name || null;
  const displayCurrency = amountCurrency || fiatCurrency || null;
  const amountLabel =
    amount !== null && amount !== undefined && amount !== ""
      ? `${amount}${displayCurrency ? ` ${displayCurrency}` : ""}`
      : null;

  return (
    <div
      className={cn(
        "mx-auto mb-6 flex max-w-sm items-center justify-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 backdrop-blur-sm dark:border-white/10 dark:bg-secondary-50 md:mb-10 md:gap-3 md:px-5 md:py-2.5",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full bg-primary-70/20 blur-sm" />
          <Image
            src={assetIconUrl || getAssetIconUrl(assetSymbol)}
            alt={`${assetSymbol} logo`}
            width={16}
            height={16}
            className="relative rounded-full md:h-5 md:w-5"
          />
        </div>
        <span className="truncate text-[11px] font-bold uppercase text-black dark:text-white md:text-xs">
          {assetSymbol}
        </span>
      </div>

      {chainName ? (
        <>
          <ChevronRight className="h-3 w-3 shrink-0 text-gray-400 md:h-4 md:w-4" />
          <div className="flex min-w-0 items-center gap-1.5">
            <ChainIcon name={getChainIconName(chainName)} size={14} />
            <span className="truncate text-[11px] font-medium text-gray-500 dark:text-gray-300 md:text-xs">
              {chainName}
            </span>
          </div>
        </>
      ) : null}

      {amountLabel ? (
        <>
          <ChevronRight className="h-3 w-3 shrink-0 text-gray-400 md:h-4 md:w-4" />
          <span className="truncate text-[11px] font-bold text-primary-60 md:text-xs">
            {amountLabel}
          </span>
        </>
      ) : null}
    </div>
  );
}
