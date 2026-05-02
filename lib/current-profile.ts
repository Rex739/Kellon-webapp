import { getSession } from "@/services/api/auth"
import { cookies } from "next/headers"

export const currentProfile = async () => {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value

  const session = await getSession(sessionToken)
  if (!session) return null

  const profile = session.data
  return profile
}
