"use client"

import { FC } from "react"
import { Card, CardHeader, CardTitle } from "../ui/card"
import { RotateCw } from "lucide-react"
import { ExtendedChain, Route } from "@lifi/sdk"

import { cn } from "@/lib/utils"
import RouteOptions from "./RouteOptions"

interface RoutesCardProps {
  routes: Route[]
  chains: ExtendedChain[]
  onRouteSelect: (route: Route) => void
  isRefetched: boolean
  handleRefetchRoute: () => void
}

const RoutesCard: FC<RoutesCardProps> = ({
  routes,
  chains,
  isRefetched,
  handleRefetchRoute,
  onRouteSelect,
}) => {
  return (
    <Card className="lg:flex w-md xl:max-w-lgbg-white dark:bg-secondary-10 rounded-2xl lg:rounded-l-none text-gray-20 dark:text-gray-40 border-input px-0!">
      <CardHeader className="px-2 xs:px-4 md:px-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-black dark:text-white">
            Receive
          </CardTitle>
          <RotateCw
            onClick={handleRefetchRoute}
            className={cn(
              "w-5 h-5 cursor-pointer",
              isRefetched && "rotate-360 duration-300"
            )}
          />
        </div>
      </CardHeader>
      <RouteOptions
        routes={routes}
        chains={chains}
        isRefetched={isRefetched}
        handleRefetchRoute={handleRefetchRoute}
        onRouteSelect={onRouteSelect}
      />
    </Card>
  )
}

export default RoutesCard
