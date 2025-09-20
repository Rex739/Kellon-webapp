import BottomNavigationBar from "@/components/navigation/BottomNavigationBar"
import Topbar from "@/components/navigation/Topbar"
import { FC, ReactNode } from "react"

interface layoutProps {
  children: ReactNode
}

const layout: FC<layoutProps> = ({ children }) => {
  return (
    <main>
      <Topbar className="" />
      {children}
      <BottomNavigationBar className="md:hidden z-20"/>
    </main>
  )
}

export default layout
