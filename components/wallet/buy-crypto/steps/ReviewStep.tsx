// components/BuyCryptoFlow/steps/ReviewStep.tsx
import { ShieldCheck } from "lucide-react"
import ChainIcon from "@/components/wallet/ChainIcon"
import SummaryPill from "../SummaryPill"

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
  // Safely format estimatedCrypto to avoid .toFixed() error
  const getFormattedCrypto = () => {
    const cryptoValue =
      typeof estimatedCrypto === "number" && !isNaN(estimatedCrypto)
        ? estimatedCrypto
        : 0
    return cryptoValue.toFixed(4)
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100dvh-200px)] md:min-h-[500px]">
      <div className="flex-1 animate-in fade-in slide-in-from-bottom-4">
        {/* 1. Summary Chip - Same as Provider Step for consistency */}
        <SummaryPill
          asset={asset}
          selectedChain={selectedChain}
          amount={amount}
          fiatCurrency={fiatCurrency}
        />

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
          </div>
        </div>

        {/* 3. Action Section */}
        <div className="mt-auto pb-6 space-y-4">
          <button
            onClick={onConfirm}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary-70 to-primary-60 py-3.5 font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:hover:shadow-lg cursor-pointer "
          >
            <span className="relative z-10 flex items-center justify-center gap-2 text-sm md:text-base">
              <ShieldCheck className="w-6 h-6" />
              Initialize Secure Payment
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
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
    </div>
  )
}
