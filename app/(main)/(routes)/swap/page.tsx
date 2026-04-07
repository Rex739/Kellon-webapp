import GridBackground from "@/components/backgrounds/GridBackground"
import CryptoInfiniteScroll from "@/components/CryptoInfiniteScroll"
import SwapInterface from "@/components/swap/SwapInterface"

import { FC } from "react"

// interface pageProps {

// }

const page: FC = ({}) => {
  return (
    <section className="h-[100dvh] flex flex-col justify-center items-center w-11/12 mx-auto ">
      <section className="relative ">
        <GridBackground className="z-10" />
        <SwapInterface className="z-20 relative" />
      </section>

      <CryptoInfiniteScroll className="hidden md:block absolute bottom-0" />
    </section>
  )
}

export default page
