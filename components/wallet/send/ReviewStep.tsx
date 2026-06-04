"use client";

import Image from "next/image";
import { Send } from "lucide-react";
import FlowSummaryPill from "@/components/wallet/shared/FlowSummaryPill";
import { FlowReviewRow } from "@/components/wallet/shared/FlowReviewRow";
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
      <FlowSummaryPill
        asset={selectedAsset?.symbol || null}
        assetIconUrl={
          selectedAsset ? getTokenIconUrl(selectedAsset.symbol) : null
        }
        networkName={getChainLabel(selectedAsset?.chain)}
        amount={formatAssetAmount(amountValue)}
        amountCurrency={selectedAsset?.symbol}
      />

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
        <FlowReviewRow
          label="Recipient"
          value={truncateMiddle(recipientInput.trim(), 14)}
          variant="card"
        />
        <FlowReviewRow
          label="Method"
          value={getRecipientLabel(recipientKind)}
          variant="card"
        />
        <FlowReviewRow
          label="Asset"
          value={selectedAsset?.symbol || "--"}
          variant="card"
        />
        <FlowReviewRow
          label="Network"
          value={getChainLabel(selectedAsset?.chain)}
          variant="card"
        />
      </div>
    </div>
  );
}
