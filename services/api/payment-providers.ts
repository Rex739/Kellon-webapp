import { ApiResponse, handleResponse } from "./index";

/**
 * --- Strict Request Interfaces ---
 */
export interface ProviderListQuery {
  country?: string;
  currency?: string;
  network?: string;
  type?: string;
}

export interface PaycrestRateParams {
  token: string;
  amount: number;
  currency: string;
  network: string;
  side?: "buy" | "sell";
}

export interface CentiivQuoteRequest {
  fromAsset: string;
  toAsset: string;
  amount: number;
}

export interface BankVerificationRequest {
  bankCode: string;
  accountNumber: string;
  save?: boolean;
  bankName?: string;
  accountName?: string;
}

export interface PaycrestAccountVerificationRequest {
  institution: string;
  accountIdentifier: string;
  currency?: string;
  save?: boolean;
  bankName?: string;
  accountName?: string;
}

/**
 * --- Strict Response Interfaces ---
 * Defined based on backend controller property access
 */
export interface PaymentProvider {
  id: string;
  name: string;
  slug: string;
  isEnabled: boolean;
  health?: {
    state: string;
    isHealthy: boolean;
  };
}

export interface PaycrestRateResponse {
  buy: {
    rate: string; // e.g. "1381.57"
    providerIds: string[];
    orderType: string;
    refundTimeoutMinutes: number;
  };
  sell: {
    rate: string;
    providerIds: string[];
    orderType: string;
    refundTimeoutMinutes: number;
  };
}

export interface CentiivQuoteResponse {
  rate: string;
  estimatedReceivableAmount: string;
  fees: string;
}

export interface BankAccountData {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  bank_name?: string;
  account_name?: string;
}

export interface CentiivBank {
  name: string;
  code: string;
}

export interface PaycrestInstitution {
  name?: string;
  code?: string;
  id?: string;
  institution?: string;
  [key: string]: unknown;
}

export interface PaycrestAccountData {
  accountName?: string;
  institutionName?: string;
  bankName?: string;
  [key: string]: unknown;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

function buildProviderListQuery(params: ProviderListQuery) {
  return buildQuery({
    country: params.country,
    currency: params.currency,
    network: params.network,
    type: params.type,
  });
}

/**
 * --- Provider Service ---
 */
export const providerService = {
  /**
   * GET /api/providers
   * controller: listProviders
   */
  listProviders: async (
    params: ProviderListQuery,
  ): Promise<ApiResponse<PaymentProvider[]>> => {
    const query = buildProviderListQuery(params);
    const endpoint = query ? `/api/providers?${query}` : "/api/providers";

    const res = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(res);
  },

  /**
   * GET /api/providers/paycrest/rate
   * controller: getPaycrestRate
   */
  getPaycrestRate: async (
    params: PaycrestRateParams,
  ): Promise<ApiResponse<PaycrestRateResponse>> => {
    const query = buildQuery({
      token: params.token,
      amount: params.amount,
      currency: params.currency,
      network: params.network,
      side: params.side,
    });

    const res = await fetch(`/api/providers/paycrest/rate?${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse(res);
  },

  /**
   * POST /api/providers/centiiv/quote
   * controller: getQuoteCentiiv
   */
  getCentiivQuote: async (
    body: CentiivQuoteRequest,
  ): Promise<ApiResponse<CentiivQuoteResponse>> => {
    const res = await fetch("/api/providers/centiiv/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  /**
   * POST /api/providers/verify-bank
   * controller: verifyBank
   */
  verifyBank: async (
    body: BankVerificationRequest,
  ): Promise<ApiResponse<BankAccountData>> => {
    const res = await fetch("/api/providers/verify-bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  /**
   * GET /api/providers/centiiv/banks
   * controller: getBankListsFromCentiiv
   */
  getBankList: async (): Promise<ApiResponse<CentiivBank[]>> => {
    const res = await fetch("/api/providers/centiiv/banks", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return handleResponse(res);
  },

  /**
   * GET /api/providers/paycrest/institutions/:currency
   * controller: getPaycrestInstitutionsHandler
   */
  getPaycrestInstitutions: async (
    currency: string,
  ): Promise<ApiResponse<PaycrestInstitution[]>> => {
    const normalizedCurrency = currency.toUpperCase();
    const res = await fetch(
      `/api/providers/paycrest/institutions/${encodeURIComponent(normalizedCurrency)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      },
    );
    return handleResponse(res);
  },

  /**
   * POST /api/providers/paycrest/verify-account
   * controller: verifyPaycrestAccountHandler
   */
  verifyPaycrestAccount: async (
    body: PaycrestAccountVerificationRequest,
  ): Promise<ApiResponse<PaycrestAccountData>> => {
    const res = await fetch("/api/providers/paycrest/verify-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
};
