"use client";

import Image from "next/image";
import { ArrowRight, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import CountrySelectorButton from "@/components/wallet/shared/CountrySelectorButton";
import { Button } from "@/components/ui/button";

interface WithdrawableAsset {
  symbol: string;
  name: string;
  balance: number;
  network: { id: string; name: string } | null;
  usdValue: number;
}

interface AssetSelectionStepProps {
  asset: string | null;
  country: string | null;
  isDetectingCountry: boolean;
  assets: WithdrawableAsset[];
  onSelectAsset: (asset: string) => void;
  onOpenCountryModal: () => void;
  onBackToWallet: () => void;
  onContinue: () => void;
}

export function WithdrawAssetSelectionStep({
  asset,
  country,
  isDetectingCountry,
  assets,
  onSelectAsset,
  onOpenCountryModal,
  onBackToWallet,
  onContinue,
}: AssetSelectionStepProps) {
  const hasValidSelection = Boolean(asset);

  return (
    <div className="flex h-full min-h-[calc(100dvh-200px)] flex-col md:min-h-[500px]">
      <div className="flex-1 overflow-y-auto md:px-0">
        <div className="mb-8 flex justify-center">
          <CountrySelectorButton
            country={country}
            isDetecting={isDetectingCountry}
            onClick={onOpenCountryModal}
          />
        </div>

        <section className="mb-8">
          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Available Assets
          </h3>
          {assets.length > 0 ? (
            <div className="space-y-3">
              {assets.map((item) => (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => onSelectAsset(item.symbol)}
                  className={cn(
                    "cursor-pointer",
                    "w-full rounded-2xl border p-4 text-left transition-all",
                    asset === item.symbol
                      ? "border-primary-60 bg-primary-70/5 ring-2 ring-primary-60/20"
                      : "border-black/5 bg-white hover:bg-gray-50 dark:border-white/10 dark:bg-secondary-50 dark:hover:bg-secondary-60/50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative h-8 w-8">
                        <Image
                          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${item.symbol.toLowerCase()}.png`}
                          alt={item.symbol}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="text-left">
                        <p
                          className={cn(
                            "text-sm font-bold",
                            asset === item.symbol
                              ? "text-primary-60"
                              : "text-black dark:text-white",
                          )}
                        >
                          {item.symbol}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.network?.name
                            ? item.network.name.charAt(0).toUpperCase() +
                              item.network.name.slice(1)
                            : "Available"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-black dark:text-white">
                        {item.balance.toFixed(4)}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${item.usdValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/70 p-8 text-center dark:border-white/10 dark:bg-secondary-50/40">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-95 text-gray-30 dark:bg-secondary-60 dark:text-gray-40">
                <Wallet className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-black dark:text-white">
                No assets available to withdraw
              </h4>
              <p className="mt-2 max-w-xs text-sm text-gray-500 dark:text-gray-40">
                Your withdrawable assets will appear here once your wallet has a
                balance.
              </p>
              <button
                type="button"
                onClick={onBackToWallet}
                className="mt-5 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-gray-50 dark:border-white/10 dark:bg-secondary-60/50 dark:text-white dark:hover:bg-secondary-60 cursor-pointer"
              >
                Back to Wallet
              </button>
            </div>
          )}
        </section>
      </div>

      {assets.length > 0 ? (
        <div className="sticky bottom-0 left-0 right-0 mt-6 border-t border-black/5 px-4 pb-4 pt-6 dark:border-white/5 md:px-0">
          <div className="mx-auto max-w-md md:max-w-full">
            <Button
              type="button"
              variant="flow"
              size="flow"
              onClick={onContinue}
              disabled={!hasValidSelection}
              className={cn(!hasValidSelection && "from-gray-400 to-gray-500")}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-sm md:text-base">
                {!hasValidSelection ? (
                  "Select Asset to Continue"
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </span>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
