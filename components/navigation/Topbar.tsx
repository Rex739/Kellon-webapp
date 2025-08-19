"use client"

import Link from "next/link"
import { FC, HtmlHTMLAttributes, useState } from "react"
import { useEffect } from "react"

// IMP START - App Imports
import { navigationListUrls } from "./navigationUrl"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/Icons"
import { usePathname } from "next/navigation"
import { isActive } from "@/lib/isActiveLink"
import Login from "@/components/Login"
import ModeToggle from "@/components/ModeToggle"
import { Button } from "@/components/ui/button"
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
} from "@web3auth/modal/react"
import { WalletCircle } from "@/components/ui/wallet-circle"
import MobileMenu from "./MobileMenu"
import { useAccount } from "wagmi"
import { MoreHorizontal } from "lucide-react"
// IMP END - App Imports

type TopbarProps = HtmlHTMLAttributes<HTMLDivElement>

const Topbar: FC<TopbarProps> = ({ className }) => {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // IMP START - Web3Auth connection state
  const {
    connect,
    isConnected,
    loading: connectLoading,
    error: connectError,
  } = useWeb3AuthConnect()
  // IMP END - Web3Auth connection state

  // IMP START - Blockchain Calls
  const { address } = useAccount()
  const {
    disconnect,
    // loading: disconnectLoading,
    // error: disconnectError,
  } = useWeb3AuthDisconnect()

  // IMP END - Blockchain Calls

  useEffect(() => {
    // Whenever connection status changes, close the menu
    if (isConnected) {
      setIsMenuOpen(false)
    }
  }, [isConnected])

  return (
    <section className={cn(className, "p-5")}>
      <header className="flex justify-between items-center">
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-5 bg-white dark:bg-secondary-60 w-fit capitalize px-5 py-3 rounded-xl shadow-topbar border border-input">
          <Icons.Logo className="h-6 w-6" />

          {navigationListUrls.map(({ label, href }, i) => (
            <ul key={i}>
              <li>
                <Link
                  href={href}
                  className={cn(
                    "text-gray-20 dark:text-gray-40 hover:text-black dark:hover:text-white font-medium",
                    isActive(pathname, href) && "text-black dark:text-white"
                  )}
                >
                  {label}
                </Link>
              </li>
            </ul>
          ))}
        </nav>

        {/* Desktop Controls */}
        <ul className="hidden md:flex items-center gap-3">
          <li className="flex">
            <ModeToggle />
          </li>
          <li>
            <Login />
          </li>
        </ul>

        {/* Mobile Topbar */}
        <div className="flex md:hidden w-full justify-between items-center">
          <Icons.Logo className="h-10 w-10  p-2 rounded-md shadow-2xl border border-black dark:border-white" />

          {!isConnected ? (
            // Show connect button if NOT connected
            <Button
              onClick={() => connect()}
              isLoading={connectLoading}
              disabled={connectLoading}
              className="shadow-2xl  font-semibold inline-flex gap-2 justify-center items-center text-white"
            >
              <WalletCircle className="border-white" />
              Connect
            </Button>
          ) : (
            // Show hamburger if connected
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              className=""
            >
              <div className="flex">
                <span className="border border-black dark:border-white border-r-0 rounded-l-md flex items-center justify-center p-1">
                  <WalletCircle className="dark:text-white w-7 h-7 flex justify-center items-center" />
                </span>
                <span className="border border-black dark:border-white rounded-r-md flex items-center justify-center p-1">
                  <MoreHorizontal className="dark:text-white w-7 h-7" />
                </span>
              </div>
            </button>
          )}
        </div>
      </header>
      {/* Mobile Menu */}

      <MobileMenu
        isOpen={isMenuOpen && isConnected}
        onClose={() => setIsMenuOpen(false)}
        onDisconnect={disconnect}
        address={address}
      />
      {connectError && (
        <p className="text-red-500 text-sm mt-2">{connectError.message}</p>
      )}
    </section>
  )
}

export default Topbar
