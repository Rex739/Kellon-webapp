import type { AssetType } from "@/types/db";
import { ApiResponse, apiFetch, handleResponse } from ".";

export interface InternalTransferPayload {
  amount: number | string;
  symbol: string;
  assetType: AssetType;
  chain: string;
  recipientEmail?: string;
  recipientTag?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface InternalTransferResponse {
  transactionId?: string;
  status?: string;
  recipient: {
    type: "existing" | "pending";
    id?: string;
    email?: string | null;
    tag?: string | null;
  };
}

export interface TransferRecipient {
  found: boolean;
  name?: string | null;
  addresses?: Record<string, string | null | undefined> | null;
}

export const transferService = {
  verifyRecipient: async (
    identifier: string,
  ): Promise<ApiResponse<TransferRecipient>> => {
    const normalizedIdentifier = identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier);
    const queryKey = isEmail
      ? "email"
      : normalizedIdentifier.startsWith("@")
        ? "tag"
        : "username";
    const queryValue =
      queryKey === "email"
        ? normalizedIdentifier.toLowerCase()
        : normalizedIdentifier.replace(/^@/, "");
    const res = await apiFetch(
      `/api/workflows/lookup?${queryKey}=${encodeURIComponent(queryValue)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
      { signed: false },
    );

    return handleResponse(res);
  },

  createInternalTransfer: async (
    body: InternalTransferPayload,
  ): Promise<ApiResponse<InternalTransferResponse>> => {
    const res = await apiFetch("/api/transfers/internal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return handleResponse(res);
  },
};
