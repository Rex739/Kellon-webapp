"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import StepIndicator from "@/components/wallet/buy-crypto/BuyCryptoStepIndicator";
import { invoiceService } from "@/services/api/invoices";
import {
  transferService,
  type TransferRecipient,
} from "@/services/api/transfers";
import type { User } from "@/types/db";
import { AmountSection } from "./create-invoice/AmountSection";
import { CustomerDetailsSection } from "./create-invoice/CustomerDetailsSection";
import { DescriptionSection } from "./create-invoice/DescriptionSection";
import { ExpirySection } from "./create-invoice/ExpirySection";
import { InvoiceReview } from "./create-invoice/InvoiceReview";
import {
  EXPIRY_PRESETS,
  INVOICE_STEPS,
  invoiceSchema,
  type InvoiceFormValues,
  type InvoiceStep,
} from "./create-invoice/types";
import {
  getExpiryDate,
  getInvoiceAssetGroups,
  getInvoiceAssetOptions,
  getInvoiceCustomerContactLabel,
  getInvoiceSelfIdentifiers,
  isInvoiceCustomerContactEmail,
} from "./create-invoice/utils";

interface CreateInvoicePageProps {
  profile: User;
}

export default function CreateInvoicePage({ profile }: CreateInvoicePageProps) {
  const router = useRouter();
  const assetOptions = useMemo(
    () => getInvoiceAssetOptions(profile.assets || []),
    [profile.assets],
  );
  const assetGroups = useMemo(
    () => getInvoiceAssetGroups(assetOptions),
    [assetOptions],
  );
  const defaultAsset = assetGroups[0];

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      amount: "",
      assetSymbol: defaultAsset?.symbol || "",
      chain: defaultAsset?.chains[0]?.chain || "",
      description: "",
      customerName: "",
      customerContact: "",
      expiryPreset: "1d",
    },
  });

  const selectedAssetSymbol = form.watch("assetSymbol");
  const selectedChain = form.watch("chain");
  const watchedAmount = form.watch("amount");
  const watchedDescription = form.watch("description");
  const watchedCustomerName = form.watch("customerName");
  const watchedExpiryPreset = form.watch("expiryPreset");
  const customerContact = form.watch("customerContact");

  const selectedAssetGroup = assetGroups.find(
    (asset) => asset.symbol === selectedAssetSymbol,
  );
  const selectedAsset = selectedAssetGroup?.chains.find(
    (asset) => asset.chain === selectedChain,
  );
  const selectedExpiry = EXPIRY_PRESETS.find(
    (preset) => preset.value === watchedExpiryPreset,
  );
  const customerContactValue = customerContact.trim();
  const customerContactLabel =
    getInvoiceCustomerContactLabel(customerContactValue);

  const [verifiedCustomer, setVerifiedCustomer] =
    useState<TransferRecipient | null>(null);
  const [isVerifyingCustomer, setIsVerifyingCustomer] = useState(false);
  const [customerLookupMessage, setCustomerLookupMessage] = useState("");
  const [mobileStep, setMobileStep] = useState<InvoiceStep>("amount");
  const [isDesktopReview, setIsDesktopReview] = useState(false);

  const selfIdentifiers = useMemo(
    () => getInvoiceSelfIdentifiers(profile),
    [profile],
  );

  useEffect(() => {
    if (!selectedAssetGroup) return;

    const chainIsAvailable = selectedAssetGroup.chains.some(
      (asset) => asset.chain === selectedChain,
    );

    if (!chainIsAvailable) {
      form.setValue("chain", selectedAssetGroup.chains[0]?.chain || "");
    }
  }, [form, selectedAssetGroup, selectedChain]);

  useEffect(() => {
    const contact = customerContact.trim();
    setVerifiedCustomer(null);

    if (!contact) {
      setCustomerLookupMessage("");
      return;
    }

    const isValidContact =
      isInvoiceCustomerContactEmail(contact) ||
      /^@?[a-zA-Z0-9._-]{3,}$/.test(contact);

    if (!isValidContact) {
      setCustomerLookupMessage("Enter a valid email or Kellon tag.");
      return;
    }

    if (selfIdentifiers.has(contact.toLowerCase())) {
      const message = "You can't create an invoice for yourself.";
      setCustomerLookupMessage(message);
      form.setError("customerContact", { message });
      return;
    }

    setCustomerLookupMessage("Checking Kellon user...");
    setIsVerifyingCustomer(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const lookupValue = contact.includes("@")
          ? contact.toLowerCase()
          : contact.replace(/^@/, "");
        const response = await transferService.verifyRecipient(lookupValue);
        const customer = response.data;

        if (!customer?.found) {
          const message = "No Kellon user found for this contact.";
          setCustomerLookupMessage(message);
          form.setError("customerContact", { message });
          return;
        }

        setVerifiedCustomer(customer);
        setCustomerLookupMessage(
          customer.name
            ? `Verified as ${customer.name}`
            : "Kellon customer verified",
        );
        form.clearErrors("customerContact");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to verify this Kellon user.";
        setCustomerLookupMessage(message);
        form.setError("customerContact", { message });
      } finally {
        setIsVerifyingCustomer(false);
      }
    }, 450);

    return () => {
      window.clearTimeout(timeoutId);
      setIsVerifyingCustomer(false);
    };
  }, [customerContact, form, selfIdentifiers]);

  const ensureCustomerIsVerified = () => {
    if (verifiedCustomer?.found) return true;

    form.setError("customerContact", {
      message: isVerifyingCustomer
        ? "Wait while we verify this Kellon customer."
        : "Verify this Kellon customer before continuing.",
    });
    return false;
  };

  const goToMobileDetails = async () => {
    const isValid = await form.trigger(["assetSymbol", "chain", "amount"]);
    if (isValid) setMobileStep("details");
  };

  const goToMobileReview = async () => {
    const isValid = await form.trigger([
      "customerName",
      "customerContact",
      "description",
      "expiryPreset",
    ]);

    if (isValid && ensureCustomerIsVerified()) {
      setMobileStep("review");
    }
  };

  const goToDesktopReview = async () => {
    const isValid = await form.trigger();
    if (isValid && ensureCustomerIsVerified()) {
      setIsDesktopReview(true);
    }
  };

  const submitInvoice = async (values: InvoiceFormValues) => {
    const selectedAsset = assetOptions.find(
      (asset) =>
        asset.symbol === values.assetSymbol && asset.chain === values.chain,
    );

    if (!selectedAsset) {
      toast.error("Select an asset to request");
      return;
    }

    const customerContact = values.customerContact?.trim();
    const isEmailContact = customerContact
      ? isInvoiceCustomerContactEmail(customerContact)
      : false;

    if (!verifiedCustomer?.found) {
      form.setError("customerContact", {
        message: "Verify this Kellon customer before creating the invoice.",
      });
      return;
    }

    try {
      await invoiceService.createInvoice({
        amount: values.amount,
        symbol: selectedAsset.symbol,
        chain: selectedAsset.chain,
        assetType: selectedAsset.assetType,
        description: values.description || undefined,
        customerName: values.customerName || undefined,
        customerEmail: isEmailContact ? customerContact : undefined,
        metadata: customerContact
          ? {
              customerContact,
              customerContactType: isEmailContact ? "email" : "kellon_tag",
            }
          : undefined,
        expiresAt: getExpiryDate(values.expiryPreset).toISOString(),
      });

      toast.success("Invoice created");
      router.push("/invoices");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create invoice",
      );
    }
  };

  const amountSection = (
    <AmountSection
      form={form}
      assetGroups={assetGroups}
      selectedAssetGroup={selectedAssetGroup}
      selectedAsset={selectedAsset}
    />
  );
  const customerSection = (
    <CustomerDetailsSection
      form={form}
      customerLookupMessage={customerLookupMessage}
      verifiedCustomer={verifiedCustomer}
      isVerifyingCustomer={isVerifyingCustomer}
    />
  );
  const descriptionSection = <DescriptionSection form={form} />;
  const expirySection = <ExpirySection form={form} />;
  const reviewSection = (
    <InvoiceReview
      selectedAsset={selectedAsset}
      selectedAssetSymbol={selectedAssetSymbol}
      watchedAmount={watchedAmount}
      watchedCustomerName={watchedCustomerName}
      watchedDescription={watchedDescription}
      watchedExpiryPreset={watchedExpiryPreset}
      selectedExpiry={selectedExpiry}
      verifiedCustomer={verifiedCustomer}
      customerContact={customerContact}
      customerContactValue={customerContactValue}
      customerContactLabel={customerContactLabel}
    />
  );
  const isBusy = form.formState.isSubmitting || isVerifyingCustomer;

  return (
    <section className="container mx-auto flex min-h-[90dvh] max-w-4xl flex-col px-4 pb-28 pt-4 md:px-6 md:pb-14 md:pt-20">
      <header className="relative mb-8 flex items-center justify-center">
        <button
          type="button"
          onClick={() => {
            if (mobileStep !== "amount") {
              setMobileStep(mobileStep === "review" ? "details" : "amount");
              return;
            }
            if (isDesktopReview) {
              setIsDesktopReview(false);
              return;
            }
            router.back();
          }}
          className="absolute left-0 cursor-pointer rounded-full border border-black/5 bg-white p-2 text-gray-600 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-secondary-50 dark:text-gray-300 dark:hover:bg-secondary-60/50"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <h1 className="text-lg font-semibold text-black dark:text-white">
          {mobileStep === "review" || isDesktopReview
            ? "Review Invoice"
            : "Create Invoice"}
        </h1>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitInvoice)}>
          <div className="mb-8 md:hidden">
            <StepIndicator
              currentStep={INVOICE_STEPS.indexOf(mobileStep)}
              totalSteps={INVOICE_STEPS.length}
            />
          </div>

          <div className="space-y-5 md:hidden">
            {mobileStep === "amount" ? amountSection : null}
            {mobileStep === "details" ? (
              <>
                {customerSection}
                {descriptionSection}
                {expirySection}
              </>
            ) : null}
            {mobileStep === "review" ? reviewSection : null}

            <div className="sticky bottom-0 -mx-4 px-4 pb-4 pt-5">
              {mobileStep === "amount" ? (
                <>
                  <Button
                    type="button"
                    variant="flow"
                    size="flow"
                    onClick={goToMobileDetails}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                  <p className="mt-3 text-center text-[10px] leading-relaxed text-gray-400">
                    Choose the asset and amount you want this customer to pay.
                  </p>
                </>
              ) : null}

              {mobileStep === "details" ? (
                <>
                  <Button
                    type="button"
                    variant="flow"
                    size="flow"
                    onClick={goToMobileReview}
                    disabled={isBusy || !verifiedCustomer?.found}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                  <p className="mt-3 text-center text-[10px] leading-relaxed text-gray-400">
                    We verify the customer before you create the invoice.
                  </p>
                </>
              ) : null}

              {mobileStep === "review" ? (
                <>
                  <Button
                    type="submit"
                    variant="flow"
                    size="flow"
                    disabled={isBusy || !verifiedCustomer?.found}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                      {form.formState.isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      Create Invoice
                    </span>
                  </Button>
                  <p className="mt-3 text-center text-[10px] leading-relaxed text-gray-400">
                    Confirm the details before generating this payment request.
                  </p>
                </>
              ) : null}
            </div>
          </div>

          <div className="hidden md:block">
            {isDesktopReview ? (
              <div className="space-y-8">
                {reviewSection}
                <div className="mx-auto flex w-full max-w-xl gap-3 border-t border-black/5 pt-6 dark:border-white/5">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 flex-1 rounded-2xl"
                    onClick={() => setIsDesktopReview(false)}
                  >
                    Edit Details
                  </Button>
                  <Button
                    type="submit"
                    variant="flow"
                    size="flow"
                    className="flex-1"
                    disabled={isBusy || !verifiedCustomer?.found}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 text-base">
                      {form.formState.isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      Create Invoice
                    </span>
                  </Button>
                </div>
                <p className="mx-auto max-w-xl px-4 text-center text-xs leading-relaxed text-gray-400">
                  Confirm the invoice details before generating the payment
                  request.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 items-start gap-5">
                <div className="flex flex-col gap-5">
                  {amountSection}
                  {descriptionSection}
                </div>
                <div className="flex flex-col gap-5">
                  {customerSection}
                  {expirySection}
                  <Button
                    type="button"
                    variant="flow"
                    size="flow"
                    onClick={goToDesktopReview}
                    disabled={isBusy || !verifiedCustomer?.found}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 text-base">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                  <p className="px-4 text-center text-xs leading-relaxed text-gray-400">
                    Add the invoice details and verify the Kellon customer
                    before review.
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>
      </Form>
    </section>
  );
}
