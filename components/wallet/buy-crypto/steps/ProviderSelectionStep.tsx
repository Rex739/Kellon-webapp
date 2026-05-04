// components/BuyCryptoFlow/steps/ProviderSelectionStep.tsx
import { ChevronRight, Globe, ArrowRight, Loader2 } from "lucide-react"
import Image from "next/image"
import ChainIcon from "@/components/wallet/ChainIcon"
import { cn } from "@/lib/utils"

interface Provider {
  id: string
  name: string
  logo: string
  deliveryTime: string
  fee: string
  isRecommended?: boolean
  features: string[]
}

interface ProviderSelectionStepProps {
  asset: string | null
  networkName: string | null
  selectedChain?: { name: string } | null
  amount: string
  providers: Provider[]
  selectedProviderId: string
  paymentMethodLabel: string
  onSelectProvider: (id: string) => void
  onContinue: () => void
  // New props for rates
  providerRates: Record<string, number | null>
  isRatesLoading: boolean
}

export function ProviderSelectionStep({
  asset,
  selectedChain,
  amount,
  providers,
  selectedProviderId,
  paymentMethodLabel,
  onSelectProvider,
  onContinue,
  providerRates,
  isRatesLoading,
}: ProviderSelectionStepProps) {
  return (
    <div className="flex-1 flex flex-col px-4 animate-in fade-in slide-in-from-right-4">
      {/* Summary chip (unchanged) */}
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

      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
        Recommended Providers
      </h3>

      <div className="space-y-4">
        {providers.map((provider) => {
          const estimatedAmount = providerRates[provider.id]
          const isLoadingRate = isRatesLoading && estimatedAmount === undefined

          return (
            <button
              key={provider.id}
              onClick={() => onSelectProvider(provider.id)}
              className={cn(
                "w-full p-4 rounded-[24px] border transition-all text-left relative",
                selectedProviderId === provider.id
                  ? "border-primary-70 bg-primary-70/5 ring-1 ring-primary-70"
                  : "border-slate-200 dark:border-white/5 bg-gray-50 dark:bg-secondary-60/40",
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-3">
                  <Globe className="w-8 h-8 text-primary-70" />
                  <div>
                    <p className="font-bold text-xs">{provider.name}</p>
                    <p className="text-[8px] text-gray-500">
                      {provider.deliveryTime}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {isLoadingRate ? (
                    <div className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                      <span className="text-xs text-gray-400">
                        Estimating...
                      </span>
                    </div>
                  ) : estimatedAmount !== undefined &&
                    estimatedAmount !== null ? (
                    <p className="font-bold text-sm">
                      {estimatedAmount.toFixed(4)} {asset}
                    </p>
                  ) : (
                    <p className="font-bold text-sm">~ {asset}</p>
                  )}
                  <p className="text-[10px] text-gray-500">
                    Fee: {provider.fee}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {provider.features.slice(0, 3).map((f) => (
                  <span
                    key={f}
                    className="px-1 bg-gray-200 dark:bg-white/5 rounded text-[8px] font-bold text-gray-500"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-auto pb-6">
        <button
          onClick={onContinue}
          className="w-full py-4 bg-primary-70 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg"
        >
          Select {paymentMethodLabel.split(" ")[0]}{" "}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
