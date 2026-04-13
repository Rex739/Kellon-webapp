import Cookies from "js-cookie"
import { BASE_URL, handleResponse } from "."

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
    body: JSON.stringify({ token }),
    credentials: "include",
  })

  const user = await handleResponse(res)

  // Using js-cookie to set the deviceToken if it exists in the response
  if (user?.data?.deviceToken) {
    Cookies.set("deviceToken", user.data.deviceToken, {
      expires: 365, // Sets cookie for 1 year, adjust as needed
      path: "/",
      sameSite: "strict",
      secure: true, // Only sent over HTTPS
    })
  }

  return user
}



/**
 * 🚪 Logout User
 * Notifies the backend to invalidate the session and clear cookies.
 */
export async function logout(device: string) {
  console.log("token", device)
  const res = await fetch(`/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // This is the missing piece
    },
    credentials: "include",
    body: JSON.stringify({ device }),
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
