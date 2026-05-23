import { Eye, EyeOff } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { DisplayCurrency } from "./dashboard-types";
import { SkeletonLine } from "./DashboardSkeletons";

interface PortfolioBalanceCardProps {
  activeBalanceLabel: string;
  assetCountLabel: string;
  canToggleCurrency: boolean;
  countryCode: string;
  flag: string;
  hiddenActiveBalanceLabel: string;
  hiddenSecondaryBalanceLabel: string;
  isBalanceVisible: boolean;
  isDetecting: boolean;
  isLocalDisplay: boolean;
  isPortfolioLoading: boolean;
  localCurrency: string;
  portfolioLabel: string;
  secondaryBalanceLabel: string;
  setDisplayCurrency: Dispatch<SetStateAction<DisplayCurrency>>;
  setIsBalanceVisible: Dispatch<SetStateAction<boolean>>;
  totalNetworks: number;
}

export default function PortfolioBalanceCard({
  activeBalanceLabel,
  assetCountLabel,
  canToggleCurrency,
  countryCode,
  flag,
  hiddenActiveBalanceLabel,
  hiddenSecondaryBalanceLabel,
  isBalanceVisible,
  isDetecting,
  isLocalDisplay,
  isPortfolioLoading,
  localCurrency,
  portfolioLabel,
  secondaryBalanceLabel,
  setDisplayCurrency,
  setIsBalanceVisible,
  totalNetworks,
}: PortfolioBalanceCardProps) {
  return (
    <section className="order-1 flex flex-col items-start space-y-4 md:mb-0 md:block min-[900px]:col-span-full">
      <div className="relative flex w-full flex-col items-start space-y-4 overflow-hidden rounded-none bg-transparent p-0 text-left text-gray-20 shadow-none dark:text-gray-40 md:min-h-[320px] md:items-stretch md:justify-between md:rounded-lg md:border md:border-gray-80/80 md:p-6 md:text-left md:text-cryptoNight md:shadow-sm md:dark:border-white/10 md:dark:bg-secondary-50/20 md:dark:text-white lg:min-h-[360px] lg:p-8">
        <div className="absolute inset-x-0 top-0 hidden h-52 md:block md:bg-[radial-gradient(circle_at_20%_0%,rgba(167,22,127,0.12),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.65),transparent_50%)] md:dark:bg-[radial-gradient(circle_at_20%_0%,rgba(193,92,165,0.45),transparent_48%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.14),transparent_38%)]" />

        <div className="relative flex items-center justify-start gap-3 self-stretch md:justify-between">
          <div className="flex items-center gap-2 rounded-full border border-gray-80 bg-gray-90 px-3 py-1.5 text-[10px] font-bold tracking-tight text-gray-20 dark:border-white/5 dark:bg-secondary-50 dark:text-gray-40 md:border-gray-80 md:bg-white/80 md:py-1.5 md:text-[10px] md:backdrop-blur md:dark:border-white/10 md:dark:bg-white/10 md:dark:text-white/75">
            <span
              className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-black/5 text-[11px] leading-none dark:border-white/10 md:border-primary-90/40 md:bg-primary-99 md:dark:border-white/20 md:dark:bg-white/5"
              aria-label={`Detected country ${countryCode}`}
              title={countryCode}
            >
              {isDetecting ? <SkeletonLine className="h-2.5 w-2.5" /> : flag}
            </span>
            {isDetecting ? (
              <SkeletonLine className="h-2.5 w-32" />
            ) : (
              portfolioLabel
            )}
            {canToggleCurrency && (
              <button
                type="button"
                onClick={() =>
                  setDisplayCurrency((currency) =>
                    currency === "LOCAL" ? "USD" : "LOCAL",
                  )
                }
                className="ml-1 cursor-pointer rounded-full border border-gray-80 px-1.5 py-0.5 text-[9px] font-bold text-gray-20 transition hover:border-gray-60 hover:text-cryptoNight dark:border-white/10 dark:text-gray-40 dark:hover:text-white md:border-primary-90/40 md:bg-primary-99 md:text-[8px] md:text-primary-50 md:hover:text-primary-30 md:dark:border-white/10 md:dark:bg-white/5 md:dark:text-primary-80 md:dark:hover:text-primary-90"
              >
                {isLocalDisplay ? "USD" : localCurrency}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsBalanceVisible((visible) => !visible)}
            className="hidden rounded-full border border-gray-80 bg-white/80 p-1.5 text-gray-20 transition hover:bg-white hover:text-cryptoNight md:block md:dark:border-white/10 md:dark:bg-white/10 md:dark:text-white/70 md:dark:hover:bg-white/15 md:dark:hover:text-white"
            aria-label={isBalanceVisible ? "Hide balances" : "Show balances"}
          >
            {isBalanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

        <div className="relative flex flex-1 flex-col justify-start self-stretch pt-1 md:justify-center md:pt-0">
          <div
            className="group cursor-pointer select-none"
            onClick={() => setIsBalanceVisible((visible) => !visible)}
          >
            <div className="flex items-center justify-start gap-3">
              {isPortfolioLoading && isBalanceVisible ? (
                <SkeletonLine className="h-10 w-44 md:h-16 md:w-72 lg:h-20 lg:w-80" />
              ) : (
                <h2 className="text-3xl font-bold leading-none text-cryptoNight transition-opacity group-active:opacity-70 dark:text-white md:max-w-[11ch] md:text-5xl lg:text-7xl">
                  {isBalanceVisible
                    ? activeBalanceLabel
                    : hiddenActiveBalanceLabel}
                </h2>
              )}
            </div>

            {isPortfolioLoading && isBalanceVisible ? (
              <SkeletonLine className="mt-3 h-4 w-24 md:w-32" />
            ) : (
              <p className="mt-1 text-xs font-medium text-gray-20 dark:text-gray-40 md:mt-2 md:max-w-xl md:text-base md:dark:text-white/70">
                {isBalanceVisible
                  ? secondaryBalanceLabel
                  : hiddenSecondaryBalanceLabel}
              </p>
            )}
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-2 md:gap-3 md:pt-5 lg:gap-4 lg:pt-6">
          <div className="rounded-xl border border-gray-80/80 bg-white/70 p-3 backdrop-blur dark:border-white/10 dark:bg-secondary-50 lg:p-4">
            <p className="text-[10px] font-bold tracking-tight text-gray-30 dark:text-white/35">
              Total Holdings
            </p>
            <p className="mt-2 text-sm font-semibold text-cryptoNight dark:text-white">
              {assetCountLabel}
            </p>
          </div>

          <div className="rounded-xl border border-gray-80/80 bg-white/70 p-3 backdrop-blur dark:border-white/10 dark:bg-secondary-50 lg:p-4">
            <p className="text-[10px] font-bold tracking-tight text-gray-30 dark:text-white/35">
              Networks
            </p>
            <p className="mt-2 text-sm font-semibold text-cryptoNight dark:text-white">
              {totalNetworks === 1 ? "1 network" : `${totalNetworks} networks`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
