"use client";

import Image from "next/image";
import { Send } from "lucide-react";
import { getChainLabel } from "@/lib/chains";
import type { RecipientKind, SendableAsset } from "./send-types";
import {
  formatAssetAmount,
  getRecipientLabel,
  getTokenIconUrl,
  truncateMiddle,
} from "./send-utils";

interface ReviewStepProps {
  amountValue: number;
  selectedAsset: SendableAsset | null;
  recipientInput: string;
  recipientKind: RecipientKind;
}

export default function ReviewStep({
  amountValue,
  selectedAsset,
  recipientInput,
  recipientKind,
}: ReviewStepProps) {
  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-95 text-primary-50 dark:bg-primary-70/15 dark:text-primary-80">
          {selectedAsset ? (
            <span className="relative h-8 w-8">
              <Image
                src={getTokenIconUrl(selectedAsset.symbol)}
                alt={selectedAsset.symbol}
                fill
                sizes="32px"
                className="object-contain"
              />
            </span>
          ) : (
            <Send className="h-6 w-6" />
          )}
        </div>
        <p className="text-sm font-medium text-gray-20 dark:text-gray-40">
          You are sending
        </p>
        <h2 className="mt-2 text-4xl font-bold text-black dark:text-white md:text-5xl">
          {formatAssetAmount(amountValue)} {selectedAsset?.symbol}
        </h2>
      </div>

      <div className="grid gap-3">
        <ReviewRow
          label="Recipient"
          value={truncateMiddle(recipientInput.trim(), 14)}
        />
        <ReviewRow label="Method" value={getRecipientLabel(recipientKind)} />
        <ReviewRow label="Asset" value={selectedAsset?.symbol || "--"} />
        <ReviewRow
          label="Network"
          value={getChainLabel(selectedAsset?.chain)}
        />
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-80 bg-gray-95 px-4 py-3 dark:border-white/10 dark:bg-secondary-60/25">
      <span className="text-xs font-medium text-gray-20 dark:text-gray-40">
        {label}
      </span>
      <span className="min-w-0 truncate text-right text-sm font-semibold text-black dark:text-white">
        {value}
      </span>
    </div>
  );
}
