// hooks/use-user.ts
import { useQuery } from "@tanstack/react-query"
import { getSession } from "@/lib/api/auth"
import { User } from "@/types/db"

export function useUser(initialData?: User | null) {
  return useQuery<User | null>({
    queryKey: ["user-session"],
    queryFn: async () => {
      const session = await getSession()
      console.log("session", session)
      return session?.data || null
    },
    initialData,
    // Since we provide initialData from the server,
    // we set a staleTime so it doesn't immediately refetch on the client.
    staleTime: 1000 * 60 * 5,
  })
}
