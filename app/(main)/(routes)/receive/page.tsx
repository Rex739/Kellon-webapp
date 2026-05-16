import ReceiveCrypto from "@/components/wallet/receive-crypto/ReceiveCrypto"
import { currentProfile } from "@/lib/current-profile"
import { redirect } from "next/navigation"
import { FC } from "react"

const page: FC = async () => {
  const profile = await currentProfile()
  if (!profile) redirect("/")

  const chainAccounts = profile.chainAccounts ?? []
  return (
    <main className="min-h-[100dvh]">
      <ReceiveCrypto chainAccounts={chainAccounts} />
    </main>
  )
}

export default page
