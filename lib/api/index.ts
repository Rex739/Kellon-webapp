type ApiError = {
  message?: string
  error?: string
}

/**
 * Standardized handler for fetch responses.
 * Parses JSON on success or extracts error messages on failure.
 * @param res - Fetch Response object
 * @returns Parsed JSON body or null if empty
 * @throws Error with message from backend or default fallback
 */


export async function handleResponse(res: Response) {
  if (!res.ok) {
    let error: ApiError = {}
    try {
      error = await res.json()
    } catch {
      // Fallback for non-JSON error responses
    }

    throw new Error(error.message || error.error || "Something went wrong")
  }

  return res.json().catch(() => null)
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

