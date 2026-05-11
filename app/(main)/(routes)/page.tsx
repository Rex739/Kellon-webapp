import { FC } from "react"
import { redirect } from "next/navigation"
import { User } from "@/types/db"
import DashboardClient from "@/components/wallet/Dashboard"
import { currentProfile } from "@/lib/current-profile"

const Page: FC = async ({}) => {
  const profile = (await currentProfile()) as User
  if (!profile) return redirect("/")

  return (
    <section className="min-h-screen flex lg:items-center">
      <DashboardClient profile={profile} />
    </section>
  )
}

export default Page
