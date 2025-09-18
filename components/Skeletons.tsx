import { FC } from "react"

export const RouteOptionSkeleton: FC = () => {
  return (
    <div
      className={
        "w-full flex items-center gap-3 px-4 py-3 border border-input rounded-2xl bg-white dark:bg-secondary-60  "
      }
    >
      {/* Protocol/Bridge Icon */}
      <div className="w-8 h-8 bg-gray-300 dark:bg-secondary-20  rounded-full animate-pulse"></div>
      {/* Route Details (Amount, Fees) */}
      <div className="flex-1 space-y-1.5">
        <div className="h-4 bg-gray-300 dark:bg-secondary-20  rounded w-3/4 animate-pulse"></div>
        <div className="h-3 bg-gray-300 dark:bg-secondary-20 rounded w-1/2 animate-pulse"></div>
      </div>
      {/* Select Button */}
      <div className="h-8 w-20 bg-gray-300 dark:bg-secondary-20  rounded animate-pulse"></div>
    </div>
  )
}

export const TokenSkeletonItem: FC = () => {
  return (
    <div className="w-full flex items-center gap-3 px-4 py-3 text-left">
      <div className="w-7 h-7 bg-gray-300 dark:bg-secondary-60 rounded-full animate-pulse"></div>
      <div className="flex flex-col gap-1.5">
        <div className="h-4 bg-gray-300 dark:bg-secondary-60 rounded w-16 animate-pulse"></div>
        <div className="h-3 bg-gray-300 dark:bg-secondary-60 rounded w-24 animate-pulse"></div>
      </div>
    </div>
  )
}

// Skeleton Item for Chain List (Dialog and Desktop)
export const ChainSkeletonItem: FC = () => {
  return (
    <div className="w-full flex items-center gap-3 px-4 py-3 text-left">
      <div className="w-7 h-7 bg-gray-300 dark:bg-secondary-60 rounded-full animate-pulse"></div>
      <div className="h-4 bg-gray-300 dark:bg-secondary-60 rounded w-24 animate-pulse"></div>
    </div>
  )
}

// Skeleton Item for Top Chains Grid (Mobile)
export const TopChainSkeletonItem: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-2 border border-input rounded-xl">
      <div className="w-9 h-9 bg-gray-300 dark:bg-secondary-60  rounded-full animate-pulse"></div>
    </div>
  )
}
