"use client"

import { FC, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronRight,
  Key,
  Smartphone,
  Users,
  Network,
  Bell,
  Share2,
  HelpCircle,
  FileText,
  ShieldAlert,
  Info,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ActionToolTip } from "../ActionTooltip"
import { User } from "@/types/db"
import Signout from "../auth/Signout"

interface UserNavigationProps {
  user: User
}

const UserNavigation: FC<UserNavigationProps> = ({ user }) => {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <ActionToolTip
        label="Open account menu"
        side="bottom"
        align="end"
        disabled={open}
      >
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 outline-none pr-3 rounded-full transition-colors group">
            <div className="w-10 h-10 rounded-full bg-primary-95 dark:bg-primary-10 flex items-center justify-center overflow-hidden border border-gray-80 dark:border-secondary-40 transition-all group-hover:border-primary-50">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-full h-full object-cover"
                  width={40}
                  height={40}
                />
              ) : (
                <span className="text-sm text-primary-50 font-bold">
                  {user?.name?.charAt(0).toUpperCase() || "?"}
                </span>
              )}
            </div>
          </button>
        </DropdownMenuTrigger>
      </ActionToolTip>

      <DropdownMenuContent
        className="w-72 bg-white dark:bg-secondary-60 border-gray-80 dark:border-secondary-40 text-black dark:text-white p-2 shadow-2xl max-h-[85vh] overflow-y-auto"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold text-black dark:text-white">
              {user.name}
            </p>
            <p className="text-xs text-gray-20 dark:text-secondary-90">
              {user.email}
            </p>

            {/* VIEW PROFILE LINK */}
            <Link
              href="/profile"
              className="text-primary-50 text-xs font-bold flex items-center mt-1 hover:opacity-80 transition-opacity w-fit"
            >
              View Profile
              <ChevronRight className="ml-0.5 h-3 w-3" />
            </Link>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-gray-80 dark:bg-secondary-40" />

        {/* SECURITY & BACKUP */}
        <DropdownMenuGroup>
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-30 dark:text-secondary-90">
            Security & Backup
          </p>
          <DropdownItem icon={<Key size={16} />} label="Stellar Key Recovery" />
          <DropdownItem
            icon={<Smartphone size={16} />}
            label="Trusted Devices"
          />
          <DropdownItem icon={<Users size={16} />} label="Social Recovery" />
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-gray-80 dark:bg-secondary-40" />

        {/* DEVELOPER */}
        <DropdownMenuGroup>
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-30 dark:text-secondary-90">
            Developer
          </p>
          <DropdownItem
            icon={<Network size={16} />}
            label="Network Information"
          />
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-gray-80 dark:bg-secondary-40" />

        {/* PREFERENCES */}
        <DropdownMenuGroup>
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-30 dark:text-secondary-90">
            Preferences
          </p>
          <DropdownItem icon={<Bell size={16} />} label="Push Notifications" />
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-gray-80 dark:bg-secondary-40" />

        {/* SUPPORT & COMMUNITY */}
        <DropdownMenuGroup>
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-30 dark:text-secondary-90">
            Support & Community
          </p>
          <DropdownItem icon={<Share2 size={16} />} label="Share Kellon" />
          <DropdownItem
            icon={<HelpCircle size={16} />}
            label="Help & Support"
          />
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-gray-80 dark:bg-secondary-40" />

        {/* LEGAL & INFO */}
        <DropdownMenuGroup>
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-30 dark:text-secondary-90">
            Legal & Information
          </p>
          <DropdownItem
            icon={<ShieldAlert size={16} />}
            label="Privacy Policy"
          />
          <DropdownItem icon={<FileText size={16} />} label="Terms of Use" />
          <DropdownItem
            icon={<Info size={16} />}
            label="About Kellon"
            subLabel="v1.0.12"
          />
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-gray-80 dark:bg-secondary-40" />

        <div className="p-1">
          <Signout />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const DropdownItem = ({
  icon,
  label,
  subLabel,
}: {
  icon: React.ReactNode
  label: string
  subLabel?: string
}) => (
  <DropdownMenuItem className="focus:bg-primary-95 dark:focus:bg-primary-10 focus:text-primary-50 cursor-pointer py-2.5 px-3 rounded-xl transition-colors group">
    <div className="mr-3 text-primary-50 transition-colors">{icon}</div>
    <div className="flex flex-col flex-1">
      <span className="text-sm font-medium leading-none text-black dark:text-white">
        {label}
      </span>
      {subLabel && (
        <span className="text-[10px] text-gray-20 dark:text-secondary-90 mt-1">
          {subLabel}
        </span>
      )}
    </div>
    <ChevronRight className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity text-black dark:text-white" />
  </DropdownMenuItem>
)

export default UserNavigation
