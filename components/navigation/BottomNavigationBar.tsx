"use client"

import Link from "next/link"
import { FC, HtmlHTMLAttributes } from "react"
import { navigationListUrls } from "./navigationUrl"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/Icons"
import { isActive } from "@/lib/isActiveLink"
import { usePathname } from "next/navigation"

type BottomNavigationBarProps = HtmlHTMLAttributes<HTMLDivElement>

const BottomNavigationBar: FC<BottomNavigationBarProps> = ({ className }) => {
  // IMP START - Get Current Route Pathname for Active Link Highlighting
  const pathname = usePathname()
  // IMP END - Get Current Route Pathname for Active Link Highlighting

  return (
    // IMP START - Bottom Navigation Wrapper (Fixed Position)
    <section className={cn(className, "fixed bottom-0 w-full")}>
      {/* IMP START - Navigation Menu Container */}
      <nav className="flex justify-around bg-white dark:bg-secondary-60 px-5 py-3 shadow-topbar border-t border-input">
        {/* IMP START - Render Navigation Items */}
        {navigationListUrls.map(({ label, href, icon }, i) => {
          const Icon = icon && Icons[icon] // IMP - Dynamically map icon string to actual component
          return (
            <ul key={i}>
              <li>
                <Link
                  href={href}
                  className={cn(
                    // IMP START - Base Styling for Links
                    "text-gray-20 dark:text-gray-40 hover:text-black dark:hover:text-white capitalize text-xs font-medium",
                    // IMP END - Base Styling for Links

                    // IMP START - Apply Active Link Styling
                    isActive(pathname, href) && "text-black dark:text-white"
                    // IMP END - Apply Active Link Styling
                  )}
                >
                  {/* IMP START - Render Icon if Available */}
                  {Icon && (
                    <Icon
                      className={cn(
                        "text-gray-20 dark:text-gray-40 hover:text-black dark:hover:text-white",
                        isActive(pathname, href) // IMP - Apply active color to icon
                      )}
                    />
                  )}
                  {/* IMP END - Render Icon if Available */}

                  {/* IMP START - Render Label */}
                  <span>{label}</span>
                  {/* IMP END - Render Label */}
                </Link>
              </li>
            </ul>
          )
        })}
        {/* IMP END - Render Navigation Items */}
      </nav>
      {/* IMP END - Navigation Menu Container */}
    </section>
    // IMP END - Bottom Navigation Wrapper (Fixed Position)
  )
}

export default BottomNavigationBar
