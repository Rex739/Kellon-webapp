// lib/api/provider.ts

import { ApiResponse, handleResponse } from "./index"

/**
 * --- Strict Request Interfaces ---
 */
export interface ProviderListQuery {
  country?: string
  currency?: string
  network?: string
  type?: string
}

export interface PaycrestRateParams {
  token: string
  amount: number
  currency: string
  network: string
}

export interface CentiivQuoteRequest {
  fromAsset: string
  toAsset: string
  amount: number
}

export interface BankVerificationRequest {
  bankCode: string
  accountNumber: string
  save?: boolean
  bankName?: string
  accountName?: string
}

/**
 * --- Strict Response Interfaces ---
 * Defined based on backend controller property access
 */
export interface PaymentProvider {
  id: string
  name: string
  slug: string
  isEnabled: boolean
}

export interface PaycrestRateResponse {
  buy: {
    rate: string // e.g. "1381.57"
    providerIds: string[]
    orderType: string
    refundTimeoutMinutes: number
  }
  sell: {
    rate: string
    providerIds: string[]
    orderType: string
    refundTimeoutMinutes: number
  }
}

export interface CentiivQuoteResponse {
  rate: string 
  estimatedReceivableAmount: string 
  fees: string 
}

export interface BankAccountData {
  accountName: string
  accountNumber: string
  bankName: string
  bankCode: string
}

export interface CentiivBank {
  name: string
  code: string
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
    const query = new URLSearchParams(
      params as Record<string, string>,
    ).toString()
    const res = await fetch(`/api/providers?${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    return handleResponse(res)
  },

  /**
   * GET /api/providers/paycrest/rate
   * controller: getPaycrestRate
   */
  getPaycrestRate: async (
    params: PaycrestRateParams,
  ): Promise<ApiResponse<PaycrestRateResponse>> => {
    const query = new URLSearchParams({
      token: params.token,
      amount: params.amount.toString(),
      currency: params.currency,
      network: params.network,
    }).toString()

    const res = await fetch(`/api/providers/paycrest/rate?${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
    return handleResponse(res)
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
    })
    return handleResponse(res)
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
    })
    return handleResponse(res)
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
    })
    return handleResponse(res)
  },
}
