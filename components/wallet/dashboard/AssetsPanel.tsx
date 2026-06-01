import { Coins } from "lucide-react";
import AssetCard from "@/components/wallet/dashboard/AssetCard";
import { getChainLabel } from "@/lib/chains";
import type { GroupedAssetSummary } from "@/lib/dashboard-types";
import { formatAssetAmount, formatCurrencyAmount } from "@/lib/dashboard-utils";

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
    <div className="order-3 flex w-full flex-col gap-4 rounded-2xl border border-white/70 bg-white/55 p-3 shadow-sm shadow-primary-90/20 backdrop-blur-xl dark:border-white/10 dark:bg-secondary-50/20 dark:shadow-none xs:p-4 md:h-[300px] md:overflow-hidden md:rounded-xl md:border md:border-white/70 md:bg-white/60 md:p-5 md:dark:border-white/10 md:dark:bg-transparent min-[900px]:col-span-full min-[900px]:!h-[270px]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold leading-tight tracking-normal text-black dark:text-white md:text-base">
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
                className="px-3 py-3 xs:px-4 md:px-4 md:py-3 lg:px-5 lg:py-4"
              />
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center rounded-xl border border-primary-90/50 bg-white/70 p-8 text-center shadow-sm shadow-primary-90/10 dark:border-white/10 dark:bg-secondary-50 dark:shadow-none md:min-h-0 md:rounded-lg lg:items-start lg:text-left">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary-90/50 bg-primary-99 dark:border-white/5 dark:bg-white/5 md:mb-5 md:h-14 md:w-14">
            <Coins
              size={24}
              className="text-primary-50 dark:text-gray-600 md:h-7 md:w-7"
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
