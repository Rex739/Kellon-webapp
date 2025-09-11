import { useState, useEffect } from "react"
import { getChains, type ExtendedChain } from "@lifi/sdk"

export function useSupportedChains() {
  const [chains, setChains] = useState<ExtendedChain[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getChains()
      .then((list) => setChains(list))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])
  return { chains, loading }
}
