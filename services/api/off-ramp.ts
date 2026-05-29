import { ApiResponse, apiFetch, handleResponse } from "./index";

/**
 * --- Offramp Request Interface ---
 * Mapped to: { fiatAmount, fiatCurrency, cryptoCurrencyCode, chain, bankId, recipient, ... }
 */
export interface OfframpInitRequest {
  fiatAmount: number;
  fiatCurrency: string;
  cryptoAmount?: number;
  assetAmount?: number;
  cryptoCurrencyCode: string; // Map from your asset symbol
  cryptocurrency?: string;
  asset?: string;
  token?: string;
  chain: string; // Map from networkId
  network?: string; // Optional alias for chain
  rate?: number | string | null;

  // Banking & Recipient Info
  bankId?: string; // database UUID for a saved bank
  bankAccountId?: string; // alias for bankId used in some UI flows
  bankDetail?: {
    bankName?: string;
    accountNumber: string;
    bankCode: string;
    accountName: string;
    provider?: string | null;
    country?: string | null;
  };
  recipient?: string | object; // Email, phone, or complex object

  // Security / MFA Fields
  verificationCode?: string; // OTP or TOTP code
  verificationType?: "otp" | "totp";
  verificationCodes?: Record<string, string>;

  providerId?: string;
  source?: "web" | "mobile";
  paymentMethod?: string;
}

/**
 * --- Offramp Response Interface ---
 */
export interface OfframpResponse {
  id?: string;
  success?: boolean;
  transactionId?: string;
  transactionReference?: string;
  txId?: string;
  orderId?: string;
  reference?: string;
  providerReference?: string;
  checkoutUrl?: string; // e.g. for Moonpay/Transak
  paymentUrl?: string;
  redirectUrl?: string;
  url?: string; // e.g. for MoneyGram
  provider?: string;
  status?: string;
  message?: string;
  transaction?: {
    id?: string;
    transactionId?: string;
  };
  order?: {
    id?: string;
    transactionId?: string;
    reference?: string;
  };
  // If MFA is needed, backend returns 403 with these:
  code?: "VERIFICATION_REQUIRED";
  verificationType?: "otp" | "totp";
}

/**
 * --- Offramp Service ---
 */
export const offrampService = {
  initiatePaychant: (body: OfframpInitRequest) =>
    post(["/api/offramp/paychant/initiate", "/api/offramp/paychant"], body),

  initiateTransak: (body: OfframpInitRequest) =>
    post(["/api/offramp/transak/initiate", "/api/offramp/transak"], body),

  initiateRamp: (body: OfframpInitRequest) =>
    post(["/api/offramp/ramp/initiate", "/api/offramp/ramp"], body),

  initiatePaycrest: (body: OfframpInitRequest) =>
    post(["/api/offramp/paycrest/initiate", "/api/offramp/paycrest"], body),

  initiateCentiiv: (body: OfframpInitRequest) =>
    post(["/api/offramp/centiiv/initiate", "/api/offramp/centiiv"], body),

  initiateMoonpay: (body: OfframpInitRequest) =>
    post(["/api/offramp/moonpay/initiate", "/api/offramp/moonpay"], body),

  initiateQuidax: (body: OfframpInitRequest) =>
    post(["/api/offramp/quidax/initiate", "/api/offramp/quidax"], body),

  /**
   * Specialized MoneyGram Offramp (Uses Stellar Network)
   */
  initiateMoneyGram: (body: OfframpInitRequest) =>
    post(["/api/offramp/moneygram/initiate", "/api/offramp/moneygram"], body),

  /**
   * Centiiv Fund Destination
   */
  fundCentiiv: async (body: {
    transactionId: string;
  }): Promise<ApiResponse<{ success: boolean }>> => {
    const res = await apiFetch("/api/offramp/centiiv/fund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
};

/**
 * --- Internal POST Helper ---
 */
async function post(
  endpoints: string | string[],
  body: OfframpInitRequest,
): Promise<ApiResponse<OfframpResponse>> {
  const candidates = Array.isArray(endpoints) ? endpoints : [endpoints];
  let lastResponse: Response | null = null;

  for (const endpoint of candidates) {
    const res = await apiFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-platform": typeof window !== "undefined" ? "web" : "mobile",
      },
      body: JSON.stringify(body),
    });

    if (res.status !== 404 || endpoint === candidates[candidates.length - 1]) {
      return handleResponse(res);
    }

    lastResponse = res;
  }

  return handleResponse(lastResponse as Response);
}
