"use client"

import { FC, useState, ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronRight,
  Key,
  TabletSmartphone,
  Users,
  Server,
  Bell,
  Share2,
  MessageSquare,
  Shield,
  FileText,
  Info,
  AlertCircle,
  ArrowLeft,
  Pencil,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import { ActionToolTip } from "@/components/ActionTooltip"
import { User } from "@/types/db"
import Signout from "@/components/auth/Signout"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Icons } from "@/components/Icons"
import Slab from "@/components/ui/slab"
import StellarKeyRecoveryModal from "@/components/modals/StellarRecoveryModal"

interface UserNavigationProps {
  profile: User
}

interface NavItemProps {
  icon: ReactNode
  label: string
  subLabel?: string
  onClick: () => void
}

interface LinkItemProps {
  icon: ReactNode
  label: string
  href: string
}

const UserNavigation: FC<UserNavigationProps> = ({ profile }) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const isMobile = useMediaQuery("(max-width: 767px)")

  const handleOpenModal = (name: string): void => {
    setMenuOpen(false)
    setTimeout(() => {
      setActiveModal(name)
    }, 150)
  }

  // Shared content for both Dropdown and Drawer to keep it DRY
  const MenuContent: FC<{ hideProfile?: boolean }> = ({
    hideProfile = false,
  }) => (
    <div className="flex flex-col">
      {!hideProfile && (
        <div className="p-4 flex items-center gap-4">
          {/* Avatar Stack */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full bg-primary-95 dark:bg-primary-70 flex items-center justify-center overflow-hidden border-2 border-white dark:border-secondary-40 shadow-sm">
              {profile?.image ? (
                <Image
                  src={profile.image}
                  alt={profile.name || "User"}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-lg font-bold text-primary-50 dark:text-white">
                  {profile?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Pencil Badge */}
            <Link
              href="/settings/profile"
              onClick={() => setMenuOpen(false)}
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-primary-70 rounded-full border-2 border-white dark:border-secondary-60 flex items-center justify-center shadow-md hover:bg-primary-60 transition-colors"
            >
              <Pencil className="w-2.5 h-2.5 text-white" />
            </Link>
          </div>

          {/* User Details */}
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-bold text-black dark:text-white truncate">
              {profile.name}
            </p>
            <p className="text-xs text-gray-20 dark:text-secondary-90 truncate">
              {profile.email}
            </p>
            <Link
              href="/settings/profile"
              onClick={() => setMenuOpen(false)}
              className="text-primary-70 text-[10px] font-bold flex items-center mt-1 hover:opacity-80 transition-opacity group"
            >
              Edit Profile
              <ChevronRight className="ml-0.5 h-2.5 w-2.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      <div className="h-[1px] bg-gray-80 dark:bg-secondary-40 my-1" />

      {/* Security & Backup Section */}
      <div className="flex flex-col">
        <SectionHeader label="Security & Backup" />
        <NavigationItem
          icon={<Key className="w-4 h-4" />}
          label="Stellar Key Recovery"
          subLabel="Backup your Stellar secret key"
          onClick={() => handleOpenModal("stellar")}
        />
        <NavigationItem
          icon={<TabletSmartphone className="w-4 h-4" />}
          label="Trusted Devices"
          onClick={() => handleOpenModal("trusted")}
        />
        <NavigationItem
          icon={<Users className="w-4 h-4" />}
          label="Social Recovery"
          onClick={() => handleOpenModal("social")}
        />
      </div>

      <div className="h-[1px] bg-gray-80 dark:bg-secondary-40 my-1" />

      {/* Developer Section */}
      <div className="flex flex-col">
        <SectionHeader label="Developer" />
        <NavigationItem
          icon={<Server className="w-4 h-4" />}
          label="Network Information"
          onClick={() => handleOpenModal("network")}
        />
      </div>

      <div className="h-[1px] bg-gray-80 dark:bg-secondary-40 my-1" />

      {/* Preferences Section */}
      <div className="flex flex-col">
        <SectionHeader label="Preferences" />
        <NavigationItem
          icon={<Bell className="w-4 h-4" />}
          label="Push Notifications"
          onClick={() => handleOpenModal("notifications")}
        />
      </div>

      <div className="h-[1px] bg-gray-80 dark:bg-secondary-40 my-1" />

      {/* Support & Community Section */}
      <div className="flex flex-col">
        <SectionHeader label="Support & Community" />
        <NavigationItem
          icon={<Share2 className="w-4 h-4" />}
          label="Share Kellon"
          onClick={() => handleOpenModal("share")}
        />
        <NavigationItem
          icon={<MessageSquare className="w-4 h-4" />}
          label="Help & Support"
          onClick={() => handleOpenModal("support")}
        />
      </div>

      <div className="h-[1px] bg-gray-80 dark:bg-secondary-40 my-1" />

      {/* Legal Section */}
      <div className="flex flex-col">
        <SectionHeader label="Legal & Information" />
        <LinkItem
          icon={<Shield className="w-4 h-4" />}
          label="Privacy Policy"
          href="/legal/privacy"
        />
        <LinkItem
          icon={<FileText className="w-4 h-4" />}
          label="Terms of Use"
          href="/legal/terms"
        />
        <LinkItem
          icon={<AlertCircle className="w-4 h-4" />}
          label="Disclaimer"
          href="/legal/disclaimer"
        />
        <LinkItem
          icon={<Info className="w-4 h-4" />}
          label="About Kellon"
          href="/about"
        />
      </div>

      <div className="h-[1px] bg-gray-80 dark:bg-secondary-40 my-1" />
      <div className="p-1">
        <Signout />
      </div>
    </div>
  )
  if (isMobile) {
    return (
      <>
        <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
          <DrawerTrigger asChild>
            <div className="text-gray-20 dark:text-gray-40 hover:text-black dark:hover:text-white capitalize text-xs font-medium cursor-pointer">
              <Slab href="" className="invisible" />
              <div className="py-4 flex flex-col space-y-1 items-center">
                <Icons.Account className="h-4 w-4" />
                <span>Account</span>
              </div>
            </div>
          </DrawerTrigger>

          <DrawerContent className="bg-white dark:bg-secondary-20 border-gray-80 dark:border-secondary-40 max-h-[96vh] [&>button]:hidden">
            {/* Use grid-cols-3 to create three equal zones */}
            <DrawerHeader className="grid grid-cols-3 items-center border-b border-gray-80 dark:border-secondary-40 pb-4 px-4">
              {/* 1. Left: Back Button */}
              <div className="flex justify-start">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 bg-white dark:bg-secondary-60/50 rounded-full border border-slate-200 dark:border-none hover:opacity-80 transition-opacity"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-white" />
                </button>
              </div>

              {/* 2. Center: Title */}
              <DrawerTitle className="text-lg font-bold text-black dark:text-white text-center whitespace-nowrap">
                Account
              </DrawerTitle>

              {/* 3. Right: Empty spacer to balance the grid so the title stays centered */}
              <div className="w-9 flex justify-end" aria-hidden="true" />

              <DrawerDescription className="sr-only">
                Manage your account settings and security.
              </DrawerDescription>
            </DrawerHeader>

            <div className="overflow-y-auto px-2 pb-10">
              {/* Ensure MenuContent has hideProfile={true} here if you are rendering the profile elsewhere */}
              <MenuContent />
            </div>
          </DrawerContent>
        </Drawer>

        <StellarKeyRecoveryModal
          isOpen={activeModal === "stellar"}
          onClose={() => setActiveModal(null)}
        />
      </>
    )
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
        <ActionToolTip
          label="Open account menu"
          side="bottom"
          align="end"
          disabled={menuOpen}
        >
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 outline-none pr-3 rounded-full transition-colors group">
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
            </button>
          </DropdownMenuTrigger>
        </ActionToolTip>

        <DropdownMenuContent
          className="w-72 bg-white dark:bg-secondary-40 border-gray-80 dark:border-secondary-40 p-1 shadow-2xl max-h-[85vh] overflow-y-auto"
          align="end"
          onCloseAutoFocus={(e: Event) => e.preventDefault()}
        >
          <MenuContent />
        </DropdownMenuContent>
      </DropdownMenu>

      <StellarKeyRecoveryModal
        isOpen={activeModal === "stellar"}
        onClose={() => setActiveModal(null)}
      />
    </>
  )
}

const SectionHeader: FC<{ label: string }> = ({ label }) => (
  <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-30 dark:text-secondary-90">
    {label}
  </p>
)

const NavigationItem: FC<NavItemProps> = ({
  icon,
  label,
  subLabel,
  onClick,
}) => (
  <button
    onClick={(e) => {
      e.preventDefault()
      onClick()
    }}
    className="w-full flex items-center justify-between p-3 hover:bg-gray-95 dark:hover:bg-secondary-70 rounded-xl transition-colors group cursor-pointer outline-none text-left"
  >
    <div className="flex items-center gap-3">
      <div className="text-primary-70">{icon}</div>
      <div>
        <p className="text-xs font-bold text-black dark:text-white">{label}</p>
        {subLabel && (
          <p className="text-[10px] text-gray-20 dark:text-secondary-90">
            {subLabel}
          </p>
        )}
      </div>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-30 group-hover:translate-x-0.5 transition-transform" />
  </button>
)

const LinkItem: FC<LinkItemProps> = ({ icon, label, href }) => (
  <Link
    href={href}
    className="w-full flex items-center justify-between p-3 hover:bg-gray-95 dark:hover:bg-secondary-70 rounded-xl transition-colors group cursor-pointer outline-none"
  >
    <div className="flex items-center gap-3">
      <div className="text-primary-70">{icon}</div>
      <p className="text-xs font-bold text-black dark:text-white">{label}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-30 group-hover:translate-x-0.5 transition-transform" />
  </Link>
)

export default UserNavigation
