"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Send, UserRound, WalletCards } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { transferService } from "@/services/api/transfers";
import type { Asset, Transaction, User } from "@/types/db";

interface SearchBarProps {
  className?: string;
  profile?: User | null;
}

type SearchResult = {
  id: string;
  label: string;
  description: string;
  href: string;
  type: "asset" | "transaction" | "user";
};

function formatAmount(amount: Asset["amount"] | Transaction["amount"]): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "0";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
  }).format(value);
}

function normalize(value: unknown): string {
  return String(value || "").toLowerCase();
}

const SearchBar = ({ className, profile }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [userResult, setUserResult] = useState<SearchResult | null>(null);
  const [isLookingUpUser, setIsLookingUpUser] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmedQuery = query.trim();
  const lowerQuery = trimmedQuery.toLowerCase();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (trimmedQuery.length < 3) {
      setUserResult(null);
      setIsLookingUpUser(false);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setIsLookingUpUser(true);
      try {
        const response = await transferService.verifyRecipient(trimmedQuery);
        if (cancelled) return;

        if (response.data?.found) {
          setUserResult({
            id: `user:${trimmedQuery}`,
            label: response.data.name || trimmedQuery,
            description: "Kellon user",
            href: `/send?recipient=${encodeURIComponent(trimmedQuery)}`,
            type: "user",
          });
        } else {
          setUserResult(null);
        }
      } catch {
        if (!cancelled) setUserResult(null);
      } finally {
        if (!cancelled) setIsLookingUpUser(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [trimmedQuery]);

  const localResults = useMemo<SearchResult[]>(() => {
    if (!lowerQuery) return [];

    const assetResults = (profile?.assets || [])
      .filter((asset) => {
        const haystack = [
          asset.symbol,
          asset.chain,
          asset.assetType,
          formatAmount(asset.amount),
        ]
          .map(normalize)
          .join(" ");

        return haystack.includes(lowerQuery);
      })
      .slice(0, 3)
      .map((asset, index) => ({
        id: `asset:${asset.id || `${asset.symbol}:${asset.chain || "wallet"}:${index}`}`,
        label: asset.symbol,
        description: `${formatAmount(asset.amount)} ${asset.symbol}${
          asset.chain ? ` on ${asset.chain}` : ""
        }`,
        href: "/",
        type: "asset" as const,
      }));

    const transactionResults = (profile?.transactions || [])
      .filter((transaction) => {
        const haystack = [
          transaction.id,
          transaction.type,
          transaction.status,
          transaction.symbol,
          transaction.assetType,
          formatAmount(transaction.amount),
        ]
          .map(normalize)
          .join(" ");

        return haystack.includes(lowerQuery);
      })
      .slice(0, 4)
      .map((transaction, index) => ({
        id: `transaction:${transaction.id || `${transaction.type}:${transaction.symbol}:${index}`}`,
        label: `${transaction.type.replace(/_/g, " ")} ${transaction.symbol}`,
        description: `${formatAmount(transaction.amount)} ${
          transaction.symbol
        } · ${transaction.status.toLowerCase()}`,
        href: `/transactions/${transaction.id}`,
        type: "transaction" as const,
      }));

    return [...assetResults, ...transactionResults];
  }, [lowerQuery, profile?.assets, profile?.transactions]);

  const results = userResult ? [userResult, ...localResults] : localResults;
  const showResults = isFocused && trimmedQuery.length > 0;

  return (
    <div className={cn("group relative w-full max-w-sm", className)}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-30 transition-colors group-focus-within:text-primary-50 dark:text-white/45 dark:group-focus-within:text-primary-80">
        <Search size={18} />
      </div>
      <Input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
        placeholder="Search assets, txns, or users..."
        className="h-10 w-full rounded-md border-gray-80 bg-white/90 pl-10 pr-12 text-gray-20 shadow-sm transition-all placeholder:text-gray-30 focus-visible:ring-1 focus-visible:ring-primary-50 dark:border-white/10 dark:bg-secondary-50/80 dark:text-white dark:shadow-[0_0_0_1px_rgba(255,255,255,0.02)] dark:placeholder:text-white/38 dark:focus-visible:border-primary-80 dark:focus-visible:ring-primary-80/70"
      />
      <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-gray-80 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-30 lg:flex dark:border-white/10 dark:bg-secondary-60/60 dark:text-white/50">
        <span className="text-[12px]">⌘</span>K
      </div>

      {showResults ? (
        <div className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-lg border border-gray-80 bg-white shadow-xl dark:border-white/10 dark:bg-secondary-50/95 dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl">
          {results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto p-1">
              {results.map((result) => {
                const Icon =
                  result.type === "user"
                    ? UserRound
                    : result.type === "asset"
                      ? WalletCards
                      : Send;

                return (
                  <Link
                    key={result.id}
                    href={result.href}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-gray-95 dark:hover:bg-white/[0.06]"
                    onClick={() => {
                      setQuery("");
                      setIsFocused(false);
                    }}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-95 text-primary-50 dark:border dark:border-primary-80/15 dark:bg-primary-70/20 dark:text-primary-90">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-cryptoNight dark:text-white">
                        {result.label}
                      </p>
                      <p className="truncate text-xs text-gray-20 dark:text-white/48">
                        {result.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-5 text-center">
              <p className="text-sm font-semibold text-cryptoNight dark:text-white">
                {isLookingUpUser ? "Searching..." : "No results found"}
              </p>
              <p className="mt-1 text-xs text-gray-20 dark:text-white/48">
                Try an asset, transaction status, email, or Kellon tag.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default SearchBar;
