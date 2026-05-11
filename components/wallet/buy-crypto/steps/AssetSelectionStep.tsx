import { cn } from "@/lib/utils";
import Image from "next/image";
import { CheckCircle2, ChevronDown, Globe, ArrowRight } from "lucide-react";
import ChainIcon from "@/components/wallet/ChainIcon";
import { getSupportedChainsForToken } from "@/lib/chains";

interface AssetSelectionStepProps {
  asset: string | null;
  networkName: string | null;
  networkId: string | null;
  country: string | null;
  isDetectingCountry: boolean;
  onSelectAsset: (asset: string) => void;
  onSelectNetwork: (name: string, id: string) => void;
  onOpenCountryModal: () => void;
  onContinue: () => void;
}

const assets = [
  { id: "usdc", name: "USD Coin", symbol: "USDC" },
  { id: "usdt", name: "Tether", symbol: "USDT" },
];

export const getFlag = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));

export function AssetSelectionStep({
  asset,
  networkName,
  country,
  isDetectingCountry,
  onSelectAsset,
  onSelectNetwork,
  onOpenCountryModal,
  onContinue,
}: AssetSelectionStepProps) {
  const availableNetworks = asset
    ? getSupportedChainsForToken(asset as "USDC" | "USDT")
    : [];

  return (
    <div className="flex flex-col flex-1 space-y-8 px-4 animate-in fade-in slide-in-from-right-4">
      <div className="flex justify-center -mt-2">
        <button
          onClick={onOpenCountryModal}
          disabled={isDetectingCountry}
          className={cn(
            "flex items-center gap-2 bg-white dark:bg-secondary-60/40 border border-slate-200 dark:border-white/10 px-4 py-1.5 rounded-full transition-all",
            isDetectingCountry && "animate-pulse opacity-70",
          )}
        >
          <span className="text-lg leading-none">
            {country ? getFlag(country) : <Globe className="w-4 h-4" />}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-tight">
            {isDetectingCountry ? "Locating..." : country || "NG"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      <section>
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
          Select Asset
        </h3>
        <div className="space-y-3">
          {assets.map((a) => (
            <button
              key={a.id}
              onClick={() => onSelectAsset(a.symbol)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-[24px] border transition-all",
                asset === a.symbol
                  ? "border-primary-70 bg-primary-70/5 dark:bg-primary-70/10"
                  : "bg-gray-50 dark:bg-secondary-60 border-slate-200 dark:border-white/5",
              )}
            >
              <div className="flex items-center gap-4">
                <Image
                  src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${a.symbol.toLowerCase()}.png`}
                  alt={a.symbol}
                  width={32}
                  height={32}
                />
                <div className="text-left">
                  <p
                    className={cn(
                      "font-bold text-sm",
                      asset === a.symbol
                        ? "text-primary-70"
                        : "text-black dark:text-white",
                    )}
                  >
                    {a.symbol}
                  </p>
                  <p className="text-xs text-gray-500">{a.name}</p>
                </div>
              </div>
              {asset === a.symbol && (
                <CheckCircle2 className="w-5 h-5 text-primary-70" />
              )}
            </button>
          ))}
        </div>
      </section>

      {asset && (
        <section className="animate-in fade-in slide-in-from-bottom-2">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
            Select Network
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {availableNetworks.map((chain) => {
              const chainNameLower = chain.name.toLowerCase();
              const isSelected = networkName === chainNameLower;
              return (
                <button
                  key={chain.id}
                  onClick={() =>
                    onSelectNetwork(chainNameLower, chain.id.toString())
                  }
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border transition-all text-sm font-bold",
                    isSelected
                      ? "bg-primary-70 border-primary-70 text-white shadow-lg"
                      : "bg-gray-50 dark:bg-secondary-60 border-slate-200 dark:border-white/5",
                  )}
                >
                  <ChainIcon name={chain.name} size={20} />
                  {chain.name}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {networkName && (
        <div className="mt-auto pb-6">
          <button
            onClick={onContinue}
            className="w-full py-4 bg-primary-70 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
