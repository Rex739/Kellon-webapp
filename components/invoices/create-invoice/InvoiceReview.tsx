import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransferRecipient } from "@/services/api/transfers";
import { AssetLogo } from "./AssetLogo";
import { ReviewRow } from "./ReviewRow";
import {
  EXPIRY_PRESETS,
  INVOICE_CARD_CLASS,
  type InvoiceAssetOption,
  type InvoiceFormValues,
} from "./types";
import { formatChain, getAssetIcon, getExpiryDate } from "./utils";

interface InvoiceReviewProps {
  selectedAsset?: InvoiceAssetOption;
  selectedAssetSymbol: string;
  watchedAmount: string;
  watchedCustomerName?: string;
  watchedDescription?: string;
  watchedExpiryPreset: InvoiceFormValues["expiryPreset"];
  selectedExpiry?: (typeof EXPIRY_PRESETS)[number];
  verifiedCustomer: TransferRecipient | null;
  customerContact: string;
  customerContactValue: string;
  customerContactLabel: string;
}

export function InvoiceReview({
  selectedAsset,
  selectedAssetSymbol,
  watchedAmount,
  watchedCustomerName,
  watchedDescription,
  watchedExpiryPreset,
  selectedExpiry,
  verifiedCustomer,
  customerContact,
  customerContactValue,
  customerContactLabel,
}: InvoiceReviewProps) {
  return (
    <div className="mx-auto w-full max-w-xl animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-6 flex items-center justify-center">
        <div className="flex max-w-full items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 text-xs font-semibold text-gray-600 dark:border-white/10 dark:bg-secondary-50 dark:text-gray-300">
          <AssetLogo
            src={selectedAsset?.iconUrl || getAssetIcon(selectedAssetSymbol)}
            symbol={selectedAsset?.symbol || selectedAssetSymbol || "Asset"}
            size="sm"
          />
          <span className="font-bold text-black dark:text-white">
            {selectedAsset?.symbol || "Asset"}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
          <span>
            {selectedAsset ? formatChain(selectedAsset.chain) : "Network"}
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="truncate text-primary-60">
            {watchedAmount || "0"} {selectedAsset?.symbol || ""}
          </span>
        </div>
      </div>

      <section className={cn(INVOICE_CARD_CLASS, "p-6")}>
        <div className="space-y-4">
          <ReviewRow
            label="Amount"
            value={`${watchedAmount || "0"} ${selectedAsset?.symbol || ""}`}
            highlight
          />
          <ReviewRow
            label="Network"
            value={selectedAsset ? formatChain(selectedAsset.chain) : "--"}
          />
          <ReviewRow
            label="Customer"
            value={
              verifiedCustomer?.name || watchedCustomerName || customerContact
            }
          />
          <ReviewRow
            label={customerContactLabel}
            value={customerContactValue || "--"}
          />
          <ReviewRow
            label="Description"
            value={watchedDescription?.trim() || "No description"}
          />
          <ReviewRow
            label="Expires"
            value={`${selectedExpiry?.label || "1 Day"} • ${getExpiryDate(
              watchedExpiryPreset,
            ).toLocaleDateString()}`}
          />
        </div>
      </section>
    </div>
  );
}
