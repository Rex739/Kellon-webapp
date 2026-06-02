"use client";

import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Info,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ActionToolTip } from "@/components/ActionTooltip";
import { useDetectCountry } from "@/hooks/use-detect-country";
import { useExchangeRate } from "@/hooks/use-exchange-rate";
import {
  CHAIN_UI_DATA,
  getChainLabel,
  type SupportedChainKeys,
} from "@/lib/chains";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import {
  formatCurrencyAmount,
  getProviderAmount,
  getTransactionAmountLabel,
  getTransactionStatusClasses,
  getTransactionStatusLabel,
  getTransactionTitle,
  getTransactionSymbol,
  isPositiveTransaction,
} from "@/lib/dashboard-utils";
import { cn } from "@/lib/utils";
import priceService from "@/services/price-service";
import { transactionService } from "@/services/api/transactions";
import type { Asset, Transaction, User } from "@/types/db";

interface AssetDetailsPageProps {
  profile: User;
  symbol: string;
}

interface ChainBalance {
  chain: string;
  label: string;
  amount: number;
  percentage: number;
  value: number;
  color: string;
}

const DEFAULT_TOKEN_PRICE = 1;
const CHAIN_ORDER: SupportedChainKeys[] = [
  "base",
  "stellar",
  "celo",
  "polygon",
  "bnb",
];
const HIDDEN_CHAINS = new Set(["avalanche", "avax"]);
const FALLBACK_CHAIN_COLORS = [
  "#0052FF",
  "#111111",
  "#35D07F",
  "#8247E5",
  "#F3BA2F",
  "#C15CA5",
];

function parseAmount(amount: Asset["amount"]): number {
  const parsed = typeof amount === "string" ? Number(amount) : amount;
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeChain(chain?: string | null): string {
  return chain?.trim().toLowerCase() || "unknown";
}

function formatTokenAmount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value > 0 && value < 1 ? 2 : 0,
    maximumFractionDigits: 6,
  }).format(value);
}

function formatShortDate(value: Date | string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recent";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getTransactionChain(transaction: Transaction): string | null {
  const metadata = transaction.metadata;
  const chain =
    metadata?.chain ||
    metadata?.network ||
    metadata?.sourceChain ||
    metadata?.targetChain ||
    metadata?.fromChain ||
    metadata?.toChain;

  return typeof chain === "string" && chain.trim()
    ? normalizeChain(chain)
    : null;
}

function getTransactionNumericAmount(transaction: Transaction): number | null {
  const providerAmount = getProviderAmount(transaction);
  if (providerAmount !== null) return providerAmount;

  const parsed =
    typeof transaction.amount === "string"
      ? Number(transaction.amount)
      : transaction.amount;

  return Number.isFinite(parsed) ? parsed : null;
}

function getChainColor(chain: string, index: number): string {
  const normalizedChain = normalizeChain(chain) as SupportedChainKeys;
  return (
    CHAIN_UI_DATA[normalizedChain]?.color ||
    FALLBACK_CHAIN_COLORS[index % FALLBACK_CHAIN_COLORS.length]
  );
}

function getShortChainLabel(chain: string): string {
  switch (normalizeChain(chain)) {
    case "base":
      return "Base";
    case "stellar":
      return "Stellar";
    case "celo":
      return "Celo";
    case "polygon":
      return "Polygon";
    case "bnb":
      return "BNB";
    default:
      return getChainLabel(chain).replace(" Network", "");
  }
}

function getAssetIcon(symbol: string) {
  return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase()}.png`;
}

export default function AssetDetailsPage({
  profile,
  symbol,
}: AssetDetailsPageProps) {
  const router = useRouter();
  const normalizedSymbol = symbol.toUpperCase();
  const { currencyCode } = useDetectCountry();
  const localCurrency = currencyCode || "USD";
  const { exchangeRate, isRateLoading } = useExchangeRate(localCurrency, null);
  const [tokenPrice, setTokenPrice] = useState(DEFAULT_TOKEN_PRICE);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [copiedAddressChain, setCopiedAddressChain] = useState<string | null>(
    null,
  );

  const assetHoldings = useMemo(
    () =>
      (profile.assets || []).filter(
        (asset): asset is Asset =>
          Boolean(asset) && asset.symbol?.toUpperCase() === normalizedSymbol,
      ),
    [normalizedSymbol, profile.assets],
  );

  useEffect(() => {
    let isCancelled = false;

    const loadPrice = async () => {
      setIsPriceLoading(true);

      try {
        const prices = await priceService.getMultipleTokenPrices([
          normalizedSymbol,
        ]);

        if (!isCancelled) {
          setTokenPrice(prices[normalizedSymbol] || DEFAULT_TOKEN_PRICE);
        }
      } catch {
        if (!isCancelled) {
          setTokenPrice(DEFAULT_TOKEN_PRICE);
        }
      } finally {
        if (!isCancelled) {
          setIsPriceLoading(false);
        }
      }
    };

    loadPrice();

    return () => {
      isCancelled = true;
    };
  }, [normalizedSymbol]);

  const supportedChainKeys = useMemo<string[]>(() => {
    if (normalizedSymbol === "USDC" || normalizedSymbol === "USDT") {
      return CHAIN_ORDER;
    }

    return [];
  }, [normalizedSymbol]);

  const chainBalances = useMemo<ChainBalance[]>(() => {
    const totals = new Map<string, number>();

    assetHoldings.forEach((asset) => {
      const chain = normalizeChain(asset.chain);
      if (HIDDEN_CHAINS.has(chain)) return;
      if (
        supportedChainKeys.length > 0 &&
        !supportedChainKeys.includes(chain)
      ) {
        return;
      }

      totals.set(chain, (totals.get(chain) || 0) + parseAmount(asset.amount));
    });

    supportedChainKeys.forEach((chain) => {
      if (!totals.has(chain)) totals.set(chain, 0);
    });

    const totalAmount = Array.from(totals.values()).reduce(
      (sum, amount) => sum + amount,
      0,
    );

    return Array.from(totals.entries())
      .map(([chain, amount], index) => ({
        chain,
        label: getShortChainLabel(chain),
        amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
        value: amount * tokenPrice * exchangeRate,
        color: getChainColor(chain, index),
      }))
      .sort((left, right) => {
        const leftIndex = CHAIN_ORDER.indexOf(left.chain as SupportedChainKeys);
        const rightIndex = CHAIN_ORDER.indexOf(
          right.chain as SupportedChainKeys,
        );

        if (leftIndex === -1 && rightIndex === -1) {
          return right.amount - left.amount;
        }
        if (leftIndex === -1) return 1;
        if (rightIndex === -1) return -1;
        return leftIndex - rightIndex;
      });
  }, [assetHoldings, exchangeRate, supportedChainKeys, tokenPrice]);

  const totalAmount = useMemo(
    () =>
      chainBalances.reduce(
        (runningTotal, balance) => runningTotal + balance.amount,
        0,
      ),
    [chainBalances],
  );
  const totalValue = totalAmount * tokenPrice * exchangeRate;
  const activeChainBalance =
    activeTab === "overview"
      ? null
      : chainBalances.find((item) => item.chain === activeTab) || null;
  const displayAmount = activeChainBalance?.amount ?? totalAmount;
  const displayValue = activeChainBalance?.value ?? totalValue;
  const isValueLoading = isRateLoading || isPriceLoading;
  const ringColor = activeChainBalance?.color || CHAIN_UI_DATA.base.color;
  const activeChainAddress = useMemo(() => {
    if (!activeChainBalance) return null;

    const account = (profile.chainAccounts || []).find(
      (chainAccount) =>
        normalizeChain(chainAccount.chain) === activeChainBalance.chain,
    );

    return account?.smartAccountAddress || account?.publicKey || null;
  }, [activeChainBalance, profile.chainAccounts]);
  const { data: allTransactions = [], isLoading: isTransactionsLoading } =
    useQuery({
      queryKey: ["transactions"],
      queryFn: async () => {
        const response = await transactionService.getTransactions();
        return response.data || [];
      },
      staleTime: 1000 * 60 * 2,
    });

  const activeChainTransactions = useMemo(() => {
    if (!activeChainBalance) return [];

    return allTransactions
      .filter((transaction) => {
        if (getTransactionSymbol(transaction) !== normalizedSymbol)
          return false;
        const transactionChain = getTransactionChain(transaction);
        return transactionChain === activeChainBalance.chain;
      })
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      );
  }, [activeChainBalance, normalizedSymbol, allTransactions]);

  const handleCopyAddress = async () => {
    if (!activeChainAddress || !activeChainBalance) return;

    const copied = await copyToClipboard(
      activeChainAddress,
      `${activeChainBalance.label} address copied`,
    );

    if (!copied) return;

    setCopiedAddressChain(activeChainBalance.chain);
    window.setTimeout(() => {
      setCopiedAddressChain((currentChain) =>
        currentChain === activeChainBalance.chain ? null : currentChain,
      );
    }, 2000);
  };

  const handleAction = (action: "send" | "buy" | "withdraw") => {
    const query = activeChainBalance
      ? `?asset=${normalizedSymbol}&network=${activeChainBalance.chain}`
      : `?asset=${normalizedSymbol}`;

    if (action === "send") router.push(`/send${query}`);
    if (action === "buy") router.push(`/buy${query}`);
    if (action === "withdraw") router.push(`/withdraw${query}`);
  };

  return (
    <div
      className={cn(
        "container mx-auto flex min-h-[90dvh] w-full flex-col px-4 pb-28 pt-4 md:px-6 md:pb-16 md:pt-20",
        activeChainBalance ? "max-w-2xl" : "max-w-5xl",
      )}
    >
      {/* ── Header — matches buy page pattern ── */}
      <div className="flex items-center justify-between mb-8 px-0 pt-0">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 bg-gray-100 dark:bg-secondary-60/50 rounded-full border border-slate-200 dark:border-none cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-white" />
        </button>

        <div className="flex items-center gap-2">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/5 bg-white dark:border-white/10 dark:bg-secondary-50">
            <Image
              src={getAssetIcon(normalizedSymbol)}
              alt={normalizedSymbol}
              width={24}
              height={24}
              className="object-contain p-0.5"
            />
          </span>
          <h2 className="text-lg font-bold text-black dark:text-white">
            {normalizedSymbol}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBalanceVisible((v) => !v)}
            aria-label={isBalanceVisible ? "Hide balances" : "Show balances"}
            className="p-2 rounded-full border border-black/5 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:border-none dark:bg-secondary-60/50 dark:text-gray-300 cursor-pointer"
          >
            {isBalanceVisible ? (
              <Eye className="h-5 w-5" />
            ) : (
              <EyeOff className="h-5 w-5" />
            )}
          </button>

          <ActionToolTip
            label={`${normalizedSymbol} balance is grouped across every supported network.`}
            side="left"
          >
            <button
              type="button"
              className="p-2 rounded-full border border-primary-60/30 bg-primary-70/10 text-primary-60 hover:bg-primary-70/15 dark:border-primary-70/50 dark:text-primary-80 cursor-pointer"
            >
              <Info className="h-5 w-5" />
            </button>
          </ActionToolTip>
        </div>
      </div>

      {/* ── Tab nav ── */}
      <nav className="-mx-4 border-b border-black/5 dark:border-white/10 md:mx-0">
        <div className="flex gap-1 overflow-x-auto px-4 md:px-0">
          {[
            { id: "overview", label: "Overview" },
            ...chainBalances.map((item) => ({
              id: item.chain,
              label: item.label,
            })),
          ].map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "cursor-pointer whitespace-nowrap border-b-2 px-3 pb-3 text-sm font-semibold transition",
                  isActive
                    ? "border-primary-60 text-primary-60 dark:text-primary-80"
                    : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          CHAIN TAB VIEW
      ══════════════════════════════════════════ */}
      {activeChainBalance ? (
        <main className="mx-auto flex w-full flex-1 flex-col gap-6 pt-8">
          {/* Balance hero */}
          <section className="flex flex-col items-center text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
              {activeChainBalance.label} balance
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-none text-black dark:text-white md:text-5xl">
              {isBalanceVisible ? formatTokenAmount(displayAmount) : "••••••"}{" "}
              <span className="text-gray-400 dark:text-gray-500 text-xl md:text-3xl">
                {normalizedSymbol}
              </span>
            </h2>
            {isValueLoading ? (
              <div className="mt-2 h-5 w-24 animate-pulse rounded-full bg-gray-100 dark:bg-secondary-60" />
            ) : (
              <p className="mt-2 text-base font-semibold text-primary-60 dark:text-primary-80">
                {isBalanceVisible
                  ? formatCurrencyAmount(displayValue, localCurrency)
                  : "••••••"}
              </p>
            )}
          </section>

          {/* Quick actions */}
          <section className="grid grid-cols-3 gap-3">
            {[
              { id: "send" as const, label: "Send", icon: ArrowUpRight },
              { id: "buy" as const, label: "Buy", icon: Plus },
              { id: "withdraw" as const, label: "Withdraw", icon: ArrowUp },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleAction(action.id)}
                  className="flex cursor-pointer flex-col items-center gap-2 text-gray-600 transition hover:text-primary-60 dark:text-gray-400 dark:hover:text-primary-80"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-secondary-50">
                    <Icon className="h-5 w-5 text-black dark:text-white" />
                  </span>
                  <span className="text-xs font-semibold">{action.label}</span>
                </button>
              );
            })}
          </section>

          {/* Receive address */}
          <section className="space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              Your {activeChainBalance.label} address
            </p>

            {/* Address pill — mono, full address, inline copy */}
            <div className="flex items-center gap-2 rounded-xl border border-black/5 bg-white p-3 dark:border-white/10 dark:bg-secondary-50">
              <p className="flex-1 text-xs font-mono break-all text-black dark:text-white">
                {activeChainAddress ||
                  `No ${activeChainBalance.label} address found`}
              </p>
              {activeChainAddress && (
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  aria-label="Copy address"
                  className="flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-secondary-60 cursor-copy"
                >
                  {copiedAddressChain === activeChainBalance.chain ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  )}
                </button>
              )}
            </div>

            {/* Disclaimer */}
            <p className="text-center text-[10px] text-gray-400 dark:text-gray-500">
              Only send {activeChainBalance.label} assets to this address.
            </p>
          </section>

          {/* Recent history */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold leading-tight text-black dark:text-white md:text-base">
                Recent History
              </h3>
              {activeChainTransactions.length > 0 && (
                <Link
                  href={`/transactions?network=${activeChainBalance.chain}&asset=${normalizedSymbol}`}
                  className="text-xs font-semibold text-primary-60 hover:text-primary-50 dark:text-primary-80 dark:hover:text-primary-70 transition-colors"
                >
                  See all
                </Link>
              )}
            </div>

            {isTransactionsLoading ? (
              <div className="overflow-hidden rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-secondary-50">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex animate-pulse items-center justify-between gap-3 border-b border-black/5 px-4 py-3 last:border-b-0 dark:border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-secondary-60" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-28 rounded-full bg-gray-100 dark:bg-secondary-60" />
                        <div className="h-2.5 w-20 rounded-full bg-gray-100 dark:bg-secondary-60" />
                      </div>
                    </div>
                    <div className="h-3 w-16 rounded-full bg-gray-100 dark:bg-secondary-60" />
                  </div>
                ))}
              </div>
            ) : activeChainTransactions.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-secondary-50 max-h-[420px] overflow-y-auto">
                {activeChainTransactions.slice(0, 8).map((transaction) => {
                  const isPositive = isPositiveTransaction(transaction.type);
                  const transactionAmount =
                    getTransactionNumericAmount(transaction);
                  const transactionValue =
                    transactionAmount !== null
                      ? transactionAmount * tokenPrice * exchangeRate
                      : null;
                  const DirectionIcon = isPositive
                    ? ArrowDownLeft
                    : ArrowUpRight;

                  return (
                    <button
                      key={transaction.id}
                      type="button"
                      onClick={() =>
                        router.push(`/transactions/${transaction.id}`)
                      }
                      className="flex w-full cursor-pointer items-center justify-between gap-3 border-b border-black/5 px-4 py-3 text-left transition last:border-b-0 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-secondary-60/40"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                            isPositive
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-primary-70/10 text-primary-60 dark:text-primary-80",
                          )}
                        >
                          <DirectionIcon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-black dark:text-white">
                            {getTransactionTitle(transaction)}
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-gray-500 dark:text-gray-400">
                            {formatShortDate(transaction.createdAt)}
                            <span className="mx-1">•</span>
                            <span
                              className={getTransactionStatusClasses(
                                transaction.status,
                              )}
                            >
                              {getTransactionStatusLabel(transaction.status)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <div className="text-right">
                          <p className="text-sm font-bold text-black dark:text-white">
                            {isBalanceVisible
                              ? getTransactionAmountLabel(transaction)
                              : "••••"}
                          </p>
                          {transactionValue !== null ? (
                            <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                              {isBalanceVisible
                                ? formatCurrencyAmount(
                                    transactionValue,
                                    localCurrency,
                                  )
                                : "••••"}
                            </p>
                          ) : null}
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                    </button>
                  );
                })}

                {activeChainTransactions.length > 8 && (
                  <Link
                    href={`/transactions?network=${activeChainBalance.chain}&asset=${normalizedSymbol}`}
                    className="flex w-full items-center justify-center gap-1 px-4 py-3 text-xs font-semibold text-primary-60 transition hover:bg-gray-50 dark:text-primary-80 dark:hover:bg-secondary-60/40"
                  >
                    View all {activeChainTransactions.length} transactions
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-black/5 bg-white p-5 text-center text-sm text-gray-500 dark:border-white/10 dark:bg-secondary-50 dark:text-gray-400">
                No recent {normalizedSymbol} activity on{" "}
                {activeChainBalance.label} yet.
              </div>
            )}
          </section>
        </main>
      ) : (
        /* ══════════════════════════════════════════
            OVERVIEW TAB — 2-column layout
        ══════════════════════════════════════════ */
        <main className="flex flex-1 flex-col gap-4 pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
            {/* Left — balance + donut */}
            <section className="flex flex-col items-center rounded-2xl border border-black/5 bg-white p-5 text-center shadow-sm dark:border-white/10 dark:bg-secondary-50">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                Total multi-chain balance
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-none text-black dark:text-white md:text-4xl">
                {isBalanceVisible ? formatTokenAmount(displayAmount) : "••••••"}{" "}
                <span className="text-gray-400 dark:text-gray-500 text-xl md:text-2xl">
                  {normalizedSymbol}
                </span>
              </h2>

              <div
                className="relative mt-6 flex h-40 w-40 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(${ringColor} 0deg 360deg)`,
                }}
              >
                <div className="absolute inset-4 rounded-full bg-white dark:bg-secondary-50" />
                <div className="relative z-10 px-4 text-center">
                  {isValueLoading ? (
                    <div className="mx-auto h-5 w-20 animate-pulse rounded-full bg-gray-100 dark:bg-secondary-60" />
                  ) : (
                    <p className="text-base font-bold text-black dark:text-white">
                      {isBalanceVisible
                        ? formatCurrencyAmount(displayValue, localCurrency)
                        : "••••••"}
                    </p>
                  )}
                  <p className="mt-0.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                    Total Value
                  </p>
                </div>
              </div>
            </section>

            {/* Right — distribution */}
            <section className="rounded-2xl border hover:bg-gray-50  bg-white/55 border-white/70 p-4 shadow-sm dark:border-white/10  dark:bg-secondary-50/20 ">
              <div className="mb-3">
                <h3 className="text-[15px] font-semibold leading-tight text-black dark:text-white md:text-base">
                  Balance Distribution
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  Across supported networks
                </p>
              </div>

              <div className="space-y-2">
                {chainBalances.map((item) => (
                  <button
                    key={item.chain}
                    type="button"
                    onClick={() => setActiveTab(item.chain)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-left transition",
                      activeTab === item.chain
                        ? "border-primary-60/40 bg-primary-70/5"
                        : "border-black/5 bg-white hover:bg-gray-100 dark:border-white/5 dark:bg-secondary-50 dark:hover:bg-secondary-60/60",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold uppercase tracking-normal text-black dark:text-white">
                          {item.label}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {isBalanceVisible
                            ? formatCurrencyAmount(item.value, localCurrency)
                            : "••••"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs font-bold text-black dark:text-white">
                        {isBalanceVisible
                          ? formatTokenAmount(item.amount)
                          : "••••"}{" "}
                        <span className="font-medium text-gray-400">
                          {normalizedSymbol}
                        </span>
                      </p>
                      <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                        {item.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </main>
      )}
    </div>
  );
}
