import { FC, HtmlHTMLAttributes } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface AggregatorLogoProps extends HtmlHTMLAttributes<HTMLImageElement> {
  logoURI: string
}

const AggregatorLogo: FC<AggregatorLogoProps> = ({ logoURI, className }) => {
  return (
    <Image
      src={logoURI}
      width={100}
      height={100}
      alt="Aggregator Logo"
      className={cn("w-4 h-4 rounded-full mr-2", className)}
      onError={(e) => {
        ;(e.target as HTMLImageElement).src = "https://via.placeholder.com/20"
      }}
    />
  )
}

export default AggregatorLogo
