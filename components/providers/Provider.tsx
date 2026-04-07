import { FC, Fragment, ReactNode } from "react"

import { ThemeProvider } from "./theme-provider"

import { CustomWagmiProvider } from "./wagmi-provider"
// IMP END - SSR
import "@/lib/lifiConfig"
import SDKProviders from "./LifiProvider"
import React from "react"
import ReactQueryProvider from "./ReactQueryProvider"
import MyPrivyProvider from "./PrivyProvider"

interface ProviderProps {
  children: ReactNode
}

const Provider: FC<ProviderProps> = async ({ children }) => {
  return (
    <Fragment>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        storageKey="kellon-theme"
      >
        <MyPrivyProvider>
          <ReactQueryProvider>
            <CustomWagmiProvider>
              <SDKProviders />
              <main className="font-manrope bg-gray-80 dark:bg-secondary-50 text-cryptoNight dark:text-white relative">
                {children}
              </main>
            </CustomWagmiProvider>
          </ReactQueryProvider>
        </MyPrivyProvider>
      </ThemeProvider>
    </Fragment>
  )
}
export default Provider
