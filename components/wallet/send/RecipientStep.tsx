"use client";

import { Check, Search, Send } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type {
  RecipientFormValues,
  RecipientKind,
  VerifiedRecipient,
} from "./send-types";
import {
  getRecipientIcon,
  getRecipientLabel,
  getRecipientPendingLabel,
  truncateMiddle,
} from "./send-utils";

interface RecipientStepProps {
  recipientForm: UseFormReturn<RecipientFormValues>;
  recipientInput: string;
  recipientKind: RecipientKind;
  isRecipientValid: boolean;
  selfRecipientError: string | null;
  verifiedRecipient: VerifiedRecipient | null;
  isVerifyingRecipient: boolean;
  recipientLookupMessage: string;
  onVerifyRecipient: (values: RecipientFormValues) => void | Promise<void>;
  onRecipientChange: (value: string) => void;
}

export default function RecipientStep({
  recipientForm,
  recipientInput,
  recipientKind,
  isRecipientValid,
  selfRecipientError,
  verifiedRecipient,
  isVerifyingRecipient,
  recipientLookupMessage,
  onVerifyRecipient,
  onRecipientChange,
}: RecipientStepProps) {
  const RecipientIcon = getRecipientIcon(recipientKind);

  return (
    <div className="flex h-full flex-col gap-6">
      <Form {...recipientForm}>
        <form onSubmit={recipientForm.handleSubmit(onVerifyRecipient)}>
          <FormField
            control={recipientForm.control}
            name="recipient"
            render={({ field }) => (
              <FormItem>
                <label
                  htmlFor="send-recipient"
                  className="mb-2 block text-[11px] font-bold uppercase tracking-tight text-gray-30 dark:text-gray-40 md:text-xs"
                >
                  Email, tag, or wallet address
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-50" />
                  <FormControl>
                    <Input
                      id="send-recipient"
                      placeholder="email address, @kellonTag, or wallet address"
                      className="h-12 rounded-2xl border-black/5 bg-gray-95 pl-11 text-sm font-medium shadow-none placeholder:text-gray-400 focus-visible:ring-primary-70/20 dark:border-white/10 dark:bg-secondary-60 dark:text-white md:h-[52px] md:rounded-2xl"
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);
                        onRecipientChange(event.target.value);
                      }}
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {recipientInput.trim() ? (
        <div
          className={cn(
            "rounded-2xl border p-4",
            selfRecipientError
              ? "border-red-200 bg-red-50 dark:border-red-500/25 dark:bg-red-500/10"
              : verifiedRecipient
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/25 dark:bg-emerald-500/10"
                : isRecipientValid
                ? "border-primary-90 bg-primary-99 dark:border-primary-70/30 dark:bg-primary-70/10"
                : "border-gray-80 bg-gray-95 dark:border-white/10 dark:bg-secondary-60/35",
          )}
        >
          <div className="flex items-start gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-black dark:text-white">
                {selfRecipientError
                  ? "You can't send to yourself"
                  : isVerifyingRecipient
                    ? "Checking Kellon user"
                  : isRecipientValid
                    ? verifiedRecipient
                      ? "Recipient verified"
                      : getRecipientPendingLabel(recipientKind)
                    : "Check recipient"}
              </p>
              <p className="mt-1 break-all text-xs text-gray-20 dark:text-gray-40 md:text-sm">
                {selfRecipientError
                  ? selfRecipientError
                  : recipientLookupMessage
                    ? recipientLookupMessage
                  : isRecipientValid
                    ? truncateMiddle(recipientInput.trim(), 12)
                    : "Enter a valid email, username, @tag, EVM address, or Stellar address."}
              </p>
              {isRecipientValid && !selfRecipientError ? (
                <div className="mt-4 grid gap-2">
                  <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-xs font-medium text-gray-20 dark:bg-white/5 dark:text-white/80">
                    {verifiedRecipient ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <RecipientIcon className="h-4 w-4 text-primary-50" />
                    )}
                    {verifiedRecipient
                      ? verifiedRecipient.name || "Verified recipient"
                      : recipientKind === "email" || recipientKind === "tag"
                        ? "We will verify this Kellon user automatically"
                        : "Wallet address will be used as entered"}
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-xs font-medium text-gray-20 dark:bg-white/5 dark:text-white/80">
                    <RecipientIcon className="h-4 w-4 text-primary-50" />
                    {getRecipientLabel(recipientKind)}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-80 bg-gray-95 p-8 text-center dark:border-white/10 dark:bg-secondary-60/20 md:min-h-[300px]">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-95 text-primary-50 dark:bg-primary-70/15 dark:text-primary-80">
            <Send className="h-6 w-6" />
          </div>
          <h2 className="text-base font-semibold text-black dark:text-white">
            Start with a recipient
          </h2>
          <p className="mt-2 max-w-xs text-sm text-gray-20 dark:text-gray-40">
            Send by email, Kellon tag, or a supported wallet address.
          </p>
        </div>
      )}
    </div>
  );
}
