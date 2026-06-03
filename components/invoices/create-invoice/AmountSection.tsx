import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AssetChoice } from "./AssetChoice";
import {
  INVOICE_CARD_CLASS,
  INVOICE_INPUT_CLASS,
  type InvoiceAssetGroup,
  type InvoiceAssetOption,
  type InvoiceFormValues,
} from "./types";
import { formatChain } from "./utils";

interface AmountSectionProps {
  form: UseFormReturn<InvoiceFormValues>;
  assetGroups: InvoiceAssetGroup[];
  selectedAssetGroup?: InvoiceAssetGroup;
  selectedAsset?: InvoiceAssetOption;
}

export function AmountSection({
  form,
  assetGroups,
  selectedAssetGroup,
  selectedAsset,
}: AmountSectionProps) {
  return (
    <section className={INVOICE_CARD_CLASS}>
      <h2 className="mb-3 text-sm font-bold text-black dark:text-white">
        Amount
      </h2>
      <div className="space-y-3">
        <FormField
          control={form.control}
          name="assetSymbol"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {assetGroups.map((asset) => (
                    <AssetChoice
                      key={asset.symbol}
                      asset={asset}
                      selected={field.value === asset.symbol}
                      onClick={() => field.onChange(asset.symbol)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />

        {selectedAssetGroup && selectedAssetGroup.chains.length > 1 ? (
          <FormField
            control={form.control}
            name="chain"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Network
                </FormLabel>
                <FormControl>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedAssetGroup.chains.map((asset) => (
                      <button
                        key={asset.key}
                        type="button"
                        onClick={() => field.onChange(asset.chain)}
                        className={cn(
                          "shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                          field.value === asset.chain
                            ? "border-primary-90 bg-primary-95 text-primary-50 dark:border-primary-70/20 dark:bg-primary-70/15 dark:text-primary-80"
                            : "border-gray-80 bg-white/80 text-gray-20 hover:text-cryptoNight dark:border-white/10 dark:bg-secondary-50/70 dark:text-gray-40 dark:hover:text-white",
                        )}
                      >
                        {formatChain(asset.chain)}
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        ) : null}

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    inputMode="decimal"
                    placeholder="0.00"
                    className={cn(
                      INVOICE_INPUT_CLASS,
                      "h-16 rounded-2xl pr-20 text-2xl font-semibold",
                    )}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                    {selectedAsset?.symbol || "Asset"}
                  </span>
                </div>
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
