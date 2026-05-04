import {
  Delete,
  ChevronRight,
  CreditCard,
  Landmark,
  Smartphone,
  ChevronDown,
  ArrowRight,
} from "lucide-react"
import Image from "next/image"
import ChainIcon from "@/components/wallet/ChainIcon"
// import {
//   getCurrencyDecimals,
//   getCurrencySymbol,
// } from "@/lib/country-currency-map"
// import { cn } from "@/lib/utils"

interface AmountEntryStepProps {
  asset: string | null
  networkName: string | null
  selectedChain?: { name: string } | null
  amount: string
  fiatCurrency: string
  fiatSymbol: string
  decimals: number
  cryptoAmountValue: number
  exchangeRate: number
  isRateLoading: boolean
  isAmountValid: boolean
  paymentMethod: string
  paymentMethodLabel: string
  onOpenPaymentModal: () => void
  onKeypadPress: (val: string) => void
  onContinue: () => void
}

export function AmountEntryStep({
  asset,
  // networkName,
  selectedChain,
  amount,
  fiatCurrency,
  // fiatSymbol,
  // decimals,
  cryptoAmountValue,
  exchangeRate,
  isRateLoading,
  isAmountValid,
  paymentMethod,
  paymentMethodLabel,
  onOpenPaymentModal,
  onKeypadPress,
  onContinue,
}: AmountEntryStepProps) {
  const keypadKeys = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    ".",
    "0",
    "delete",
  ]

  return (
    <div className="flex-1 flex flex-col items-center animate-in fade-in slide-in-from-right-4">
      {/* Selected asset/network chip */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-gray-50 dark:bg-secondary-60/30 mb-10">
        <div className="flex items-center gap-1.5">
          <Image
            src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${asset?.toLowerCase()}.png`}
            alt=""
            width={16}
            height={16}
          />
          <span className="text-[11px] font-bold uppercase">{asset}</span>
        </div>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <div className="flex items-center gap-1.5">
          {selectedChain && <ChainIcon name={selectedChain.name} size={14} />}
          <span className="text-[11px] font-medium text-gray-500">
            {selectedChain?.name}
          </span>
        </div>
        {amount && (
          <>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-[11px] font-bold text-primary-70">
              {amount}
            </span>
          </>
        )}
      </div>

      {/* Amount display */}
      <div className="text-center mb-4">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-2xl font-bold text-gray-400">
            {fiatCurrency}
          </span>
          <span className="text-6xl font-bold tracking-tight text-black dark:text-white">
            {amount || "0"}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          You will receive approximately {cryptoAmountValue.toFixed(4)} {asset}
        </p>
        <div className="mt-4 inline-flex items-center px-4 py-1.5 bg-gray-100 dark:bg-secondary-60/40 rounded-full border border-slate-200 dark:border-white/5">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
            1 {asset} ≈{" "}
            {new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 2,
            }).format(exchangeRate)}{" "}
            {fiatCurrency}
          </p>
        </div>
      </div>

      {/* Payment method selector */}
      <div className="w-full px-4 mt-auto mb-6">
        <button
          onClick={onOpenPaymentModal}
          className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-gray-50 dark:bg-secondary-60/20 active:scale-[0.98] transition-transform"
        >
          <span className="text-[11px] text-gray-500 font-medium">
            Select payment method
          </span>
          <div className="flex items-center gap-2 text-xs font-bold">
            {paymentMethod === "card" && (
              <CreditCard className="w-4 h-4 text-primary-70" />
            )}
            {paymentMethod === "bank" && (
              <Landmark className="w-4 h-4 text-primary-70" />
            )}
            {paymentMethod === "mobile_money" && (
              <Smartphone className="w-4 h-4 text-primary-70" />
            )}
            {paymentMethodLabel}
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </button>
      </div>

      {/* Keypad */}
      <div className="w-full grid grid-cols-3 gap-2 px-4 pb-6">
        {keypadKeys.map((key) => (
          <button
            key={key}
            onClick={() => onKeypadPress(key)}
            className="h-14 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-secondary-60/40 hover:bg-gray-100 transition-colors text-xl font-bold active:scale-95"
          >
            {key === "delete" ? (
              <Delete className="w-6 h-6 text-gray-500" />
            ) : (
              key
            )}
          </button>
        ))}
      </div>

      {/* Continue button */}
      <div className="w-full px-4 pb-6">
        <button
          disabled={!isAmountValid || isRateLoading}
          onClick={onContinue}
          className="w-full py-4 bg-primary-70 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          {isRateLoading
            ? "Fetching Rate..."
            : isAmountValid
              ? "Select Provider"
              : "Enter Amount"}
          {isAmountValid && !isRateLoading && (
            <ArrowRight className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
}
