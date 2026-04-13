"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Landmark, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { BankDetail } from "@/types/db"
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal"

interface BankItemProps {
  bank: BankDetail
  onEdit: (bank: BankDetail) => void
  onDelete: (id: string) => Promise<void>
}

const BankItem = ({ bank, onEdit, onDelete }: BankItemProps) => {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!bank.id) return
    setIsDeleting(true)
    try {
      await onDelete(bank.id)
      toast.success("Bank account deleted")
      router.refresh()
      setIsDeleting(false)
    } catch (error) {
      toast.error("Failed to delete account")
      setIsDeleting(false)
    }
  }

  return (
    <div
      onClick={() => onEdit(bank)}
      className="p-4 bg-white dark:bg-secondary-60 rounded-2xl flex items-center justify-between group cursor-pointer hover:ring-1 hover:ring-primary-70 transition-all mt-2 gap-2 min-w-0"
    >
      {/* Content Section */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2 bg-primary-70/10 rounded-lg text-primary-70 shrink-0">
          <Landmark className="w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <p className="font-semibold text-sm truncate text-slate-900 dark:text-white">
            {bank.bankName}
          </p>
          <span className="text-[10px] md:text-xs text-slate-500 flex space-x-1 items-center">
            <p className="max-w-[50px] xs:max-w-[100px] xm:max-w-[120px] md:max-w-fit truncate">
              {bank.accountName}
            </p>
            <div className="h-[3px] w-[3px] bg-slate-400 rounded-full" />
            <p>{bank.accountNumber}</p>
          </span>
        </div>
      </div>

      {/* Delete Section */}
      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <DeleteConfirmationModal
          title="Delete Bank Account"
          itemName={bank.bankName}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          trigger={
            <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors cursor-pointer">
              <Trash2 className="w-4 h-4" />
            </button>
          }
        />
      </div>
    </div>
  )
}

export default BankItem
