/**
 * @file Auth Service Utilities
 * Handles authentication flows between the Next.js frontend (Client & Server)
 * and the backend API, specifically managing Privy-based sessions.
 */


type ApiError = {
  message?: string
  error?: string
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

const BASE_URL = getBaseUrl()

/**
 * Standardized handler for fetch responses.
 * Parses JSON on success or extracts error messages on failure.
 * @param res - Fetch Response object
 * @returns Parsed JSON body or null if empty
 * @throws Error with message from backend or default fallback
 */
async function handleResponse(res: Response) {
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
 * 🔐 Login with Privy
 * Sends the Privy identity token and device metadata to the backend
 * to establish a session.
 * * @param token - The Privy identity token (JWT)
 */
export async function loginWithPrivy(token: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      token,
      device: "web-browser",
      deviceInfo: {
        platform: "web",
        userAgent:
          typeof window !== "undefined" ? navigator.userAgent : "unknown",
        timestamp: new Date().toISOString(),
      },
    }),
    credentials: "include", // Ensure cookies are set/sent
  })

  return handleResponse(res)
}

/**
 * 🚪 Logout User
 * Notifies the backend to invalidate the session and clear cookies.
 */
export async function logout() {
  const res = await fetch(`/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  })

  return handleResponse(res)
}

/**
 * 🔎 Get Current Session
 * Server-side utility to check authentication status by forwarding
 * the session token to the backend.
 * * @note This function must be called within a Next.js Server Component or Action.
 * @returns User object if authenticated, otherwise null.
 */
export async function getSession(sessionToken?: string) {
  // 1. Retrieve the session token from the browser's request cookies

  // Early exit if no token is present to avoid unnecessary API calls
  if (!sessionToken) return null

  try {
    const res = await fetch(`${BASE_URL}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 2. Explicitly forward the auth token to the external backend
        Cookie: `session_token=${sessionToken}`,
      },
      // 3. Prevent Next.js from caching auth data across different users
      cache: "no-store",
    })

    return await handleResponse(res)
  } catch (error) {
    console.error("Session fetch failed:", error)
    return null
  }
}
