import { FC } from "react"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { SendAmountFormSchemaType } from "@/lib/validations/form"
import { cn } from "@/lib/utils"

interface SendAmountFormProps {
  form: UseFormReturn<SendAmountFormSchemaType>
  showNativeValue: boolean
  disabled?: boolean // Add disabled prop
}

const SendAmountForm: FC<SendAmountFormProps> = ({
  form,
  showNativeValue,
  disabled = false, // Default to false
}) => {
  return (
    <Form {...form}>
      <div>
        <FormField
          control={form.control}
          name="sendAmount"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  {showNativeValue && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-semibold text-black dark:text-white">
                      $
                    </span>
                  )}
                  <input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    disabled={disabled} // Pass disabled prop
                    {...field}
                    className={cn(
                      "border-0 focus:ring-0 focus:outline-none shadow-none bg-transparent p-0 text-2xl font-semibold text-black dark:text-white w-full",
                      showNativeValue && "pl-5",
                      disabled && "opacity-50 cursor-not-allowed" // Add disabled styles
                    )}
                    placeholder="0"
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}

export default SendAmountForm
