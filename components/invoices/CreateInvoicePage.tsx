"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { getAssetName } from "@/lib/dashboard-utils"
import { cn } from "@/lib/utils"
import { invoiceService } from "@/services/api/invoices"
import { transferService, type TransferRecipient } from "@/services/api/transfers"
import { AssetType, type Asset, type User } from "@/types/db"

const invoiceSchema = z.object({
  amount: z
    .string()
    .trim()
    .refine((value) => Number(value) > 0, "Enter a valid amount"),
  assetSymbol: z.string().min(1, "Select an asset"),
  chain: z.string().min(1, "Select a network"),
  description: z.string().trim().optional(),
  customerName: z.string().trim().optional(),
  customerContact: z
    .string()
    .trim()
    .min(1, "Enter the customer's email or Kellon tag")
    .refine(
      (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
        /^@?[a-zA-Z0-9._-]{3,}$/.test(value),
      {
        message: "Enter a valid email or Kellon tag",
      },
    ),
  expiryPreset: z.enum(["1h", "1d", "3d", "7d", "30d"]),
})

type InvoiceFormValues = z.infer<typeof invoiceSchema>

type InvoiceAssetOption = {
  key: string
  symbol: string
  name: string
  iconUrl: string
  chain: string
  assetType: AssetType
}

type InvoiceAssetGroup = {
  symbol: string
  name: string
  iconUrl: string
  chains: InvoiceAssetOption[]
}

const EXPIRY_PRESETS = [
  { label: "1 Hour", value: "1h" },
  { label: "1 Day", value: "1d" },
  { label: "3 Days", value: "3d" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
] as const

const HIDDEN_INVOICE_CHAINS = new Set(["avalanche", "avax"])

interface CreateInvoicePageProps {
  profile: User
}

export default function CreateInvoicePage({
  profile,
}: CreateInvoicePageProps) {
  const router = useRouter()
  const assets = profile.assets || []
  const assetOptions = useMemo(() => getInvoiceAssetOptions(assets), [assets])
  const assetGroups = useMemo(
    () => getInvoiceAssetGroups(assetOptions),
    [assetOptions],
  )
  const defaultAsset = assetGroups[0]

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
  })

  const selectedAssetSymbol = form.watch("assetSymbol")
  const selectedChain = form.watch("chain")
  const selectedAssetGroup = assetGroups.find(
    (asset) => asset.symbol === selectedAssetSymbol,
  )
  const selectedAsset = selectedAssetGroup?.chains.find(
    (asset) => asset.chain === selectedChain,
  )
  const customerContact = form.watch("customerContact")
  const [verifiedCustomer, setVerifiedCustomer] =
    useState<TransferRecipient | null>(null)
  const [isVerifyingCustomer, setIsVerifyingCustomer] = useState(false)
  const [customerLookupMessage, setCustomerLookupMessage] = useState("")

  const selfIdentifiers = useMemo(() => {
    const identifiers = new Set<string>()
    const profileWithUsername = profile as User & {
      username?: string | null
    }

    if (profile.id) identifiers.add(profile.id.toLowerCase())
    if (profile.email) identifiers.add(profile.email.toLowerCase())
    if (profileWithUsername.username) {
      identifiers.add(profileWithUsername.username.toLowerCase())
      identifiers.add(
        `@${profileWithUsername.username.replace(/^@/, "")}`.toLowerCase(),
      )
    }
    if (profile.tag) {
      identifiers.add(profile.tag.toLowerCase())
      identifiers.add(`@${profile.tag.replace(/^@/, "")}`.toLowerCase())
    }

    return identifiers
  }, [profile])

  const isSelfCustomer = (value: string) =>
    selfIdentifiers.has(value.trim().toLowerCase())

  useEffect(() => {
    if (!selectedAssetGroup) return

    const chainIsAvailable = selectedAssetGroup.chains.some(
      (asset) => asset.chain === selectedChain,
    )

    if (!chainIsAvailable) {
      form.setValue("chain", selectedAssetGroup.chains[0]?.chain || "")
    }
  }, [form, selectedAssetGroup, selectedChain])

  useEffect(() => {
    const contact = customerContact.trim()
    setVerifiedCustomer(null)

    if (!contact) {
      setCustomerLookupMessage("")
      return
    }

    const isValidContact =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ||
      /^@?[a-zA-Z0-9._-]{3,}$/.test(contact)

    if (!isValidContact) {
      setCustomerLookupMessage("Enter a valid email or Kellon tag.")
      return
    }

    if (isSelfCustomer(contact)) {
      setCustomerLookupMessage("You can't create an invoice for yourself.")
      form.setError("customerContact", {
        message: "You can't create an invoice for yourself.",
      })
      return
    }

    setCustomerLookupMessage("Checking Kellon user...")
    setIsVerifyingCustomer(true)

    const timeoutId = window.setTimeout(async () => {
      try {
        const lookupValue = contact.includes("@")
          ? contact.toLowerCase()
          : contact.replace(/^@/, "")
        const response = await transferService.verifyRecipient(lookupValue)
        const customer = response.data

        if (!customer?.found) {
          setCustomerLookupMessage("No Kellon user found for this contact.")
          form.setError("customerContact", {
            message: "No Kellon user found for this contact.",
          })
          return
        }

        setVerifiedCustomer(customer)
        setCustomerLookupMessage(
          customer.name
            ? `Verified as ${customer.name}`
            : "Kellon customer verified",
        )
        form.clearErrors("customerContact")
      } catch (error) {
        setCustomerLookupMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify this Kellon user.",
        )
        form.setError("customerContact", {
          message:
            error instanceof Error
              ? error.message
              : "Unable to verify this Kellon user.",
        })
      } finally {
        setIsVerifyingCustomer(false)
      }
    }, 450)

    return () => {
      window.clearTimeout(timeoutId)
      setIsVerifyingCustomer(false)
    }
  }, [customerContact, form, selfIdentifiers])

  const submitInvoice = async (values: InvoiceFormValues) => {
    const selectedAsset = assetOptions.find(
      (asset) =>
        asset.symbol === values.assetSymbol && asset.chain === values.chain,
    )

    if (!selectedAsset) {
      toast.error("Select an asset to request")
      return
    }

    const customerContact = values.customerContact?.trim()
    const isEmailContact = customerContact
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerContact)
      : false

    if (!verifiedCustomer?.found) {
      form.setError("customerContact", {
        message: "Verify this Kellon customer before creating the invoice.",
      })
      return
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
      })

      toast.success("Invoice created")
      router.push("/invoices")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create invoice",
      )
    }
  }

  return (
    <section className="container mx-auto flex min-h-[100dvh] max-w-5xl flex-col px-4 pb-28 pt-4 md:px-6 md:pb-14 md:pt-28">
      <header className="relative mb-8 flex items-center justify-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-0 rounded-full border border-black/5 bg-white p-2 text-gray-600 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-secondary-50 dark:text-gray-300 dark:hover:bg-secondary-60/50 cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <h1 className="text-lg font-semibold text-black dark:text-white">
          Create Invoice
        </h1>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submitInvoice)}
          className="flex flex-col gap-5 md:grid md:grid-cols-2 md:items-start"
        >
          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-5">
            {/* Amount */}
            <section className="rounded-[24px] border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-secondary-50/80 dark:shadow-none">
              <h2 className="mb-3 text-sm font-bold text-black dark:text-white">
                Amount
              </h2>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="assetSymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {assetGroups.map((asset) => {
                            const isSelected = field.value === asset.symbol

                            return (
                              <button
                                key={asset.symbol}
                                type="button"
                                onClick={() => field.onChange(asset.symbol)}
                                className={cn(
                                  "flex cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                                  isSelected
                                    ? "border-primary-70 bg-primary-95 text-cryptoNight shadow-sm dark:border-primary-70/30 dark:bg-primary-70/15 dark:text-white"
                                    : "border-black/5 bg-gray-95 text-gray-600 hover:text-black dark:border-white/10 dark:bg-secondary-60 dark:text-gray-400 dark:hover:bg-secondary-60/50 dark:hover:text-white",
                                )}
                              >
                                <AssetLogo
                                  src={asset.iconUrl}
                                  symbol={asset.symbol}
                                />
                                <span className="min-w-0">
                                  <span className="block text-sm font-bold">
                                    {asset.symbol}
                                  </span>
                                  <span className="block truncate text-xs opacity-70">
                                    {asset.name}
                                  </span>
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                {selectedAssetGroup && selectedAssetGroup.chains.length > 1 ? (
                  <FormField
                    control={form.control}
                    name="chain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          Network
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {selectedAssetGroup.chains.map((asset) => {
                              const isSelected = field.value === asset.chain

                              return (
                                <button
                                  key={asset.key}
                                  type="button"
                                  onClick={() => field.onChange(asset.chain)}
                                  className={cn(
                                    "shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                                    isSelected
                                      ? "border-primary-90 bg-primary-95 text-primary-50 dark:border-primary-70/20 dark:bg-primary-70/15 dark:text-primary-80"
                                      : "border-gray-80 bg-white/80 text-gray-20 hover:text-cryptoNight dark:border-white/10 dark:bg-secondary-50/70 dark:text-gray-40 dark:hover:text-white",
                                  )}
                                >
                                  {formatChain(asset.chain)}
                                </button>
                              )
                            })}
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />
                ) : null}

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            inputMode="decimal"
                            placeholder="0.00"
                            className="h-16 rounded-2xl border-black/5 bg-gray-95 pr-20 text-2xl font-semibold text-black placeholder:text-gray-400 focus-visible:ring-primary-70/20 dark:border-white/10 dark:bg-secondary-60 dark:text-white"
                          />
                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                            {selectedAsset?.symbol || "Asset"}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* Description */}
            <section className="rounded-[24px] border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-secondary-50/80 dark:shadow-none">
              <div className="mb-3">
                <h2 className="text-sm font-bold text-black dark:text-white">
                  Description
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Optional
                </p>
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <textarea
                        {...field}
                        placeholder="What is this payment for?"
                        className="min-h-28 w-full resize-none rounded-2xl border border-black/5 bg-gray-95 px-4 py-3 text-sm text-black outline-none transition focus-visible:ring-[3px] focus-visible:ring-primary-70/20 dark:border-white/10 dark:bg-secondary-60 dark:text-white dark:placeholder:text-gray-400"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
            </section>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="flex flex-col gap-5">
            {/* Customer Details */}
            <section className="rounded-[24px] border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-secondary-50/80 dark:shadow-none">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-black dark:text-white">
                  Customer Details
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Optional
                </p>
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Customer name"
                          className="h-12 rounded-2xl border-black/5 bg-gray-95 text-black placeholder:text-gray-400 focus-visible:ring-primary-70/20 dark:border-white/10 dark:bg-secondary-60 dark:text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Email or Kellon Tag
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="customer@email.com or @username"
                          className="h-12 rounded-2xl border-black/5 bg-gray-95 text-black placeholder:text-gray-400 focus-visible:ring-primary-70/20 dark:border-white/10 dark:bg-secondary-60 dark:text-white"
                      />
                    </FormControl>
                    {customerLookupMessage ? (
                      <p
                        className={cn(
                          "text-xs font-medium",
                          verifiedCustomer?.found
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isVerifyingCustomer
                              ? "text-gray-500 dark:text-gray-400"
                              : "text-red-500",
                        )}
                      >
                        {customerLookupMessage}
                      </p>
                    ) : null}
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
                />
              </div>
            </section>

            {/* Expiry */}
            <section className="rounded-[24px] border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-secondary-50/20 dark:shadow-none">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-black dark:text-white">
                  Expiry
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  When should this link expire?
                </p>
              </div>
              <FormField
                control={form.control}
                name="expiryPreset"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {EXPIRY_PRESETS.map((preset) => {
                          const isActive = field.value === preset.value

                          return (
                            <button
                              key={preset.value}
                              type="button"
                              onClick={() => field.onChange(preset.value)}
                              className={cn(
                                "rounded-full border px-4 py-2 text-xs font-semibold transition-all cursor-pointer",
                                isActive
                                  ? "border-primary-60/40 bg-primary-70/5 text-primary-60 dark:border-primary-70/30 dark:bg-primary-70/10 dark:text-primary-80"
                                  : "border-black/5 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-black dark:border-white/5 dark:bg-secondary-50 dark:text-gray-400 dark:hover:bg-secondary-60/60 dark:hover:text-white",
                              )}
                            >
                              {preset.label}
                            </button>
                          )
                        })}
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-red-500" />
                  </FormItem>
                )}
              />
            </section>

            {/* Submit */}
            <Button
              type="submit"
              variant="flow"
              size="flow"
              disabled={
                form.formState.isSubmitting ||
                isVerifyingCustomer ||
                !verifiedCustomer?.found
              }
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-sm md:text-base">
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                Create Invoice
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            </Button>
          </div>
        </form>
      </Form>
    </section>
  )
}

function getInvoiceAssetOptions(assets: Asset[]): InvoiceAssetOption[] {
  const options = assets
    .filter(
      (asset) =>
        asset.assetType === AssetType.CRYPTO &&
        !HIDDEN_INVOICE_CHAINS.has((asset.chain || "").toLowerCase()),
    )
    .map((asset) => {
      const symbol = asset.symbol.toUpperCase()

      return {
        key: `${symbol}:${asset.chain || "base"}`,
        symbol,
        name: getAssetName(symbol),
        iconUrl: getAssetIcon(symbol),
        chain: asset.chain || "base",
        assetType: asset.assetType,
      }
    })

  if (options.length > 0) {
    return Array.from(
      new Map(options.map((asset) => [asset.key, asset])).values(),
    )
  }

  return [
    {
      key: "USDC:base",
      symbol: "USDC",
      name: getAssetName("USDC"),
      iconUrl: getAssetIcon("USDC"),
      chain: "base",
      assetType: AssetType.CRYPTO,
    },
    {
      key: "USDT:base",
      symbol: "USDT",
      name: getAssetName("USDT"),
      iconUrl: getAssetIcon("USDT"),
      chain: "base",
      assetType: AssetType.CRYPTO,
    },
  ]
}

function getInvoiceAssetGroups(
  assets: InvoiceAssetOption[],
): InvoiceAssetGroup[] {
  const groups = new Map<string, InvoiceAssetGroup>()

  assets.forEach((asset) => {
    const existingGroup = groups.get(asset.symbol)

    if (existingGroup) {
      existingGroup.chains.push(asset)
      return
    }

    groups.set(asset.symbol, {
      symbol: asset.symbol,
      name: asset.name,
      iconUrl: asset.iconUrl,
      chains: [asset],
    })
  })

  return Array.from(groups.values())
}

function AssetLogo({ src, symbol }: { src: string; symbol: string }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary-60/10 dark:bg-secondary-60">
      <img
        src={src}
        alt={`${symbol} logo`}
        className="h-full w-full object-cover"
      />
    </span>
  )
}

function getAssetIcon(symbol: string): string {
  return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase()}.png`
}

function getExpiryDate(preset: InvoiceFormValues["expiryPreset"]): Date {
  const expiresAt = new Date()

  switch (preset) {
    case "1h":
      expiresAt.setHours(expiresAt.getHours() + 1)
      break
    case "1d":
      expiresAt.setDate(expiresAt.getDate() + 1)
      break
    case "3d":
      expiresAt.setDate(expiresAt.getDate() + 3)
      break
    case "7d":
      expiresAt.setDate(expiresAt.getDate() + 7)
      break
    case "30d":
      expiresAt.setDate(expiresAt.getDate() + 30)
      break
  }

  return expiresAt
}

function formatChain(chain: string): string {
  return chain.charAt(0).toUpperCase() + chain.slice(1).toLowerCase()
}
