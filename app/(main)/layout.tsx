import BottomNavigationBar from "@/components/navigation/BottomNavigationBar"
import Topbar from "@/components/navigation/Topbar"
import { currentProfile } from "@/lib/current-profile"
import { User } from "@/types/db"
import { FC, ReactNode } from "react"

interface layoutProps {
  children: ReactNode
}

const layout: FC<layoutProps> = async ({ children }) => {
  const profile = (await currentProfile()) as User

  return (
    <main>
      <Topbar className="" initialProfile={profile} />
      {children}
      <BottomNavigationBar className="md:hidden z-20" profile={profile} />
    </main>
  )
}

export default layout
