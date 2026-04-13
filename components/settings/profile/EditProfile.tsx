"use client"

import { FC, useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  X,
  Camera,
  User as UserIcon,
  AtSign,
  Mail,
  CheckCircle2,
  Pencil,
  LucideIcon,
  ArrowLeft,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import BankAccountModal from "./BankAccountModal"
import { getBanks } from "@/lib/api/bank"
import { BankDetail } from "@/types/db"

const profileSchema = z.object({
  displayName: z.string().min(2, "Name is too short"),
  kellonTag: z
    .string()
    .min(3, "Tag is too short")
    .startsWith("@", "Must start with @"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const ProfilePage: FC = () => {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const { data: user } = useUser()

  // --- Bank State Lifted Here ---
  const [banks, setBanks] = useState<BankDetail[]>([])
  const [isBanksLoading, setIsBanksLoading] = useState(true)

  const fetchBanks = async () => {
    try {
      const response = await getBanks()
      if (response?.data) setBanks(response.data)
    } catch (error) {
      console.error("Failed to load banks")
    } finally {
      setIsBanksLoading(false)
    }
  }

  useEffect(() => {
    fetchBanks()
  }, [])
  // ------------------------------

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.name || "",
      kellonTag: `@${user?.tag}` || "",
    },
  })

  const onSubmit = (data: ProfileFormValues) => {
    setIsEditing(false)
    toast.success("Profile updated successfully!")
  }

  return (
    <section className="min-h-screen text-slate-900 dark:text-white pb-10 transition-colors duration-300 py-16 lg:py-20">
      <div className="flex items-center justify-between px-6 py-5 max-w-2xl mx-auto">
        <div
          onClick={() => router.back()}
          className="p-2 bg-white dark:bg-secondary-60/50 rounded-full shadow-sm border border-slate-200 dark:border-none hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-6 h-6 md:hidden" />
          <ArrowLeft className="w-6 h-6 hidden md:flex" />
        </div>
        <h1 className="text-lg font-semibold">
          {isEditing ? "Edit Profile" : "Profile"}
        </h1>
        <div className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-secondary-60 rounded-[32px] p-8 flex flex-col items-center text-center space-y-4 shadow-sm border border-slate-100 dark:border-none">
          <div className="relative">
            <Avatar className="w-28 h-28 border-4 border-white dark:border-none bg-primary-70 shadow-md">
              <AvatarFallback className="text-3xl font-bold bg-primary-70 text-white">
                {user?.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "?"}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-[#1a1f2e] border-2 border-slate-50 dark:border-[#0b101a] rounded-full text-primary-70 shadow-lg">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold">
              {form.getValues("displayName")}
            </h2>
            <p className="text-slate-500 dark:text-gray-400 text-sm">
              {user?.email}
            </p>
          </div>
          <Badge className="bg-slate-100 dark:bg-[#1a1f2e] text-primary-70 py-1.5 px-4 rounded-full border-none">
            {form.getValues("kellonTag")}
          </Badge>
        </div>

        {/* Info Section */}
        <div className="bg-white dark:bg-secondary-60 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-none">
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="font-semibold text-lg">Profile Information</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-primary-70 hover:bg-primary-70/10 rounded-full transition-colors"
              >
                <Pencil className="w-5 h-5" />
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-6">
              <InfoItem
                icon={UserIcon}
                label="Display Name"
                value={form.getValues("displayName")}
              />
              <InfoItem
                icon={AtSign}
                label="Kellon Tag"
                value={form.getValues("kellonTag")}
              />
              <div className="flex items-center gap-4 px-1">
                <div className="p-3 bg-slate-100 dark:bg-[#1a1f2e] rounded-xl text-primary-70">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 border-b border-slate-100 dark:border-gray-800 pb-4">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                    Email
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{user?.email}</p>
                    <Badge className="bg-green-500/10 text-green-600 border-none flex gap-1 items-center px-2 py-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-500">
                        Display Name
                      </FormLabel>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-3 w-5 h-5 text-primary-70" />
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 h-12 pl-12 rounded-xl"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl h-12"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary-70 text-white rounded-xl h-12 font-bold"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>

        {/* Bank Component now receives data from parent */}
        <BankAccountModal
          banks={banks}
          isLoading={isBanksLoading}
          onRefresh={fetchBanks}
        />
      </div>
    </section>
  )
}

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) => (
  <div className="flex items-center gap-4 px-1">
    <div className="p-3 bg-slate-100 dark:bg-[#1a1f2e] rounded-xl text-primary-70">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 border-b border-slate-100 dark:border-gray-800 pb-4">
      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
)

export default ProfilePage
