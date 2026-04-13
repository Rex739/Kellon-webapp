import { BankDetail } from "@/types/db"
import { ApiResponse, handleResponse } from "."

export const getBanks = async (): Promise<ApiResponse<BankDetail[]>> => {
  const res = await fetch("/api/banks", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  return handleResponse(res)
}

export const addBank = async (
  data: Partial<BankDetail>,
): Promise<ApiResponse<BankDetail>> => {
  const res = await fetch("/api/banks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

export const deleteBank = async (id: string): Promise<ApiResponse<void>> => {
  const res = await fetch(`/api/banks/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
  return handleResponse(res)
}

export const updateBank = async (
  id: string,
  data: Partial<BankDetail>,
): Promise<ApiResponse<BankDetail>> => {
  const res = await fetch(`/api/banks/${id}`, {
    method: "PATCH", // or PUT depending on your backend
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}
