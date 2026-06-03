import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetLogo } from "./AssetLogo";
import type { InvoiceAssetGroup } from "./types";

interface AssetChoiceProps {
  asset: InvoiceAssetGroup;
  selected: boolean;
  onClick: () => void;
}

export function AssetChoice({ asset, selected, onClick }: AssetChoiceProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3 text-left transition-all",
        selected
          ? "border-primary-60 bg-primary-70/5 ring-2 ring-primary-60/20"
          : "border-black/5 bg-gray-95 text-gray-600 hover:text-black dark:border-white/10 dark:bg-secondary-50 dark:text-gray-400 dark:hover:bg-secondary-60/50 dark:hover:text-white",
      )}
    >
      <div className="flex items-center gap-3">
        <AssetLogo src={asset.iconUrl} symbol={asset.symbol} />
        <span className="min-w-0">
          <span
            className={cn(
              "block text-sm font-bold",
              selected && "text-primary-60",
            )}
          >
            {asset.symbol}
          </span>
          <span className="block truncate text-xs opacity-70">
            {asset.name}
          </span>
        </span>
      </div>

      {selected && <CheckCircle2 className="h-5 w-5 text-primary-70" />}
    </button>
  );
}
