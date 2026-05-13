import { FC, useState, useEffect, useCallback, useRef } from "react"
import { Label } from "@/components/ui/label"
import { ExtendedChain, type Token } from "@lifi/sdk"
import SendAmountForm from "./SendAmountForm"
import { UseFormReturn } from "react-hook-form"
import { SendAmountFormSchemaType } from "@/lib/validations/form"
import { Icons } from "@/components/Icons"
import TokenWithChainLogo from "./TokenWithChainLogo"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import FallbackTokenAndChainLogo from "./FallbackTokenAndChainLogo"
import { formatUSD } from "@/lib/format-number"

interface SendAmountProps {
  fromToken: Token | null
  toToken: Token | null
  fromChain: number
  chains: ExtendedChain[]
  form: UseFormReturn<SendAmountFormSchemaType>
}

const SendAmount: FC<SendAmountProps> = ({
  fromChain,
  fromToken,
  toToken,
  chains,
  form,
}) => {
  const [showNativeValue, setShowNativeValue] = useState<boolean>(false)
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const { setValue } = form
  const isFormDisabled = !fromToken || !toToken
  // Use ref to track previous relevant params
  const previousRelevantParamsRef = useRef<string>("")

  const toggleValueDisplay = () => {
    setShowNativeValue((prev) => !prev)
  }

  const sendAmount = form.watch("sendAmount")

  // Memoize the function to get relevant params string (excluding fromAmount)
  const getRelevantParamsString = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("fromAmount")
    return params.toString()
  }, [searchParams])

  // Reset sendAmount when relevant params change (excluding fromAmount)
  useEffect(() => {
    const currentRelevantParams = getRelevantParamsString()

    // Check if relevant params have actually changed (excluding fromAmount)
    if (previousRelevantParamsRef.current !== currentRelevantParams) {
      // Only reset if there was a previous value (not initial render)
      if (
        previousRelevantParamsRef.current !== "" &&
        sendAmount &&
        sendAmount !== ""
      ) {
        setValue("sendAmount", "", {
          shouldValidate: false,
          shouldDirty: false,
        })
      }

      // Update the previous reference
      previousRelevantParamsRef.current = currentRelevantParams
    }
  }, [getRelevantParamsString, sendAmount, setValue])

  // Update URL search params when sendAmount changes
  useEffect(() => {
    // Create new URLSearchParams instance
    const params = new URLSearchParams(searchParams.toString())

    if (sendAmount && sendAmount !== "0") {
      // Add or update the fromAmount parameter
      params.set("fromAmount", sendAmount)
    } else {
      // Remove the parameter if sendAmount is empty or 0
      params.delete("fromAmount")
    }

    // Get the new search string
    const newSearch = params.toString()

    // Only update if the search params have actually changed
    if (newSearch !== searchParams.toString()) {
      // Construct the new URL
      const newUrl = `${pathname}${newSearch ? `?${newSearch}` : ""}`

      // Use replace to update the URL without adding to browser history
      router.replace(newUrl, { scroll: false })
    }
  }, [sendAmount, searchParams, pathname, router])

  const fromTokenUsdValue = (tokenPrice: string) => {
    if (!tokenPrice) return null

    const TOKEN_PRICE = Number(tokenPrice)
    const SEND_AMOUNT = Number(sendAmount)

    const ENTERED_VALUE = TOKEN_PRICE * SEND_AMOUNT

    if (ENTERED_VALUE === 0) {
      return "$0.00"
    }

    if (ENTERED_VALUE < 0.01) {
      return "<$0.01"
    }

    return formatUSD(ENTERED_VALUE)
  }

  const fromTokenNativeValue = (fromToken: Token) => {
    const tokenPriceUsd = fromToken.priceUSD
    if (!tokenPriceUsd) return null

    const TOKEN_PRICE = Number(tokenPriceUsd)
    const SEND_AMOUNT = Number(sendAmount)

    const ENTERED_VALUE = SEND_AMOUNT / TOKEN_PRICE

    if (ENTERED_VALUE == 0) {
      return `0 ${fromToken.symbol}`
    }

    return `${ENTERED_VALUE} ${fromToken.symbol}`
  }

  return (
    <div className="bg-white2 dark:bg-secondary-60 rounded-lg flex flex-col p-3 space-y-4 border border-input">
      <Label className="text-sm text-black dark:text-white font-semibold">
        Send
      </Label>
      <div>
        {fromChain && fromToken ? (
          <div className="flex space-x-4">
            {/* Token + chain logos */}

            <TokenWithChainLogo
              token={fromToken}
              chains={chains}
              chainId={fromChain}
            />

            {/* send amount */}
            <div className="flex flex-col  items-start">
              <SendAmountForm
                form={form}
                showNativeValue={showNativeValue}
                disabled={isFormDisabled}
              />
              <button
                onClick={toggleValueDisplay}
                className="text-xs flex items-center cursor-pointer px-1 hover:rounded-lg hover:bg-input dark:hover:bg-secondary-70 hover:px-1"
              >
                {showNativeValue
                  ? fromTokenNativeValue(fromToken)
                  : fromTokenUsdValue(fromToken.priceUSD)}

                <Icons.ArrowUpDown className="h-3 w-3 ml-1" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex  items-center space-x-4">
            <FallbackTokenAndChainLogo />
            <div className="flex flex-col">
              <span className="text-2xl">0</span>
              <span className="text-xs">$0.00</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SendAmount
