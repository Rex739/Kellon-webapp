"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Landmark,
  Loader2,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { bankService } from "@/services/api/bank";
import { providerService } from "@/services/api/payment-providers";
import type { BankDetail } from "@/types/db";
import type { SelectableBank } from "@/components/modals/SelectBankModal";
import SummaryPill from "../SummaryPill";

interface BuyBankSelectionStepProps {
  asset: string | null;
  amount: string;
  fiatCurrency: string;
  selectedChain?: { name: string } | null;
  selectedBank: BankDetail | null;
  savedBanks: BankDetail[];
  selectedProviderName?: string | null;
  selectedProviderBank: SelectableBank | null;
  onSelectProviderBank: (bank: SelectableBank | null) => void;
  onSelectSavedBank: (bank: BankDetail) => void;
  onOpenBankModal: () => void;
  onAddVerifiedBank: (bank: BankDetail) => void;
  onContinue: () => void;
}

export function BuyBankSelectionStep({
  asset,
  amount,
  fiatCurrency,
  selectedChain,
  selectedBank,
  savedBanks,
  selectedProviderName,
  selectedProviderBank,
  onSelectProviderBank,
  onSelectSavedBank,
  onOpenBankModal,
  onAddVerifiedBank,
  onContinue,
}: BuyBankSelectionStepProps) {
  const [accountNumber, setAccountNumber] = useState("");
  const [verifiedAccount, setVerifiedAccount] = useState<BankDetail | null>(
    null,
  );
  const [verificationError, setVerificationError] = useState("");
  const [saveForFuture, setSaveForFuture] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const lastVerificationKeyRef = useRef("");
  const providerKey = selectedProviderName?.toLowerCase() || "";
  const isPaycrest = providerKey === "paycrest";

  useEffect(() => {
    setAccountNumber("");
    setVerifiedAccount(null);
    setVerificationError("");
    lastVerificationKeyRef.current = "";
  }, [selectedProviderBank?.value]);

  useEffect(() => {
    const hasValidAccountNumber = /^\d{10}$/.test(accountNumber);

    if (!selectedProviderBank || !hasValidAccountNumber) {
      setVerifiedAccount(null);
      setVerificationError("");
      lastVerificationKeyRef.current = "";
      return;
    }

    const verificationKey = `${selectedProviderBank.value}:${accountNumber}`;
    if (lastVerificationKeyRef.current === verificationKey) return;

    let cancelled = false;

    const verifyBank = async () => {
      lastVerificationKeyRef.current = verificationKey;
      setIsVerifying(true);
      setVerifiedAccount(null);
      setVerificationError("");

      try {
        if (isPaycrest) {
          const response = await providerService.verifyPaycrestAccount({
            institution: selectedProviderBank.value,
            accountIdentifier: accountNumber,
            currency: fiatCurrency,
            save: false,
            bankName: selectedProviderBank.label,
          });

          if (cancelled) return;

          const accountName = response.data.accountName;
          if (!accountName) {
            setVerificationError(
              "Account verified, but the provider did not return an account name.",
            );
            return;
          }

          setVerifiedAccount({
            id: `paycrest:${selectedProviderBank.value}:${accountNumber}`,
            bankName: response.data.bankName || selectedProviderBank.label,
            bankCode: response.data.bankCode || selectedProviderBank.value,
            accountNumber: response.data.accountNumber || accountNumber,
            accountName,
            country: fiatCurrency,
            provider: "paycrest",
          });
        } else {
          const response = await providerService.verifyBank({
            bankCode: selectedProviderBank.value,
            accountNumber,
            save: false,
            bankName: selectedProviderBank.label,
          });

          if (cancelled) return;

          const accountName = response.data.accountName;
          if (!accountName) {
            setVerificationError(
              "Account verified, but the provider did not return an account name.",
            );
            return;
          }

          setVerifiedAccount({
            id: `centiiv:${selectedProviderBank.value}:${accountNumber}`,
            bankName: response.data.bankName || selectedProviderBank.label,
            bankCode: response.data.bankCode || selectedProviderBank.value,
            accountNumber: response.data.accountNumber || accountNumber,
            accountName,
            country: fiatCurrency,
            provider: "centiiv",
          });
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Bank verification failed";
          setVerificationError(message);
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setIsVerifying(false);
        }
      }
    };

    verifyBank();

    return () => {
      cancelled = true;
    };
  }, [accountNumber, fiatCurrency, isPaycrest, selectedProviderBank]);

  const handleAccountNumberChange = (value: string) => {
    if (!/^\d{0,10}$/.test(value)) return;

    setAccountNumber(value);

    if (value.length !== 10) {
      setVerifiedAccount(null);
      setVerificationError("");
    }
  };

  const handleUseVerifiedBank = async () => {
    if (!verifiedAccount) return;

    setIsSaving(true);
    try {
      if (saveForFuture) {
        const saved = await bankService.addBank({
          bankName: verifiedAccount.bankName,
          bankCode: verifiedAccount.bankCode,
          accountNumber: verifiedAccount.accountNumber,
          accountName: verifiedAccount.accountName,
          country: verifiedAccount.country || fiatCurrency,
          provider: verifiedAccount.provider,
        });

        if (!saved.success || !saved.data) {
          throw new Error("Unable to save bank details");
        }

        onAddVerifiedBank(saved.data);
        toast.success("Bank saved successfully");
      } else {
        onAddVerifiedBank(verifiedAccount);
      }

      onSelectProviderBank(null);
      setAccountNumber("");
      setVerifiedAccount(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to add bank details";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-[calc(100dvh-200px)] flex-col md:min-h-[500px]">
      <div className="flex-1 overflow-y-auto md:px-0">
        <SummaryPill
          asset={asset}
          selectedChain={selectedChain}
          amount={amount}
          fiatCurrency={fiatCurrency}
        />

        <div className="mt-8">
          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Refund Account (Required)
          </h3>
          <p className="mb-5 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            Paycrest requires a bank account for potential fiat refunds if the
            crypto purchase fails.
          </p>

          <div className="mb-5">
            <div className="mb-3 flex items-center justify-between">
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
              <div className="space-y-2">
                {savedBanks.map((bank) => {
                  const isSelected = bank.id === selectedBank?.id;

                  return (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => onSelectSavedBank(bank)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all",
                        isSelected
                          ? "border-primary-60 bg-primary-70/5 ring-2 ring-primary-60/20"
                          : "border-black/5 bg-white hover:bg-gray-50 dark:border-white/10 dark:bg-secondary-50 dark:hover:bg-secondary-60/50",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-black dark:text-white">
                          {bank.bankName}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
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
              <div className="rounded-2xl border border-dashed border-black/10 bg-white px-4 py-6 text-center dark:border-white/10 dark:bg-secondary-50/10">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  No saved accounts yet
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Add a refund account before reviewing this purchase.
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenBankModal}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary-60/60 bg-primary-70/5 px-4 py-3 text-left text-primary-60 transition hover:bg-primary-70/10"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-semibold">Add New Bank Details</span>
          </button>

          {selectedBank ? (
            <div className="mt-4 rounded-2xl border border-primary-80 bg-primary-95/70 p-3 dark:border-primary-70/20 dark:bg-primary-70/10">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-50 dark:text-primary-80">
                <ShieldCheck className="h-4 w-4" />
                Selected refund account
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-30 dark:text-gray-40">
                    Bank name
                  </span>
                  <span className="text-right text-sm font-semibold text-cryptoNight dark:text-white">
                    {selectedBank.bankName}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-30 dark:text-gray-40">
                    Account number
                  </span>
                  <span className="text-right text-sm font-semibold text-cryptoNight dark:text-white">
                    {selectedBank.accountNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-30 dark:text-gray-40">
                    Account name
                  </span>
                  <span className="text-right text-sm font-semibold text-cryptoNight dark:text-white">
                    {selectedBank.accountName}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {selectedProviderBank ? (
            <div className="mt-4 space-y-3 rounded-2xl border border-gray-90 bg-white p-3 dark:border-white/10 dark:bg-secondary-50/70">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-95 text-primary-60 dark:bg-primary-70/10 dark:text-primary-80">
                  {selectedProviderBank.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedProviderBank.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Landmark className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-cryptoNight dark:text-white">
                    {selectedProviderBank.label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenBankModal}
                  className="text-xs font-semibold text-primary-60 transition hover:text-primary-50"
                >
                  Change
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-mid text-gray-30 dark:text-gray-40">
                  Account Number
                </label>
                <div className="relative">
                  <Input
                    value={accountNumber}
                    onChange={(event) =>
                      handleAccountNumberChange(event.target.value)
                    }
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit account number"
                    className="h-11 rounded-2xl border-gray-80 bg-gray-95 text-sm text-cryptoNight placeholder:text-gray-30 focus-visible:ring-primary-70/20 dark:border-white/10 dark:bg-secondary-60 dark:text-white dark:placeholder:text-gray-40"
                  />
                  {isVerifying ? (
                    <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary-60" />
                  ) : null}
                </div>
                {accountNumber.length > 0 && accountNumber.length < 10 ? (
                  <p className="text-xs text-gray-30 dark:text-gray-40">
                    Account number must be exactly 10 digits.
                  </p>
                ) : null}
                {verificationError ? (
                  <p className="text-xs font-medium text-red-500">
                    {verificationError}
                  </p>
                ) : null}
              </div>

              {verifiedAccount ? (
                <div className="rounded-2xl border border-primary-80 bg-primary-95/70 p-3 dark:border-primary-70/20 dark:bg-primary-70/10">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-50 dark:text-primary-80">
                    <ShieldCheck className="h-4 w-4" />
                    Bank account verified
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-30 dark:text-gray-40">
                        Bank name
                      </span>
                      <span className="text-right text-sm font-semibold text-cryptoNight dark:text-white">
                        {verifiedAccount.bankName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-30 dark:text-gray-40">
                        Account number
                      </span>
                      <span className="text-right text-sm font-semibold text-cryptoNight dark:text-white">
                        {verifiedAccount.accountNumber}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-30 dark:text-gray-40">
                        Account name
                      </span>
                      <span className="text-right text-sm font-semibold text-cryptoNight dark:text-white">
                        {verifiedAccount.accountName}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-between rounded-2xl bg-gray-95 px-3 py-2 dark:bg-secondary-60/50">
                <div>
                  <p className="text-xs font-medium text-cryptoNight dark:text-white">
                    Save bank for future use
                  </p>
                </div>
                <Switch
                  checked={saveForFuture}
                  onCheckedChange={setSaveForFuture}
                  className="data-[state=checked]:bg-primary-60"
                />
              </div>

              <button
                type="button"
                onClick={handleUseVerifiedBank}
                disabled={!verifiedAccount || isSaving}
                className="w-full rounded-2xl bg-gradient-to-r from-primary-70 to-primary-60 py-3 text-sm font-bold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Use This Bank"
                )}
              </button>
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
                "Select Refund Account"
              ) : (
                <>
                  Review Order
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </button>
        </div>
      </div>
    </div>
  );
}
