"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { BankDetail } from "@/types/db"

const bankFormSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountHolderName: z.string().min(1, "Account holder name is required"),
  accountNumber: z
    .string()
    .min(10, "Account number must be at least 10 digits"),
})

export type BankFormValues = z.infer<typeof bankFormSchema>

interface BankFormProps {
  initialData?: BankDetail | null
  onSubmit: (data: BankFormValues) => void
  isSubmitting: boolean
}

const BankForm = ({ initialData, onSubmit, isSubmitting }: BankFormProps) => {
  const form = useForm<BankFormValues>({
    resolver: zodResolver(bankFormSchema),
    defaultValues: {
      bankName: initialData?.bankName || "",
      accountHolderName: initialData?.accountName || "",
      accountNumber: initialData?.accountNumber || "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-900 dark:text-white">
                Bank Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Zenith Bank"
                  {...field}
                  className="bg-white dark:bg-[#1a1f2e] border-slate-200 dark:border-none h-14 rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountHolderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-900 dark:text-white">
                Account Holder Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Name on account"
                  {...field}
                  className="bg-white dark:bg-[#1a1f2e] border-slate-200 dark:border-none h-14 rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-slate-900 dark:text-white">
                Account Number *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Account Number"
                  {...field}
                  className="bg-white dark:bg-[#1a1f2e] border-slate-200 dark:border-none h-14 rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-70 hover:bg-primary-70/90 h-14 rounded-2xl text-white font-bold text-base mt-4 transition-all"
        >
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
          {initialData ? "Update Bank Account" : "Save Bank Account"}
        </Button>
      </form>
    </Form>
  )
}

export default BankForm
