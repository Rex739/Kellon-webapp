"use client"

import Link from "next/link"
import { FC, HtmlHTMLAttributes } from "react"

// IMP START - App Imports
import { navigationListUrls } from "./navigationUrl"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/Icons"
import { usePathname } from "next/navigation"
import { isActive } from "@/lib/is-active-link"

import { useUser } from "@/hooks/use-user"

import NotificationBell from "@/components/notification/NotificationBell"
import UserNavigation from "./user-navigation/UserNavigation"
import ModeToggle from "@/components/ModeToggle"
import SearchBar from "@/components/SearchBar"

import { User } from "@/types/db"

interface TopbarProps extends HtmlHTMLAttributes<HTMLDivElement> {
  initialProfile: User
}

const Topbar: FC<TopbarProps> = ({ className, initialProfile }) => {
  const pathname = usePathname()
  const { data: profile } = useUser(initialProfile)

  const HIDDEN_PATHS = ["/continue"]

  if (HIDDEN_PATHS.includes(pathname)) {
    return null
  }

  return (
    <section
      className={cn(
        className,
        "px-5 py-2 md:py-0 relative md:fixed w-full z-50 bg-white dark:bg-secondary-50",
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
      </header>
    </section>
  )
}

export default Topbar
