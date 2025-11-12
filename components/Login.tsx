"use client"
import { FC } from "react"
// IMP START - Blockchian Calls
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
} from "@web3auth/modal/react"
import { Button } from "@/components/ui/button"
import { useAccount } from "wagmi"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { WalletCircle } from "./ui/wallet-circle"
import { truncateAddress } from "@/lib/truncateAddress"

// IMP END - Blockchian Calls

// interface LoginProps {}

const Login: FC = ({}) => {
  // IMP START - Login
  const { connect, isConnected, loading: connectLoading } = useWeb3AuthConnect()
  // IMP END - Login

  const { disconnect } = useWeb3AuthDisconnect()

  // IMP START - Blockchain Calls
  const { address } = useAccount()

  const truncatedAddress = truncateAddress(address, 4, 4)
  // IMP END - Blockchain Calls

  return (
    <section className="rounded-md inline-block">
      {isConnected ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              isLoading={connectLoading}
              className="capitalize tracking-tight  cursor-pointer group flex items-center gap-2 text-gray-0 dark:text-white font-medium dark:bg-secondary-60"
              size={"lg"}
              variant={"outline"}
            >
              <WalletCircle /> {truncatedAddress}
              <ChevronDown className="h-5 w-5 text-gray-30 transition-colors group-hover:text-gray-30" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="capitalize cursor-pointer">
            <DropdownMenuLabel>Manage account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => disconnect()}
              className="cursor-pointer"
            >
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          isLoading={connectLoading}
          onClick={() => connect()}
          className="capitalize font-semibold cursor-pointer group"
          size={"lg"}
        >
          <span className="inline-flex gap-2 justify-center items-center text-white">
            <WalletCircle className="border-white" />
            connect wallet
          </span>
        </Button>
      )}
    </section>
  )
}

export default Login
