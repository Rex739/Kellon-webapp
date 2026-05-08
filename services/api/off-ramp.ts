import { ApiResponse, handleResponse } from "./index"

/**
 * --- Offramp Request Interface ---
 * Mapped to: { fiatAmount, fiatCurrency, cryptoCurrencyCode, chain, bankId, recipient, ... }
 */
export interface OfframpInitRequest {
  fiatAmount: number;
  fiatCurrency: string;
  cryptoCurrencyCode: string; // Map from your asset symbol
  chain: string;              // Map from networkId
  network?: string;           // Optional alias for chain
  
  // Banking & Recipient Info
  bankId?: string;            // database UUID for a saved bank
  bankAccountId?: string;     // alias for bankId used in some UI flows
  bankDetail?: {
    accountNumber: string;
    bankCode: string;
    accountName: string;
  };
  recipient?: string | object; // Email, phone, or complex object
  
  // Security / MFA Fields
  verificationCode?: string;   // OTP or TOTP code
  verificationType?: "otp" | "totp";
}

/**
 * --- Offramp Response Interface ---
 */
export interface OfframpResponse {
  success: boolean;
  transactionId?: string;
  checkoutUrl?: string; // e.g. for Moonpay/Transak
  url?: string;         // e.g. for MoneyGram
  message?: string;
  // If MFA is needed, backend returns 403 with these:
  code?: "VERIFICATION_REQUIRED";
  verificationType?: "otp" | "totp";
}

/**
 * --- Offramp Service ---
 */
export const offrampService = {
  initiatePaychant: (body: OfframpInitRequest) => post("/api/offramp/paychant", body),
  
  initiateTransak: (body: OfframpInitRequest) => post("/api/offramp/transak", body),
  
  initiateRamp: (body: OfframpInitRequest) => post("/api/offramp/ramp", body),
  
  initiatePaycrest: (body: OfframpInitRequest) => post("/api/offramp/paycrest", body),
  
  initiateCentiiv: (body: OfframpInitRequest) => post("/api/offramp/centiiv", body),
  
  initiateMoonpay: (body: OfframpInitRequest) => post("/api/offramp/moonpay", body),
  
  initiateQuidax: (body: OfframpInitRequest) => post("/api/offramp/quidax", body),
  
  /**
   * Specialized MoneyGram Offramp (Uses Stellar Network)
   */
  initiateMoneyGram: (body: OfframpInitRequest) => post("/api/offramp/moneygram", body),
  
  /**
   * Centiiv Fund Destination
   */
  fundCentiiv: async (body: { transactionId: string }): Promise<ApiResponse<{ success: boolean }>> => {
    const res = await fetch("/api/offramp/centiiv/fund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
};

/**
 * --- Internal POST Helper ---
 */
async function post(
  endpoint: string, 
  body: OfframpInitRequest
): Promise<ApiResponse<OfframpResponse>> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      // Optional: Add platform headers if needed for MFA logic
      "x-platform": typeof window !== "undefined" ? "web" : "mobile",
    },
    credentials: "include", 
    body: JSON.stringify(body),
  });
  
  return handleResponse(res);
}