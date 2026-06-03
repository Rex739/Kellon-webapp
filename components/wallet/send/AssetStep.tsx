"use client";

import { Wallet } from "lucide-react";
import AssetNetworkIcon from "@/components/wallet/AssetNetworkIcon";
import { Button } from "@/components/ui/button";
import { getChainLabel } from "@/lib/chains";
import { cn } from "@/lib/utils";
import type { SendableAsset } from "./send-types";
import { formatAssetAmount } from "./send-utils";

interface AssetStepProps {
  sendableAssets: SendableAsset[];
  selectedAsset: SendableAsset | null;
  onSelectAsset: (assetKey: string) => void;
  onOpenAddFunds: () => void;
}

export default function AssetStep({
  sendableAssets,
  selectedAsset,
  onSelectAsset,
  onOpenAddFunds,
}: AssetStepProps) {
  return (
    <div className="flex h-full min-w-0 flex-col gap-3">
      {sendableAssets.length > 0 ? (
        sendableAssets.map((asset) => {
          const isSelected = asset.key === selectedAsset?.key;
          return (
            <button
              key={asset.key}
              type="button"
              onClick={() => onSelectAsset(asset.key)}
              className={cn(
                "cursor-pointer",
                "flex w-full min-w-0 items-center justify-between gap-3 rounded-2xl border p-4 text-left transition sm:gap-4",
                isSelected
                  ? "border-primary-70 bg-primary-99 dark:border-primary-70/50 dark:bg-primary-70/10"
                  : "border-gray-80 bg-gray-95 hover:border-gray-60 dark:border-white/10 dark:bg-secondary-60/25 dark:hover:border-white/20",
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <AssetNetworkIcon symbol={asset.symbol} network={asset.chain} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-black dark:text-white">
                    {asset.symbol}
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-20 dark:text-gray-40">
                    {asset.name} • {getChainLabel(asset.chain)}
                  </p>
                </div>
              </div>
              <div className="max-w-[72px] shrink-0 text-right sm:max-w-none">
                <p className="truncate text-xs font-semibold text-black dark:text-white sm:text-sm">
                  {formatAssetAmount(asset.amount)}
                </p>
                <p className="text-xs text-gray-20 dark:text-gray-40">
                  {asset.symbol}
                </p>
              </div>
            </button>
          );
        })
      ) : (
        <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-80 bg-gray-95 p-8 text-center dark:border-white/10 dark:bg-secondary-60/20 md:min-h-[300px]">
          <Wallet className="mb-4 h-8 w-8 text-gray-30" />
          <h2 className="text-base font-semibold text-black dark:text-white">
            No sendable assets
          </h2>
          <p className="mt-2 max-w-xs text-sm text-gray-20 dark:text-gray-40">
            Fund your wallet with USDC or USDT before sending.
          </p>
          <Button
            type="button"
            onClick={onOpenAddFunds}
            className="mt-5 h-11 rounded-xl bg-primary-50 px-5 text-sm font-bold text-white hover:bg-primary-60"
          >
            Add Funds
          </Button>
        </div>
      )}
    </div>
  );
}
