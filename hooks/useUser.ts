import { getSession } from "@/lib/api/auth"
import { User } from "@/types/db"
import { useQuery } from "@tanstack/react-query"

// hooks/use-user.ts
export function useUser(initialData?: User | null) {
  return useQuery<User | null>({
    queryKey: ["user-session"],
    queryFn: async () => {
      try {
        const session = await getSession()
        // Only return null if the backend explicitly says the user is gone
        if (!session?.data) return null
        return session.data
      } catch (error) {
        // If the fetch fails (network error), keep the current data
        // throwing the error allows React Query to keep the "stale" data visible
        throw error
      }
    },
    initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in memory for 30 mins even if unused
    refetchOnWindowFocus: false, // Prevents flipping to Guest when clicking back to tab
    retry: 1, // Don't give up immediately on one failure
  })
}
