"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useBuyCryptoState, STEPS } from "@/hooks/use-buy-cypto-state";
import type { Step } from "@/hooks/use-buy-cypto-state";
import type { BankDetail } from "@/types/db";
import { useCountryDetection } from "@/hooks/use-country-detection";
import {
  getCurrencyForCountry,
  getCurrencySymbol,
  getCurrencyDecimals,
} from "@/lib/country-currency-map";
import { getChainById } from "@/lib/chains";
import PaymentMethodModal from "@/components/modals/PaymentMethodModal";
import { CountrySelectorModal } from "@/components/modals/CountrySelectorModal";
import { SUPPORTED_RAMP_COUNTRIES } from "@/lib/supported-countries";
import { useExchangeRate } from "@/hooks/use-exchange-rate";
import { useProviders } from "@/hooks/use-provider";
import { useProviderRates } from "@/hooks/use-provider-rates";
import { bankService } from "@/services/api/bank";
import SelectBankModal from "@/components/modals/SelectBankModal";
import StepIndicator from "./BuyCryptoStepIndicator";
import { AssetSelectionStep } from "./steps/AssetSelectionStep";
import { AmountEntryStep } from "./steps/AmountEntryStep";
import { ProviderSelectionStep } from "./steps/ProviderSelectionStep";
import { BuyBankSelectionStep } from "./steps/BankSelectionStep";
import { ReviewStep } from "./steps/ReviewStep";

const MIN_CRYPTO_THRESHOLD = 0.01;
const DEFAULT_FLOW_STEPS = ["asset", "amount", "provider", "review"] as const;
type VisibleFlowStep = (typeof DEFAULT_FLOW_STEPS)[number] | Step;

const methodLabels: Record<string, string> = {
  card: "Debit/Credit Card",
  bank: "Bank Transfer",
  mobile_money: "Mobile Money",
};

export default function BuyCryptoFlow({
  onAttemptClose,
}: {
  onAttemptClose: (hasStarted: boolean) => void;
}) {
  const {
    step,
    asset,
    networkName,
    networkId,
    amount,
    currency,
    country,
    countrySource,
    bankId,
    setAsset,
    setNetwork,
    setAmount,
    setCountryAndCurrency,
    setBankId,
    setStep,
  } = useBuyCryptoState();

  // Local UI state
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "bank" | "mobile_money"
  >("card");
  const [savedBanks, setSavedBanks] = useState<BankDetail[]>([]);

  // Track if amount was set via input (desktop) or keypad (mobile)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDesktopAmountValid, setIsDesktopAmountValid] = useState(false);

  // Country detection (stable callback)
  const handleCountryDetected = useCallback(
    (detectedCountry: string, detectedCurrency: string) => {
      setCountryAndCurrency(detectedCountry, detectedCurrency, "auto");
    },
    [setCountryAndCurrency],
  );

  const { isDetecting: isDetectingCountry } = useCountryDetection(
    country,
    countrySource,
    handleCountryDetected,
  );

  // Derived values
  const fiatCurrency = useMemo(
    () => getCurrencyForCountry(country || "US"),
    [country],
  );
  const fiatSymbol = useMemo(
    () => getCurrencySymbol(fiatCurrency),
    [fiatCurrency],
  );
  const decimals = useMemo(
    () => getCurrencyDecimals(fiatCurrency),
    [fiatCurrency],
  );
  const selectedChain = useMemo(
    () => (networkId ? getChainById(networkId) : null),
    [networkId],
  );

  // Exchange rate
  const { exchangeRate, isRateLoading } = useExchangeRate(fiatCurrency, asset);

  // Providers
  const {
    providers,
    selectedProviderId,
    setSelectedProviderId,
    isLoadingProviders,
  } = useProviders(country, asset, networkName, currency);

  // Derived amount values
  const cryptoAmountValue = useMemo(() => {
    if (!amount || exchangeRate === 0) return 0;
    return Number(amount) / exchangeRate;
  }, [amount, exchangeRate]);

  const isAmountValid = useMemo(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return false;
    return cryptoAmountValue >= MIN_CRYPTO_THRESHOLD;
  }, [cryptoAmountValue, amount]);

  const fiatAmountNum = useMemo(() => parseFloat(amount) || 0, [amount]);

  // Provider-specific rates (only when step is "provider" and inputs are valid)
  const showRates = step === "provider" && isAmountValid && fiatAmountNum > 0;
  const { rates: providerRates, isLoadingRates } = useProviderRates({
    providers: showRates ? providers : [],
    asset,
    amount: fiatAmountNum,
    currency: fiatCurrency,
    networkName,
    isAmountValid: showRates,
    isLoadingProviders,
  });
  const selectedProvider =
    providers.find((provider) => provider.id === selectedProviderId) || null;
  const selectedBank = savedBanks.find((bank) => bank.id === bankId) || null;
  const requiresRefundBank =
    selectedProvider?.name?.toLowerCase() === "paycrest";
  const flowSteps = useMemo(
    (): readonly VisibleFlowStep[] =>
      requiresRefundBank ? STEPS : DEFAULT_FLOW_STEPS,
    [requiresRefundBank],
  );
  const currentStepIndex = Math.max(0, flowSteps.indexOf(step));

  useEffect(() => {
    let cancelled = false;

    const loadBanks = async () => {
      try {
        const response = await bankService.getBanks();
        if (!cancelled) {
          setSavedBanks(response.data || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load banks", error);
        }
      }
    };

    loadBanks();

    return () => {
      cancelled = true;
    };
  }, []);

  // Handlers
  const handleKeypadPress = (val: string) => {
    let nextAmount = amount;
    if (val === "delete") {
      nextAmount = amount.slice(0, -1);
    } else if (val === "." && (amount.includes(".") || decimals === 0)) {
      return;
    } else if (amount === "0" && val !== ".") {
      nextAmount = val;
    } else {
      nextAmount = amount + val;
    }
    setAmount(nextAmount);
  };

  const handleAmountChange = (value: string) => {
    // Validate amount format (allow numbers with up to 2 decimals)
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(value) || value === "") {
      setAmount(value);
      // Validate if amount is valid
      const numValue = parseFloat(value);
      const isValid = !isNaN(numValue) && numValue > 0;
      setIsDesktopAmountValid(isValid);
    }
  };

  const confirmPurchase = () => {
    alert("Initiating Gateway...");
  };

  // Step navigation
  const goBack = () => {
    if (step === "amount") setStep("asset");
    else if (step === "provider") setStep("amount");
    else if (step === "bank") setStep("provider");
    else if (step === "review")
      setStep(requiresRefundBank ? "bank" : "provider");
    else onAttemptClose(false);
  };

  // Sync amount validity for desktop
  useEffect(() => {
    if (step === "amount") {
      // Ensure amount validity is in sync
      const isValid =
        parseFloat(amount) > 0 && cryptoAmountValue >= MIN_CRYPTO_THRESHOLD;
      setIsDesktopAmountValid(isValid);
    }
  }, [amount, cryptoAmountValue, step]);

  return (
    <div className="flex flex-col container max-w-2xl mx-auto min-h-[90dvh] pb-32 md:pt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-4 pt-4">
        <button
          onClick={goBack}
          className="p-2 bg-gray-100 dark:bg-secondary-60/50 rounded-full border border-slate-200 dark:border-none"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-white" />
        </button>
        <h2 className="text-lg font-bold text-black dark:text-white">
          {step === "provider"
            ? "Choose Provider"
            : step === "amount"
              ? "Enter Amount"
              : step === "bank"
                ? "Refund Account"
                : step === "review"
                  ? "Review Order"
                  : "Buy Crypto"}
        </h2>
        <button
          onClick={() => onAttemptClose(true)}
          className="p-2 bg-gray-100 dark:bg-secondary-60/50 rounded-full border border-slate-200 dark:border-none"
        >
          <X className="w-5 h-5 text-slate-600 dark:text-white" />
        </button>
      </div>

      <StepIndicator
        currentStep={currentStepIndex}
        totalSteps={flowSteps.length}
      />

      <div className="flex-1 flex flex-col pt-4 w-11/12 mx-auto md:w-lg md:mx-auto ">
        {step === "asset" && (
          <AssetSelectionStep
            asset={asset}
            networkName={networkName}
            networkId={networkId}
            country={country}
            isDetectingCountry={isDetectingCountry}
            onSelectAsset={setAsset}
            onSelectNetwork={setNetwork}
            onOpenCountryModal={() => setIsCountryModalOpen(true)}
            onContinue={() => setStep("amount")}
          />
        )}

        {step === "amount" && (
          <AmountEntryStep
            asset={asset}
            networkName={networkName}
            selectedChain={selectedChain}
            amount={amount}
            fiatCurrency={fiatCurrency}
            fiatSymbol={fiatSymbol}
            decimals={decimals}
            cryptoAmountValue={cryptoAmountValue}
            exchangeRate={exchangeRate}
            isRateLoading={isRateLoading}
            isAmountValid={isAmountValid}
            paymentMethod={paymentMethod}
            paymentMethodLabel={methodLabels[paymentMethod]}
            onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            onKeypadPress={handleKeypadPress}
            onContinue={() => {
              if (isAmountValid) {
                setStep("provider");
              }
            }}
            onAmountChange={handleAmountChange}
          />
        )}

        {step === "provider" && (
          <ProviderSelectionStep
            asset={asset}
            networkName={networkName}
            selectedChain={selectedChain}
            amount={amount}
            providers={providers}
            selectedProviderId={selectedProviderId}
            paymentMethodLabel={methodLabels[paymentMethod]}
            onSelectProvider={setSelectedProviderId}
            onContinue={() => setStep(requiresRefundBank ? "bank" : "review")}
            providerRates={providerRates}
            isRatesLoading={isLoadingRates}
            fiatCurrency={fiatCurrency}
            fiatSymbol={fiatSymbol}
            decimals={decimals}
            cryptoAmountValue={cryptoAmountValue}
          />
        )}

        {step === "bank" && (
          <BuyBankSelectionStep
            asset={asset}
            amount={amount}
            fiatCurrency={fiatCurrency}
            selectedChain={selectedChain}
            selectedBank={selectedBank}
            savedBanks={savedBanks}
            onSelectSavedBank={(bank) => setBankId(bank.id)}
            onOpenBankModal={() => setIsBankModalOpen(true)}
            onContinue={() => selectedBank && setStep("review")}
          />
        )}

        {step === "review" && (
          <ReviewStep
            amount={amount}
            asset={asset}
            fiatCurrency={fiatCurrency}
            fiatSymbol={fiatSymbol}
            selectedChain={selectedChain}
            selectedProvider={selectedProvider}
            estimatedCrypto={
              providerRates[selectedProviderId] &&
              typeof providerRates[selectedProviderId] === "object"
                ? providerRates[selectedProviderId]?.cryptoAmount || 0
                : typeof providerRates[selectedProviderId] === "number"
                  ? providerRates[selectedProviderId]
                  : cryptoAmountValue
            }
            selectedBank={selectedBank}
            paymentMethodLabel={methodLabels[paymentMethod]}
            onConfirm={confirmPurchase}
          />
        )}
      </div>

      <PaymentMethodModal
        isOpen={isPaymentModalOpen}
        onClose={setIsPaymentModalOpen}
        selectedMethod={paymentMethod}
        onSelect={setPaymentMethod}
      />

      <CountrySelectorModal
        isVisible={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        selectedCountry={country || "NG"}
        countries={SUPPORTED_RAMP_COUNTRIES}
        onSelect={(code) => {
          setCountryAndCurrency(code, getCurrencyForCountry(code), "manual");
        }}
      />

      <SelectBankModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        currency={fiatCurrency}
        providerName={selectedProvider?.name || null}
        savedBanks={savedBanks}
        selectedBankId={selectedBank?.id || null}
        onSelectSavedBank={(bank) => setBankId(bank.id)}
        onAddVerifiedBank={(bank) => {
          setSavedBanks((current) => {
            const exists = current.some((item) => item.id === bank.id);
            return exists ? current : [bank, ...current];
          });
          setBankId(bank.id);
        }}
      />
    </div>
  );
}
