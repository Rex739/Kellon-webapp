"use client"

import { FC, useEffect, useState } from "react"
import {
  Users,
  ArrowLeft,
  ShieldCheck,
  Zap,
  AlertCircle,
  LucideIcon,
  Plus,
  Loader2,
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

// API Services

import { Guardian } from "@/types/db"
import { acceptGuardianInvite, addGuardian, getGuardiansOf, getMyGuardians } from "@/lib/api/social-recovery"

interface SocialRecoveryModalProps {
  isOpen: boolean
  onClose: () => void
}

type View = "main" | "manage-guardians"
type GuardianTab = "my-guardians" | "guardian-for"

const SocialRecoveryModal: FC<SocialRecoveryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Navigation & Tab State
  const [currentView, setCurrentView] = useState<View>("main")
  const [activeTab, setActiveTab] = useState<GuardianTab>("my-guardians")

  // Data & Loading State
  const [myGuardians, setMyGuardians] = useState<Guardian[]>([])
  const [guardianFor, setGuardianFor] = useState<Guardian[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [guardianInput, setGuardianInput] = useState("")
  const [requestIdInput, setRequestIdInput] = useState("")

  // Reset view on close
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "auto"
        setCurrentView("main")
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Fetch data when entering Manage Guardians
  useEffect(() => {
    if (currentView === "manage-guardians" && isOpen) {
      fetchGuardianData()
    }
  }, [currentView, isOpen])

  const fetchGuardianData = async () => {
    setIsLoading(true)
    const [myRes, forRes] = await Promise.all([
      getMyGuardians(),
      getGuardiansOf(),
    ])
    if (myRes.success) setMyGuardians(myRes.data || [])
    if (forRes.success) setGuardianFor(forRes.data || [])
    setIsLoading(false)
  }

  const handleAddGuardian = async () => {
    if (!guardianInput) return
    const res = await addGuardian(guardianInput)
    if (res.success) {
      setGuardianInput("")
      fetchGuardianData()
    }
  }

  const handleAcceptInvite = async (userId: string) => {
    const res = await acceptGuardianInvite(userId)
    if (res.success) fetchGuardianData()
  }

  const ActionButton = ({
    icon: Icon,
    title,
    description,
    variant = "dark",
    onClick,
  }: {
    icon: LucideIcon
    title: string
    description: string
    variant?: "pink" | "orange" | "dark"
    onClick?: () => void
  }) => {
    const variants = {
      pink: "bg-primary-20 hover:bg-primary-20/90 text-white border-none",
      orange: "bg-orange-10 hover:bg-orange-10/90 text-white border-none",
      dark: "bg-secondary-60 dark:bg-secondary-60 border border-gray-80 dark:border-secondary-40 text-white",
    }

    return (
      <button
        onClick={onClick}
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

  const ManageGuardiansView = () => (
    <div className="px-4 pb-8 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCurrentView("main")}
          className="p-2 bg-white dark:bg-secondary-60/50 rounded-full border border-slate-200 dark:border-none"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-white" />
        </button>
        <h2 className="text-xl font-bold text-black dark:text-white">
          Guardians
        </h2>
        <div className="w-9" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-80 dark:border-secondary-40 mb-6">
        <button
          onClick={() => setActiveTab("my-guardians")}
          className={cn(
            "flex-1 pb-3 text-sm font-bold transition-all",
            activeTab === "my-guardians"
              ? "text-primary-20 border-b-2 border-primary-20"
              : "text-gray-20 dark:text-secondary-90",
          )}
        >
          My Guardians
        </button>
        <button
          onClick={() => setActiveTab("guardian-for")}
          className={cn(
            "flex-1 pb-3 text-sm font-bold transition-all",
            activeTab === "guardian-for"
              ? "text-primary-20 border-b-2 border-primary-20"
              : "text-gray-20 dark:text-secondary-90",
          )}
        >
          Guardian For
        </button>
      </div>

      {activeTab === "my-guardians" ? (
        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
          <p className="text-[13px] text-gray-20 dark:text-secondary-90 mb-6 leading-relaxed">
            Add trusted contacts who can help you recover your account if you
            lose access. You need at least 2 guardians to approve recovery.
          </p>

          <div className="bg-white dark:bg-secondary-60 border border-gray-80 dark:border-secondary-40 rounded-[24px] p-5 mb-8">
            <h4 className="text-sm font-bold mb-4 text-black dark:text-white">
              Add New Guardian
            </h4>
            <div className="flex gap-2">
              <Input
                value={guardianInput}
                onChange={(e) => setGuardianInput(e.target.value)}
                placeholder="Enter user tag (e.g. @alice)"
                className="bg-gray-95 dark:bg-secondary-40 border-gray-80 dark:border-secondary-40 rounded-xl"
              />
              <Button
                onClick={handleAddGuardian}
                className="bg-primary-20 hover:bg-primary-20/90 h-10 w-10 p-0 rounded-xl"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-[10px] mt-3 text-gray-20 dark:text-secondary-90">
              Note: Backend currently needs User ID. If tag fails, try User ID.
            </p>
          </div>

          <h3 className="text-xs font-bold text-gray-20 dark:text-secondary-90 uppercase tracking-widest mb-4">
            Your Guardians
          </h3>
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary-20" />
            </div>
          ) : myGuardians.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center opacity-40">
              <Users className="w-12 h-12 mb-2" />
              <p className="text-sm italic">No guardians added yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myGuardians.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-4 bg-gray-95 dark:bg-secondary-40 rounded-2xl"
                >
                  <span className="text-sm font-bold">{g.guardianId}</span>
                  <span
                    className={cn(
                      "text-[10px] px-2 py-1 rounded-full font-bold",
                      g.status === "ACCEPTED"
                        ? "text-green-500 bg-green-500/10"
                        : "text-orange-500 bg-orange-500/10",
                    )}
                  >
                    {g.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
          <p className="text-[13px] text-gray-20 dark:text-secondary-90 mb-8 leading-relaxed">
            People who have trusted you to be their guardian.
          </p>
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary-20" />
            </div>
          ) : guardianFor.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center opacity-40">
              <p className="text-sm italic">
                You are not a guardian for anyone.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {guardianFor.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-secondary-60 border border-gray-80 dark:border-secondary-40 rounded-2xl"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-black dark:text-white">
                      {g.userId}
                    </span>
                    <span className="text-[11px] text-gray-20 uppercase">
                      {g.status}
                    </span>
                  </div>
                  {g.status === "PENDING" && (
                    <Button
                      onClick={() => handleAcceptInvite(g.userId)}
                      className="bg-primary-20 hover:bg-primary-20/90 text-white text-xs h-8 px-4 rounded-lg font-bold"
                    >
                      Accept
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )

  const MainView = () => (
    <div className="px-4 pb-8 h-full">
      <div className="flex justify-start mb-4">
        <button
          onClick={onClose}
          className="p-2 bg-white dark:bg-secondary-60/50 rounded-full border border-slate-200 dark:border-none"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-white" />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center space-y-2 mb-6">
        <h2 className="text-xl font-bold text-black dark:text-white">
          Social Recovery
        </h2>
      </div>

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
          onClick={() => setCurrentView("manage-guardians")}
        />
      </div>

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
              value={requestIdInput}
              onChange={(e) => setRequestIdInput(e.target.value)}
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

  return isMobile ? (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-white dark:bg-secondary-20 border-gray-80 dark:border-secondary-40 max-h-[92vh] [&>button]:hidden">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Social Recovery</DrawerTitle>
          <DrawerDescription>
            Manage guardians and account recovery
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto custom-scrollbar pt-4">
          {currentView === "main" ? <MainView /> : <ManageGuardiansView />}
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-secondary-20 border-gray-80 dark:border-secondary-40 outline-none rounded-[24px] p-0 overflow-hidden [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Social Recovery</DialogTitle>
          <DialogDescription>
            Manage guardians and account recovery
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 overflow-y-auto max-h-[85vh] custom-scrollbar">
          {currentView === "main" ? <MainView /> : <ManageGuardiansView />}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SocialRecoveryModal
