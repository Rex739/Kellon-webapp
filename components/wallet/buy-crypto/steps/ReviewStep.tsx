// components/BuyCryptoFlow/steps/ReviewStep.tsx
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import ChainIcon from "@/components/wallet/ChainIcon";
import SummaryPill from "../SummaryPill";
import type { BankDetail } from "@/types/db";
import type { OnrampResponse } from "@/services/api/on-ramp";
import { Button } from "@/components/ui/button";

interface ReviewStepProps {
  amount: string;
  asset: string | null;
  fiatCurrency: string;
  fiatSymbol: string;
  selectedChain?: { name: string } | null;
  selectedProvider: { name: string; logo?: string } | null;
  estimatedCrypto: number;
  selectedBank?: BankDetail | null;
  paymentMethodLabel: string;
  isSubmitting?: boolean;
  initializedOrder?: OnrampResponse | null;
  isCompleting?: boolean;
  onConfirm: () => void | Promise<void>;
  onConfirmSent?: () => void | Promise<void>;
}

export function ReviewStep({
  amount,
  asset,
  fiatCurrency,
  selectedChain,
  selectedProvider,
  estimatedCrypto,
  selectedBank,
  paymentMethodLabel,
  isSubmitting = false,
  initializedOrder = null,
  isCompleting = false,
  onConfirm,
  onConfirmSent,
}: ReviewStepProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  // Safely format estimatedCrypto to avoid .toFixed() error
  const getFormattedCrypto = () => {
    const cryptoValue =
      typeof estimatedCrypto === "number" && !isNaN(estimatedCrypto)
        ? estimatedCrypto
        : 0;
    return cryptoValue.toFixed(4);
  };

  const providerAccount = initializedOrder?.providerAccount;

  useEffect(() => {
    if (!providerAccount?.validUntil) return;

    setNow(Date.now());
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [providerAccount?.validUntil]);

  const expiryCountdown = useMemo(() => {
    if (!providerAccount?.validUntil) return null;
    if (now === null) return null;

    const expiryTime = new Date(providerAccount.validUntil).getTime();
    if (Number.isNaN(expiryTime)) return providerAccount.validUntil;

    const diffMs = expiryTime - now;
    if (diffMs <= 0) return "Expired";

    const totalSeconds = Math.ceil(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (value: number) => String(value).padStart(2, "0");

    return hours > 0
      ? `${hours}:${pad(minutes)}:${pad(seconds)}`
      : `${minutes}:${pad(seconds)}`;
  }, [now, providerAccount?.validUntil]);

  const copyValue = async (
    fieldKey: string,
    label: string,
    value?: string | number | null,
  ) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedField(fieldKey);
      toast.success(`${label} copied`);
      setTimeout(() => {
        setCopiedField((currentField) =>
          currentField === fieldKey ? null : currentField,
        );
      }, 1800);
    } catch {
      toast.error("Unable to copy");
    }
  };

  const formatTransferAmount = (currency: string, value: string) => {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return `${currency} ${value}`;
    }

    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).format(numericValue);
  };

  const CopyableRow = ({
    label,
    value,
    fieldKey,
    copyable = true,
  }: {
    label: string;
    value?: string | number | null;
    fieldKey: string;
    copyable?: boolean;
  }) => {
    if (!value) return null;

    const isCopied = copiedField === fieldKey;

    return (
      <div className="flex items-center justify-between gap-4 border-b border-gray-90 py-3 last:border-b-0 dark:border-white/5">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <button
          type="button"
          disabled={!copyable}
          onClick={() => copyable && copyValue(fieldKey, label, value)}
          className="flex min-w-0 items-center gap-2 text-right text-sm font-bold text-black transition hover:text-primary-60 disabled:cursor-default disabled:hover:text-black dark:text-white dark:disabled:hover:text-white cursor-copy"
        >
          <span className="truncate">{value}</span>
          {copyable ? (
            isCopied ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            )
          ) : null}
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-[calc(100dvh-200px)] flex-col md:min-h-[500px]">
      <div className="flex-1 overflow-y-auto md:px-0 animate-in fade-in slide-in-from-bottom-4">
        {/* 1. Summary Chip - Same as Provider Step for consistency */}
        <SummaryPill
          asset={asset}
          selectedChain={selectedChain}
          amount={amount}
          fiatCurrency={fiatCurrency}
        />

        {providerAccount ? (
          <>
            <div className="mb-8 w-full rounded-[28px] border border-black/5  bg-white p-6 dark:border-white/10 dark:bg-secondary-50">
              <div className="mb-5 flex items-start gap-3">
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    Transfer to provider account
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                    Send the exact amount below, then confirm once the transfer
                    is done.
                  </p>
                </div>
              </div>

              <div className="mb-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="text-xs leading-5">
                  This account is for this payment only. Do not save it or use
                  it for future transfers.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-90 bg-gray-95 px-4 dark:border-white/10 dark:bg-secondary-60/50">
                <CopyableRow
                  label="Bank"
                  fieldKey="provider-bank"
                  value={providerAccount.institution}
                />
                <CopyableRow
                  label="Account number"
                  fieldKey="provider-account-number"
                  value={providerAccount.accountIdentifier}
                />
                <CopyableRow
                  label="Account name"
                  fieldKey="provider-account-name"
                  value={providerAccount.accountName}
                />
                <CopyableRow
                  label="Amount"
                  fieldKey="provider-transfer-amount"
                  value={formatTransferAmount(
                    providerAccount.currency,
                    providerAccount.amountToTransfer,
                  )}
                />
                <CopyableRow
                  label="Expires in"
                  fieldKey="provider-valid-until"
                  value={expiryCountdown}
                  copyable={false}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 2. Detailed Transaction Card */}
            <div className="w-full rounded-[28px] p-6 mb-8 bg-white border border-black/5  dark:bg-secondary-50 dark:border-white/10  ">
              <div className="space-y-5">
                {/* Purchase Amount */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">
                    Purchase Amount
                  </span>
                  <span className="text-sm font-bold text-black dark:text-white">
                    {fiatCurrency} {amount}
                  </span>
                </div>

                {/* Estimated Receive */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">
                    Estimated Receive
                  </span>
                  <span className="text-sm font-bold text-primary-60">
                    {getFormattedCrypto()} {asset}
                  </span>
                </div>

                <div className="h-px bg-slate-200 dark:bg-white/5 w-full" />

                {/* Blockchain */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">
                    Blockchain
                  </span>
                  <div className="flex items-center gap-2">
                    {selectedChain && (
                      <ChainIcon name={selectedChain.name} size={16} />
                    )}
                    <span className="text-sm font-bold text-black dark:text-white">
                      {selectedChain?.name}
                    </span>
                  </div>
                </div>

                {/* Provider */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">
                    Provider
                  </span>
                  <span className="text-sm font-bold text-black dark:text-white">
                    {selectedProvider?.name}
                  </span>
                </div>

                {selectedProvider?.name?.toLowerCase() === "paycrest" &&
                selectedBank ? (
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-sm text-gray-500 font-medium">
                      Refund Account
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-black dark:text-white">
                        {selectedBank.bankName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedBank.accountNumber} •{" "}
                        {selectedBank.accountName}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="sticky bottom-0 left-0 right-0 mt-6 border-t border-black/5 bg-gradient-to-t px-4 pb-4 pt-6 dark:border-white/5 md:px-0">
        <div className="mx-auto max-w-md md:max-w-full">
          {providerAccount ? (
            <>
              <Button
                type="button"
                variant="flow"
                size="flow"
                onClick={onConfirmSent}
                disabled={isCompleting || !onConfirmSent}
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-sm md:text-base">
                  <CheckCircle2 className="h-5 w-5" />
                  {isCompleting
                    ? "Completing Order..."
                    : "I have Sent The Money"}
                </span>
                {!isCompleting && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                )}
              </Button>
              <p className="mt-3 px-4 text-center text-[11px] leading-relaxed text-gray-400">
                We will complete your order and take you to the transaction
                details once you confirm.
              </p>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="flow"
                size="flow"
                onClick={onConfirm}
                disabled={isSubmitting}
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-sm md:text-base">
                  <ShieldCheck className="h-5 w-5" />
                  {isSubmitting
                    ? "Initializing Payment..."
                    : "Initialize Secure Payment"}
                </span>
                {!isSubmitting && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                )}
              </Button>

              <p className="mt-3 px-4 text-center text-[11px] leading-relaxed text-gray-400">
                You will be redirected to {selectedProvider?.name}&apos;s secure
                portal to complete your transaction via{" "}
                <span className="font-bold text-gray-500">
                  {paymentMethodLabel.toLowerCase()}
                </span>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
