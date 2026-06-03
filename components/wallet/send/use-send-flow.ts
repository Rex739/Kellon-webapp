"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  isTransferVerificationRequiredError,
  transferService,
} from "@/services/api/transfers";
import type { Asset, AssetType, User } from "@/types/db";
import type {
  AmountFormValues,
  RecipientFormValues,
  SendableAsset,
  SendStep,
  VerifiedRecipient,
} from "./send-types";
import {
  ASSET_NAMES,
  SEND_STEPS,
  amountSchema,
  getRecentRecipient,
  getRecipientKind,
  isSupportedRecipient,
  parseAssetAmount,
  recipientSchema,
} from "./send-utils";

export function useSendFlow(profile: User) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRecipient = searchParams.get("recipient") || "";
  const [step, setStep] = useState<SendStep>("recipient");
  const [recipientInput, setRecipientInput] = useState(initialRecipient);
  const [verifiedRecipient, setVerifiedRecipient] =
    useState<VerifiedRecipient | null>(null);
  const [isVerifyingRecipient, setIsVerifyingRecipient] = useState(false);
  const [recipientLookupMessage, setRecipientLookupMessage] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationRequest, setVerificationRequest] = useState<{
    verificationType: "otp" | "totp";
  } | null>(null);

  const recipientKind = getRecipientKind(recipientInput);
  const isRecipientValid = isSupportedRecipient(recipientKind);
  const normalizedRecipient = recipientInput.trim();

  const recipientForm = useForm<RecipientFormValues>({
    resolver: zodResolver(recipientSchema),
    defaultValues: { recipient: initialRecipient },
    mode: "onChange",
  });

  const amountForm = useForm<AmountFormValues>({
    resolver: zodResolver(amountSchema),
    defaultValues: { amount: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (!initialRecipient) return;

    setRecipientInput(initialRecipient);
    recipientForm.setValue("recipient", initialRecipient, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setVerifiedRecipient(null);
    setStep("recipient");
  }, [initialRecipient, recipientForm]);

  const sendableAssets = useMemo<SendableAsset[]>(() => {
    return (profile.assets || [])
      .filter((asset): asset is Asset => Boolean(asset?.symbol && asset?.chain))
      .map((asset) => {
        const symbol = asset.symbol.toUpperCase();
        const chain = asset.chain || "";
        return {
          id: asset.id,
          key: [asset.id, symbol, chain].filter(Boolean).join(":"),
          symbol,
          name: ASSET_NAMES[symbol] || symbol,
          amount: parseAssetAmount(asset.amount),
          chain,
          assetType: asset.assetType,
        };
      })
      .filter(
        (asset) => asset.amount > 0 && ["USDC", "USDT"].includes(asset.symbol),
      )
      .sort((left, right) => {
        if (left.symbol !== right.symbol) {
          return left.symbol.localeCompare(right.symbol);
        }
        return left.chain.localeCompare(right.chain);
      });
  }, [profile.assets]);

  const selectedAsset =
    sendableAssets.find((asset) => asset.key === selectedAssetId) ||
    sendableAssets[0] ||
    null;

  const amountValue = Number(amount);
  const isAmountValid =
    Number.isFinite(amountValue) &&
    amountValue > 0 &&
    Boolean(selectedAsset) &&
    amountValue <= (selectedAsset?.amount || 0);

  const recentRecipients = useMemo(() => {
    const seen = new Set<string>();

    return (profile.transactions || [])
      .filter((transaction) =>
        ["TRANSFER_OUT", "TRANSFER_IN"].includes(transaction.type),
      )
      .map(getRecentRecipient)
      .filter((recipient): recipient is { value: string; method: string } =>
        Boolean(recipient?.value),
      )
      .filter((recipient) => {
        const key = recipient.value.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 5);
  }, [profile.transactions]);

  const selfIdentifiers = useMemo(() => {
    const identifiers = new Set<string>();
    const profileWithUsername = profile as User & {
      username?: string | null;
    };

    if (profile.id) identifiers.add(profile.id.toLowerCase());
    if (profile.email) identifiers.add(profile.email.toLowerCase());
    if (profileWithUsername.username) {
      identifiers.add(profileWithUsername.username.toLowerCase());
      identifiers.add(
        `@${profileWithUsername.username.replace(/^@/, "")}`.toLowerCase(),
      );
    }
    if (profile.tag) {
      identifiers.add(profile.tag.toLowerCase());
      identifiers.add(`@${profile.tag.replace(/^@/, "")}`.toLowerCase());
    }

    (profile.chainAccounts || []).forEach((account) => {
      if (account.publicKey) identifiers.add(account.publicKey.toLowerCase());
      if (account.smartAccountAddress) {
        identifiers.add(account.smartAccountAddress.toLowerCase());
      }
    });

    return identifiers;
  }, [profile]);

  const isSelfRecipient = (value: string) =>
    selfIdentifiers.has(value.trim().toLowerCase());

  const selfRecipientError =
    normalizedRecipient && isSelfRecipient(normalizedRecipient)
      ? "You can't send to yourself. Choose another recipient."
      : null;

  useEffect(() => {
    const recipient = normalizedRecipient;
    const kind = getRecipientKind(recipient);

    setVerifiedRecipient(null);

    if (!recipient) {
      setRecipientLookupMessage("");
      return;
    }

    if (isSelfRecipient(recipient)) {
      const message = "You can't send to yourself. Choose another recipient.";
      setRecipientLookupMessage(message);
      recipientForm.setError("recipient", { message });
      return;
    }

    if (!isSupportedRecipient(kind)) {
      setRecipientLookupMessage(
        "Enter a valid email, username, @tag, EVM address, or Stellar address.",
      );
      return;
    }

    if (kind === "evm" || kind === "stellar") {
      setVerifiedRecipient({ id: recipient, identifier: recipient });
      setRecipientLookupMessage("Wallet address will be used as entered.");
      recipientForm.clearErrors("recipient");
      return;
    }

    setRecipientLookupMessage("Checking Kellon user...");
    setIsVerifyingRecipient(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const lookupValue =
          kind === "tag" ? recipient.replace(/^@/, "") : recipient.toLowerCase();
        const response = await transferService.verifyRecipient(lookupValue);
        const recipientUser = response.data;

        if (!recipientUser?.found) {
          const message = "No Kellon user found for this recipient.";
          setRecipientLookupMessage(message);
          recipientForm.setError("recipient", { message });
          return;
        }

        setVerifiedRecipient({
          id: lookupValue,
          name: recipientUser.name,
          addresses: recipientUser.addresses,
          identifier: recipient,
        });
        setRecipientLookupMessage(
          recipientUser.name
            ? `Verified as ${recipientUser.name}`
            : "Kellon recipient verified",
        );
        recipientForm.clearErrors("recipient");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to verify recipient.";
        setRecipientLookupMessage(message);
        recipientForm.setError("recipient", { message });
      } finally {
        setIsVerifyingRecipient(false);
      }
    }, 450);

    return () => {
      window.clearTimeout(timeoutId);
      setIsVerifyingRecipient(false);
    };
  }, [normalizedRecipient, recipientForm, selfIdentifiers]);

  const verifyRecipient = async (values: RecipientFormValues) => {
    const recipient = values.recipient.trim();
    const kind = getRecipientKind(recipient);

    if (isSelfRecipient(recipient)) {
      recipientForm.setError("recipient", {
        message: "You can't send to yourself. Choose another recipient.",
      });
      return;
    }

    if (verifiedRecipient) {
      setStep("asset");
      return;
    }

    if (kind !== "email" && kind !== "tag") {
      setVerifiedRecipient({ id: recipient, identifier: recipient });
      setStep("asset");
      return;
    }

    setIsVerifyingRecipient(true);
    try {
      const lookupValue =
        kind === "tag" ? recipient.replace(/^@/, "") : recipient.toLowerCase();
      const response = await transferService.verifyRecipient(lookupValue);
      const recipientUser = response.data;

      if (!recipientUser?.found) {
        throw new Error("Recipient not found.");
      }

      if (isSelfRecipient(recipient)) {
        recipientForm.setError("recipient", {
          message: "You can't send to yourself. Choose another recipient.",
        });
        return;
      }

      setVerifiedRecipient({
        id: lookupValue,
        name: recipientUser.name,
        addresses: recipientUser.addresses,
        identifier: recipient,
      });
      setStep("asset");
    } catch (error) {
      recipientForm.setError("recipient", {
        message:
          error instanceof Error
            ? error.message
            : "Unable to verify recipient.",
      });
    } finally {
      setIsVerifyingRecipient(false);
    }
  };

  const handleRecipientChange = (nextRecipient: string) => {
    setRecipientInput(nextRecipient);

    if (isSelfRecipient(nextRecipient)) {
      recipientForm.setError("recipient", {
        message: "You can't send to yourself. Choose another recipient.",
      });
    } else {
      recipientForm.clearErrors("recipient");
      void recipientForm.trigger("recipient");
    }
  };

  const setAmountValue = (value: string) => {
    setAmount(value);
    amountForm.setValue("amount", value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleAmountKeypadPress = (value: string) => {
    const current = amountForm.getValues("amount");
    if (value === "delete") {
      setAmountValue(current.slice(0, -1));
      return;
    }
    if (value === "." && current.includes(".")) return;
    if (current === "0" && value !== ".") {
      setAmountValue(value);
      return;
    }
    setAmountValue(`${current}${value}`);
  };

  const goBack = () => {
    if (step === "recipient") {
      router.back();
      return;
    }

    const currentIndex = SEND_STEPS.indexOf(step);
    setStep(SEND_STEPS[Math.max(0, currentIndex - 1)]);
  };

  const goNext = () => {
    if (step === "recipient") {
      void recipientForm.handleSubmit(verifyRecipient)();
      return;
    }
    if (step === "asset" && selectedAsset) {
      setStep("amount");
      return;
    }
    if (step === "amount") {
      void amountForm.handleSubmit(() => {
        if (isAmountValid) setStep("review");
      })();
    }
  };

  const executeTransfer = async (verification?: {
    verificationCode: string;
    verificationType: "otp" | "totp";
  }) => {
    if (
      !selectedAsset ||
      !isAmountValid ||
      !isRecipientValid ||
      !verifiedRecipient
    )
      return;

    setIsSubmitting(true);
    try {
      const trimmedRecipient = recipientInput.trim();
      const response = await transferService.createInternalTransfer({
        amount: amountValue,
        symbol: selectedAsset.symbol,
        assetType: selectedAsset.assetType || ("CRYPTO" as AssetType),
        chain: selectedAsset.chain,
        verificationCode: verification?.verificationCode,
        verificationType: verification?.verificationType,
        recipientEmail:
          recipientKind === "email"
            ? trimmedRecipient.toLowerCase()
            : undefined,
        recipientTag:
          recipientKind === "tag"
            ? trimmedRecipient.replace(/^@/, "")
            : undefined,
        metadata:
          recipientKind === "evm" || recipientKind === "stellar"
            ? {
                chain: selectedAsset.chain,
                network: selectedAsset.chain,
                recipientAddress: trimmedRecipient,
                recipientAddressType: recipientKind,
              }
            : {
                chain: selectedAsset.chain,
                network: selectedAsset.chain,
                recipientMethod: recipientKind,
                verifiedRecipientId: verifiedRecipient.id,
              },
      });

      setVerificationRequest(null);
      toast.success(
        response.data?.recipient?.type === "pending"
          ? "Transfer invite created"
          : "Transfer created",
      );
      router.push("/transactions");
    } catch (error) {
      if (isTransferVerificationRequiredError(error)) {
        setVerificationRequest({
          verificationType: error.verificationType,
        });
        toast.info("Enter your verification code to continue.");
        return;
      }

      toast.error(
        error instanceof Error ? error.message : "Unable to process transfer",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitTransfer = () => {
    void executeTransfer();
  };

  const submitTransferVerification = (verificationCode: string) => {
    if (!verificationRequest) return;

    void executeTransfer({
      verificationCode,
      verificationType: verificationRequest.verificationType,
    });
  };

  const closeTransferVerification = () => {
    if (isSubmitting) return;
    setVerificationRequest(null);
    setStep("review");
  };

  const primaryButtonDisabled =
    (step === "recipient" &&
      (!isRecipientValid ||
        isVerifyingRecipient ||
        Boolean(selfRecipientError) ||
        !verifiedRecipient)) ||
    (step === "asset" && !selectedAsset) ||
    (step === "amount" && !isAmountValid) ||
    (step === "review" && isSubmitting);

  return {
    amount,
    amountForm,
    amountValue,
    closeSend: () => router.push("/"),
    closeTransferVerification,
    goBack,
    goNext,
    handleAmountKeypadPress,
    handleRecipientChange,
    isAddFundsOpen,
    isAmountValid,
    isRecipientValid,
    selfRecipientError,
    isSubmitting,
    isVerifyingRecipient,
    primaryButtonDisabled,
    recentRecipients,
    recipientForm,
    recipientInput,
    recipientKind,
    recipientLookupMessage,
    verificationRequest,
    selectedAsset,
    sendableAssets,
    setAmount,
    setIsAddFundsOpen,
    setRecipientInput,
    setSelectedAssetId,
    setStep,
    setVerifiedRecipient,
    step,
    submitTransfer,
    submitTransferVerification,
    verifiedRecipient,
    verifyRecipient,
  };
}
