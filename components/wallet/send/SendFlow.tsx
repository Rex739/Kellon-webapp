"use client";

import { ArrowLeft, ArrowRight, Send, X } from "lucide-react";
import AddFundsModal from "@/components/modals/AddFundsModal";
import StepIndicator from "@/components/wallet/buy-crypto/BuyCryptoStepIndicator";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/db";
import AmountStep from "./AmountStep";
import AssetStep from "./AssetStep";
import RecentsPanel from "./RecentsPanel";
import RecipientStep from "./RecipientStep";
import ReviewStep from "./ReviewStep";
import TransferVerificationModal from "./TransferVerificationModal";
import { SEND_STEPS, stepTitles } from "./send-utils";
import { useSendFlow } from "./use-send-flow";

interface SendFlowProps {
  profile: User;
}

export default function SendFlow({ profile }: SendFlowProps) {
  const {
    amount,
    amountForm,
    amountValue,
    closeTransferVerification,
    closeSend,
    goBack,
    goNext,
    handleAmountKeypadPress,
    handleRecipientChange,
    isAddFundsOpen,
    isAmountValid,
    isRecipientValid,
    isSubmitting,
    isVerifyingRecipient,
    primaryButtonDisabled,
    recentRecipients,
    recipientForm,
    recipientInput,
    recipientKind,
    selectedAsset,
    sendableAssets,
    setAmount,
    setIsAddFundsOpen,
    setRecipientInput,
    setSelectedAssetId,
    setStep,
    setVerifiedRecipient,
    selfRecipientError,
    step,
    submitTransfer,
    submitTransferVerification,
    verificationRequest,
    verifiedRecipient,
    verifyRecipient,
  } = useSendFlow(profile);

  return (
    <div className="container mx-auto flex min-h-[90dvh] max-w-5xl flex-col px-4 pb-32 pt-4 md:px-6 md:pt-12">
      <div className="mb-8 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          className="rounded-full border border-gray-80 bg-white p-2 text-gray-20 transition hover:bg-gray-95 hover:text-cryptoNight dark:border-white/10 dark:bg-secondary-60/50 dark:text-white dark:hover:bg-secondary-60 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <h1 className="text-lg font-bold text-black dark:text-white md:text-2xl">
          {stepTitles[step]}
        </h1>

        <button
          type="button"
          onClick={closeSend}
          className="rounded-full border border-gray-80 bg-white p-2 text-gray-20 transition hover:bg-gray-95 hover:text-cryptoNight dark:border-white/10 dark:bg-secondary-60/50 dark:text-white dark:hover:bg-secondary-60 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <StepIndicator
        currentStep={SEND_STEPS.indexOf(step)}
        totalSteps={SEND_STEPS.length}
      />

      <div className="mx-auto grid w-full max-w-4xl gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] md:items-start">
        <section className="min-h-[420px] rounded-2xl border border-black/5 bg-white/75 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-secondary-50/45 md:rounded-lg md:p-5">
          {step === "recipient" ? (
            <RecipientStep
              recipientForm={recipientForm}
              recipientInput={recipientInput}
              recipientKind={recipientKind}
              isRecipientValid={isRecipientValid}
              selfRecipientError={selfRecipientError}
              verifiedRecipient={verifiedRecipient}
              onVerifyRecipient={verifyRecipient}
              onRecipientChange={handleRecipientChange}
            />
          ) : null}

          {step === "asset" ? (
            <AssetStep
              sendableAssets={sendableAssets}
              selectedAsset={selectedAsset}
              onSelectAsset={setSelectedAssetId}
              onOpenAddFunds={() => setIsAddFundsOpen(true)}
            />
          ) : null}

          {step === "amount" ? (
            <AmountStep
              amountForm={amountForm}
              amount={amount}
              selectedAsset={selectedAsset}
              isAmountValid={isAmountValid}
              onAmountChange={setAmount}
              onKeypadPress={handleAmountKeypadPress}
              onReview={() => setStep("review")}
            />
          ) : null}

          {step === "review" ? (
            <ReviewStep
              amountValue={amountValue}
              selectedAsset={selectedAsset}
              recipientInput={recipientInput}
              recipientKind={recipientKind}
            />
          ) : null}
        </section>

        <RecentsPanel
          recentRecipients={recentRecipients}
          recipientForm={recipientForm}
          setRecipientInput={setRecipientInput}
          setVerifiedRecipient={setVerifiedRecipient}
          setStep={setStep}
        />
      </div>

      <div className="mx-auto mt-6 w-full max-w-4xl">
        <Button
          variant="flow"
          size="flow"
          onClick={step === "review" ? submitTransfer : goNext}
          disabled={primaryButtonDisabled}
        >
          <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
            {step === "review"
              ? isSubmitting
                ? "Sending..."
                : "Send Now"
              : step === "recipient" && isVerifyingRecipient
                ? "Verifying..."
                : "Continue"}
            {step === "review" ? (
              <Send className="h-5 w-5" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
        </Button>
      </div>

      <AddFundsModal isOpen={isAddFundsOpen} onClose={setIsAddFundsOpen} />
      <TransferVerificationModal
        isOpen={Boolean(verificationRequest)}
        isSubmitting={isSubmitting}
        verificationType={verificationRequest?.verificationType || "otp"}
        onClose={closeTransferVerification}
        onSubmit={submitTransferVerification}
      />
    </div>
  );
}
