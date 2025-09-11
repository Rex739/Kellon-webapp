import * as z from "zod"

export const sendAmountFormSchema = z.object({
  sendAmount: z
    .string()
    .regex(/^\d+$/, {
      message: "Amount must be a valid integer in smallest units",
    })
    .refine((val) => BigInt(val) > 0n, {
      message: "Amount must be greater than zero",
    }),
})

export type SendAmountFormSchemaType = z.infer<typeof sendAmountFormSchema>
