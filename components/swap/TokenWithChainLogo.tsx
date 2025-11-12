import { FC, HtmlHTMLAttributes } from "react"
import Image from "next/image"
import { ExtendedChain, Token } from "@lifi/sdk"
import { cn } from "@/lib/utils"

interface TokenWithChainLogoProps extends HtmlHTMLAttributes<HTMLDivElement> {
  token: Token
  chainId: number
  chains: ExtendedChain[]
}

const TokenWithChainLogo: FC<TokenWithChainLogoProps> = ({
  token,
  chainId,
  chains,
  className,
}) => {
  const chain = chains.find((c) => c.id === chainId)

  return (
    <div
      className={cn(
        "min-w-10 min-h-10 max-w-10 max-h-10 lg:min-w-11 lg:min-h-11 lg:max-w-11 lg:max-h-11  bg-white1 dark:bg-secondary-70 rounded-full relative",
        className
      )}
    >
      {/* Token logo or fallback */}
      {token.logoURI ? (
        <Image
          src={token.logoURI}
          alt={token.symbol}
          width={100}
          height={100}
          className="rounded-full min-w-10 min-h-10 max-w-10 max-h-10 lg:min-w-11 lg:min-h-11 lg:max-w-11 lg:max-h-11"
        />
      ) : (
        <div className="rounded-full flex justify-center items-center bg-blue-950 text-white p-2 w-11 h-11">
          {token.name?.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Chain logo overlay or fallback */}
      {chain ? (
        <div className="w-5 h-5 border-2 rounded-full border-white2 dark:border-secondary-60 absolute -bottom-1.5 right-0">
          <Image
            src={chain.logoURI ?? "/placeholder.png"}
            alt={chain.name || "Chain"}
            width={100}
            height={100}
            className="rounded-full "
          />
        </div>
      ) : (
        <div className="w-5 h-5 bg-white1 dark:bg-secondary-70 rounded-full border-white2 dark:border-secondary-60 border-2 absolute -bottom-1.5 right-0" />
      )}
    </div>
  )
}

export default TokenWithChainLogo
