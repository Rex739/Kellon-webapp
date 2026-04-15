"use client"

import { FC, useState } from "react"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { ActionToolTip } from "@/components/ActionTooltip"
import { User } from "@/types/db"
import Signout from "@/components/auth/Signout"
import { toast } from "sonner"

import { NavigationModals, ModalType } from "@/components/modals/NavigationModals"
import { DropdownItem } from "./DropdownItem"

interface UserNavigationProps {
  profile: User
}

const UserNavigation: FC<UserNavigationProps> = ({ profile }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [modalKey, setModalKey] = useState(0) // 👈 forces modal container remount

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

  const handleModalClose = () => {
    setActiveModal(null)
    setModalKey((prev) => prev + 1) // 👈 remount modals, killing any leftover overlay
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
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
          className="w-72 bg-white dark:bg-secondary-60 border-gray-80 dark:border-secondary-40 p-2 shadow-2xl max-h-[85vh] overflow-y-auto"
          align="end"
          onCloseAutoFocus={(e) => {
            if (activeModal) e.preventDefault()
          }}
        >
          {/* ... rest of your menu content unchanged ... */}
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold text-black dark:text-white">
                {profile.name}
              </p>
              <p className="text-xs text-gray-20 dark:text-secondary-90">
                {profile.email}
              </p>
              <Link
                href="/settings/profile"
                className="text-primary-70 text-xs font-bold flex items-center mt-2 hover:opacity-80 transition-opacity w-fit group"
              >
                View Profile
                <ChevronRight className="ml-0.5 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-80 dark:bg-secondary-40" />
          <DropdownMenuGroup>
            <SectionHeader label="Security & Backup" />
            <DropdownItem
              icon={<KeyRoundIcon className="rotate-[270deg]" size={16} />}
              label="Stellar Key Recovery"
              onClick={() => setActiveModal("stellar")}
            />
            <DropdownItem
              icon={<Smartphone size={16} />}
              label="Trusted Devices"
              onClick={() => setActiveModal("devices")}
            />
            <DropdownItem
              icon={<Users size={16} />}
              label="Social Recovery"
              href="/settings/social-recovery"
            />
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-gray-80 dark:bg-secondary-40" />
          <DropdownMenuGroup>
            <SectionHeader label="Developer" />
            <DropdownItem
              icon={<Network size={16} />}
              label="Network Information"
              onClick={() => setActiveModal("network")}
            />
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-gray-80 dark:bg-secondary-40" />
          <DropdownMenuGroup>
            <SectionHeader label="Preferences" />
            <DropdownItem
              icon={<Bell size={16} />}
              label="Push Notifications"
            />
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-gray-80 dark:bg-secondary-40" />
          <DropdownMenuGroup>
            <SectionHeader label="Support & Community" />
            <DropdownItem
              icon={<Share2 size={16} />}
              label="Share Kellon"
              onClick={handleShare}
            />
            <DropdownItem
              icon={<HelpCircle size={16} />}
              label="Help & Support"
              onClick={() => setActiveModal("help")}
            />
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-gray-80 dark:bg-secondary-40" />
          <DropdownMenuGroup>
            <SectionHeader label="Legal & Information" />
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

      <NavigationModals
        key={modalKey} // 👈 forces remount, removing any stale overlay
        activeModal={activeModal}
        onClose={handleModalClose}
      />
    </>
  )
}

const SectionHeader = ({ label }: { label: string }) => (
  <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-30 dark:text-secondary-90">
    {label}
  </p>
)

export default UserNavigation
