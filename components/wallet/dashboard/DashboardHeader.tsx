import Image from "next/image";
import Link from "next/link";
import NotificationBell from "@/components/notification/NotificationBell";
import type { User } from "@/types/db";

interface DashboardHeaderProps {
  greeting: string;
  profile: User;
}

export default function DashboardHeader({
  greeting,
  profile,
}: DashboardHeaderProps) {
  return (
    <>
      <div className="flex w-full items-center justify-between md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-80 bg-primary-95 transition-all group-hover:border-primary-50 dark:border-white dark:bg-primary-70">
            {profile?.image ? (
              <Image
                src={profile.image}
                alt={profile.name || "User"}
                className="h-full w-full object-cover"
                width={40}
                height={40}
              />
            ) : (
              <span className="text-sm font-bold text-primary-50 dark:text-white">
                {profile?.name?.charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </div>

          <Link
            href="/settings/profile"
            className="flex flex-col justify-center"
          >
            <span className="text-xs font-medium capitalize text-gray-20 dark:text-gray-40">
              {greeting}
            </span>
            <span className="text-xs font-semibold leading-tight text-black dark:text-white">
              {(profile && `${profile.name?.split(" ")[0]}!`) || "Guest"}
            </span>
          </Link>
        </div>

        <NotificationBell />
      </div>

      <div className="hidden items-end justify-between md:flex">
        <div>
          <p className="text-lg font-medium capitalize text-gray-20 dark:text-gray-40">
            {greeting},{" "}
            <span className="text-black dark:text-white">
              {`${profile.name?.split(" ")[0]}!` || "Guest"}
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
