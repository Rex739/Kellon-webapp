import { cn } from "@/lib/utils"
import { FC, HtmlHTMLAttributes } from "react"

type DotProps = HtmlHTMLAttributes<HTMLDivElement>

const Dot: FC<DotProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "rounded-full h-1 w-1 bg-gray-20 dark:bg-gray-40",
        className
      )}
    />
  )
}

export default Dot
