"use client";

import type { UseFormReturn } from "react-hook-form";
import Keypad from "@/components/Keypad";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { getChainLabel } from "@/lib/chains";
import type { AmountFormValues, SendableAsset } from "./send-types";
import { formatAssetAmount } from "./send-utils";

interface AmountStepProps {
  amountForm: UseFormReturn<AmountFormValues>;
  amount: string;
  selectedAsset: SendableAsset | null;
  isAmountValid: boolean;
  onAmountChange: (value: string) => void;
  onKeypadPress: (value: string) => void;
  onReview: () => void;
}

export default function AmountStep({
  amountForm,
  amount,
  selectedAsset,
  isAmountValid,
  onAmountChange,
  onKeypadPress,
  onReview,
}: AmountStepProps) {
  return (
    <div className="flex h-full flex-col justify-center gap-6">
      <Form {...amountForm}>
        <form
          onSubmit={amountForm.handleSubmit(() => {
            if (isAmountValid) onReview();
          })}
          className="space-y-6"
        >
          <FormField
            control={amountForm.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-20 dark:text-gray-40">
                    Sending {selectedAsset?.symbol || "asset"} on{" "}
                    {getChainLabel(selectedAsset?.chain)}
                  </p>
                  <FormControl>
                    <input
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);
                        onAmountChange(event.target.value);
                      }}
                      inputMode="decimal"
                      placeholder="0"
                      className="mt-4 w-full bg-transparent text-center text-6xl font-bold leading-none text-black outline-none placeholder:text-gray-60 dark:text-white dark:placeholder:text-white/15 md:text-7xl"
                    />
                  </FormControl>
                  <p className="mt-3 text-sm text-gray-20 dark:text-gray-40">
                    Available: {formatAssetAmount(selectedAsset?.amount || 0)}{" "}
                    {selectedAsset?.symbol}
                  </p>
                </div>
                <FormMessage className="text-center text-xs" />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {amount && !isAmountValid ? (
        <p className="text-center text-xs font-medium text-red-500">
          Enter an amount greater than zero and within your balance.
        </p>
      ) : null}

      <div className="block md:hidden">
        <Keypad onPress={onKeypadPress} />
      </div>
    </div>
  );
}
