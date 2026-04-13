"use client"

import { logout } from "@/lib/api/auth"
import { LogOut } from "lucide-react"
import { FC } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type SignoutProps = object

const Signout: FC<SignoutProps> = ({}) => {
  const router = useRouter()

  const handleSignout = async () => {
    // Retrieve the deviceToken from cookies
    const deviceToken = Cookies.get("deviceToken")

    try {
      // Pass the token to the logout utility to handle backend cleanup
      await logout(deviceToken || "")

      // Clean up the local cookie
      Cookies.remove("deviceToken")

      toast.success("Logged out successfully")

      router.push("/continue")
    } catch (error) {
      console.error("Logout failed", error)
      toast.error("Failed to sign out. Please try again.")
    }
  }

  return (
    <div
      className="text-red-400 focus:bg-red-400/10 focus:text-red-400 cursor-pointer py-3 rounded-xl transition-colors flex items-center"
      onClick={handleSignout}
    >
      <LogOut className="mr-3 h-4 w-4" />
      <span>Sign out</span>
    </div>
  )
}

export default Signout
