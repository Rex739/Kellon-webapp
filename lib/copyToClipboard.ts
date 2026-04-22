import { toast } from "sonner"

/**
 * Copies text to clipboard and triggers a global toast notification.
 * @param text The string to be copied
 * @param message Optional custom success message
 */
export async function copyToClipboard(
  text: string,
  message: string = "Copied to clipboard",
) {
  try {
    await navigator.clipboard.writeText(text)

    toast.success(message, {
      id: "global-copy-toast", // Prevents toast stacking if clicked multiple times
      duration: 2000,
      icon: "📋",
    })

    return true
  } catch (err) {
    console.error("Failed to copy:", err)
    toast.error("Failed to copy to clipboard")
    return false
  }
}
