"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Landmark,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BankDetail } from "@/types/db";
import SummaryPill from "@/components/wallet/buy-crypto/SummaryPill";

interface BankSelectionStepProps {
  asset: string | null;
  amount: string;
  amountUnit: string | null;
  selectedChain?: { name: string } | null;
  selectedBank: BankDetail | null;
  savedBanks: BankDetail[];
  providerName: string | null;
  onSelectSavedBank: (bank: BankDetail) => void;
  onOpenBankModal: () => void;
  onContinue: () => void;
}

export function WithdrawBankSelectionStep({
  asset,
  amount,
  amountUnit,
  selectedChain,
  selectedBank,
  savedBanks,
  providerName,
  onSelectSavedBank,
  onOpenBankModal,
  onContinue,
}: BankSelectionStepProps) {
  const isPaycrest = providerName?.toLowerCase() === "paycrest";

  return (
    <div className="flex h-full min-h-[calc(100dvh-200px)] flex-col md:min-h-[500px]">
      <div className="flex-1 overflow-y-auto md:px-0">
        <SummaryPill
          asset={asset}
          selectedChain={selectedChain}
          amount={amount}
          fiatCurrency={amountUnit || undefined}
        />

        <div className="mt-8">
          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            {isPaycrest ? "Refund Account (Required)" : "Bank Details"}
          </h3>

          {isPaycrest ? (
            <>
              <p className="mb-8 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                Paycrest requires a fallback bank account for potential fiat
                refunds if the withdrawal cannot be completed.
              </p>

              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Saved Accounts
                  </h3>
                  {savedBanks.length ? (
                    <span className="text-[10px] text-gray-400">
                      {savedBanks.length} saved
                    </span>
                  ) : null}
                </div>

                {savedBanks.length ? (
                  <div className="space-y-3">
                    {savedBanks.map((bank) => {
                      const isSelected = bank.id === selectedBank?.id;

                      return (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => onSelectSavedBank(bank)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-[24px] border px-5 py-5 text-left transition-all",
                            isSelected
                              ? "border-primary-60 bg-primary-70/5 ring-2 ring-primary-60/20"
                              : "border-black/5 bg-white hover:bg-gray-50 dark:border-white/10 dark:bg-secondary-50 dark:hover:bg-secondary-60/50",
                          )}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-lg font-semibold text-black dark:text-white">
                              {bank.bankName}
                            </p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {bank.accountNumber} • {bank.accountName}
                            </p>
                          </div>

                          {isSelected ? (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-70" />
                          ) : (
                            <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-black/10 bg-white px-5 py-10 text-center dark:border-white/10 dark:bg-secondary-50/10">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      No saved accounts yet
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Add a refund account before reviewing this withdrawal.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onOpenBankModal}
                className="flex w-full items-center gap-3 rounded-[24px] border border-dashed border-primary-60/70 bg-primary-70/5 px-5 py-5 text-left text-primary-60 transition hover:bg-primary-70/10"
              >
                <div className="rounded-full border border-primary-60/60 p-1.5">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-base font-semibold">
                  Add New Bank Details
                </span>
              </button>
            </>
          ) : (
            <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-secondary-50/10 md:p-6">
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  New Account
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenBankModal}
                className="flex w-full items-center justify-between rounded-2xl border border-gray-80 bg-gray-95 px-4 py-4 text-left transition-colors hover:bg-gray-90 dark:border-white/10 dark:bg-secondary-50 dark:hover:bg-secondary-60/70"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl border border-black/5 bg-white p-3 text-primary-70 dark:border-white/10 dark:bg-secondary-60/60">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-black dark:text-white">
                      {selectedBank
                        ? selectedBank.bankName
                        : "Select your bank"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {selectedBank
                        ? selectedBank.accountName
                        : "Choose a saved account or add a new one"}
                    </p>
                  </div>
                </div>
                {selectedBank ? (
                  <span className="text-xs font-semibold text-primary-60">
                    Change
                  </span>
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>

              <div className="mt-4 rounded-2xl border border-gray-80 bg-gray-95 px-4 py-4 dark:border-white/10 dark:bg-secondary-50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Account Number
                </p>
                <p className="mt-3 text-base font-semibold text-black dark:text-white">
                  {selectedBank?.accountNumber || "Select a bank account"}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {selectedBank
                    ? `${selectedBank.accountName} • ${selectedBank.bankName}`
                    : "Verification happens when you add a new bank"}
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenBankModal}
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary-60 bg-primary-70/5 px-3 py-2 text-xs font-semibold text-primary-60 ring-2 ring-primary-60/20 transition hover:bg-primary-70/5"
              >
                <Plus className="h-4 w-4" />
                Add New Account
              </button>
            </section>
          )}

          {!isPaycrest ? (
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Recent Accounts
                </h3>
                {savedBanks.length ? (
                  <span className="text-[10px] text-gray-400">
                    {savedBanks.length} saved
                  </span>
                ) : null}
              </div>

              {savedBanks.length ? (
                <div className="space-y-3">
                  {savedBanks.map((bank) => {
                    const isSelected = bank.id === selectedBank?.id;

                    return (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => onSelectSavedBank(bank)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all",
                          isSelected
                            ? "border-primary-60 bg-primary-70/5 ring-2 ring-primary-60/20"
                            : "border-black/5 bg-white hover:bg-gray-50 dark:border-white/10 dark:bg-secondary-50 dark:hover:bg-secondary-60/50",
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="rounded-2xl border border-black/5 bg-gray-95 p-3 text-primary-70 dark:border-white/10 dark:bg-secondary-40">
                            <Landmark className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-black dark:text-white">
                              {bank.bankName}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {bank.accountName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {bank.accountNumber}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <CheckCircle2 className="h-5 w-5 text-primary-70" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-black/10 bg-white px-5 py-10 text-center dark:border-white/10 dark:bg-secondary-50/10">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    No recent accounts yet
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Add a bank account to continue your withdrawal.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 mt-6 border-t border-black/5 px-4 pb-4 pt-6 dark:border-white/5 md:px-0">
        <div className="mx-auto max-w-md md:max-w-full">
          <button
            type="button"
            onClick={onContinue}
            disabled={!selectedBank}
            className={cn(
              "group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary-70 to-primary-60 py-3.5 font-bold text-white shadow-lg transition-all md:py-4",
              "hover:shadow-xl active:scale-[0.98]",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
              !selectedBank && "from-gray-400 to-gray-500",
            )}
          >
            <span className="relative z-10 flex items-center justify-center gap-2 text-sm md:text-base">
              {!selectedBank ? (
                isPaycrest ? (
                  "Select Refund Account"
                ) : (
                  "Select Bank to Continue"
                )
              ) : (
                <>
                  {isPaycrest ? "Review Order" : "Review Withdrawal"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
