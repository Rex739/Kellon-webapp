import React, { FC } from "react"

const FallbackTokenAndChainLogo: FC = ({}) => {
  return (
    <div className="w-11 h-11 bg-white1 dark:bg-secondary-70 rounded-full relative">
      <div className="w-5 h-5 bg-white1 dark:bg-secondary-70 rounded-full border-white2 dark:border-secondary-60 border-2 absolute -bottom-1.5 right-0" />
    </div>
  )
}

export default FallbackTokenAndChainLogo
