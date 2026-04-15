"use client"

import Link from "next/link"
import { FC, HtmlHTMLAttributes, useState, useEffect } from "react"

// IMP START - App Imports
import { navigationListUrls } from "./navigationUrl"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/Icons"
import { usePathname } from "next/navigation"
import { isActive } from "@/lib/isActiveLink"
import { Button } from "@/components/ui/button"
import { WalletCircle } from "@/components/ui/wallet-circle"
import MobileMenu from "./MobileMenu"
import { useAccount } from "wagmi"
import { MoreHorizontal } from "lucide-react"

// IMP START - Privy Auth Import
import { usePrivy } from "@privy-io/react-auth"
import { useUser } from "@/hooks/useUser"

import NotificationBell from "../notification/NotificationBell"
import UserNavigation from "./user-navigation/UserNavigation"
import ModeToggle from "../ModeToggle"
import SearchBar from "../SearchBar"
// IMP END - Privy Auth Import

type TopbarProps = HtmlHTMLAttributes<HTMLDivElement>

const Topbar: FC<TopbarProps> = ({ className }) => {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: profile } = useUser()

  // IMP START - Privy connection state
  const { login, authenticated, ready, logout } = usePrivy()
  // IMP END - Privy connection state

  // IMP START - Blockchain Calls
  const { address } = useAccount()
  // IMP END - Blockchain Calls

  useEffect(() => {
    // Whenever connection status changes to authenticated, close the menu
    if (authenticated) {
      setIsMenuOpen(false)
    }
  }, [authenticated])

  const HIDDEN_PATHS = ["/continue"]

  if (HIDDEN_PATHS.includes(pathname)) {
    return null
  }

  return (
    <section
      className={cn(
        className,
        "px-5 fixed w-full z-50 bg-white dark:bg-secondary-60 border-b border-input",
      )}
    >
      <header className="flex justify-between items-center">
        {/* Desktop Navigation */}
        <div className="flex gap-2">
          <nav className="hidden md:flex gap-5  w-fit capitalize px-5 py-2 my-2 rounded-md border border-input">
            <Icons.Logo className="h-6 w-6" />

            {navigationListUrls.map(({ label, href }, i) => (
              <ul key={i}>
                <li>
                  <Link
                    href={href}
                    className={cn(
                      "text-gray-20 dark:text-gray-40 hover:text-black dark:hover:text-white font-medium",
                      isActive(pathname, href) && "text-black dark:text-white",
                    )}
                  >
                    {label}
                  </Link>
                </li>
              </ul>
            ))}
          </nav>
          {/* <ModeToggle /> */}
        </div>

        {/* Desktop Controls */}
        <ul className="hidden md:flex items-center gap-2">
          <li>
            <SearchBar />
          </li>
          <li>
            <div className="flex rounded-md border border-input items-centerspace-x-1">
              <ModeToggle />
              <div className="h-9 w-[1px] bg-input my-auto"></div>
              <NotificationBell />
            </div>
          </li>

          <li>{profile && <UserNavigation profile={profile} />}</li>
        </ul>
        {/* Mobile Topbar */}
        <div className="flex md:hidden w-full justify-between items-center">
          <Icons.Logo className="h-10 w-10  p-2 rounded-md shadow-2xl border border-black dark:border-white" />

          {!authenticated ? (
            // Show connect button if NOT connected
            <Button
              onClick={login}
              disabled={!ready}
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
        isOpen={isMenuOpen && authenticated}
        onClose={() => setIsMenuOpen(false)}
        onDisconnect={logout}
        address={address}
      />
    </section>
  )
}

export default Topbar
