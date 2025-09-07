"use client"

import { type ExtendedChain, type Token } from "@lifi/sdk"
import { FC } from "react"
import Image from "next/image"
import { Label } from "@/components/ui/label"

interface SwapBoxProps {
  chains: ExtendedChain[]
  fromChain: number
  toChain: number
  fromToken: Token | null
  toToken: Token | null
  handleChainSelectOpen: (side: "from" | "to") => void
}

const SwapBox: FC<SwapBoxProps> = ({
  chains,
  fromChain,
  fromToken,
  toChain,
  toToken,
  handleChainSelectOpen,
}) => {
  return (
    <div className="space-y-2">
      {/* From Section */}
      <div
        onClick={() => handleChainSelectOpen("from")}
        className="bg-white2 dark:bg-secondary-60 rounded-lg flex flex-col p-3 space-y-4 border border-input cursor-pointer"
      >
        <Label className="text-sm text-black dark:text-white font-semibold">From</Label>

        {/* Show selected chain + token if available */}
        <div>
          {fromChain && fromToken ? (
            <div className="flex space-x-4">
              {/* Token + chain logos */}
              <div className="flex items-center space-x-2">
                <div className="w-11 h-11 bg-white1 dark:bg-secondary-70 rounded-full relative">
                  {/* Token logo or fallback */}
                  {fromToken.logoURI ? (
                    <Image
                      src={fromToken.logoURI}
                      alt={fromToken.symbol}
                      width={100}
                      height={100}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="rounded-full flex justify-center items-center bg-blue-950 text-white p-2 w-11 h-11">
                      {fromToken.name?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Chain logo overlay or fallback */}
                  {chains.find((c) => c.id === fromChain) ? (
                    <div className="w-5 h-5 border-2 rounded-full border-white2 dark:border-secondary-60 absolute -bottom-1.5 right-0">
                      <Image
                        src={
                          chains.find((c) => c.id === fromChain)?.logoURI ??
                          "/placeholder.png"
                        }
                        alt={
                          chains.find((c) => c.id === fromChain)?.name ||
                          "Chain"
                        }
                        width={100}
                        height={100}
                        className="rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="w-5 h-5 bg-white1 dark:bg-secondary-70 rounded-full border-white2 dark:border-secondary-60 border-2 absolute -bottom-1.5 right-0" />
                  )}
                </div>
              </div>

              {/* Token + chain text */}
              <div className="flex flex-col">
                <p className="text-lg font-semibold text-black dark:text-white">
                  {fromToken.symbol}
                </p>
                {chains.find((c) => c.id === fromChain) && (
                  <p className="text-xs">
                    {chains.find((c) => c.id === fromChain)?.name}
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Empty state when nothing is selected
            <div className="flex items-center space-x-2">
              <div className="w-11 h-11 bg-white1 dark:bg-secondary-70 rounded-full relative">
                <div className="w-5 h-5 bg-white1 dark:bg-secondary-70 rounded-full border-white2 dark:border-secondary-60 border-2 absolute -bottom-1.5 right-0" />
              </div>
              <span>Select chain and token</span>
            </div>
          )}
        </div>
      </div>

      {/* To Section */}
      <div
        onClick={() => handleChainSelectOpen("to")}
        className="bg-white2 dark:bg-secondary-60 rounded-lg flex flex-col p-3 space-y-4 border border-input cursor-pointer"
      >
        <Label className="text-sm text-black dark:text-white font-semibold">To</Label>

        {/* Show selected chain + token if available */}
        <div>
          {toChain && toToken ? (
            <div className="flex space-x-4">
              {/* Token + chain logos */}
              <div className="flex items-center space-x-2">
                <div className="w-11 h-11 bg-white1 dark:bg-secondary-70 rounded-full relative">
                  {/* Token logo or fallback */}
                  {toToken.logoURI ? (
                    <Image
                      src={toToken.logoURI}
                      alt={toToken.symbol}
                      width={100}
                      height={100}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="rounded-full flex justify-center items-center bg-blue-950 text-white p-2 w-11 h-11">
                      {toToken.name?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Chain logo overlay or fallback */}
                  {chains.find((c) => c.id === toChain) ? (
                    <div className="w-5 h-5 border-2 rounded-full border-white2 dark:border-secondary-60 absolute -bottom-1.5 right-0">
                      <Image
                        src={
                          chains.find((c) => c.id === toChain)?.logoURI ??
                          "/placeholder.png"
                        }
                        alt={
                          chains.find((c) => c.id === toChain)?.name || "Chain"
                        }
                        width={100}
                        height={100}
                        className="rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="w-5 h-5 bg-white1 dark:bg-secondary-70 rounded-full border-white2 dark:border-secondary-60 border-2 absolute -bottom-1.5 right-0" />
                  )}
                </div>
              </div>

              {/* Token + chain text */}
              <div className="flex flex-col">
                <p className="text-lg font-semibold text-black dark:text-white">
                  {toToken.symbol}
                </p>
                {chains.find((c) => c.id === toChain) && (
                  <p className="text-xs">
                    {chains.find((c) => c.id === toChain)?.name}
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Empty state when nothing is selected
            <div className="flex items-center space-x-2">
              <div className="w-11 h-11 bg-white1 dark:bg-secondary-70 rounded-full relative">
                <div className="w-5 h-5 bg-white1 dark:bg-secondary-70 rounded-full border-white2 dark:border-secondary-60 border-2 absolute -bottom-1.5 right-0" />
              </div>
              <span>Select chain and token</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SwapBox
