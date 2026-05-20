"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUp,
  ArrowUpRight,
  Clock,
  Eye,
  EyeOff,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import NotificationBell from "@/components/notification/NotificationBell";
import AddFundsModal from "@/components/modals/AddFundsModal";
import { useDetectCountry } from "@/hooks/use-detect-country";
import { useExchangeRate } from "@/hooks/use-exchange-rate";
import {
  getCurrencyDecimals,
  getCurrencySymbol,
  COUNTRY_CURRENCY_MAP,
} from "@/lib/country-currency-map";
import { formatNumber } from "@/lib/format-number";
import { cn, getGreeting } from "@/lib/utils";
import priceService from "@/services/price-service";
import { transactionService } from "@/services/api/transactions";
import type { Asset, Transaction, User } from "@/types/db";

import AssetCard from "./AssetCard";
import QuickAction from "./QuickAction";
import { getChainLabel } from "@/lib/chains";

interface DashboardClientProps {
  profile: User;
}

interface GroupedAssetSummary {
  symbol: string;
  name: string;
  amount: number;
  usdValue: number;
  localValue: number;
  chainCount: number;
  primaryChain: string | null;
}

const ASSET_LABELS: Record<string, string> = {
  USDC: "USD Coin",
  USDT: "Tether USD",
};

const DEFAULT_TOKEN_PRICE = 1;

function parseAssetAmount(amount: Asset["amount"]): number {
  const parsed = typeof amount === "string" ? Number(amount) : amount;
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrencyAmount(value: number, currency: string): string {
  const decimals = getCurrencyDecimals(currency);
  const symbol = getCurrencySymbol(currency);
  const absoluteValue = Math.abs(value);
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(absoluteValue);

  if (currency === "USD") {
    return `${value < 0 ? "-" : ""}${symbol}${formattedNumber}`;
  }

  return `${value < 0 ? "-" : ""}${symbol}${formattedNumber}`;
}

function formatAssetAmount(value: number): string {
  return formatNumber(value, {
    minimumFractionDigits: value > 0 && value < 1 ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

function getAssetName(symbol: string): string {
  return ASSET_LABELS[symbol] || symbol;
}

function formatRelativeDate(value: Date | string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getTransactionAction(type: Transaction["type"]): string {
  switch (type) {
    case "BUY":
    case "DEPOSIT":
      return "Buy";
    case "TRANSFER_IN":
      return "Received";
    case "TRANSFER_OUT":
      return "Sent";
    default:
      return type.charAt(0) + type.slice(1).toLowerCase();
  }
}

function isPositiveTransaction(type: Transaction["type"]): boolean {
  return ["DEPOSIT", "BUY", "TRANSFER_IN"].includes(type);
}

function getTransactionSymbol(transaction: Transaction): string {
  const metadata = transaction.metadata;
  const provider = metadata?.provider?.toLowerCase();

  switch (provider) {
    case "paycrest":
      return metadata?.token || transaction.symbol;
    case "centiiv":
      return metadata?.asset || transaction.symbol;
    default:
      return transaction.symbol;
  }
}

function getProviderAmount(transaction: Transaction): number | null {
  const metadata = transaction.metadata;
  const provider = metadata?.provider?.toLowerCase();

  switch (provider) {
    case "paycrest": {
      const paycrestAmount = metadata?.paycrestResponse?.amount;
      if (paycrestAmount) return parseFloat(paycrestAmount);
      break;
    }
    case "centiiv": {
      const centiivAmount = metadata?.centiivResponse?.receivableAmount;
      if (centiivAmount) return parseFloat(centiivAmount);
      break;
    }
    default:
      return null;
  }

  return null;
}

function getTransactionTitle(transaction: Transaction): string {
  const action = getTransactionAction(transaction.type);
  const symbol = getTransactionSymbol(transaction);

  if (action === "Buy") {
    return `Buy ${symbol}`;
  }

  return `${symbol} ${action}`;
}

function getTransactionAmountLabel(transaction: Transaction): string {
  const amount = getProviderAmount(transaction);
  const symbol = getTransactionSymbol(transaction);

  if (amount === null) {
    return `-- ${symbol}`;
  }

  const prefix = isPositiveTransaction(transaction.type) ? "+" : "-";
  return `${prefix}${formatAssetAmount(amount)} ${symbol}`;
}

function getTransactionStatusLabel(status: Transaction["status"]): string {
  switch (status) {
    case "COMPLETED":
    case "PAID":
      return "Successful";
    case "FAILED":
      return "Failed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

function getTransactionStatusClasses(status: Transaction["status"]): string {
  switch (status) {
    case "COMPLETED":
    case "PAID":
      return "text-emerald-600 dark:text-emerald-400";
    case "FAILED":
      return "text-red-500 dark:text-red-400";
    case "CANCELLED":
      return "text-gray-500 dark:text-gray-400";
    default:
      return "text-primary-60 dark:text-primary-80";
  }
}

export default function DashboardClient({ profile }: DashboardClientProps) {
  const { countryCode, currencyCode, flag, isDetecting } = useDetectCountry();
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState<"LOCAL" | "USD">(
    "LOCAL",
  );
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});
  const [transactions, setTransactions] = useState<Transaction[]>(
    profile.transactions || [],
  );
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null,
  );

  const greeting = getGreeting();
  const localCurrency = currencyCode || "USD";
  const { exchangeRate, isRateLoading } = useExchangeRate(localCurrency, null);
  // Build a Set of all fiat currency codes from the country map
  const FIAT_CURRENCIES = new Set(Object.values(COUNTRY_CURRENCY_MAP));

  const rawAssets = useMemo(
    () => (profile?.assets || []).filter((asset): asset is Asset => !!asset),
    [profile?.assets],
  );

  const cryptoAssets = useMemo(
    () =>
      rawAssets.filter(
        (asset) => !FIAT_CURRENCIES.has(asset.symbol.toUpperCase()),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawAssets],
  );

  const assetSymbolsKey = useMemo(
    () =>
      Array.from(
        new Set(cryptoAssets.map((asset) => asset.symbol.toUpperCase())),
      ).join(","),
    [cryptoAssets],
  );

  useEffect(() => {
    let isCancelled = false;

    const loadPrices = async () => {
      if (!assetSymbolsKey) {
        setTokenPrices({});
        return;
      }

      const symbols = assetSymbolsKey.split(",").filter(Boolean);

      try {
        const prices = await priceService.getMultipleTokenPrices(symbols);
        if (isCancelled) return;

        const nextPrices = symbols.reduce<Record<string, number>>(
          (accumulator, symbol) => {
            const normalizedSymbol = symbol.toUpperCase();
            accumulator[normalizedSymbol] =
              prices[symbol] || prices[normalizedSymbol] || DEFAULT_TOKEN_PRICE;
            return accumulator;
          },
          {},
        );

        setTokenPrices(nextPrices);
      } catch {
        if (isCancelled) return;

        const fallbackPrices = assetSymbolsKey
          .split(",")
          .filter(Boolean)
          .reduce<Record<string, number>>((accumulator, symbol) => {
            accumulator[symbol.toUpperCase()] = DEFAULT_TOKEN_PRICE;
            return accumulator;
          }, {});

        setTokenPrices(fallbackPrices);
      }
    };

    loadPrices();

    return () => {
      isCancelled = true;
    };
  }, [assetSymbolsKey]);

  useEffect(() => {
    let isCancelled = false;

    const loadTransactions = async () => {
      setIsTransactionsLoading(true);
      setTransactionsError(null);

      try {
        const response = await transactionService.getTransactions();
        if (isCancelled) return;

        setTransactions(response.data || []);
      } catch (error) {
        if (isCancelled) return;

        setTransactionsError(
          error instanceof Error ? error.message : "Failed to load activity",
        );
      } finally {
        if (!isCancelled) {
          setIsTransactionsLoading(false);
        }
      }
    };

    loadTransactions();

    return () => {
      isCancelled = true;
    };
  }, []);

  const groupedAssets = useMemo<GroupedAssetSummary[]>(() => {
    const grouped = new Map<
      string,
      {
        amount: number;
        chains: Set<string>;
      }
    >();

    cryptoAssets.forEach((asset) => {
      const symbol = asset.symbol.toUpperCase();
      const currentEntry = grouped.get(symbol) || {
        amount: 0,
        chains: new Set<string>(),
      };

      currentEntry.amount += parseAssetAmount(asset.amount);
      if (asset.chain) {
        currentEntry.chains.add(asset.chain);
      }

      grouped.set(symbol, currentEntry);
    });

    return Array.from(grouped.entries())
      .map(([symbol, entry]) => {
        const usdPrice = tokenPrices[symbol] || DEFAULT_TOKEN_PRICE;
        const usdValue = entry.amount * usdPrice;

        return {
          symbol,
          name: getAssetName(symbol),
          amount: entry.amount,
          usdValue,
          localValue: usdValue * exchangeRate,
          chainCount: entry.chains.size,
          primaryChain: entry.chains.values().next().value || null,
        };
      })
      .sort((left, right) => right.usdValue - left.usdValue);
  }, [exchangeRate, cryptoAssets, tokenPrices]);

  const totalUsdBalance = useMemo(
    () =>
      groupedAssets.reduce(
        (runningTotal, asset) => runningTotal + asset.usdValue,
        0,
      ),
    [groupedAssets],
  );

  const totalLocalBalance = useMemo(
    () =>
      groupedAssets.reduce(
        (runningTotal, asset) => runningTotal + asset.localValue,
        0,
      ),
    [groupedAssets],
  );

  const totalNetworks = useMemo(() => {
    const allChains = new Set<string>();

    rawAssets.forEach((asset) => {
      if (asset.chain) allChains.add(asset.chain);
    });

    return allChains.size;
  }, [rawAssets]);

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort(
          (left, right) =>
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime(),
        )
        .slice(0, 5),
    [transactions],
  );

  const isLocalDisplay = displayCurrency === "LOCAL";
  const activeCurrency = isLocalDisplay ? localCurrency : "USD";
  const activeBalance = isLocalDisplay ? totalLocalBalance : totalUsdBalance;
  const secondaryBalance = isLocalDisplay ? totalUsdBalance : totalLocalBalance;
  const secondaryCurrency = isLocalDisplay ? "USD" : localCurrency;
  const canToggleCurrency = localCurrency !== "USD";

  const portfolioLabel = `Available Balance (${activeCurrency})`;
  const activeBalanceLabel = formatCurrencyAmount(
    activeBalance,
    activeCurrency,
  );
  const secondaryBalanceLabel = formatCurrencyAmount(
    secondaryBalance,
    secondaryCurrency,
  );
  const marketRateLabel =
    localCurrency === "USD"
      ? "1 USD = $1.00"
      : `$1 = ${formatCurrencyAmount(exchangeRate, localCurrency)}`;
  const assetCountLabel = `${groupedAssets.length} asset${groupedAssets.length === 1 ? "" : "s"}`;
  // const topAsset = groupedAssets[0]
  const hiddenActiveBalanceLabel = `${getCurrencySymbol(activeCurrency)}••••••`;
  const hiddenSecondaryBalanceLabel = `${getCurrencySymbol(secondaryCurrency)}••••••`;

  return (
    <div className="container mx-auto w-full max-w-7xl px-4 pb-32 pt-4 md:px-6 md:pb-12 md:pt-28 space-y-6 md:space-y-8">
      {/* ─── Mobile Header ─── */}
      <div className="flex w-full items-center justify-between md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-80 bg-primary-95 transition-all group-hover:border-primary-50 dark:border-white dark:bg-primary-70">
            {profile?.image ? (
              <Image
                src={profile.image}
                alt={profile.name || "User"}
                className="h-full w-full object-cover"
                width={40}
                height={40}
              />
            ) : (
              <span className="text-sm font-bold text-primary-50 dark:text-white">
                {profile?.name?.charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </div>

          <Link
            href="/settings/profile"
            className="flex flex-col justify-center"
          >
            <span className="text-xs font-medium capitalize text-gray-20 dark:text-gray-40">
              {greeting}
            </span>
            <span className="text-xs font-semibold leading-tight text-black dark:text-white">
              {(profile && `${profile.name?.split(" ")[0]}!`) || "Guest"}
            </span>
          </Link>
        </div>

        <NotificationBell />
      </div>

      {/* ─── Desktop Header ─── */}
      <div className="hidden items-end justify-between md:flex">
        <div>
          <p className="text-lg font-medium capitalize text-gray-20 dark:text-gray-40">
            {greeting},{" "}
            <span className="text-black dark:text-white">
              {`${profile.name?.split(" ")[0]}!` || "Guest"}
            </span>
          </p>
        </div>
      </div>

      {/* ─── Main Content Wrapper ─── */}
      <div
        className={cn(
          "px-0 py-0 text-gray-20 dark:text-gray-40",
          "rounded-none",
          "md:rounded-lg  md:bg-white/30 md:p-4",
          "md:dark:bg-secondary-50/10",
        )}
      >
        <div className="grid grid-cols-1 gap-6 md:gap-4 min-[900px]:grid-cols-12 min-[900px]:items-start">
          <div className="contents min-[900px]:col-span-8 min-[900px]:flex min-[900px]:w-full min-[900px]:flex-col min-[900px]:gap-4">
            {/* ─── Balance Card ─── */}
            <section className="order-1 flex flex-col items-start space-y-4 md:mb-0 md:block min-[900px]:col-span-full">
              <div className="relative flex w-full flex-col items-start space-y-4 overflow-hidden rounded-none bg-transparent p-0 text-left text-gray-20 shadow-none dark:text-gray-40 md:min-h-[320px] md:items-stretch md:justify-between md:rounded-lg md:border md:border-gray-80/80 md:p-6 md:text-left md:text-cryptoNight md:shadow-sm md:dark:border-white/10 md:dark:bg-secondary-50/20 md:dark:text-white lg:min-h-[360px] lg:p-8">
                {/* Background Gradient (Desktop Only) */}
                <div className="absolute inset-x-0 top-0 hidden h-52 md:block md:bg-[radial-gradient(circle_at_20%_0%,rgba(167,22,127,0.12),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.65),transparent_50%)] md:dark:bg-[radial-gradient(circle_at_20%_0%,rgba(193,92,165,0.45),transparent_48%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.14),transparent_38%)]" />

                {/* ─── Top Row: Flag, Label, Currency Toggle ─── */}
                <div className="relative flex items-center justify-start gap-3 self-stretch md:justify-between">
                  <div className="flex items-center gap-2 rounded-full border border-gray-80 bg-gray-90 px-3 py-1.5 text-[10px] font-bold tracking-tight text-gray-20 dark:border-white/5 dark:bg-secondary-50 dark:text-gray-40 md:border-gray-80 md:bg-white/80 md:py-1.5 md:text-[10px] md:backdrop-blur md:dark:border-white/10 md:dark:bg-white/10 md:dark:text-white/75">
                    <span
                      className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-black/5 text-[11px] leading-none dark:border-white/10 md:border-primary-90/40 md:bg-primary-99 md:dark:border-white/20 md:dark:bg-white/5"
                      aria-label={`Detected country ${countryCode}`}
                      title={countryCode}
                    >
                      {flag}
                    </span>
                    {portfolioLabel}
                    {canToggleCurrency && (
                      <button
                        type="button"
                        onClick={() =>
                          setDisplayCurrency((c) =>
                            c === "LOCAL" ? "USD" : "LOCAL",
                          )
                        }
                        className="ml-1 cursor-pointer rounded-full border border-gray-80 px-1.5 py-0.5 text-[9px] font-bold text-gray-20 transition hover:border-gray-60 hover:text-cryptoNight dark:border-white/10 dark:text-gray-40 dark:hover:text-white md:border-primary-90/40 md:bg-primary-99 md:text-[8px] md:text-primary-50 md:hover:text-primary-30 md:dark:border-white/10 md:dark:bg-white/5 md:dark:text-primary-80 md:dark:hover:text-primary-90"
                      >
                        {isLocalDisplay ? "USD" : localCurrency}
                      </button>
                    )}
                  </div>

                  {/* Desktop Eye Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsBalanceVisible((s) => !s)}
                    className="hidden rounded-full border border-gray-80 bg-white/80 p-1.5 text-gray-20 transition hover:bg-white hover:text-cryptoNight md:block md:dark:border-white/10 md:dark:bg-white/10 md:dark:text-white/70 md:dark:hover:bg-white/15 md:dark:hover:text-white"
                    aria-label={
                      isBalanceVisible ? "Hide balances" : "Show balances"
                    }
                  >
                    {isBalanceVisible ? (
                      <Eye size={16} />
                    ) : (
                      <EyeOff size={16} />
                    )}
                  </button>
                </div>

                {/* ─── Center: Market Rate & Balance ─── */}
                <div className="relative flex flex-1 flex-col justify-start self-stretch pt-1 md:justify-center md:pt-0">
                  {/* Market Rate Pill */}
                  <div className="mb-2 flex w-fit items-center gap-1.5 py-1 text-[10px] font-bold uppercase text-primary-40 dark:text-white/75 md:hidden md:mb-3 md:gap-2 md:rounded-md md:border md:border-white/5 md:px-3 md:py-1 md:text-xs dark:md:border-white/10">
                    {isDetecting || isRateLoading
                      ? "Updating..."
                      : marketRateLabel}
                  </div>

                  {/* Clickable Balance Group */}
                  <div
                    className="group cursor-pointer select-none"
                    onClick={() => setIsBalanceVisible((s) => !s)}
                  >
                    <div className="flex items-center justify-start gap-3">
                      <h2 className="text-3xl font-bold leading-none text-cryptoNight transition-opacity group-active:opacity-70 dark:text-white md:max-w-[11ch] md:text-5xl lg:text-7xl">
                        {isBalanceVisible
                          ? activeBalanceLabel
                          : hiddenActiveBalanceLabel}
                      </h2>
                    </div>

                    <p className="mt-1 text-xs font-medium text-gray-20 dark:text-gray-40 md:mt-2 md:max-w-xl md:text-base md:dark:text-white/70">
                      {isBalanceVisible
                        ? secondaryBalanceLabel
                        : hiddenSecondaryBalanceLabel}
                    </p>
                  </div>
                </div>

                {/* ─── Desktop Stats Grid ─── */}
                <div className="hidden md:grid md:grid-cols-3 md:gap-3 md:pt-5 lg:gap-4 lg:pt-6">
                  <div className="rounded-xl border border-gray-80/80 bg-white/70 p-3 backdrop-blur dark:border-white/10 dark:bg-secondary-50 lg:p-4">
                    <p className="text-[10px] font-bold tracking-tight text-gray-30 dark:text-white/35">
                      Exchange Rate
                    </p>
                    <p className="mt-2 text-sm font-semibold text-cryptoNight dark:text-white">
                      {isDetecting || isRateLoading
                        ? "Updating..."
                        : marketRateLabel}
                    </p>
                  </div>

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
                      {totalNetworks === 1
                        ? "1 network"
                        : `${totalNetworks} networks`}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Assets Column */}
            <div className="order-3 flex w-full flex-col gap-4 md:h-[300px] md:overflow-hidden md:rounded-lg md:border md:border-input md:p-5 min-[900px]:col-span-full min-[900px]:!h-[270px]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold tracking-normal text-black dark:text-white md:text-xl">
                    My Assets
                  </h3>
                </div>
              </div>

              {groupedAssets.length > 0 ? (
                <div className="grid min-h-0 content-start gap-3 md:max-h-full md:flex-1 md:overflow-y-auto md:overscroll-contain md:pr-1">
                  {groupedAssets.map((asset) => {
                    const cardValue =
                      displayCurrency === "LOCAL"
                        ? asset.localValue
                        : asset.usdValue;
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
                        className="px-4 py-3 md:px-4 md:py-3 lg:px-5 lg:py-4"
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm font-medium text-gray-500 dark:border-white/5 dark:bg-secondary-40 dark:text-gray-400 md:rounded-lg">
                  Your balances will appear here after your first deposit.
                </div>
              )}
            </div>
          </div>

          <div className="contents min-[900px]:order-2 min-[900px]:col-span-4 min-[900px]:flex min-[900px]:w-full min-[900px]:flex-col min-[900px]:gap-4">
            {/* ─── Quick Actions ─── */}
            <section className="order-2 flex w-full items-start justify-start gap-2 xs:gap-3 md:grid md:grid-cols-4 md:content-start md:gap-3 md:rounded-lg md:border md:border-input md:p-4 min-[900px]:order-none min-[900px]:col-span-full min-[900px]:!grid-cols-2 lg:p-5">
              <QuickAction
                icon={<Plus size={22} />}
                label="Add Funds"
                onClick={() => setIsAddFundsOpen(true)}
              />
              <QuickAction icon={<ArrowUpRight size={22} />} label="Send" />
              <QuickAction icon={<ArrowUp size={22} />} label="Withdraw" />
              <QuickAction icon={<MoreHorizontal size={22} />} label="More" />
            </section>

            {/* Activity Column */}
            <div className="order-4 flex w-full flex-col space-y-4 md:h-[360px] md:overflow-hidden md:rounded-lg md:border md:border-input md:p-5 min-[900px]:order-none min-[900px]:col-span-full min-[900px]:space-y-3 min-[900px]:p-4 lg:space-y-4 lg:p-5">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-lg font-semibold tracking-normal text-black dark:text-white md:text-xl">
                    Activity
                  </h3>
                </div>
                <Link
                  href="/transactions"
                  className="text-xs font-semibold text-primary-50 hover:opacity-80 md:text-sm"
                >
                  See All
                </Link>
              </div>

              {isTransactionsLoading ? (
                <div className="flex min-h-[250px] flex-1 flex-col items-center justify-center rounded-xl border border-black/5 bg-gray-50 p-8 text-center dark:border-white/10 dark:bg-secondary-50 md:rounded-lg">
                  <div className="mb-4 h-12 w-12 animate-pulse rounded-full border border-gray-300 bg-gray-200 dark:border-white/5 dark:bg-white/5 md:h-14 md:w-14" />
                  <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 md:text-base">
                    Loading activity
                  </h4>
                  <p className="max-w-[180px] text-xs text-gray-400 dark:text-gray-500 md:text-sm">
                    Pulling your recent transactions.
                  </p>
                </div>
              ) : transactionsError ? (
                <div className="flex min-h-[250px] flex-1 flex-col items-center justify-center rounded-xl border border-black/5 bg-gray-50 p-8 text-center dark:border-white/10 dark:bg-secondary-50 md:rounded-lg">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-200 dark:border-white/5 dark:bg-white/5 md:h-14 md:w-14">
                    <Clock
                      size={24}
                      className="text-gray-400 dark:text-gray-600 md:h-7 md:w-7"
                    />
                  </div>
                  <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 md:text-base">
                    Activity unavailable
                  </h4>
                  <p className="max-w-[220px] text-xs text-gray-400 dark:text-gray-500 md:text-sm">
                    {transactionsError}
                  </p>
                </div>
              ) : recentTransactions.length > 0 ? (
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <div className="overflow-hidden rounded-xl border border-black/5 bg-white dark:border-white/10 dark:bg-secondary-50">
                    {recentTransactions.map((transaction) => (
                      <Link
                        key={transaction.id}
                        href={`/transactions/${transaction.id}`}
                        className="flex items-center justify-between gap-3 border-b border-black/5 px-3 py-3 transition-colors last:border-b-0 hover:bg-gray-95 dark:border-white/10 dark:hover:bg-secondary-60/40 min-[900px]:gap-2 min-[900px]:px-2.5 min-[900px]:py-2.5 lg:gap-3 lg:px-3 lg:py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3 min-[900px]:gap-2 lg:gap-3">
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full min-[900px]:h-7 min-[900px]:w-7 lg:h-8 lg:w-8",
                              isPositiveTransaction(transaction.type)
                                ? "bg-primary-95 dark:bg-primary-70/15"
                                : "bg-gray-95 dark:bg-secondary-60",
                            )}
                          >
                            {isPositiveTransaction(transaction.type) ? (
                              <ArrowDownLeft className="h-3.5 w-3.5 text-primary-50 dark:text-primary-80 min-[900px]:h-3 min-[900px]:w-3 lg:h-3.5 lg:w-3.5" />
                            ) : (
                              <ArrowUpRight className="h-3.5 w-3.5 text-gray-20 dark:text-gray-40 min-[900px]:h-3 min-[900px]:w-3 lg:h-3.5 lg:w-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-black dark:text-white min-[900px]:text-[11px] lg:text-sm">
                              {getTransactionTitle(transaction)}
                            </p>
                            <div className="mt-1 flex items-center gap-2 min-[900px]:gap-1.5">
                              <span className="text-[11px] text-gray-500 dark:text-gray-400 min-[900px]:text-[10px] lg:text-[11px]">
                                {formatRelativeDate(transaction.createdAt)}
                              </span>
                              <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                              <span
                                className={cn(
                                  "text-[10px] font-medium min-[900px]:text-[9px] lg:text-[10px]",
                                  getTransactionStatusClasses(
                                    transaction.status,
                                  ),
                                )}
                              >
                                {getTransactionStatusLabel(transaction.status)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="ml-3 min-w-[56px] shrink-0 text-right min-[900px]:ml-2 min-[900px]:min-w-[48px] lg:ml-3 lg:min-w-[56px]">
                          <p className="break-words text-xs font-medium leading-tight text-black dark:text-white min-[900px]:text-[11px] lg:text-sm">
                            {isBalanceVisible
                              ? getTransactionAmountLabel(transaction)
                              : "••••"}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[250px] flex-1 flex-col items-center justify-center rounded-xl border border-black/5 bg-gray-50 p-8 text-center dark:border-white/10 dark:bg-secondary-50 md:rounded-lg">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-200 dark:border-white/5 dark:bg-white/5 md:mb-5 md:h-14 md:w-14">
                    <Clock
                      size={24}
                      className="text-gray-400 dark:text-gray-600 md:h-7 md:w-7"
                    />
                  </div>
                  <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 md:text-base">
                    No transactions yet
                  </h4>
                  <p className="max-w-[180px] text-xs text-gray-400 dark:text-gray-500 md:text-sm">
                    Your financial journey starts with your first deposit.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddFundsModal isOpen={isAddFundsOpen} onClose={setIsAddFundsOpen} />
    </div>
  );
}
