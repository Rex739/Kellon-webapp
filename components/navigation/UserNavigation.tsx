"use client"

import { FC, useState, ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronRight,
  Smartphone,
  Users,
  Network,
  Bell,
  Share2,
  HelpCircle,
  FileText,
  ShieldAlert,
  Info,
  KeyRoundIcon,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ActionToolTip } from "../ActionTooltip"
import { User } from "@/types/db"
import Signout from "../auth/Signout"
import { toast } from "sonner"

interface UserNavigationProps {
  user: User
}

interface DropdownItemProps {
  icon: ReactNode
  label: string
  subLabel?: string
  href?: string
  onClick?: () => void
  isExternal?: boolean
}

const UserNavigation: FC<UserNavigationProps> = ({ user }) => {
  const [open, setOpen] = useState(false)

  // Modal States
  const [isDevicesOpen, setIsDevicesOpen] = useState(false)
  const [isNetworkOpen, setIsNetworkOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const handleShare = async () => {
    const shareData = {
      title: "Kellon",
      text: "Experience the future of Web3 with Kellon.",
      url: typeof window !== "undefined" ? window.location.origin : "",
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        toast.success("Link copied to clipboard!")
      }
    } catch (err) {
      console.error("Error sharing:", err)
    }
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <ActionToolTip
          label="Open account menu"
          side="bottom"
          align="end"
          disabled={open}
        >
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 outline-none pr-3 rounded-full transition-colors group">
              <div className="w-10 h-10 rounded-full bg-primary-95 dark:bg-primary-70 flex items-center justify-center overflow-hidden border border-gray-80 dark:border-white transition-all group-hover:border-primary-50">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-full h-full object-cover"
                    width={40}
                    height={40}
                  />
                ) : (
                  <span className="text-sm text-primary-50 dark:text-white font-bold">
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

              <Link
                href="/settings/profile"
                className="text-primary-70 text-xs font-bold flex items-center mt-1 hover:opacity-80 transition-opacity w-fit"
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
            <DropdownItem
              icon={<KeyRoundIcon className="rotate-[270deg]" size={16} />}
              label="Stellar Key Recovery"
              href="/settings/stellar-key-recovery"
            />
            <DropdownItem
              icon={<Smartphone size={16} />}
              label="Trusted Devices"
              onClick={() => setIsDevicesOpen(true)}
            />
            <DropdownItem
              icon={<Users size={16} />}
              label="Social Recovery"
              href="/settings/social-recovery"
            />
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
              onClick={() => setIsNetworkOpen(true)}
            />
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-gray-80 dark:bg-secondary-40" />

          {/* PREFERENCES */}
          <DropdownMenuGroup>
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-30 dark:text-secondary-90">
              Preferences
            </p>
            <DropdownItem
              icon={<Bell size={16} />}
              label="Push Notifications"
            />
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-gray-80 dark:bg-secondary-40" />

          {/* SUPPORT & COMMUNITY */}
          <DropdownMenuGroup>
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-30 dark:text-secondary-90">
              Support & Community
            </p>
            <DropdownItem
              icon={<Share2 size={16} />}
              label="Share Kellon"
              onClick={handleShare}
            />
            <DropdownItem
              icon={<HelpCircle size={16} />}
              label="Help & Support"
              onClick={() => setIsHelpOpen(true)}
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
              href="https://www.kellon.xyz/privacy-policy"
              isExternal
            />
            <DropdownItem
              icon={<FileText size={16} />}
              label="Terms of Use"
              href="https://www.kellon.xyz/terms-of-use"
              isExternal
            />
            <DropdownItem
              icon={<Info size={16} />}
              label="Disclaimer"
              href="https://www.kellon.xyz/disclaimer"
              isExternal
            />
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-gray-80 dark:bg-secondary-40" />

          <div className="p-1">
            <Signout />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modals for specific actions */}
      <SimpleModal
        open={isDevicesOpen}
        onOpenChange={setIsDevicesOpen}
        title="Trusted Devices"
        description="Manage the devices that have access to your Kellon account."
      >
        <p className="text-sm text-gray-20 dark:text-secondary-90 text-center py-4">
          No other devices found.
        </p>
      </SimpleModal>

      <SimpleModal
        open={isNetworkOpen}
        onOpenChange={setIsNetworkOpen}
        title="Network Information"
        description="View your current blockchain connectivity details."
      >
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Network</span>
            <span className="font-bold text-primary-50">Avalanche Mainnet</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span className="text-green-500">Connected</span>
          </div>
        </div>
      </SimpleModal>

      <SimpleModal
        open={isHelpOpen}
        onOpenChange={setIsHelpOpen}
        title="Help & Support"
        description="Get in touch with the Kellon team for assistance."
      >
        <p className="text-sm text-center py-4">
          Support center is coming soon.
        </p>
      </SimpleModal>
    </>
  )
}

const DropdownItem: FC<DropdownItemProps> = ({
  icon,
  label,
  subLabel,
  href,
  onClick,
  isExternal,
}) => {
  const content = (
    <div className="flex items-center w-full">
      <div className="mr-3 text-primary-50 dark:text-primary-10 transition-colors">
        {icon}
      </div>
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
    </div>
  )

  if (href) {
    return (
      <DropdownMenuItem
        asChild
        className="focus:bg-primary-95 dark:focus:bg-secondary-70 focus:text-primary-50 cursor-pointer py-2.5 px-3 rounded-xl transition-colors group"
      >
        {isExternal ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {content}
          </a>
        ) : (
          <Link href={href}>{content}</Link>
        )}
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenuItem
      onClick={onClick}
      className="focus:bg-primary-95 dark:focus:bg-secondary-70 focus:text-primary-50 cursor-pointer py-2.5 px-3 rounded-xl transition-colors group"
    >
      {content}
    </DropdownMenuItem>
  )
}

interface SimpleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: ReactNode
}

const SimpleModal: FC<SimpleModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="bg-white dark:bg-secondary-60 border-gray-80 dark:border-secondary-40 sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="text-black dark:text-white">
          {title}
        </DialogTitle>
        <DialogDescription className="text-gray-20 dark:text-secondary-90">
          {description}
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 text-black dark:text-white">{children}</div>
    </DialogContent>
  </Dialog>
)

export default UserNavigation
