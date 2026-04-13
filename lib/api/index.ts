import { User } from "@/types/db"

type ApiError = {
  message?: string
  error?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface LoginResponseData {
  deviceToken?: string
  user?: User // if user data is also returned
  // include any other fields your backend returns
}
/**
 * Standardized handler for fetch responses.
 * Parses JSON on success or extracts error messages on failure.
 * @param res - Fetch Response object
 * @returns Parsed JSON body or null if empty
 * @throws Error with message from backend or default fallback
 */

export async function handleResponse<T>(
  res: Response,
): Promise<ApiResponse<T>> {
  if (!res.ok) {
    let error: ApiError = {}
    try {
      error = await res.json()
    } catch {}
    throw new Error(error.message || error.error || "Something went wrong")
  }

  const json = await res.json().catch(() => null)

  // If the response has a top-level 'data' property, unwrap it
  const unwrappedData = json?.data !== undefined ? json.data : json

  return { success: true, data: unwrappedData }
}

/**
 * Validates and retrieves the backend API base URL.
 * @throws Error if the environment variable is missing.
 */
const getBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL

  if (!apiUrl || apiUrl.length === 0) {
    throw new Error(
      "Missing environment variable NEXT_PUBLIC_BACKEND_API_URL!!",
    )
  }

  return apiUrl
}

export const BASE_URL = getBaseUrl()
