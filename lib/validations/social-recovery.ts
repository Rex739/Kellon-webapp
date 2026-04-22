import * as z from "zod"

// --- Validation Schemas ---

/**
 * Validates the Guardian ID input.
 * Accepts @tags (min 3 chars) or standard User IDs (min 6 chars).
 */
export const guardianSchema = z.object({
  guardianId: z
    .string()
    .min(1, "Identifier is required")
    // If they typed the @ manually, we strip it or handle it,
    // but usually, we just validate the text length.
    .transform((val) => val.replace(/^@/, ""))
    .refine((val) => val.length >= 3, {
      message: "Identifier must be at least 3 characters",
    }),
})

/**
 * Validates the Recovery Request ID input.
 */
export const approvalSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
})

// --- Type Inference ---

export type GuardianFormValues = z.infer<typeof guardianSchema>
export type ApprovalFormValues = z.infer<typeof approvalSchema>
