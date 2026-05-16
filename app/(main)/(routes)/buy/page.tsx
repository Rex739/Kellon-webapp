import BuyCryptoFlowManager from "@/components/wallet/buy-crypto/BuyCryptoFlowManager"
import { currentProfile } from "@/lib/current-profile"
import { User } from "@/types/db"
import { redirect } from "next/navigation"

export default async function BuyPage() {
  const profile = await currentProfile() as User

  if (!profile) redirect("/")
  return (
    <main className="min-h-[100dvh]">
      <BuyCryptoFlowManager />
    </main>
  )
}
