"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Landmark, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SelectableBank } from "@/components/modals/SelectBankModal";
import { providerService } from "@/services/api/payment-providers";
import type { BankDetail } from "@/types/db";

export type BankFormValues = {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  bankCode: string;
  provider: string;
  country: string;
};

interface BankFormProps {
  initialData?: BankDetail | null;
  selectedProviderBank: SelectableBank | null;
  onOpenBankModal: () => void;
  onSubmit: (data: BankFormValues) => void;
  isSubmitting: boolean;
}

const DEFAULT_CURRENCY = "NGN";
const DEFAULT_PROVIDER = "centiiv";

const BankForm = ({
  initialData,
  selectedProviderBank,
  onOpenBankModal,
  onSubmit,
  isSubmitting,
}: BankFormProps) => {
  const [accountNumber, setAccountNumber] = useState(
    initialData?.accountNumber || "",
  );
  const [verifiedAccount, setVerifiedAccount] = useState<BankFormValues | null>(
    initialData
      ? {
          bankName: initialData.bankName,
          accountHolderName: initialData.accountName,
          accountNumber: initialData.accountNumber,
          bankCode: initialData.bankCode || "",
          provider: initialData.provider || DEFAULT_PROVIDER,
          country: initialData.country || DEFAULT_CURRENCY,
        }
      : null,
  );
  const [verificationError, setVerificationError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const lastVerificationKeyRef = useRef("");

  const activeBank = useMemo<SelectableBank | null>(() => {
    if (selectedProviderBank) return selectedProviderBank;
    if (!initialData?.bankName || !initialData?.bankCode) return null;

    return {
      label: initialData.bankName,
      value: initialData.bankCode,
    };
  }, [initialData, selectedProviderBank]);

  useEffect(() => {
    if (!selectedProviderBank) return;

    setAccountNumber("");
    setVerifiedAccount(null);
    setVerificationError("");
    lastVerificationKeyRef.current = "";
  }, [selectedProviderBank?.value]);

  useEffect(() => {
    const hasValidAccountNumber = /^\d{10}$/.test(accountNumber);

    if (!activeBank || !hasValidAccountNumber) {
      if (!initialData || accountNumber !== initialData.accountNumber) {
        setVerifiedAccount(null);
      }
      setVerificationError("");
      lastVerificationKeyRef.current = "";
      return;
    }

    const verificationKey = `${activeBank.value}:${accountNumber}`;
    if (lastVerificationKeyRef.current === verificationKey) return;

    let cancelled = false;

    const verifyBank = async () => {
      lastVerificationKeyRef.current = verificationKey;
      setIsVerifying(true);
      setVerifiedAccount(null);
      setVerificationError("");

      try {
        const response = await providerService.verifyBank({
          bankCode: activeBank.value,
          accountNumber,
          save: false,
          bankName: activeBank.label,
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
          bankName: response.data.bankName || activeBank.label,
          accountHolderName: accountName,
          accountNumber: response.data.accountNumber || accountNumber,
          bankCode: response.data.bankCode || activeBank.value,
          provider: DEFAULT_PROVIDER,
          country: DEFAULT_CURRENCY,
        });
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Bank verification failed";
          setVerificationError(message);
          toast.error(message);
        }
      } finally {
        if (!cancelled) setIsVerifying(false);
      }
    };

    verifyBank();

    return () => {
      cancelled = true;
    };
  }, [accountNumber, activeBank, initialData]);

  const handleAccountNumberChange = (value: string) => {
    if (!/^\d{0,10}$/.test(value)) return;

    setAccountNumber(value);

    if (value.length !== 10) {
      setVerifiedAccount(null);
      setVerificationError("");
    }
  };

  const handleSubmit = () => {
    if (!verifiedAccount) return;
    onSubmit(verifiedAccount);
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onOpenBankModal}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between rounded-2xl border px-4 py-4 text-left transition",
          activeBank
            ? "border-primary-80 bg-primary-95/70 dark:border-primary-70/20 dark:bg-primary-70/10"
            : "border-dashed border-primary-60/60 bg-primary-70/5 text-primary-60 hover:bg-primary-70/10",
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-95 text-primary-60 dark:bg-primary-70/10 dark:text-primary-80">
            {activeBank?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeBank.image}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Landmark className="h-4 w-4" />
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-cryptoNight dark:text-white">
              {activeBank?.label || "Select bank"}
            </span>
            <span className="mt-1 block text-xs text-gray-30 dark:text-gray-40">
              Bank code is added automatically
            </span>
          </span>
        </span>
        {activeBank ? (
          <span className="text-xs font-semibold text-primary-60">Change</span>
        ) : null}
      </button>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-mid text-gray-30 dark:text-gray-40">
          Account Number
        </label>
        <div className="relative">
          <Input
            value={accountNumber}
            onChange={(event) => handleAccountNumberChange(event.target.value)}
            inputMode="numeric"
            maxLength={10}
            placeholder="Enter 10-digit account number"
            className="h-12 rounded-2xl border-gray-80 bg-white text-sm text-cryptoNight placeholder:text-gray-30 focus-visible:ring-primary-70/20 dark:border-white/10 dark:bg-secondary-60 dark:text-white dark:placeholder:text-gray-40"
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
              <span className="text-gray-30 dark:text-gray-40">Bank name</span>
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
                {verifiedAccount.accountHolderName}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <Button
        type="button"
        variant="flow"
        size="flow"
        onClick={handleSubmit}
        disabled={!verifiedAccount || isSubmitting}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </span>
        ) : initialData ? (
          "Update Bank Account"
        ) : (
          "Save Bank Account"
        )}
      </Button>

      {verifiedAccount ? (
        <div className="flex items-center gap-2 text-xs text-gray-30 dark:text-gray-40">
          <CheckCircle2 className="h-4 w-4 text-primary-60" />
          Bank code will be saved securely and hidden from this screen.
        </div>
      ) : null}
    </div>
  );
};

export default BankForm;
