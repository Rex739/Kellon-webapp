// components/BuyCryptoFlow/steps/ReviewStep.tsx
import { ChevronRight, ShieldCheck,  } from "lucide-react"
import Image from "next/image"
import ChainIcon from "@/components/wallet/ChainIcon"


interface ReviewStepProps {
  amount: string
  asset: string | null
  fiatCurrency: string
  fiatSymbol: string
  selectedChain?: { name: string } | null
  selectedProvider: { name: string; logo?: string } | null
  estimatedCrypto: number
  paymentMethodLabel: string
  onConfirm: () => void
}

export function ReviewStep({
  amount,
  asset,
  fiatCurrency,
  selectedChain,
  selectedProvider,
  estimatedCrypto,
  paymentMethodLabel,
  onConfirm,
}: ReviewStepProps) {
  return (
    <div className="flex-1 flex flex-col px-4 animate-in fade-in slide-in-from-bottom-4">
      {/* 1. Summary Chip - Same as Provider Step for consistency */}
      <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 dark:border-white/10 bg-gray-50 dark:bg-secondary-60/30 mb-8">
        <div className="flex items-center gap-2">
          <Image
            src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${asset?.toLowerCase()}.png`}
            alt=""
            width={18}
            height={18}
          />
          <span className="text-xs font-bold">{asset}</span>
        </div>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <div className="flex items-center gap-2">
          {selectedChain && <ChainIcon name={selectedChain.name} size={16} />}
          <span className="text-xs font-bold">{selectedChain?.name}</span>
        </div>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="text-xs font-bold text-primary-70">{amount}</span>
      </div>

      {/* 2. Detailed Transaction Card */}
      <div className="w-full rounded-[28px] border border-slate-200 dark:border-white/10 bg-gray-50 dark:bg-secondary-60/30 p-6 mb-8">
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
            <span className="text-sm font-bold text-primary-70">
              {estimatedCrypto.toFixed(4)} {asset}
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
            <span className="text-sm text-gray-500 font-medium">Provider</span>
            <span className="text-sm font-bold text-black dark:text-white">
              {selectedProvider?.name}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Action Section */}
      <div className="mt-auto pb-6 space-y-4">
        <button
          onClick={onConfirm}
          className="w-full py-4 bg-primary-70 text-white font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform shadow-xl shadow-primary-70/20"
        >
          <ShieldCheck className="w-6 h-6" />
          Initialize Secure Payment
        </button>

        <p className="text-[11px] text-gray-400 text-center leading-relaxed px-4">
          You will be redirected to {selectedProvider?.name}&apos;s secure
          portal to complete your transaction via{" "}
          <span className="font-bold text-gray-500">
            {paymentMethodLabel.toLowerCase()}
          </span>
          .
        </p>
      </div>
    </div>
  )
}
