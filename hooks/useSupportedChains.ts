import { useQuery } from "@tanstack/react-query"
import { getChains, type ExtendedChain } from "@lifi/sdk"

export function useSupportedChains() {
  const { data: chains = [], isLoading: loading } = useQuery<ExtendedChain[]>({
    queryKey: ["supportedChains"],
    queryFn: async () => await getChains(),
    staleTime: Infinity, // never goes stale
    gcTime: Infinity, // stays cached
  })

  return { chains, loading }
}
