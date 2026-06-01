"use client";

import { ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFlag } from "@/components/wallet/buy-crypto/steps/AssetSelectionStep";

interface CountrySelectorButtonProps {
  country: string | null;
  isDetecting?: boolean;
  onClick: () => void;
  className?: string;
}

export default function CountrySelectorButton({
  country,
  isDetecting = false,
  onClick,
  className,
}: CountrySelectorButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDetecting}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-1.5 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-secondary-50 dark:hover:bg-secondary-60/50",
        isDetecting && "animate-pulse opacity-70",
        className,
      )}
    >
      <span className="text-lg leading-none">
        {country ? getFlag(country) : <Globe className="h-4 w-4" />}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-tight">
        {isDetecting ? "Locating..." : country || "NG"}
      </span>
      <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
    </button>
  );
}
