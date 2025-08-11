import { FC, Fragment, ReactNode } from "react"

// IMP START - Quick Start
import Web3AuthenticationProvider from "./providers/web3AuthProvider"
// IMP END - Quick Start

// IMP START - Theme Provider (handles dark/light mode & theme state)
import { ThemeProvider } from "./providers/theme-provider"
// IMP END - Theme Provider

// IMP START - SSR
import { cookieToWeb3AuthState } from "@web3auth/modal"
// IMP END - SSR

// IMP START - SSR
import { headers } from "next/headers"
// IMP END - SSR

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
          <main className="font-manrope bg-white dark:bg-secondary-50 text-cryptoNight dark:text-white ">
            {children}
          </main>
        </Web3AuthenticationProvider>
        {/* // IMP END - SSR */}
      </ThemeProvider>
    </Fragment>
  )
}
export default Provider
