import { Coins } from "lucide-react";
import AssetCard from "@/components/wallet/dashboard/AssetCard";
import { getChainLabel } from "@/lib/chains";
import type { GroupedAssetSummary } from "./dashboard-types";
import { formatAssetAmount, formatCurrencyAmount } from "./dashboard-utils";

interface AssetsPanelProps {
  activeCurrency: string;
  displayCurrency: "LOCAL" | "USD";
  groupedAssets: GroupedAssetSummary[];
  isAssetValueLoading: boolean;
  isBalanceVisible: boolean;
}

export default function AssetsPanel({
  activeCurrency,
  displayCurrency,
  groupedAssets,
  isAssetValueLoading,
  isBalanceVisible,
}: AssetsPanelProps) {
  return (
    <div className="order-3 flex w-full flex-col gap-4 md:h-[300px] md:overflow-hidden md:rounded-lg md:border md:border-input md:p-5 min-[900px]:col-span-full min-[900px]:!h-[270px]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base tracking-normal text-black dark:text-white">
            My Assets
          </h3>
        </div>
      </div>

      {groupedAssets.length > 0 ? (
        <div className="grid min-h-0 content-start gap-3 md:max-h-full md:flex-1 md:overflow-y-auto md:overscroll-contain md:pr-1">
          {groupedAssets.map((asset) => {
            const cardValue =
              displayCurrency === "LOCAL" ? asset.localValue : asset.usdValue;
            const subtitle =
              asset.chainCount > 1
                ? "Available on multiple networks"
                : `Runs on ${getChainLabel(asset.primaryChain || "")}`;

            return (
              <AssetCard
                key={asset.symbol}
                name={asset.name}
                symbol={asset.symbol}
                amount={formatAssetAmount(asset.amount)}
                value={formatCurrencyAmount(cardValue, activeCurrency)}
                subtitle={subtitle}
                hideBalances={!isBalanceVisible}
                isValueLoading={isAssetValueLoading}
                className="px-4 py-3 md:px-4 md:py-3 lg:px-5 lg:py-4"
              />
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center rounded-xl border border-black/5 bg-gray-50 p-8 text-center dark:border-white/10 dark:bg-secondary-50 md:min-h-0 md:rounded-lg lg:items-start lg:text-left">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-200 dark:border-white/5 dark:bg-white/5 md:mb-5 md:h-14 md:w-14">
            <Coins
              size={24}
              className="text-gray-400 dark:text-gray-600 md:h-7 md:w-7"
            />
          </div>
          <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 md:text-base">
            No assets yet
          </h4>
          <p className="max-w-[220px] text-xs text-gray-400 dark:text-gray-500 md:text-sm">
            Your holdings will appear here after your first deposit or crypto
            purchase.
          </p>
        </div>
      )}
    </div>
  );
}
