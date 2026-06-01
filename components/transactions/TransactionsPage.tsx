"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import HydrationSafeRelativeTime from "@/components/HydrationSafeRelativeTime";
import { cn } from "@/lib/utils";
import { transactionService } from "@/services/api/transactions";
import type { Transaction } from "@/types/db";
import TransactionFilterModal, {
  type ActivityFilter,
} from "@/components/modals/TransactionFilterModal";

type QuickTab = "all" | "sent" | "received";

const QUICK_TABS: QuickTab[] = ["all", "sent", "received"];

function formatAssetAmount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value > 0 && value < 1 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
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

function getMetadataSymbol(metadata: Transaction["metadata"]): string | null {
  const symbol =
    metadata?.cryptoCurrencyCode ||
    metadata?.cryptoCurrency ||
    metadata?.token ||
    metadata?.asset ||
    metadata?.toAsset ||
    metadata?.targetAsset;

  return typeof symbol === "string" && symbol.trim()
    ? symbol.toUpperCase()
    : null;
}

function getTransactionSymbol(transaction: Transaction): string {
  const metadata = transaction.metadata;
  const provider = metadata?.provider?.toLowerCase();

  if (transaction.type === "BUY") {
    return getMetadataSymbol(metadata) || transaction.symbol;
  }

  switch (provider) {
    case "paycrest":
      return getMetadataSymbol(metadata) || transaction.symbol;
    case "centiiv":
      return getMetadataSymbol(metadata) || transaction.symbol;
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

function parseTransactionAmount(amount: Transaction["amount"]): number | null {
  const parsed = typeof amount === "string" ? Number(amount) : amount;
  return Number.isFinite(parsed) ? parsed : null;
}

function getTransactionDisplayAmount(transaction: Transaction): number | null {
  const providerAmount = getProviderAmount(transaction);
  if (providerAmount !== null) return providerAmount;

  if (["TRANSFER_IN", "TRANSFER_OUT"].includes(transaction.type)) {
    return parseTransactionAmount(transaction.amount);
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
  const amount = getTransactionDisplayAmount(transaction);
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

function matchesActivityFilter(
  transaction: Transaction,
  filter: ActivityFilter,
): boolean {
  const method = (transaction.executionMethod || "").toLowerCase();
  const metadata = JSON.stringify(transaction.metadata || {}).toLowerCase();

  switch (filter) {
    case "all":
      return true;
    case "sent":
      return ["TRANSFER_OUT", "SELL"].includes(transaction.type);
    case "received":
      return ["TRANSFER_IN"].includes(transaction.type);
    case "withdraw":
      return transaction.type === "WITHDRAW";
    case "deposit":
      return ["BUY", "DEPOSIT"].includes(transaction.type);
    case "invoices":
      return method.includes("invoice") || metadata.includes("invoice");
    case "gifts":
      return method.includes("gift") || metadata.includes("gift");
    case "cards":
      return method.includes("card") || metadata.includes("card");
    case "earn":
      return (
        method.includes("earn") ||
        method.includes("yield") ||
        metadata.includes("earn") ||
        metadata.includes("yield")
      );
    default:
      return true;
  }
}

function normalizeDate(value: string | null, endOfDay = false): number | null {
  if (!value) return null;

  const date = new Date(
    `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`,
  );
  if (Number.isNaN(date.getTime())) return null;
  return date.getTime();
}

function TransactionListSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center justify-between gap-4 border-b border-black/5 px-4 py-4 last:border-b-0 dark:border-white/10 md:px-5"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-full bg-gray-100 dark:bg-secondary-60" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-28 rounded-full bg-gray-100 dark:bg-secondary-60" />
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-12 rounded-full bg-gray-100 dark:bg-secondary-60" />
                <div className="h-1 w-1 rounded-full bg-gray-200 dark:bg-secondary-60" />
                <div className="h-2.5 w-14 rounded-full bg-gray-100 dark:bg-secondary-60" />
              </div>
            </div>
          </div>
          <div className="h-3.5 w-20 shrink-0 rounded-full bg-gray-100 dark:bg-secondary-60" />
        </div>
      ))}
    </>
  );
}

export default function TransactionsPage() {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeQuickTab, setActiveQuickTab] = useState<QuickTab>("all");
  const [appliedActivityFilter, setAppliedActivityFilter] =
    useState<ActivityFilter>("all");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [draftActivityFilter, setDraftActivityFilter] =
    useState<ActivityFilter>("all");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await transactionService.getTransactions();
      return response.data || [];
    },
  });

  const transactions = useMemo(() => data || [], [data]);
  const filteredTransactions = useMemo(() => {
    const startTime = normalizeDate(appliedStartDate);
    const endTime = normalizeDate(appliedEndDate, true);

    return [...transactions]
      .filter((transaction) => {
        if (activeQuickTab === "sent") {
          if (!matchesActivityFilter(transaction, "sent")) return false;
        } else if (activeQuickTab === "received") {
          if (!matchesActivityFilter(transaction, "received")) return false;
        }

        if (!matchesActivityFilter(transaction, appliedActivityFilter)) {
          return false;
        }

        const timestamp = new Date(transaction.createdAt).getTime();
        if (startTime !== null && timestamp < startTime) return false;
        if (endTime !== null && timestamp > endTime) return false;

        return true;
      })
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      );
  }, [
    transactions,
    activeQuickTab,
    appliedActivityFilter,
    appliedStartDate,
    appliedEndDate,
  ]);

  const openFilters = () => {
    setDraftActivityFilter(appliedActivityFilter);
    setDraftStartDate(appliedStartDate);
    setDraftEndDate(appliedEndDate);
    setIsFilterOpen(true);
  };

  const resetFilters = () => {
    setAppliedActivityFilter("all");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setDraftActivityFilter("all");
    setDraftStartDate("");
    setDraftEndDate("");
    setIsFilterOpen(false);
  };

  const applyFilters = () => {
    setAppliedActivityFilter(draftActivityFilter);
    setAppliedStartDate(draftStartDate);
    setAppliedEndDate(draftEndDate);
    setIsFilterOpen(false);
  };

  return (
    <section className="container mx-auto flex h-[100dvh] max-w-4xl flex-col overflow-hidden px-4 pb-28 pt-4 md:px-6 md:pb-12 md:pt-28">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-black/5 bg-white p-2 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-secondary-50 dark:hover:bg-secondary-60/50 cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <h1 className="text-lg font-semibold text-black dark:text-white md:text-2xl">
          Transactions
        </h1>

        <button
          type="button"
          onClick={openFilters}
          className="rounded-full border border-black/5 bg-white p-2 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-secondary-50 dark:hover:bg-secondary-60/50 cursor-pointer"
          aria-label="Open filters"
        >
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      <TransactionFilterModal
        isOpen={isFilterOpen}
        onClose={setIsFilterOpen}
        activityFilter={draftActivityFilter}
        startDate={draftStartDate}
        endDate={draftEndDate}
        onActivityFilterChange={setDraftActivityFilter}
        onStartDateChange={setDraftStartDate}
        onEndDateChange={setDraftEndDate}
        onReset={resetFilters}
        onApply={applyFilters}
      />

      {/* Quick Tabs */}
      <div className="mt-5 overflow-x-auto">
        <div className="flex min-w-max gap-2 rounded-full border border-black/5 bg-white p-1 dark:border-white/10 dark:bg-secondary-50">
          {QUICK_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveQuickTab(tab)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium capitalize transition md:px-5 cursor-pointer",
                activeQuickTab === tab
                  ? "bg-primary-60 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-secondary-50">
          {isLoading ? (
            <TransactionListSkeleton />
          ) : error ? (
            <div className="rounded-2xl border border-black/5 bg-white p-6 text-center dark:border-white/10 dark:bg-secondary-50">
              <p className="text-xs text-red-500 dark:text-red-400">
                {error instanceof Error
                  ? error.message
                  : "Failed to load transactions."}
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-3 rounded-full bg-gray-100 p-3 dark:bg-secondary-60/50">
                <ArrowUpRight className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                No transactions yet
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Your transactions will appear here
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <Link
                key={transaction.id}
                href={`/transactions/${transaction.id}`}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-4 border-b border-black/5 px-4 py-4 transition-colors last:border-b-0 md:px-5",
                  "hover:bg-gray-95 dark:border-white/10 dark:hover:bg-secondary-60/40",
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      isPositiveTransaction(transaction.type)
                        ? "bg-primary-95 dark:bg-primary-70/15"
                        : "bg-gray-95 dark:bg-secondary-60",
                    )}
                  >
                    {isPositiveTransaction(transaction.type) ? (
                      <ArrowDownLeft className="h-4 w-4 text-primary-60 dark:text-primary-80" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-black dark:text-white">
                      {getTransactionTitle(transaction)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        <HydrationSafeRelativeTime
                          value={transaction.createdAt}
                        />
                      </span>
                      <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                      <span
                        className={cn(
                          "text-[10px] font-medium",
                          getTransactionStatusClasses(transaction.status),
                        )}
                      >
                        {getTransactionStatusLabel(transaction.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-black dark:text-white">
                      {getTransactionAmountLabel(transaction)}
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
