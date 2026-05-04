import ProfilePage from "@/components/settings/profile/EditProfile"
import { currentProfile } from "@/lib/current-profile"
import { redirect } from "next/navigation"
import { FC } from "react"

const page: FC = async ({}) => {
  const profile = await currentProfile()
  if (!profile) return redirect("/")

  return (
    <section>
      <ProfilePage initialProfile={profile} />
    </section>
  )
}

export default page
