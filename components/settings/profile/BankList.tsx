"use client";

import { Landmark } from "lucide-react";
import { BankDetail } from "@/types/db";
import { Loader2 } from "lucide-react";
import BankItem from "./BankItem";

interface BankListProps {
  banks: BankDetail[];
  isLoading: boolean;
  onEdit: (bank: BankDetail) => void;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
}

const BankList = ({
  banks,
  isLoading,
  onEdit,
  onDelete,
  onAddNew,
}: BankListProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary-70" />
      </div>
    );
  }

  if (banks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
        <div className="w-24 h-24 bg-slate-200/50 dark:bg-secondary-60 rounded-full flex items-center justify-center">
          <Landmark className="w-12 h-12 text-slate-400 opacity-50" />
        </div>
        <p className="text-slate-500 dark:text-gray-400 font-medium">
          No bank accounts saved yet
        </p>
        <button
          type="button"
          onClick={onAddNew}
          className="group relative h-14 w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-primary-70 to-primary-60 font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-95"
        >
          <span className="relative z-10 flex items-center justify-center gap-2 text-sm md:text-base">
            Add Bank Account
          </span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {banks.map((bank) => (
        <BankItem
          key={bank.id}
          bank={bank}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default BankList;
