import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  EXPIRY_PRESETS,
  INVOICE_CARD_CLASS,
  type InvoiceFormValues,
} from "./types";

interface ExpirySectionProps {
  form: UseFormReturn<InvoiceFormValues>;
}

export function ExpirySection({ form }: ExpirySectionProps) {
  return (
    <section className={INVOICE_CARD_CLASS}>
      <div className="mb-4">
        <h2 className="text-sm font-bold text-black dark:text-white">Expiry</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          When should this link expire?
        </p>
      </div>
      <FormField
        control={form.control}
        name="expiryPreset"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {EXPIRY_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => field.onChange(preset.value)}
                    className={cn(
                      "cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition-all",
                      field.value === preset.value
                        ? "border-primary-60/40 bg-primary-70/5 text-primary-60 dark:border-primary-70/30 dark:bg-primary-70/10 dark:text-primary-80"
                        : "border-black/5 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-black dark:border-white/5 dark:bg-secondary-50 dark:text-gray-400 dark:hover:bg-secondary-60/60 dark:hover:text-white",
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />
    </section>
  );
}
