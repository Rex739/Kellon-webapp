"use client"

import Link from "next/link"
import { FC, HtmlHTMLAttributes, useState, useEffect } from "react"

// IMP START - App Imports
import { navigationListUrls } from "./navigationUrl"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/Icons"
import { usePathname } from "next/navigation"
import { isActive } from "@/lib/isActiveLink"
import ModeToggle from "@/components/ModeToggle"
import { Button } from "@/components/ui/button"
import { WalletCircle } from "@/components/ui/wallet-circle"
import MobileMenu from "./MobileMenu"
import { useAccount } from "wagmi"
import { MoreHorizontal } from "lucide-react"
import Image from "next/image"
// IMP START - Privy Auth Import
import { usePrivy } from "@privy-io/react-auth"
import { useUser } from "@/hooks/useUser"
import { getGreeting } from "@/lib/utils/helpers"
// IMP END - Privy Auth Import

type TopbarProps = HtmlHTMLAttributes<HTMLDivElement>

const Topbar: FC<TopbarProps> = ({ className }) => {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: user } = useUser()

  // IMP START - Privy connection state
  const { login, authenticated, ready, logout } = usePrivy()
  // IMP END - Privy connection state

  // IMP START - Blockchain Calls
  const { address } = useAccount()
  // IMP END - Blockchain Calls

  const greeting = getGreeting()
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
    <section className={cn(className, "p-5 fixed w-full z-50")}>
      <header className="flex justify-between items-center">
        {/* Desktop Navigation */}
        <div className="flex gap-2">
          <nav className="hidden md:flex gap-5 bg-white dark:bg-secondary-60 w-fit capitalize px-5 py-3 rounded-xl border border-input">
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
        <ul className="hidden md:flex items-center">
          <li>
            <div className="flex  items-center  gap-3">
              {/* Avatar Placeholder */}
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center overflow-hidden">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-full h-full object-cover"
                    width={100}
                    height={100}
                  />
                ) : (
                  <span className="text-xs text-white font-medium">
                    {user?.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground leading-tight">
                  {greeting}
                </span>
                <span className="font-semibold text-sm leading-tight">
                  {user?.name ? user.name.split(" ")[0] : "Guest"}
                </span>
              </div>
            </div>
          </li>
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
