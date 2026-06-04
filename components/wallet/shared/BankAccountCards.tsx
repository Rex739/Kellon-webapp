"use client";

import { CheckCircle2, ChevronRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BankAccountDisplay {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface BankAccountDetailsCardProps {
  title: string;
  account: BankAccountDisplay;
}

export function BankAccountDetailsCard({
  title,
  account,
}: BankAccountDetailsCardProps) {
  return (
    <div className="rounded-2xl border border-primary-80 bg-primary-95/70 p-3 dark:border-primary-70/20 dark:bg-primary-70/10">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-50 dark:text-primary-80">
        <ShieldCheck className="h-4 w-4" />
        {title}
      </div>
      <div className="space-y-2 text-xs">
        <BankAccountDetailRow label="Bank name" value={account.bankName} />
        <BankAccountDetailRow
          label="Account number"
          value={account.accountNumber}
        />
        <BankAccountDetailRow
          label="Account name"
          value={account.accountName}
        />
      </div>
    </div>
  );
}

interface SavedBankAccountButtonProps {
  account: BankAccountDisplay;
  isSelected: boolean;
  onClick: () => void;
}

export function SavedBankAccountButton({
  account,
  isSelected,
  onClick,
}: SavedBankAccountButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all",
        isSelected
          ? "border-primary-60 bg-primary-70/5 ring-2 ring-primary-60/20"
          : "border-black/5 bg-white hover:bg-gray-50 dark:border-white/10 dark:bg-secondary-50 dark:hover:bg-secondary-60/50",
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-black dark:text-white">
          {account.bankName}
        </p>
        <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
          {account.accountNumber} • {account.accountName}
        </p>
      </div>

      {isSelected ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-70" />
      ) : (
        <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
      )}
    </button>
  );
}

function BankAccountDetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-30 dark:text-gray-40">{label}</span>
      <span className="text-right text-sm font-semibold text-cryptoNight dark:text-white">
        {value}
      </span>
    </div>
  );
}
