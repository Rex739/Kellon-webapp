"use client"
import { useUser } from "@/hooks/use-user"
import { User } from "@/types/db"
import {
  ArrowUpRight,
  ArrowUp, // Added for Withdraw
  Clock,
  Eye,
  MoreHorizontal,
  Plus,
} from "lucide-react"
import QuickAction from "./QuickAction"
import AssetCard from "./AssetCard"
import Image from "next/image"
import { cn, getGreeting } from "@/lib/utils"
import NotificationBell from "@/components/notification/NotificationBell"
import Link from "next/link"
import { useState } from "react"
import AddFundsModal from "@/components/modals/AddFundsModal"

interface DashboardClientProps {
  initialProfile: User
}

export default function DashboardClient({
  initialProfile,
}: DashboardClientProps) {
  const { data: profile } = useUser(initialProfile)
  const [isAddFundsOpen, setIsAddFundsOpen] = useState<boolean>(false)

  const greeting = getGreeting()

  return (
    <div className="container mx-auto px-3 pb-32 md:py-12 space-y-6 md:space-y-8">
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
      <div
        className={cn(
          "rounded-2xl text-gray-20 dark:text-gray-40 px-0 md:px-8 py-0 md:py-10",
          "bg-transparent md:bg-white md:dark:bg-secondary-10",
          "border-none md:border md:border-input",
          "shadow-none md:shadow-sm",
        )}
      >
        {/* 1. PORTFOLIO OVERVIEW */}
        <section className="flex flex-col items-center space-y-4 md:space-y-6 mb-8 md:mb-12">
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-[#1F262E] rounded-full border border-gray-200 dark:border-white/5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            <div className="w-3.5 h-3.5 rounded-full overflow-hidden border border-black/5 dark:border-white/10 relative">
              <Image
                src="https://flagsapi.com/NG/flat/64.png"
                alt="Nigeria Flag"
                fill
                sizes="14px"
                className="object-cover"
              />
            </div>
            Portfolio Balance (NGN)
            <button className="ml-1 hover:text-black dark:hover:text-white text-[8px]">
              ▼
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Reduced from text-7xl to text-4xl on mobile */}
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-black dark:text-white">
              ₦0
            </h1>
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all text-gray-400">
              <Eye size={20} className="md:w-7 md:h-7" />
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-white/5 px-4 py-1.5 rounded-xl text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">
            <span className="text-gray-400 dark:text-gray-500 mr-2 uppercase text-[9px]">
              Market Rate
            </span>
            1 USD ≈ 1,381.09 NGN
          </div>
        </section>

        {/* 2. QUICK ACTIONS */}
        <section className="flex justify-center items-center gap-6 md:gap-10 mb-10">
          {/* Highlight removed, now neutral like the others */}
          <QuickAction
            icon={<Plus size={22} />}
            label="Add Funds"
            onClick={() => setIsAddFundsOpen(true)} // Trigger modal
          />
          <QuickAction icon={<ArrowUpRight size={22} />} label="Send" />
          <QuickAction icon={<ArrowUp size={22} />} label="Withdraw" />
          <QuickAction icon={<MoreHorizontal size={22} />} label="More" />
        </section>

        {/* 3. ASSETS & ACTIVITY SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
          {/* Assets List */}
          <div className="lg:col-span-8 space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-semibold tracking-tight text-black dark:text-white">
              My Assets
            </h3>
            <div className="grid gap-2 md:gap-3">
              {/* AssetCards now tighter for mobile */}
              <AssetCard
                name="USD Coin"
                symbol="USDC"
                amount="0.00"
                value="₦0.00"
                className="py-3 px-4 md:py-4 md:px-5" // Assuming AssetCard accepts className
              />
              <AssetCard
                name="Tether USD"
                symbol="USDT"
                amount="0.00"
                value="₦0.00"
                className="py-3 px-4 md:py-4 md:px-5"
              />
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            <div className="flex justify-between items-end">
              <h3 className="text-lg md:text-xl font-semibold tracking-tight text-black dark:text-white">
                Activity
              </h3>
              <button className="text-primary-70 text-xs md:text-sm font-semibold hover:opacity-80">
                See All
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-[#161B22] border border-gray-200 dark:border-white/5 rounded-[24px] md:rounded-[32px] p-8 md:p-10 flex flex-col items-center justify-center min-h-[250px] md:min-h-[380px] text-center">
              <div className="w-12 h-12 md:w-20 md:h-20 bg-gray-200 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-gray-300 dark:border-white/5">
                <Clock
                  size={24}
                  className="md:w-8 md:h-8 text-gray-400 dark:text-gray-600"
                />
              </div>
              <h4 className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium mb-1">
                No transactions yet
              </h4>
              <p className="text-gray-400 dark:text-gray-500 text-[11px] md:text-sm max-w-[180px]">
                Your financial journey starts with your first deposit.
              </p>
            </div>
          </div>
        </div>
      </div>
      <AddFundsModal
        isOpen={isAddFundsOpen}
        onClose={setIsAddFundsOpen}
        // onSelectBuy={() => setIsBuyFlowOpen(true)}
      />
    </div>
  )
}
