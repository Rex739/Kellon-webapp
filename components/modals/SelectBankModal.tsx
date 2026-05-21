"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Landmark,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  providerService,
  type CentiivBank,
  type PaycrestInstitution,
} from "@/services/api/payment-providers";
import { bankService } from "@/services/api/bank";
import type { BankDetail } from "@/types/db";
import { cn } from "@/lib/utils";

type AvailableBank = {
  label: string;
  value: string;
};

interface SelectBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  providerName: string | null;
  savedBanks: BankDetail[];
  selectedBankId: string | null;
  onSelectSavedBank: (bank: BankDetail) => void;
  onAddVerifiedBank: (bank: BankDetail) => void;
}

export default function SelectBankModal({
  isOpen,
  onClose,
  currency,
  providerName,
  savedBanks,
  selectedBankId,
  onSelectSavedBank,
  onAddVerifiedBank,
}: SelectBankModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [view, setView] = useState<"list" | "add">("list");
  const [bankOptions, setBankOptions] = useState<AvailableBank[]>([]);
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [selectedBankName, setSelectedBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [verifiedAccountName, setVerifiedAccountName] = useState("");
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const providerKey = providerName?.toLowerCase() || "";

  useEffect(() => {
    if (!isOpen) {
      setView("list");
      setSelectedBankCode("");
      setSelectedBankName("");
      setAccountNumber("");
      setVerifiedAccountName("");
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || view !== "add") return;

    let cancelled = false;

    const loadBanks = async () => {
      setIsLoadingBanks(true);
      try {
        if (providerKey === "paycrest") {
          const response =
            await providerService.getPaycrestInstitutions(currency);
          if (cancelled) return;
          const options = (response.data || []).map(
            (bank: PaycrestInstitution) => ({
              label: String(
                bank.name || bank.institution || bank.code || "Bank",
              ),
              value: String(bank.code || bank.id || bank.institution || ""),
            }),
          );
          setBankOptions(options.filter((option) => option.value));
        } else {
          const response = await providerService.getBankList();
          if (cancelled) return;
          const options = (response.data || []).map((bank: CentiivBank) => ({
            label: bank.name,
            value: bank.code,
          }));
          setBankOptions(options);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load banks:", error);
          toast.error("Unable to load bank list");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingBanks(false);
        }
      }
    };

    loadBanks();

    return () => {
      cancelled = true;
    };
  }, [currency, isOpen, providerKey, view]);

  const selectedSavedBank = useMemo(
    () => savedBanks.find((bank) => bank.id === selectedBankId) || null,
    [savedBanks, selectedBankId],
  );

  const verifyBank = async () => {
    if (!selectedBankCode || accountNumber.length < 10) return;

    setIsVerifying(true);
    try {
      if (providerKey === "paycrest") {
        const response = await providerService.verifyPaycrestAccount({
          institution: selectedBankCode,
          accountIdentifier: accountNumber,
          currency,
          bankName: selectedBankName,
        });

        const accountName =
          response.data?.accountName ||
          response.data?.institutionName ||
          response.data?.bankName;

        if (!accountName) {
          throw new Error("Unable to verify account");
        }

        const saved = await bankService.addBank({
          bankName: selectedBankName,
          bankCode: selectedBankCode,
          accountNumber,
          accountName,
          country: currency,
        });

        if (saved.success && saved.data) {
          setVerifiedAccountName(accountName);
          onAddVerifiedBank(saved.data);
          toast.success("Bank added successfully");
          onClose();
        }
      } else {
        const response = await providerService.verifyBank({
          bankCode: selectedBankCode,
          accountNumber,
          bankName: selectedBankName,
        });

        const accountName =
          response.data?.accountName || response.data?.account_name;

        if (!accountName) {
          throw new Error("Unable to verify account");
        }

        const saved = await bankService.addBank({
          bankName: response.data.bankName || selectedBankName,
          bankCode: response.data.bankCode || selectedBankCode,
          accountNumber: response.data.accountNumber || accountNumber,
          accountName,
        });

        if (saved.success && saved.data) {
          setVerifiedAccountName(accountName);
          onAddVerifiedBank(saved.data);
          toast.success("Bank added successfully");
          onClose();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Bank verification failed",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const content = (
    <div className="relative flex h-[85vh] flex-col sm:h-[700px]">
      <div className="flex items-center justify-between px-6 py-5">
        <button
          type="button"
          onClick={() => (view === "list" ? onClose() : setView("list"))}
          className="rounded-full border border-slate-200 bg-white p-2 dark:border-none dark:bg-secondary-60/50"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-white" />
        </button>
        <DialogTitle className="text-lg font-semibold">
          {view === "list" ? "Select Bank" : "Add Bank"}
        </DialogTitle>
        {view === "list" ? (
          <button
            type="button"
            onClick={() => setView("add")}
            className="rounded-full bg-white p-2 text-primary-70 dark:bg-secondary-60/50"
          >
            <Plus className="h-5 w-5" />
          </button>
        ) : (
          <div className="h-9 w-9" />
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {view === "list" ? (
          <div className="space-y-3">
            {savedBanks.length > 0 ? (
              savedBanks.map((bank) => {
                const isSelected = bank.id === selectedSavedBank?.id;
                return (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => {
                      onSelectSavedBank(bank);
                      onClose();
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all",
                      isSelected
                        ? "border-primary-60 bg-primary-70/5 ring-2 ring-primary-60/20"
                        : "border-black/5 bg-white hover:bg-gray-50 dark:border-white/10 dark:bg-secondary-50 dark:hover:bg-secondary-60/50",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-slate-100 p-3 text-primary-70 dark:bg-[#1a1f2e]">
                        <Landmark className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-black dark:text-white">
                          {bank.bankName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
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
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-black/10 bg-white px-5 py-10 text-center dark:border-white/10 dark:bg-secondary-50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No saved banks yet.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">
                Select bank
              </label>
              <select
                value={selectedBankCode}
                onChange={(event) => {
                  const selected = bankOptions.find(
                    (option) => option.value === event.target.value,
                  );
                  setSelectedBankCode(event.target.value);
                  setSelectedBankName(selected?.label || "");
                }}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-secondary-50 dark:text-white"
              >
                <option value="">
                  {isLoadingBanks ? "Loading banks..." : "Choose bank"}
                </option>
                {bankOptions.map((bank) => (
                  <option key={bank.value} value={bank.value}>
                    {bank.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">
                Account number
              </label>
              <input
                value={accountNumber}
                onChange={(event) =>
                  setAccountNumber(event.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter account number"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-secondary-50 dark:text-white"
              />
            </div>

            {verifiedAccountName ? (
              <div className="rounded-xl border border-primary-60/20 bg-primary-70/5 px-4 py-3">
                <p className="text-xs text-gray-500">Verified account name</p>
                <p className="mt-1 text-sm font-semibold text-primary-60">
                  {verifiedAccountName}
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={verifyBank}
              disabled={
                !selectedBankCode || accountNumber.length < 10 || isVerifying
              }
              className="w-full rounded-xl bg-gradient-to-r from-primary-70 to-primary-60 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isVerifying ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                "Verify bank"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md overflow-hidden rounded-[32px] border-none bg-slate-50 p-0 dark:bg-[#0b101a] [&>button]:hidden">
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="rounded-t-[32px] border-none bg-slate-50 outline-none dark:bg-[#0b101a] [&>button]:hidden">
        <DrawerTitle className="sr-only">Select Bank</DrawerTitle>
        {content}
      </DrawerContent>
    </Drawer>
  );
}
