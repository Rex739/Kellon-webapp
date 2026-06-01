"use client";

import { ChevronRight } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type {
  RecentRecipient,
  RecipientFormValues,
  SendStep,
  VerifiedRecipient,
} from "./send-types";
import {
  getRecipientIcon,
  getRecipientKind,
  truncateMiddle,
} from "./send-utils";

interface RecentsPanelProps {
  recentRecipients: RecentRecipient[];
  recipientForm: UseFormReturn<RecipientFormValues>;
  setRecipientInput: (value: string) => void;
  setVerifiedRecipient: (recipient: VerifiedRecipient | null) => void;
  setStep: (step: SendStep) => void;
}

export default function RecentsPanel({
  recentRecipients,
  recipientForm,
  setRecipientInput,
  setVerifiedRecipient,
  setStep,
}: RecentsPanelProps) {
  return (
    <aside className="rounded-2xl border border-black/5 bg-white/60 p-4 backdrop-blur dark:border-white/10 dark:bg-secondary-50/30 md:rounded-lg md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-black dark:text-white">
          Recents
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-tight text-gray-30 dark:text-gray-40">
          Transfer methods
        </span>
      </div>

      <div className="grid gap-3">
        {recentRecipients.length > 0 ? (
          recentRecipients.map((recipient) => {
            const kind = getRecipientKind(recipient.value);
            const Icon = getRecipientIcon(kind);

            return (
              <button
                key={recipient.value}
                type="button"
                onClick={() => {
                  setRecipientInput(recipient.value);
                  recipientForm.setValue("recipient", recipient.value, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                  setVerifiedRecipient(null);
                  setStep("recipient");
                }}
                className="flex items-center justify-between gap-3 rounded-2xl border border-gray-80 bg-white p-3 text-left transition hover:border-primary-90 hover:bg-primary-99 dark:border-white/10 dark:bg-secondary-60/25 dark:hover:border-primary-70/30 dark:hover:bg-primary-70/10 md:rounded-lg cursor-pointer"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-95 text-primary-50 dark:bg-primary-70/15 dark:text-primary-80">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-black dark:text-white">
                      {truncateMiddle(recipient.value, 10)}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-20 dark:text-gray-40">
                      {recipient.method}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-30" />
              </button>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-80 bg-gray-95 p-5 text-center dark:border-white/10 dark:bg-secondary-60/20 md:rounded-lg">
            <p className="text-sm font-medium text-black dark:text-white">
              No recent recipients
            </p>
            <p className="mt-1 text-xs text-gray-20 dark:text-gray-40">
              People you send to will appear here.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
