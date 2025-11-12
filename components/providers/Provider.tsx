import { FC, Fragment, ReactNode } from "react"

// IMP START - Quick Start
import Web3AuthenticationProvider from "./web3AuthProvider"
// IMP END - Quick Start

// IMP START - Theme Provider (handles dark/light mode & theme state)
import { ThemeProvider } from "./theme-provider"
// IMP END - Theme Provider

// IMP START - SSR
import { cookieToWeb3AuthState } from "@web3auth/modal"
// IMP END - SSR

// IMP START - SSR
import { headers } from "next/headers"
import { CustomWagmiProvider } from "./wagmi-provider"
// IMP END - SSR
import "@/lib/lifiConfig"
import { SDKProviders } from "./LifiProvider"
interface ProviderProps {
  children: ReactNode
}

const Provider: FC<ProviderProps> = async ({ children }) => {
  // IMP START - SSR
  const headersList = await headers()
  const web3authInitialState = cookieToWeb3AuthState(headersList.get("cookie"))
  // IMP END - SSR

  return (
    <Fragment>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        storageKey="kellon-theme"
      >
        {/* // IMP START - SSR */}

        <Web3AuthenticationProvider web3authInitialState={web3authInitialState}>
          <CustomWagmiProvider>
            <SDKProviders />
            <main className="font-manrope bg-gray-80 dark:bg-secondary-50 text-cryptoNight dark:text-white relative">
              {children}
            </main>
          </CustomWagmiProvider>
        </Web3AuthenticationProvider>

        {/* // IMP END - SSR */}
      </ThemeProvider>
    </Fragment>
  )
}
export default Provider
