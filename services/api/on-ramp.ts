import { ApiResponse, apiFetch, handleResponse } from "./index";

/**
 * --- Onramp Request Interface ---
 * Strictly mapped to your backend controller's destructuring:
 * const { fiatAmount, fiatCurrency, cryptoCurrencyCode, chain, network, ...metadata } = req.body;
 */
export interface OnrampInitRequest {
  fiatAmount: number;
  fiatCurrency: string;
  cryptoCurrencyCode: string;
  chain: string;
  network: string;
  // Metadata fields - explicitly defined to avoid 'any'
  paymentMethod?: string;
  providerId?: string;
  source?: "web" | "mobile";
}

/**
 * --- Onramp Response Interface ---
 * Matches the 'order' object returned by your backend
 */
export interface OnrampResponse {
  transactionId: string;
  checkoutUrl?: string;
  provider: string;
  status: string;
  orderId?: string;
  paymentDetails?: {
    accountNumber: string;
    bankName: string;
    accountName: string;
    amount: number;
    reference: string;
  };
}

/**
 * --- Onramp Service ---
 */
export const onrampService = {
  initiateRamp: (
    body: OnrampInitRequest,
  ): Promise<ApiResponse<OnrampResponse>> =>
    post("/api/onramp/ramp/initiate", body),

  initiateTransak: (
    body: OnrampInitRequest,
  ): Promise<ApiResponse<OnrampResponse>> =>
    post("/api/onramp/transak/initiate", body),

  initiatePaycrest: (
    body: OnrampInitRequest,
  ): Promise<ApiResponse<OnrampResponse>> =>
    post("/api/onramp/paycrest/initiate", body),

  initiateCentiiv: (
    body: OnrampInitRequest,
  ): Promise<ApiResponse<OnrampResponse>> =>
    post("/api/onramp/centiiv/initiate", body),

  initiateMoonpay: (
    body: OnrampInitRequest,
  ): Promise<ApiResponse<OnrampResponse>> =>
    post("/api/onramp/moonpay/initiate", body),

  initiateQuidax: (
    body: OnrampInitRequest,
  ): Promise<ApiResponse<OnrampResponse>> =>
    post("/api/onramp/quidax/initiate", body),

  initiatePaychant: (
    body: OnrampInitRequest,
  ): Promise<ApiResponse<OnrampResponse>> =>
    post("/api/onramp/paychant/initiate", body),
};

/**
 * --- Internal POST Helper ---
 * Strictly typed to prevent 'any' pollution
 */
async function post(
  endpoint: string,
  body: OnrampInitRequest,
): Promise<ApiResponse<OnrampResponse>> {
  const res = await apiFetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}
