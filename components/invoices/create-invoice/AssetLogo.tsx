import Image from "next/image";
import { cn } from "@/lib/utils";
import { getAssetIcon } from "./utils";

interface AssetLogoProps {
  src: string;
  symbol: string;
  size?: "sm" | "md";
}

export function AssetLogo({ src, symbol, size = "md" }: AssetLogoProps) {
  const pixelSize = size === "sm" ? 24 : 40;

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary-60/10 dark:bg-secondary-60",
        size === "sm" ? "h-6 w-6" : "h-10 w-10",
      )}
    >
      <Image
        src={src || getAssetIcon(symbol)}
        alt={`${symbol} logo`}
        width={pixelSize}
        height={pixelSize}
        className="h-full w-full object-cover"
      />
    </span>
  );
}
