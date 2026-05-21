"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import ChainIcon from "@/components/wallet/ChainIcon";
import SummaryPill from "@/components/wallet/buy-crypto/SummaryPill";
import type { BankDetail } from "@/types/db";

interface ReviewStepProps {
  amount: string;
  asset: string | null;
  amountUnit: string | null;
  selectedChain?: { name: string } | null;
  selectedProvider: { name: string } | null;
  selectedBank: BankDetail | null;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function WithdrawReviewStep({
  amount,
  asset,
  amountUnit,
  selectedChain,
  selectedProvider,
  selectedBank,
  onConfirm,
  isSubmitting,
}: ReviewStepProps) {
  return (
    <div className="flex h-full min-h-[calc(100dvh-200px)] flex-col md:min-h-[500px]">
      <div className="flex-1 animate-in fade-in slide-in-from-bottom-4">
        <SummaryPill
          asset={asset}
          selectedChain={selectedChain}
          amount={amount}
          fiatCurrency={amountUnit || undefined}
        />

        <div className="mb-8 w-full rounded-[28px] border border-black/5 bg-white p-6 dark:border-white/10 dark:bg-secondary-50">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Withdrawal Amount
              </span>
              <span className="text-sm font-bold text-black dark:text-white">
                {amount} {amountUnit || asset}
              </span>
            </div>

            <div className="h-px w-full bg-slate-200 dark:bg-white/5" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Asset Sold
              </span>
              <span className="text-sm font-bold text-black dark:text-white">
                {asset}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Blockchain
              </span>
              <div className="flex items-center gap-2">
                {selectedChain ? (
                  <ChainIcon name={selectedChain.name} size={16} />
                ) : null}
                <span className="text-sm font-bold text-black capitalize dark:text-white">
                  {selectedChain?.name}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Provider
              </span>
              <span className="text-sm font-bold text-black dark:text-white">
                {selectedProvider?.name}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-gray-500">Bank</span>
              <div className="text-right">
                <p className="text-sm font-bold text-black dark:text-white">
                  {selectedBank?.bankName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedBank?.accountName} • {selectedBank?.accountNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-4 pb-6">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="group relative w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-primary-70 to-primary-60 py-3.5 font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 text-sm md:text-base">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Initializing withdrawal
                </>
              ) : (
                <>
                  <ShieldCheck className="h-6 w-6" />
                  Initialize Withdrawal
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
