"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, Eye, Gift, Loader2, Send, X } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import FlowActionFooter from "@/components/wallet/shared/FlowActionFooter"
import FlowStepIndicator from "@/components/wallet/shared/FlowStepIndicator"
import AssetNetworkDisplay from "@/components/wallet/shared/AssetNetworkDisplay"
import { giftService } from "@/services/api/gifts"
import {
  transferService,
  type TransferRecipient,
} from "@/services/api/transfers"
import { getChainLabel } from "@/lib/chains"
import { cn } from "@/lib/utils"
import type { User } from "@/types/db"
import GiftCardPreview from "./GiftCardPreview"
import GiftSuccessModal from "./GiftSuccessModal"
import {
  GIFT_STEPS,
  GIFT_TEMPLATES,
  formatGiftAmount,
  getGiftAssetOptions,
  getGiftSelfIdentifiers,
  isGiftRecipientEmail,
  isGiftRecipientTag,
  type GiftAssetOption,
  type GiftStep,
} from "./gift-utils"

interface GiftFlowProps {
  profile: User
}

const stepTitles: Record<GiftStep, string> = {
  intro: "Crypto Gift Cards",
  style: "Crypto Gift Cards",
  details: "Crypto Gift Cards",
  review: "Crypto Gift Cards",
}

const giftCardClass =
  "rounded-[28px] border border-black/5 bg-white p-4 dark:border-white/10 dark:bg-secondary-50/80 md:p-5"

const giftInputClass =
  "border-black/5 bg-gray-95 text-sm font-semibold text-black placeholder:text-gray-400 focus-visible:ring-primary-70/20 dark:border-white/10 dark:bg-secondary-60 dark:text-white dark:placeholder:text-gray-500"

const giftSectionTitleClass = "text-sm font-bold text-black dark:text-white"
const giftLabelClass = "text-xs font-semibold text-gray-500 dark:text-gray-400"

export default function GiftFlow({ profile }: GiftFlowProps) {
  const router = useRouter()
  const assets = useMemo(
    () => getGiftAssetOptions(profile.assets || []),
    [profile.assets],
  )
  const [step, setStep] = useState<GiftStep>("intro")
  const [selectedTemplateId, setSelectedTemplateId] = useState("custom")
  const [cardTitle, setCardTitle] = useState("")
  const [selectedAssetKey, setSelectedAssetKey] = useState(
    () => assets[0]?.key || "",
  )
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [message, setMessage] = useState("")
  const [verifiedRecipient, setVerifiedRecipient] =
    useState<TransferRecipient | null>(null)
  const [verifiedRecipientInput, setVerifiedRecipientInput] = useState("")
  const [lookupMessage, setLookupMessage] = useState("")
  const [isVerifyingRecipient, setIsVerifyingRecipient] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [isExitOpen, setIsExitOpen] = useState(false)

  const selectedTemplate =
    GIFT_TEMPLATES.find((template) => template.id === selectedTemplateId) ||
    GIFT_TEMPLATES[0]
  const selectedAsset =
    assets.find((asset) => asset.key === selectedAssetKey) || assets[0] || null
  const selectedSymbol = selectedAsset?.symbol || "USDC"
  const selectedChain = selectedAsset?.chain || "base"
  const amountValue = Number(amount)
  const normalizedRecipient = recipient.trim()
  const normalizedRecipientKey = normalizedRecipient.toLowerCase()
  const selfIdentifiers = useMemo(
    () => getGiftSelfIdentifiers(profile),
    [profile],
  )
  const isSelfRecipient =
    Boolean(normalizedRecipient) && selfIdentifiers.has(normalizedRecipientKey)
  const isEmailRecipient = isGiftRecipientEmail(normalizedRecipient)
  const isTagRecipient = isGiftRecipientTag(normalizedRecipient)
  const isRecipientFormatValid = isEmailRecipient || isTagRecipient
  const isRecipientVerified =
    Boolean(verifiedRecipient?.found) &&
    verifiedRecipientInput === normalizedRecipientKey
  const hasEnoughBalance =
    Boolean(selectedAsset) &&
    Number.isFinite(amountValue) &&
    amountValue > 0 &&
    amountValue <= (selectedAsset?.amount || 0)
  const canReview =
    Boolean(selectedAsset) &&
    hasEnoughBalance &&
    isRecipientFormatValid &&
    !isSelfRecipient &&
    isRecipientVerified
  const canSend = canReview && !isSending

  useEffect(() => {
    if (!selectedAssetKey && assets[0]?.key) {
      setSelectedAssetKey(assets[0].key)
    }
  }, [assets, selectedAssetKey])

  useEffect(() => {
    const contact = normalizedRecipient
    const contactKey = normalizedRecipientKey

    setVerifiedRecipient(null)
    setVerifiedRecipientInput("")

    if (!contact) {
      setLookupMessage("")
      return
    }

    if (isSelfRecipient) {
      setLookupMessage("You can't send a gift to yourself.")
      return
    }

    if (!isRecipientFormatValid) {
      setLookupMessage("Enter a valid email or Kellon tag.")
      return
    }

    setLookupMessage("Checking Kellon user...")
    setIsVerifyingRecipient(true)

    const timeoutId = window.setTimeout(async () => {
      try {
        const lookupValue = isEmailRecipient
          ? contact.toLowerCase()
          : contact.replace(/^@/, "")
        const response = await transferService.verifyRecipient(
          lookupValue,
        )
        const recipientUser = response.data

        if (!recipientUser?.found) {
          setLookupMessage("No Kellon user found for this contact.")
          return
        }

        setVerifiedRecipient(recipientUser)
        setVerifiedRecipientInput(contactKey)
        setLookupMessage(
          recipientUser.name
            ? `Verified as ${recipientUser.name}`
            : "Kellon recipient verified",
        )
      } catch (error) {
        setLookupMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify recipient.",
        )
      } finally {
        setIsVerifyingRecipient(false)
      }
    }, 450)

    return () => {
      window.clearTimeout(timeoutId)
      setIsVerifyingRecipient(false)
    }
  }, [
    isEmailRecipient,
    isRecipientFormatValid,
    isSelfRecipient,
    normalizedRecipient,
    normalizedRecipientKey,
  ])

  const goBack = () => {
    const currentIndex = GIFT_STEPS.indexOf(step)
    if (currentIndex <= 0) {
      router.back()
      return
    }

    setStep(GIFT_STEPS[currentIndex - 1])
  }

  const closeFlow = () => setIsExitOpen(true)

  const handleAmountChange = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, "")
    const [whole, decimal = ""] = cleaned.split(".")
    const nextValue =
      cleaned.includes(".") && decimal !== undefined
        ? `${whole}.${decimal.slice(0, 6)}`
        : whole
    setAmount(nextValue)
  }

  const handleSendGift = async () => {
    if (!selectedAsset || !canSend) return

    setIsSending(true)
    try {
      await giftService.sendGift({
        recipientEmail: isEmailRecipient
          ? normalizedRecipient.toLowerCase()
          : undefined,
        recipientTag: isEmailRecipient
          ? undefined
          : normalizedRecipient.replace(/^@/, ""),
        amount: amountValue,
        symbol: selectedAsset.symbol,
        chain: selectedAsset.chain,
        message: message.trim() || undefined,
        templateId: selectedTemplate.id,
        title:
          selectedTemplate.id === "custom"
            ? cardTitle.trim() || selectedTemplate.title
            : selectedTemplate.title,
      })
      setIsSuccessOpen(true)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to send gift.",
      )
    } finally {
      setIsSending(false)
    }
  }

  const renderStep = () => {
    if (step === "intro") {
      return <IntroStep onContinue={() => setStep("style")} />
    }

    if (step === "style") {
      return (
        <>
          <div className="md:hidden">
            <StyleStep
              selectedTemplateId={selectedTemplateId}
              onSelect={setSelectedTemplateId}
              onContinue={() => setStep("details")}
            />
          </div>
          <DesktopGiftForm
            assets={assets}
            selectedAsset={selectedAsset}
            selectedAssetKey={selectedAssetKey}
            selectedTemplateId={selectedTemplateId}
            amount={amount}
            recipient={recipient}
            cardTitle={cardTitle}
            message={message}
            lookupMessage={lookupMessage}
            isVerifyingRecipient={isVerifyingRecipient}
            hasEnoughBalance={hasEnoughBalance}
            canReview={canReview}
            isCustomTemplate={selectedTemplate.id === "custom"}
            onSelectTemplate={setSelectedTemplateId}
            onSelectAsset={setSelectedAssetKey}
            onAmountChange={handleAmountChange}
            onRecipientChange={setRecipient}
            onCardTitleChange={setCardTitle}
            onMessageChange={setMessage}
            onReview={() => setStep("review")}
          />
        </>
      )
    }

    if (step === "details") {
      return (
        <DetailsStep
          assets={assets}
          selectedAsset={selectedAsset}
          selectedAssetKey={selectedAssetKey}
          amount={amount}
          recipient={recipient}
          cardTitle={cardTitle}
          message={message}
          lookupMessage={lookupMessage}
          isVerifyingRecipient={isVerifyingRecipient}
          hasEnoughBalance={hasEnoughBalance}
          canReview={canReview}
          isCustomTemplate={selectedTemplate.id === "custom"}
          onSelectAsset={setSelectedAssetKey}
          onAmountChange={handleAmountChange}
          onRecipientChange={setRecipient}
          onCardTitleChange={setCardTitle}
          onMessageChange={setMessage}
          onReview={() => setStep("review")}
        />
      )
    }

    return (
      <ReviewStep
        template={selectedTemplate}
        amount={amount}
        symbol={selectedSymbol}
        chain={getChainLabel(selectedChain)}
        recipient={normalizedRecipient}
        cardTitle={
          selectedTemplate.id === "custom"
            ? cardTitle.trim() || selectedTemplate.title
            : selectedTemplate.title
        }
        message={message}
        isSending={isSending}
        canSend={canSend}
        onSend={handleSendGift}
      />
    )
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden text-cryptoNight dark:text-white">
      <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-4xl flex-col px-4 pb-28 pt-5 md:px-6 md:pb-14 md:pt-20">
        <header className="mb-8 flex items-center justify-between gap-4 md:mb-10">
          <button
            type="button"
            onClick={goBack}
            className="p-2 bg-gray-100 dark:bg-secondary-60/50 rounded-full border border-slate-200 dark:border-none cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="text-center text-xl font-bold md:text-2xl">
            {stepTitles[step]}
          </h1>

          <button
            type="button"
            onClick={closeFlow}
            className="p-2 bg-gray-100 dark:bg-secondary-60/50 rounded-full border border-slate-200 dark:border-none cursor-pointer"
            aria-label="Close gifts"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {step !== "intro" ? (
          <FlowStepIndicator
            currentStep={Math.max(0, GIFT_STEPS.indexOf(step) - 1)}
            totalSteps={GIFT_STEPS.length - 1}
          />
        ) : null}

        {renderStep()}
      </main>

      <GiftSuccessModal
        open={isSuccessOpen}
        onOpenChange={setIsSuccessOpen}
        amount={amount || "0"}
        symbol={selectedSymbol}
        chain={getChainLabel(selectedChain)}
        recipient={normalizedRecipient}
        onDone={() => router.push("/")}
      />
      <GiftExitConfirmation
        open={isExitOpen}
        onStay={() => setIsExitOpen(false)}
        onLeave={() => router.push("/")}
      />
    </div>
  )
}

function IntroStep({ onContinue }: { onContinue: () => void }) {
  return (
    <section className="flex flex-1 flex-col justify-center pb-6 text-center md:mx-auto md:w-full md:max-w-4xl">
      <div className="grid items-center gap-8 md:grid-cols-[0.85fr_1fr] md:text-left">
        <div>
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] text-primary-60 dark:text-primary-80 md:mx-0 md:h-28 md:w-28">
            <Gift className="h-20 w-20 md:h-24 md:w-24" strokeWidth={1.7} />
          </div>
          <h2 className="mt-7 text-3xl font-bold leading-tight md:text-4xl">
            Share Crypto Gifts with Anyone, Anywhere
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400 md:mx-0">
            Send gifts fast, easily, and securely on Kellon.
          </p>
        </div>

        <div className="mx-auto w-full max-w-lg space-y-5 text-left">
          {[
            ["Enter your gift amount", ""],
            [
              "Share via Email or Username",
              "Send directly to any Kellon user or invite friends via email",
            ],
            [
              "Available Instantly",
              "Recipients can claim their crypto gift immediately",
            ],
          ].map(([title, description], index) => (
            <div key={title} className="flex gap-4 rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-secondary-50/40">
              <div className="relative flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-80/30 bg-primary-95 text-sm font-bold text-primary-60 dark:border-primary-80/20 dark:bg-secondary-60 dark:text-primary-80">
                  {index + 1}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-black dark:text-white md:text-base">
                  {title}
                </p>
                {description ? (
                  <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400 md:text-sm">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <div className="hidden h-10 w-10 shrink-0 md:block" />
            <FlowActionFooter
              sticky={false}
              onClick={onContinue}
              className="w-full border-0 px-0"
            >
              Create Gift
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </FlowActionFooter>
          </div>
        </div>
      </div>
    </section>
  )
}

function StyleStep({
  selectedTemplateId,
  onSelect,
  onContinue,
}: {
  selectedTemplateId: string
  onSelect: (id: string) => void
  onContinue: () => void
}) {
  return (
    <section className="mx-auto flex max-h-[calc(100dvh-190px)] min-h-0 w-full max-w-4xl flex-1 flex-col overflow-hidden md:max-h-[calc(100dvh-260px)]">
      <h2 className="mb-6 text-center text-lg font-bold md:text-xl">
        Pick a style
      </h2>
      <div className="min-h-0 flex-1 overflow-y-auto pb-4 pr-1">
        <TemplateGrid selectedTemplateId={selectedTemplateId} onSelect={onSelect} />
      </div>

      <FlowActionFooter
        onClick={onContinue}
        className="mx-auto w-full max-w-xl border-0 bg-transparent px-0"
      >
        Continue
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </FlowActionFooter>
    </section>
  )
}

function TemplateGrid({
  selectedTemplateId,
  onSelect,
  compact = false,
}: {
  selectedTemplateId: string
  onSelect: (id: string) => void
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3",
        compact ? "md:grid-cols-3 md:gap-3" : "md:grid-cols-3 md:gap-4 lg:grid-cols-4",
      )}
    >
      {GIFT_TEMPLATES.map((template) => {
        const Icon = template.Icon
        const isSelected = template.id === selectedTemplateId

        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className={cn(
              "relative cursor-pointer rounded-2xl bg-gradient-to-br p-4 text-left text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
              compact ? "min-h-20 md:p-3" : "min-h-28 md:min-h-36 md:p-5",
              template.gradient,
              isSelected
                ? "ring-2 ring-primary-70"
                : "ring-1 ring-white/10",
            )}
          >
            <Icon
              className={cn(
                "opacity-90",
                compact ? "h-7 w-7" : "h-8 w-8 md:h-9 md:w-9",
              )}
            />
            <p
              className={cn(
                "absolute bottom-4 left-4 text-sm font-bold",
                compact && "bottom-3 left-3 text-xs",
              )}
            >
              {template.title}
            </p>
            {isSelected ? (
              <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary-70 text-white">
                <Check className="h-4 w-4" />
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

function AssetAmountSection({
  assets,
  selectedAsset,
  selectedAssetKey,
  amount,
  hasEnoughBalance,
  onSelectAsset,
  onAmountChange,
}: {
  assets: GiftAssetOption[]
  selectedAsset: GiftAssetOption | null
  selectedAssetKey: string
  amount: string
  hasEnoughBalance: boolean
  onSelectAsset: (key: string) => void
  onAmountChange: (value: string) => void
}) {
  const enteredAmount = Number(amount)
  const hasEnteredAmount = Number.isFinite(enteredAmount) && enteredAmount > 0
  const isOverBalance = Boolean(selectedAsset) && hasEnteredAmount && !hasEnoughBalance

  return (
    <section className={giftCardClass}>
      <div className="mb-3">
        <h2 className={giftSectionTitleClass}>Asset & Amount</h2>
        <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
          Choose the asset to gift and enter how much to send.
        </p>
      </div>

      {assets.length > 0 ? (
        <div className="grid gap-2">
          {assets.map((asset) => {
            const isSelected = selectedAssetKey === asset.key

            return (
              <button
                key={asset.key}
                type="button"
                onClick={() => onSelectAsset(asset.key)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 text-left transition-all",
                  isSelected
                    ? "border-primary-60 bg-primary-70/5 ring-2 ring-primary-60/20"
                    : "border-black/5 bg-gray-95 text-gray-600 hover:text-black dark:border-white/10 dark:bg-secondary-50 dark:text-gray-400 dark:hover:bg-secondary-60/50 dark:hover:text-white",
                )}
              >
                <AssetNetworkDisplay
                  symbol={asset.symbol}
                  assetName={asset.name}
                  network={asset.chain}
                  className="flex-1"
                  iconSize="md"
                  symbolClassName="text-base"
                  detailClassName="text-xs"
                />
              </button>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/10 p-6 text-center text-sm text-gray-30 dark:border-white/10 dark:text-gray-40">
          Add funds to your wallet before sending a gift.
        </div>
      )}

      <div className="relative mt-3">
        <Input
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          inputMode="decimal"
          placeholder="0.00"
          className={cn(
            giftInputClass,
            "h-16 rounded-2xl pl-9 pr-20 text-2xl font-semibold",
          )}
        />
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-gray-400 dark:text-gray-500">
          $
        </span>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 dark:text-gray-400">
          {selectedAsset?.symbol || "Asset"}
        </span>
      </div>
      {selectedAsset ? (
        <p
          className={cn(
            "mt-3 text-xs font-medium",
            isOverBalance
              ? "text-red-500"
              : "text-gray-500 dark:text-gray-400",
          )}
        >
          {isOverBalance
            ? `Insufficient balance. Available: ${formatGiftAmount(
                selectedAsset.amount,
              )} ${selectedAsset.symbol}`
            : `Available: ${formatGiftAmount(selectedAsset.amount)} ${
                selectedAsset.symbol
              }`}
        </p>
      ) : null}
    </section>
  )
}

function RecipientMessageSection({
  recipient,
  cardTitle,
  message,
  lookupMessage,
  isVerifyingRecipient,
  isCustomTemplate,
  onRecipientChange,
  onCardTitleChange,
  onMessageChange,
}: {
  recipient: string
  cardTitle: string
  message: string
  lookupMessage: string
  isVerifyingRecipient: boolean
  isCustomTemplate: boolean
  onRecipientChange: (value: string) => void
  onCardTitleChange: (value: string) => void
  onMessageChange: (value: string) => void
}) {
  const lookupTone =
    lookupMessage && lookupMessage.includes("Verified")
      ? "text-emerald-600 dark:text-emerald-400"
      : isVerifyingRecipient
        ? "text-gray-500 dark:text-gray-400"
        : "text-red-500"

  return (
    <div className="space-y-4">
      <section className={giftCardClass}>
        <div className="mb-4">
          <h2 className={giftSectionTitleClass}>Recipient Details</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Send to a verified Kellon email or tag.
          </p>
        </div>

        <label className={giftLabelClass}>Username or Email</label>
        <Input
          value={recipient}
          onChange={(event) => onRecipientChange(event.target.value)}
          placeholder="Who is this gift for?"
          className={cn(giftInputClass, "mt-2 h-12 rounded-2xl")}
        />
        {lookupMessage ? (
          <p
            className={cn(
              "mt-3 flex items-center gap-2 text-xs font-medium",
              lookupTone,
            )}
          >
            {isVerifyingRecipient ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : null}
            {lookupMessage}
          </p>
        ) : null}

        {isCustomTemplate ? (
          <div className="mt-4">
            <label className={giftLabelClass}>
              Card Title <span className="font-medium">(Optional)</span>
            </label>
            <Input
              value={cardTitle}
              onChange={(event) => onCardTitleChange(event.target.value)}
              maxLength={28}
              placeholder="Gift Card"
              className={cn(giftInputClass, "mt-2 h-12 rounded-2xl")}
            />
          </div>
        ) : null}
      </section>

      <section className={giftCardClass}>
        <h2 className={giftSectionTitleClass}>
          Personal Message
          <span className="font-medium text-gray-500 dark:text-gray-400">
            {" "}
            (Optional)
          </span>
        </h2>
        <textarea
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          placeholder="Add a sweet note..."
          rows={5}
          maxLength={160}
          className={cn(
            giftInputClass,
            "mt-4 w-full resize-none rounded-2xl p-4 leading-relaxed outline-none focus:border-primary-70",
          )}
        />
      </section>
    </div>
  )
}

function DesktopGiftForm({
  assets,
  selectedAsset,
  selectedAssetKey,
  selectedTemplateId,
  amount,
  recipient,
  cardTitle,
  message,
  lookupMessage,
  isVerifyingRecipient,
  hasEnoughBalance,
  canReview,
  isCustomTemplate,
  onSelectTemplate,
  onSelectAsset,
  onAmountChange,
  onRecipientChange,
  onCardTitleChange,
  onMessageChange,
  onReview,
}: {
  assets: GiftAssetOption[]
  selectedAsset: GiftAssetOption | null
  selectedAssetKey: string
  selectedTemplateId: string
  amount: string
  recipient: string
  cardTitle: string
  message: string
  lookupMessage: string
  isVerifyingRecipient: boolean
  hasEnoughBalance: boolean
  canReview: boolean
  isCustomTemplate: boolean
  onSelectTemplate: (id: string) => void
  onSelectAsset: (key: string) => void
  onAmountChange: (value: string) => void
  onRecipientChange: (value: string) => void
  onCardTitleChange: (value: string) => void
  onMessageChange: (value: string) => void
  onReview: () => void
}) {
  return (
    <section className="hidden w-full flex-1 flex-col gap-5 md:flex">
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <section className={giftCardClass}>
            <h2 className="mb-4 text-sm font-bold text-black dark:text-white">
              Pick a Style
            </h2>
            <TemplateGrid
              selectedTemplateId={selectedTemplateId}
              onSelect={onSelectTemplate}
              compact
            />
          </section>
          <AssetAmountSection
            assets={assets}
            selectedAsset={selectedAsset}
            selectedAssetKey={selectedAssetKey}
            amount={amount}
            hasEnoughBalance={hasEnoughBalance}
            onSelectAsset={onSelectAsset}
            onAmountChange={onAmountChange}
          />
        </div>

        <div className="space-y-5">
          <RecipientMessageSection
            recipient={recipient}
            cardTitle={cardTitle}
            message={message}
            lookupMessage={lookupMessage}
            isVerifyingRecipient={isVerifyingRecipient}
            isCustomTemplate={isCustomTemplate}
            onRecipientChange={onRecipientChange}
            onCardTitleChange={onCardTitleChange}
            onMessageChange={onMessageChange}
          />
          <FlowActionFooter
            sticky={false}
            onClick={onReview}
            disabled={!canReview}
            className="w-full border-0 px-0"
            helperText="Review the gift before sending. The recipient must be a verified Kellon user."
          >
            <Eye className="h-4 w-4" />
            Review Gift
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </FlowActionFooter>
        </div>
      </div>
    </section>
  )
}

function DetailsStep({
  assets,
  selectedAsset,
  selectedAssetKey,
  amount,
  recipient,
  cardTitle,
  message,
  lookupMessage,
  isVerifyingRecipient,
  hasEnoughBalance,
  canReview,
  isCustomTemplate,
  onSelectAsset,
  onAmountChange,
  onRecipientChange,
  onCardTitleChange,
  onMessageChange,
  onReview,
}: {
  assets: GiftAssetOption[]
  selectedAsset: GiftAssetOption | null
  selectedAssetKey: string
  amount: string
  recipient: string
  cardTitle: string
  message: string
  lookupMessage: string
  isVerifyingRecipient: boolean
  hasEnoughBalance: boolean
  canReview: boolean
  isCustomTemplate: boolean
  onSelectAsset: (key: string) => void
  onAmountChange: (value: string) => void
  onRecipientChange: (value: string) => void
  onCardTitleChange: (value: string) => void
  onMessageChange: (value: string) => void
  onReview: () => void
}) {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 md:gap-5">
      <AssetAmountSection
        assets={assets}
        selectedAsset={selectedAsset}
        selectedAssetKey={selectedAssetKey}
        amount={amount}
        hasEnoughBalance={hasEnoughBalance}
        onSelectAsset={onSelectAsset}
        onAmountChange={onAmountChange}
      />
      <RecipientMessageSection
        recipient={recipient}
        cardTitle={cardTitle}
        message={message}
        lookupMessage={lookupMessage}
        isVerifyingRecipient={isVerifyingRecipient}
        isCustomTemplate={isCustomTemplate}
        onRecipientChange={onRecipientChange}
        onCardTitleChange={onCardTitleChange}
        onMessageChange={onMessageChange}
      />

      <FlowActionFooter
        sticky={false}
        onClick={onReview}
        disabled={!canReview}
        className="mx-auto w-full max-w-xl border-0 px-0 md:hidden"
        helperText="Review the gift before sending. The recipient must be a verified Kellon user."
      >
        <Eye className="h-4 w-4" />
        Review Gift
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </FlowActionFooter>
    </section>
  )
}

function ReviewStep({
  template,
  amount,
  symbol,
  chain,
  recipient,
  cardTitle,
  message,
  isSending,
  canSend,
  onSend,
}: {
  template: (typeof GIFT_TEMPLATES)[number]
  amount: string
  symbol: string
  chain: string
  recipient: string
  cardTitle: string
  message: string
  isSending: boolean
  canSend: boolean
  onSend: () => void
}) {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <GiftCardPreview
          template={template}
          amount={amount || "0.00"}
          symbol={symbol}
          recipient={recipient}
          title={cardTitle}
          className="mx-auto w-full max-w-[520px] lg:max-w-none"
        />

        <div className="space-y-5">
          {message.trim() ? (
            <div className={cn(giftCardClass, "relative py-7 text-center")}>
              <span
                className="absolute left-4 top-2 text-4xl font-bold opacity-30"
                style={{ color: template.accent }}
              >
                “
              </span>
              <p className="text-base font-medium leading-relaxed text-black dark:text-white">
                {message.trim()}
              </p>
              <span
                className="absolute bottom-0 right-4 text-4xl font-bold opacity-30"
                style={{ color: template.accent }}
              >
                ”
              </span>
            </div>
          ) : null}

          <div className={giftCardClass}>
            <dl className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Network Fee
                </dt>
                <dd className="text-sm font-bold text-black dark:text-white">
                  Gasless (Free)
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Debit
                </dt>
                <dd className="text-sm font-bold text-black dark:text-white">
                  {amount || "0"} {symbol}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Network
                </dt>
                <dd className="text-sm font-bold text-black dark:text-white">
                  {chain}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <FlowActionFooter
        sticky={false}
        onClick={onSend}
        disabled={!canSend}
        className="mx-auto w-full max-w-xl border-0 px-0"
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Confirm & Send Gift
      </FlowActionFooter>
    </section>
  )
}

function GiftExitConfirmation({
  open,
  onStay,
  onLeave,
}: {
  open: boolean
  onStay: () => void
  onLeave: () => void
}) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="w-[92vw] max-w-[340px] rounded-[32px] border-none bg-gray-70 outline-none dark:bg-black2">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-black dark:text-white">
            Leave gift flow?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            Your gift details have not been sent yet. You can stay here to keep
            editing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onStay}
            className="cursor-pointer rounded-full px-3 py-2 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50 hover:text-black dark:text-gray-400 dark:hover:bg-secondary-60/50 dark:hover:text-white"
          >
            Stay
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="cursor-pointer rounded-full px-3 py-2 text-sm font-bold text-primary-70 transition-opacity hover:opacity-80"
          >
            Leave
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
