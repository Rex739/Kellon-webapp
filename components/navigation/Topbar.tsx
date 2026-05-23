"use client";

import Link from "next/link";
import { FC, HtmlHTMLAttributes } from "react";

// IMP START - App Imports
import { navigationListUrls } from "./navigationUrl";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/Icons";
import { usePathname } from "next/navigation";
import { isActive } from "@/lib/is-active-link";

import NotificationBell from "@/components/notification/NotificationBell";
import UserNavigation from "./user-navigation/UserNavigation";
import ModeToggle from "@/components/ModeToggle";
import SearchBar from "@/components/SearchBar";

import { User } from "@/types/db";

interface TopbarProps extends HtmlHTMLAttributes<HTMLDivElement> {
  profile: User;
}

const Topbar: FC<TopbarProps> = ({ className, profile }) => {
  const pathname = usePathname();

  const HIDDEN_PATHS = ["/continue"];

  if (HIDDEN_PATHS.includes(pathname)) {
    return null;
  }

  return (
    <section
      className={cn(
        className,
        "hidden md:block px-5 py-2 md:py-0 relative md:fixed w-full md:z-50",
      )}
    >
      <header className="flex justify-between items-center">
        {/* Desktop Navigation */}
        <div className="flex gap-2">
          <nav className="hidden md:flex gap-5 w-fit capitalize px-5 py-2 my-2 rounded-md border border-gray-80 bg-white/85 shadow-sm backdrop-blur dark:border-input dark:bg-transparent dark:shadow-none">
            <Icons.Logo className="h-6 w-6" />

            {navigationListUrls.map(({ label, href }, i) => (
              <ul key={i}>
                <li>
                  <Link
                    href={href}
                    className={cn(
                      "text-gray-30 dark:text-gray-40 hover:text-cryptoNight dark:hover:text-white font-medium",
                      isActive(pathname, href) &&
                        "text-cryptoNight dark:text-white",
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
            <SearchBar profile={profile} />
          </li>
          <li>
            <div className="flex items-center rounded-md border border-gray-80 bg-white/85 shadow-sm backdrop-blur dark:border-input dark:bg-transparent dark:shadow-none">
              <ModeToggle />
              <div className="h-9 w-[1px] bg-gray-80 my-auto dark:bg-input"></div>
              <NotificationBell />
            </div>
          </li>

          <li>{profile && <UserNavigation profile={profile} />}</li>
        </ul>
      </header>
    </section>
  );
};

export default Topbar;
