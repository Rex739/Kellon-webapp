"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface TransferVerificationModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  verificationType: "otp" | "totp";
  onClose: () => void;
  onSubmit: (code: string) => void;
}

export default function TransferVerificationModal({
  isOpen,
  isSubmitting,
  verificationType,
  onClose,
  onSubmit,
}: TransferVerificationModalProps) {
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!isOpen) setCode("");
  }, [isOpen]);

  const trimmedCode = code.trim();
  const canSubmit = trimmedCode.length >= 4 && !isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[380px] rounded-[28px] border border-gray-80 bg-white p-0 outline-none dark:border-white/10 dark:bg-black2 [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Verify transfer</DialogTitle>
        </DialogHeader>

        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-95 text-primary-50 dark:bg-primary-70/15 dark:text-primary-80">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <h2 className="text-lg font-semibold text-cryptoNight dark:text-white">
            Verify transfer
          </h2>
          <p className="mx-auto mt-2 max-w-[280px] text-sm text-gray-20 dark:text-gray-40">
            Enter your {verificationType.toUpperCase()} code to complete this
            send.
          </p>

          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter code"
            className="mt-5 h-12 rounded-xl border-gray-80 bg-gray-95 text-center text-base font-semibold tracking-[0.35em] text-cryptoNight placeholder:tracking-normal dark:border-white/10 dark:bg-secondary-50 dark:text-white"
            disabled={isSubmitting}
          />

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 rounded-xl border border-gray-80 bg-white text-sm font-semibold text-gray-20 transition hover:bg-gray-95 disabled:opacity-50 dark:border-white/10 dark:bg-secondary-50 dark:text-gray-40 dark:hover:bg-secondary-60 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSubmit(trimmedCode)}
              disabled={!canSubmit}
              className="h-11 rounded-xl bg-primary-50 text-sm font-semibold text-white transition hover:bg-primary-40 disabled:opacity-60 dark:bg-primary-70 dark:hover:bg-primary-80 cursor-pointer"
            >
              {isSubmitting ? "Verifying..." : "Confirm"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
