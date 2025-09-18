import { FC } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NoRoutesAvailableProps {
  onRetry?: () => void
  isLoading?: boolean
  className?: string
}

const NoRoutesAvailable: FC<NoRoutesAvailableProps> = ({
  onRetry,
  isLoading = false,
  className,
}) => {
  return (
    <Card
      className={cn(
        "w-md xl:max-w-lg bg-white dark:bg-secondary-10 rounded-2xl lg:rounded-l-none border border-input flex justify-center items-center ",
        className
      )}
    >
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
          <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
        </div>

        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
          No Routes Available
        </h3>

        <p className="text-sm tracking-tighter text-gray-20 dark:text-gray-40 mb-6 max-w-xs">
          We couldn&apos;t find any available routes for your swap. This could
          be due to: Insufficient liquidity, network congestion, token pairing
          limitations, amount too small or large
        </p>

        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RotateCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            <span>{isLoading ? "Searching..." : "Try Again"}</span>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default NoRoutesAvailable
