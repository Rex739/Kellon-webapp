import type { Transaction } from "@/types/db";

export type DisplayCurrency = "LOCAL" | "USD";

export interface GroupedAssetSummary {
  symbol: string;
  name: string;
  amount: number;
  usdValue: number;
  localValue: number;
  chainCount: number;
  primaryChain: string | null;
}

export interface DashboardTransactionState {
  transactions: Transaction[];
  recentTransactions: Transaction[];
  isTransactionsLoading: boolean;
  transactionsError: string | null;
}
