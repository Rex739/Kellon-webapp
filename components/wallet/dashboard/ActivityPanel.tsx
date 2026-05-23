import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/db";
import { ActivityListSkeleton } from "./DashboardSkeletons";
import {
  formatRelativeDate,
  getTransactionAmountLabel,
  getTransactionStatusClasses,
  getTransactionStatusLabel,
  getTransactionTitle,
  isPositiveTransaction,
} from "./dashboard-utils";

interface ActivityPanelProps {
  isBalanceVisible: boolean;
  isTransactionsLoading: boolean;
  recentTransactions: Transaction[];
  transactionsError: string | null;
}

export default function ActivityPanel({
  isBalanceVisible,
  isTransactionsLoading,
  recentTransactions,
  transactionsError,
}: ActivityPanelProps) {
  return (
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
        <ActivityListSkeleton />
      ) : transactionsError ? (
        <ActivityEmptyState
          title="Activity unavailable"
          text={transactionsError}
        />
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
                          getTransactionStatusClasses(transaction.status),
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
        <ActivityEmptyState
          title="No transactions yet"
          text="Your financial journey starts with your first deposit."
        />
      )}
    </div>
  );
}

function ActivityEmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex min-h-[250px] flex-1 flex-col items-center justify-center rounded-xl border border-black/5 bg-gray-50 p-8 text-center dark:border-white/10 dark:bg-secondary-50 md:rounded-lg">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-gray-200 dark:border-white/5 dark:bg-white/5 md:mb-5 md:h-14 md:w-14">
        <Clock
          size={24}
          className="text-gray-400 dark:text-gray-600 md:h-7 md:w-7"
        />
      </div>
      <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 md:text-base">
        {title}
      </h4>
      <p className="max-w-[220px] text-xs text-gray-400 dark:text-gray-500 md:text-sm">
        {text}
      </p>
    </div>
  );
}
