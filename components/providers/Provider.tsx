import { FC, Fragment, ReactNode } from "react"

import { ThemeProvider } from "./theme-provider"

import { CustomWagmiProvider } from "./wagmi-provider"
// IMP END - SSR
import "@/lib/lifi-config"
import SDKProviders from "./LifiProvider"
import React from "react"
import ReactQueryProvider from "./ReactQueryProvider"
import MyPrivyProvider from "./PrivyProvider"
import { Toaster } from "sonner"

interface ProviderProps {
  children: ReactNode
}

const Provider: FC<ProviderProps> = async ({ children }) => {
  return (
    <Fragment>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={true}
        storageKey="kellon-theme"
      >
        <MyPrivyProvider>
          <ReactQueryProvider>
            <CustomWagmiProvider>
              <SDKProviders />
              <main className="font-manrope bg-gray-80 dark:bg-secondary-50 text-cryptoNight dark:text-white relative">
                {children}
                <Toaster
                  richColors
                  position="top-center"
                  // This ensures the toast matches your dark/light mode setup
                  theme="system"
                />
              </main>
            </CustomWagmiProvider>
          </ReactQueryProvider>
        </MyPrivyProvider>
      </ThemeProvider>
    </Fragment>
  )
}
export default Provider
