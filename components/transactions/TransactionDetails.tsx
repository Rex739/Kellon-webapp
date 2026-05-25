"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { getChainLabel } from "@/lib/chains";
import { transactionService } from "@/services/api/transactions";
import type { Transaction } from "@/types/db";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface TransactionDetailsProps {
  id: string;
}

function formatAssetAmount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value > 0 && value < 1 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value: Date | string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function getTransactionLabel(type: Transaction["type"]): string {
  switch (type) {
    case "TRANSFER_IN":
      return "Received";
    case "TRANSFER_OUT":
      return "Sent";
    default:
      return type.charAt(0) + type.slice(1).toLowerCase();
  }
}

function isPositiveTransaction(type: Transaction["type"]): boolean {
  return ["DEPOSIT", "BUY", "TRANSFER_IN"].includes(type);
}

function formatPaidAmount(transaction: Transaction): string | null {
  const rawValue =
    transaction.metadata &&
    typeof transaction.metadata === "object" &&
    "fiatAmount" in transaction.metadata
      ? transaction.metadata.fiatAmount
      : null;

  const parsed =
    typeof rawValue === "string" || typeof rawValue === "number"
      ? Number(rawValue)
      : NaN;

  if (!Number.isFinite(parsed)) return null;

  return `₦${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed)}`;
}

function getPreferredCryptoSymbol(
  metadata: Record<string, unknown>,
): string | null {
  const value =
    getStringMetadataValue(metadata, ["cryptoCurrencyCode"]) ||
    getStringMetadataValue(metadata, ["cryptoCurrency"]) ||
    getStringMetadataValue(metadata, ["token"]) ||
    getStringMetadataValue(metadata, ["asset"]) ||
    getStringMetadataValue(metadata, ["toAsset"]) ||
    getStringMetadataValue(metadata, ["targetAsset"]);

  return value ? value.toUpperCase() : null;
}

function getTransactionSymbol(transaction: Transaction): string {
  const metadata = getTransactionMetadata(transaction);
  const provider =
    typeof metadata.provider === "string"
      ? metadata.provider.toLowerCase()
      : null;

  if (transaction.type === "BUY") {
    return getPreferredCryptoSymbol(metadata) || transaction.symbol;
  }

  switch (provider) {
    case "paycrest":
      return getPreferredCryptoSymbol(metadata) || transaction.symbol;
    case "centiiv":
      return getPreferredCryptoSymbol(metadata) || transaction.symbol;
    default:
      return transaction.symbol;
  }
}

function getProviderAmount(transaction: Transaction): number | null {
  const metadata = getTransactionMetadata(transaction);
  const provider =
    typeof metadata.provider === "string"
      ? metadata.provider.toLowerCase()
      : null;

  switch (provider) {
    case "paycrest": {
      const paycrestAmount = getNestedMetadataValue(
        metadata,
        "paycrestResponse",
        "amount",
      );
      if (paycrestAmount) {
        return parseFloat(String(paycrestAmount));
      }
      break;
    }
    case "centiiv": {
      const centiivAmount = getNestedMetadataValue(
        metadata,
        "centiivResponse",
        "receivableAmount",
      );
      if (centiivAmount) {
        return parseFloat(String(centiivAmount));
      }
      break;
    }
    default:
      return null;
  }

  return null;
}

function parseTransactionAmount(amount: Transaction["amount"]): number | null {
  const parsed = typeof amount === "string" ? Number(amount) : amount;
  return Number.isFinite(parsed) ? parsed : null;
}

function getTransactionDisplayAmount(transaction: Transaction): number | null {
  const providerAmount = getProviderAmount(transaction);
  if (providerAmount !== null) return providerAmount;

  if (["TRANSFER_IN", "TRANSFER_OUT"].includes(transaction.type)) {
    return parseTransactionAmount(transaction.amount);
  }

  return null;
}

function getTransactionTitle(transaction: Transaction): string {
  const type = getTransactionLabel(transaction.type);
  const symbol = getTransactionSymbol(transaction);
  return `${symbol} ${type}`;
}

function getTransactionNetwork(transaction: Transaction): string {
  const transactionWithChain = transaction as Transaction & {
    chain?: string | null;
    network?: string | null;
  };
  const metadata = getTransactionMetadata(transaction);
  const provider =
    typeof metadata.provider === "string"
      ? metadata.provider.toLowerCase()
      : null;
  const chain =
    transactionWithChain.chain ||
    transactionWithChain.network ||
    getStringMetadataValue(metadata, [
      "chain",
      "network",
      "networkName",
      "selectedChain",
    ]);

  switch (provider) {
    case "paycrest":
      return getChainLabel(
        getStringMetadataValue(metadata, ["network"]) || chain,
      );
    case "centiiv":
      return getChainLabel(
        getStringMetadataValue(metadata, ["chain"]) || chain,
      );
    default:
      return chain ? getChainLabel(chain) : "Unknown";
  }
}

function getTransactionMetadata(
  transaction: Transaction,
): Record<string, unknown> {
  return transaction.metadata && typeof transaction.metadata === "object"
    ? (transaction.metadata as Record<string, unknown>)
    : {};
}

function getStringMetadataValue(
  metadata: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

function getNestedMetadataValue(
  metadata: Record<string, unknown>,
  parentKey: string,
  childKey: string,
): unknown {
  const parent = metadata[parentKey];

  if (!parent || typeof parent !== "object") {
    return null;
  }

  return (parent as Record<string, unknown>)[childKey] ?? null;
}

export default function TransactionDetails({ id }: TransactionDetailsProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const response = await transactionService.getTransaction(id);
      return response.data;
    },
  });

  const transaction = data;

  const amountValue = useMemo(() => {
    if (!transaction) return null;
    return getTransactionDisplayAmount(transaction);
  }, [transaction]);

  const symbol = useMemo(() => {
    if (!transaction) return "";
    return getTransactionSymbol(transaction);
  }, [transaction]);

  const amountLabel = useMemo(() => {
    if (!transaction) return "";
    if (amountValue === null) return `-- ${symbol}`;
    const isPositive = isPositiveTransaction(transaction.type);
    const prefix = isPositive ? "+" : "-";
    return `${prefix}${formatAssetAmount(amountValue)} ${symbol}`;
  }, [transaction, amountValue, symbol]);

  const paidAmountLabel = transaction ? formatPaidAmount(transaction) : null;
  const transactionTitle = transaction ? getTransactionTitle(transaction) : "";
  const transactionNetwork = transaction
    ? getTransactionNetwork(transaction)
    : "";

  const copyValue = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const generateReceiptHTML = () => {
    const isSuccess =
      transaction?.status === "COMPLETED" || transaction?.status === "PAID";
    const statusText = isSuccess
      ? "Successful"
      : transaction?.status === "FAILED"
        ? "Failed"
        : transaction?.status === "CANCELLED"
          ? "Cancelled"
          : transaction?.status || "Pending";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kellon Receipt</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background: white;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .receipt {
              width: 450px;
              background: white;
              border: 1px solid #e5e7eb;
            }
            .header {
              background: #a7167f;
              padding: 20px 24px;
              display: grid;
              grid-template-columns: 1fr auto;
              align-items: center;
              gap: 16px;
            }
            .brand {
              display: flex;
              align-items: center;
              gap: 10px;
              min-width: 0;
            }
            .brand-badge {
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              flex-shrink: 0;
            }
            .brand-badge img {
              width: 36px;
              height: 36px;
              object-fit: contain;
              display: block;
            }
            .brand-wordmark {
              color: white;
              font-size: 21px;
              font-weight: 500;
              line-height: 36px;
              letter-spacing: 0;
              white-space: nowrap;
            }
            .header-title {
              color: white;
              font-size: 16px;
              font-weight: 600;
              text-align: right;
              line-height: 1.2;
            }
            .content {
              padding: 24px;
            }
            .status-row {
              text-align: center;
              margin-bottom: 20px;
            }
            .status-text {
              color: ${isSuccess ? "#10b981" : "#ef4444"};
              font-size: 13px;
              font-weight: 700;
              line-height: 1;
              text-align: center;
            }
            .date {
              text-align: center;
              color: #6b7280;
              font-size: 13px;
              margin-bottom: 24px;
            }
            .amount-section {
              border-top: 1px solid #f3f4f6;
              border-bottom: 1px solid #f3f4f6;
              padding: 18px 0;
              margin-bottom: 18px;
              text-align: center;
            }
            .amount {
              font-size: 28px;
              font-weight: 700;
              color: #111827;
            }
            .transaction-type {
              font-size: 13px;
              color: #6b7280;
              margin-top: 4px;
            }
            .details {
              margin-bottom: 24px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #f9fafb;
            }
            .detail-label {
              font-size: 13px;
              color: #6b7280;
            }
            .detail-value {
              font-size: 13px;
              font-weight: 500;
              color: #111827;
            }
            .detail-value.mono {
              font-family: monospace;
              font-size: 11px;
              word-break: break-all;
              text-align: right;
              max-width: 60%;
            }
            .footer {
              border-top: 1px solid #f3f4f6;
              padding-top: 16px;
              text-align: center;
            }
            .footer p {
              font-size: 10px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="brand">
                
                <div class="brand-wordmark">Kellon</div>
              </div>
              <div class="header-title">Transaction Receipt</div>
            </div>
            <div class="content">
              <div class="status-row">
                <div class="status-text">${statusText}</div>
              </div>
              <div class="date">${formatDateTime(transaction!.createdAt)}</div>
              <div class="amount-section">
                <div class="amount">${amountLabel}</div>
                <div class="transaction-type">${getTransactionLabel(transaction!.type)}</div>
              </div>
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Asset</span>
                  <span class="detail-value">${symbol}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Network</span>
                  <span class="detail-value" style="text-transform: capitalize;">${transactionNetwork}</span>
                </div>
                ${
                  paidAmountLabel
                    ? `
                <div class="detail-row">
                  <span class="detail-label">Amount</span>
                  <span class="detail-value">${paidAmountLabel}</span>
                </div>
                `
                    : ""
                }
                <div class="detail-row">
                  <span class="detail-label">Transaction ID</span>
                  <span class="detail-value mono">${transaction!.id}</span>
                </div>
              </div>
              <div class="footer">
                <p>Powered by Kellon</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const captureReceipt = async (): Promise<HTMLCanvasElement | null> => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "450px";
    iframe.style.height = "600px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    try {
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Cannot access iframe document");

      iframeDoc.open();
      iframeDoc.write(generateReceiptHTML());
      iframeDoc.close();

      await new Promise((resolve) => setTimeout(resolve, 200));

      const receiptElement = iframeDoc.querySelector(".receipt");
      if (!receiptElement) throw new Error("Receipt element not found");

      const canvas = await html2canvas(receiptElement as HTMLElement, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: false,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const links = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
          links.forEach((link) => link.remove());
        },
      });

      return canvas;
    } catch (error) {
      console.error("Failed to capture receipt:", error);
      return null;
    } finally {
      document.body.removeChild(iframe);
    }
  };

  const downloadAsPDF = async () => {
    setIsGenerating(true);
    try {
      const canvas = await captureReceipt();
      if (!canvas) throw new Error("Failed to capture receipt");

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`receipt-${transaction?.id.slice(0, 8)}.pdf`);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareReceipt = async () => {
    setIsGenerating(true);
    try {
      const canvas = await captureReceipt();
      if (!canvas) throw new Error("Failed to capture receipt");

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), "image/png");
      });

      const file = new File(
        [blob],
        `receipt-${transaction?.id.slice(0, 8)}.png`,
        {
          type: "image/png",
        },
      );

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Transaction Receipt",
          text: `Receipt for ${transactionTitle}`,
          files: [file],
        });
      } else {
        const link = document.createElement("a");
        link.download = `receipt-${transaction?.id.slice(0, 8)}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (error) {
      console.error("Failed to share receipt:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col container max-w-2xl mx-auto min-h-[90dvh] pb-32 md:pt-12">
        <div className="flex items-center justify-between mb-8 px-4 pt-4">
          <button className="p-2 bg-gray-100 dark:bg-secondary-60/50 rounded-full border border-slate-200 dark:border-none cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-white" />
          </button>
          <h2 className="text-lg font-bold text-black dark:text-white">
            Transaction
          </h2>
          <div className="w-9 h-9" />
        </div>
        <div className="mx-auto max-w-2xl px-4 space-y-4">
          <div className="h-32 animate-pulse rounded-xl bg-white dark:bg-secondary-40" />
          <div className="h-48 animate-pulse rounded-xl bg-white dark:bg-secondary-40" />
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex flex-col container max-w-2xl mx-auto min-h-[90dvh] pb-32 md:pt-12">
        <div className="flex items-center justify-between mb-8 px-4 pt-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-gray-100 dark:bg-secondary-60/50 rounded-full border border-slate-200 dark:border-none cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-white" />
          </button>
          <h2 className="text-lg font-bold text-black dark:text-white">
            Transaction
          </h2>
          <div className="w-9 h-9" />
        </div>
        <div className="mx-auto max-w-2xl px-4">
          <div className="rounded-xl bg-white p-6 text-center dark:bg-secondary-40">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {error ? "Failed to load transaction" : "Transaction not found"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isSuccess =
    transaction.status === "COMPLETED" || transaction.status === "PAID";

  return (
    <div className="flex flex-col container max-w-2xl mx-auto min-h-[90dvh] pb-32 md:pt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-4 pt-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-100 dark:bg-secondary-60/50 rounded-full border border-slate-200 dark:border-none cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-white" />
        </button>
        <h2 className="text-lg font-bold text-black dark:text-white">
          {transactionTitle}
        </h2>
        <div className="w-9 h-9" />
      </div>

      <div className="mx-auto max-w-2xl px-4">
        {/* Status Badge - Now matches the component styling */}
        <div className="mb-6 flex justify-center">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              isSuccess
                ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
            )}
          >
            {transaction.status.toLowerCase()}
          </span>
        </div>

        {/* Amount */}
        <div className="mb-8 text-center">
          <p className="text-4xl font-bold text-black dark:text-white">
            {amountLabel}
          </p>
        </div>

        {/* Details Card */}
        <div className="space-y-4 rounded-xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-secondary-50">
          <div className="flex justify-between border-b border-black/5 pb-3 dark:border-white/5">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Date
            </span>
            <span className="text-sm font-medium text-black dark:text-white">
              {formatDateTime(transaction.createdAt)}
            </span>
          </div>

          <div className="flex justify-between border-b border-black/5 pb-3 dark:border-white/5">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Asset
            </span>
            <span className="text-sm font-medium text-black dark:text-white">
              {symbol}
            </span>
          </div>

          <div className="flex justify-between border-b border-black/5 pb-3 dark:border-white/5">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Network
            </span>
            <span className="text-sm font-medium capitalize text-black dark:text-white">
              {transactionNetwork}
            </span>
          </div>

          {paidAmountLabel && (
            <div className="flex justify-between border-b border-black/5 pb-3 dark:border-white/5">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Amount
              </span>
              <span className="text-sm font-medium text-black dark:text-white">
                {paidAmountLabel}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Transaction ID
            </span>
            <div className="flex items-center gap-2">
              <span className="max-w-[180px] truncate text-right text-xs font-mono text-black dark:text-white md:max-w-[250px]">
                {transaction.id}
              </span>
              <button
                onClick={() => copyValue(transaction.id)}
                className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons - Only 2 buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={downloadAsPDF}
            disabled={isGenerating}
            className={cn(
              "group relative flex-1 overflow-hidden rounded-xl border border-black/5 bg-white py-3 transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-secondary-50 dark:hover:bg-secondary-60/50 active:scale-95 cursor-pointer font-bold",
            )}
          >
            <span className="relative z-10 flex items-center justify-center gap-2 text-sm md:text-base">
              Save as PDF
            </span>
          </button>

          <button
            onClick={shareReceipt}
            disabled={isGenerating}
            className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-primary-70 to-primary-60 py-3 font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-95 cursor-pointer"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 text-sm md:text-base">
              Share
            </span>

            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </button>
        </div>
      </div>
    </div>
  );
}
