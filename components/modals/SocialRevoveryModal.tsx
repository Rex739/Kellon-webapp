"use client"

import { FC, useEffect } from "react"
import {
  Users,
  ArrowLeft,
  ShieldCheck,
  Zap,
  AlertCircle,
  LucideIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

interface SocialRecoveryModalProps {
  isOpen: boolean
  onClose: () => void
}

const SocialRecoveryModal: FC<SocialRecoveryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "auto"
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const ActionButton = ({
    icon: Icon, // Destructure and capitalize so it can be used as a component
    title,
    description,
    variant = "dark",
  }: {
    icon: LucideIcon // Strictly typed as a Lucide component
    title: string
    description: string
    variant?: "pink" | "orange" | "dark"
  }) => {
    const variants = {
      pink: "bg-[#D64692] hover:bg-[#D64692]/90 text-white border-none",
      orange: "bg-[#F05E4E] hover:bg-[#F05E4E]/90 text-white border-none",
      dark: "bg-secondary-60 dark:bg-secondary-60 border border-gray-80 dark:border-secondary-40 text-white",
    }

    return (
      <button
        className={cn(
          "w-full flex items-center gap-4 p-4 rounded-[20px] transition-all text-left",
          variants[variant],
        )}
      >
        <div className="shrink-0">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-none mb-1">{title}</span>
          <span className="text-[11px] opacity-80 leading-tight">
            {description}
          </span>
        </div>
      </button>
    )
  }

  const Content = () => (
    <div className="px-4 pb-8 md:pb-0 h-full overflow-y-auto custom-scrollbar">
      {/* Back Button */}
      <div className="flex justify-start mb-4">
        <button
          onClick={onClose}
          className="p-2 bg-white dark:bg-secondary-60/50 rounded-full border border-slate-200 dark:border-none"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-white" />
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center justify-center space-y-2 mb-6">
        <h2 className="text-xl font-bold text-black dark:text-white">
          Social Recovery
        </h2>
      </div>

      {/* Account Status Card */}
      <div className="bg-white dark:bg-secondary-60 border border-gray-80 dark:border-secondary-40 rounded-[24px] p-5 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-green-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-20 dark:text-secondary-90 uppercase tracking-wider">
            Account Status
          </span>
          <span className="text-lg font-bold text-black dark:text-white">
            SAFE
          </span>
        </div>
      </div>

      {/* Actions Section */}
      <div className="space-y-4 mb-8">
        <h3 className="text-xs font-bold text-gray-20 dark:text-secondary-90 uppercase tracking-widest ml-1">
          Actions
        </h3>
        <ActionButton
          variant="pink"
          icon={Zap}
          title="Quick Recovery (Fast)"
          description="Instantly reclaim your Smart Account on this device."
        />
        <ActionButton
          variant="orange"
          icon={AlertCircle}
          title="Social Recovery"
          description="Use guardians to recover (Legacy/Advanced)."
        />
        <ActionButton
          variant="dark"
          icon={Users}
          title="Manage Guardians"
          description="Trusted contacts for social recovery."
        />
      </div>

      {/* Guardian Duties Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-20 dark:text-secondary-90 uppercase tracking-widest ml-1">
          Guardian Duties
        </h3>

        <p className="text-xs text-gray-20 dark:text-secondary-90 ml-1 italic">
          No pending approvals found.
        </p>

        <div className="bg-white dark:bg-secondary-60 border border-gray-80 dark:border-secondary-40 rounded-[24px] p-5 space-y-4">
          <label className="text-sm font-bold text-black dark:text-white block ml-1">
            Approve by Request ID
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter Request ID"
              className="bg-gray-95 dark:bg-secondary-40 border-gray-80 dark:border-secondary-40 rounded-xl py-6"
            />
            <Button className="bg-[#D64692] hover:bg-[#D64692]/90 text-white rounded-xl px-6 py-6 font-bold">
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="bg-white dark:bg-secondary-20 border-gray-80 dark:border-secondary-40 max-h-[92vh] [&>button]:hidden">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Social Recovery</DrawerTitle>
            <DrawerDescription>
              Manage guardians and account recovery
            </DrawerDescription>
          </DrawerHeader>
          <Content />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-secondary-20 border-gray-80 dark:border-secondary-40 outline-none rounded-[24px] p-0 overflow-hidden [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Social Recovery</DialogTitle>
          <DialogDescription>
            Manage guardians and account recovery
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <Content />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SocialRecoveryModal
