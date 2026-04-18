"use client"

import Link from "next/link"
import { FC, HtmlHTMLAttributes } from "react"

// IMP START - App Imports
import { navigationListUrls } from "./navigationUrl"
import { cn, getGreeting } from "@/lib/utils"
import { Icons } from "@/components/Icons"
import { usePathname } from "next/navigation"
import { isActive } from "@/lib/isActiveLink"

import { useUser } from "@/hooks/use-user"

import NotificationBell from "@/components/notification/NotificationBell"
import UserNavigation from "./user-navigation/UserNavigation"
import ModeToggle from "@/components/ModeToggle"
import SearchBar from "@/components/SearchBar"
import Image from "next/image"

import { User } from "@/types/db"
// IMP END - Privy Auth Import

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

  const greeting = getGreeting()

  return (
    <section
      className={cn(
        className,
        "px-5 py-2 md:py-0 relative md:fixed w-full z-50 bg-white dark:bg-secondary-50 md:border-b border-input",
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
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-full bg-primary-95 dark:bg-primary-70 flex items-center justify-center overflow-hidden border border-gray-80 dark:border-white transition-all group-hover:border-primary-50">
              {profile?.image ? (
                <Image
                  src={profile.image}
                  alt={profile.name || "User"}
                  className="w-full h-full object-cover"
                  width={40}
                  height={40}
                />
              ) : (
                <span className="text-sm text-primary-50 dark:text-white font-bold">
                  {profile?.name?.charAt(0).toUpperCase() || "?"}
                </span>
              )}
            </div>
            <Link
              href="/settings/profile"
              className="flex flex-col justify-center"
            >
              <span className="text-xs font-medium text-gray-20 dark:text-gray-40 capitalize ">
                {greeting}
              </span>
              <span className="text-xs font-normal text-black dark:text-white leading-tight">
                {(profile && `${profile?.name?.split(" ")[0]}!`) || "Guest"}
              </span>
            </Link>
          </div>

          <NotificationBell />
        </div>
      </header>
    </section>
  )
}

export default Topbar
