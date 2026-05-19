import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

export default function QuickAction({
  icon,
  label,
  onClick,
}: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full cursor-pointer flex-col items-center text-black outline-none hover:bg-gray-50 dark:text-white md:rounded-lg md:border md:border-black/5 md:bg-white md:p-3 md:text-left md:transition md:duration-300 md:active:scale-98 md:hover:border-gray-60 md:dark:border-white/10 md:dark:bg-secondary-50 md:dark:hover:border-white/20 dark:md:hover:bg-secondary-60/50 lg:p-4"
    >
      <div
        className={cn(
          "flex h-16 w-full transform flex-col items-center justify-center space-y-1.5 rounded-xl border border-black/5 bg-white px-1 transition-all duration-300 md:transition-none md:duration-0",
          "group-hover:shadow-lg group-active:scale-95 md:h-10 md:w-10 md:rounded-lg md:group-hover:shadow-none lg:h-11 lg:w-11",
          "dark:border-white/10 dark:bg-secondary-50  dark:group-hover:border-primary-70/40 md:border-none md:bg-transparent dark:md:border-none dark:md:bg-transparent",
        )}
      >
        <span className="shrink-0 ">{icon}</span>
        <span className="text-[7px] xs:text-[9px] tracking-tight transition-colors group-hover:text-cryptoNight  dark:group-hover:text-white md:hidden">
          {label}
        </span>
      </div>

      {/* Label for Desktop (Hidden on mobile to keep the mobile UI compact) */}
      <span className="mt-2 hidden text-[11px] font-medium md:block lg:text-xs">
        {label}
      </span>
    </button>
  );
}
