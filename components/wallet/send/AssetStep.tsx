"use client";

import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import AssetNetworkDisplay from "@/components/wallet/shared/AssetNetworkDisplay";
import FlowEmptyState from "@/components/wallet/shared/FlowEmptyState";
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
                "flex w-full min-w-0 items-center justify-between gap-3 overflow-hidden rounded-2xl border p-4 text-left transition sm:gap-4",
                isSelected
                  ? "border-primary-70 bg-primary-99 dark:border-primary-70/50 dark:bg-primary-70/10"
                  : "border-gray-80 bg-gray-95 hover:border-gray-60 dark:border-white/10 dark:bg-secondary-60/25 dark:hover:border-white/20",
              )}
            >
              <AssetNetworkDisplay
                symbol={asset.symbol}
                assetName={asset.name}
                network={asset.chain}
                className="flex-1"
              />
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
        <FlowEmptyState
          className="h-full md:min-h-[300px]"
          icon={<Wallet className="h-6 w-6" />}
          title="No sendable assets"
          titleClassName="text-base font-semibold text-black dark:text-white"
          text="Fund your wallet with USDC or USDT before sending."
          textClassName="mt-1 max-w-xs text-sm text-gray-20 dark:text-gray-40"
          action={
            <Button
              type="button"
              onClick={onOpenAddFunds}
              className="h-11 rounded-xl bg-primary-50 px-5 text-sm font-bold text-white hover:bg-primary-60"
            >
              Add Funds
            </Button>
          }
        />
      )}
    </div>
  );
}
