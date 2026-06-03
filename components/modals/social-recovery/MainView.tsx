"use client";

import { FC } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ActionButton } from "./ActionButton";

// Types match the schemas used in the custom hook
interface MainViewProps {
  onClose: () => void;
  onNavigate: () => void;
  approvalForm: UseFormReturn<{ requestId: string }>;
  onApprove: (values: { requestId: string }) => Promise<void>;
}

export const MainView: FC<MainViewProps> = ({
  onClose,
  onNavigate,
  approvalForm,
  onApprove,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = approvalForm;

  return (
    <div className="px-4 pb-8 animate-in fade-in duration-300">
      {/* Navigation Header */}
      <div className="flex justify-start mb-4">
        <button
          onClick={onClose}
          className="p-2 bg-white dark:bg-secondary-60/50 rounded-full border border-black/5 dark:border-none hover:opacity-80 transition-opacity outline-none cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-white" />
        </button>
      </div>

      <div className="flex flex-col items-center mb-6">
        <h2 className="text-xl font-bold text-black dark:text-white">
          Social Recovery
        </h2>
      </div>

      {/* Account Status Card */}
      <div className="bg-white dark:bg-secondary-60 border border-black/5 dark:border-white/10 rounded-[24px] p-5 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-green-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-20 uppercase tracking-wider">
            Account Status
          </span>
          <span className="text-lg font-bold text-black dark:text-white">
            SAFE
          </span>
        </div>
      </div>

      {/* Recovery Actions */}
      <div className="space-y-4 mb-8">
        <h3 className="text-xs font-bold text-gray-20 uppercase tracking-widest ml-1">
          Actions
        </h3>
        <ActionButton
          variant="pink"
          icon={Zap}
          title="Quick Recovery"
          description="Reclaim Smart Account on this device."
          onClick={() => {
            /* Implement Quick Recovery logic if needed */
          }}
        />

        <ActionButton
          variant="orange"
          icon={AlertCircle}
          title="Social Recovery"
          description="Use guardians to recover (Advanced)."
          onClick={() => {
            // Usually triggers the recovery flow initiation
          }}
        />

        <ActionButton
          variant="dark"
          icon={Users}
          title="Manage Guardians"
          description="Trusted contacts for recovery."
          onClick={onNavigate}
        />
      </div>

      {/* Guardian Duties Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-20 uppercase tracking-widest ml-1">
          Guardian Duties
        </h3>
        <form
          onSubmit={handleSubmit(onApprove)}
          className="bg-white dark:bg-secondary-60 border border-black/5 dark:border-white/10 rounded-[24px] p-5 space-y-4"
        >
          <label className="text-sm font-bold block ml-1 text-black dark:text-white">
            Approve by Request ID
          </label>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                {...register("requestId")}
                placeholder="Enter Request ID"
                className={cn(
                  "h-12 rounded-2xl border-black/5 bg-gray-95 text-black placeholder:text-gray-400 focus-visible:ring-primary-70/20 dark:border-white/10 dark:bg-secondary-60 dark:text-white",
                  errors.requestId &&
                    "border-red-500 focus-visible:ring-red-500",
                )}
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-20 hover:bg-primary-20/90 text-white rounded-xl px-6 py-6 font-bold cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Approve"
                )}
              </Button>
            </div>
            {errors.requestId && (
              <p className="text-[10px] text-red-500 font-bold ml-1">
                {errors.requestId.message}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
