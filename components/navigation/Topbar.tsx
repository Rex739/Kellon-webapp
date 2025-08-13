"use client"

import Link from "next/link"
import { FC, HtmlHTMLAttributes } from "react"

// IMP START - App Imports
import { navigationListUrls } from "./navigationUrl" // IMP - Navigation links config
import { cn } from "@/lib/utils" // IMP - Utility for conditional class merging
import { Icons } from "@/components/Icons" // IMP - Centralized icon components
import { usePathname } from "next/navigation" // IMP - Get current route path
import { isActive } from "@/lib/isActiveLink" // IMP - Active link detection helper
import Login from "@/components/Login" // IMP - Web3Auth login component
import ModeToggle from "@/components/ModeToggle" // IMP - Dark/Light mode toggle
// IMP END - App Imports

type TopbarProps = HtmlHTMLAttributes<HTMLDivElement>

const Topbar: FC<TopbarProps> = ({ className }) => {
  // IMP START - Get Current Route Pathname for Active Link Highlighting
  const pathname = usePathname()
  // IMP END - Get Current Route Pathname for Active Link Highlighting

  return (
    // IMP START - Topbar Section Wrapper
    <section className={cn(className, "p-5")}>
      {/* IMP START - Topbar Header Layout */}
      <header className="flex justify-between">
        {/* IMP START - Navigation Menu Container */}
        <nav className="flex gap-5 bg-white dark:bg-secondary-60 w-fit capitalize px-5 py-3 rounded-xl shadow-topbar border border-input">
          {/* IMP START - App Logo */}
          <Icons.Logo className="h-6 w-6" />
          {/* IMP END - App Logo */}

          {/* IMP START - Render Navigation Links */}
          {navigationListUrls.map(({ label, href }, i) => (
            <ul key={i}>
              <li>
                <Link
                  href={href}
                  className={cn(
                    // IMP START - Base Styling for Navigation Links
                    "text-gray-20 dark:text-gray-40 hover:text-black dark:hover:text-white font-medium",
                    // IMP END - Base Styling for Navigation Links

                    // IMP START - Apply Active State Styling
                    isActive(pathname, href) && "text-black dark:text-white"
                    // IMP END - Apply Active State Styling
                  )}
                >
                  {label}
                </Link>
              </li>
            </ul>
          ))}
          {/* IMP END - Render Navigation Links */}
        </nav>
        {/* IMP END - Navigation Menu Container */}

        {/* IMP START - Auth & Utility Controls */}
        <ul className="flex">
          {/* IMP START - Dark/Light Mode Toggle */}
          <li>
            <ModeToggle />
          </li>
          {/* IMP END - Dark/Light Mode Toggle */}

          {/* IMP START - Wallet Authentication Button */}
          <li>
            <Login />
          </li>
          {/* IMP END - Wallet Authentication Button */}
        </ul>
        {/* IMP END - Auth & Utility Controls */}
      </header>
      {/* IMP END - Topbar Header Layout */}
    </section>
    // IMP END - Topbar Section Wrapper
  )
}

export default Topbar
