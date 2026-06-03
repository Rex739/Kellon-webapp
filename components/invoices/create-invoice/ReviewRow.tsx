import { cn } from "@/lib/utils";

interface ReviewRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export function ReviewRow({ label, value, highlight }: ReviewRowProps) {
  return (
    <div className="flex items-start justify-between gap-5 pb-4">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span
        className={cn(
          "max-w-[60%] text-right text-sm font-bold text-black dark:text-white",
          highlight && "text-primary-60 dark:text-primary-80",
        )}
      >
        {value}
      </span>
    </div>
  );
}
