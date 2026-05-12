import { Bell } from "lucide-react"
import { FC } from "react"

interface NotificationBellProps {}

const NotificationBell: FC<NotificationBellProps> = ({}) => {
  return (
    <div className=" rounded-full w-10 h-10 flex justify-center items-center">
      <Bell className="w-6 h-6 text-secondary-60 dark:text-gray-50 " />
    </div>
  )
}

export default NotificationBell
