"use client"

import { Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BankDetail } from "@/types/db"
import { Loader2 } from "lucide-react"
import BankItem from "./BankItem"

interface BankListProps {
  banks: BankDetail[]
  isLoading: boolean
  onEdit: (bank: BankDetail) => void
  onDelete: (id: string) => Promise<void>
  onAddNew: () => void
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
    )
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
        <Button
          onClick={onAddNew}
          className="w-full bg-primary-70 h-14 rounded-2xl text-white font-bold"
        >
          Add Bank Account
        </Button>
      </div>
    )
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
  )
}


export default BankList