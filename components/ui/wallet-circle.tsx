import { Icons } from "@/components/Icons"
import { cn } from "@/lib/utils"
import { FC, HtmlHTMLAttributes } from "react"

type WalletCircleProps = HtmlHTMLAttributes<HTMLSpanElement>
export const WalletCircle: FC<WalletCircleProps> = ({ className }) => {
  return (
    <span
      className={cn(
        "border border-black dark:border-white rounded-full p-1 flex",
        className
      )}
    >
      <Icons.Wallet className="border-input dark:text-white w-7 h-7" />
    </span>
  )
}
