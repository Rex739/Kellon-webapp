"use client"

import { FC, useEffect, useRef, useState } from "react"
import {
  usePrivy,
  useLoginWithOAuth,
  useIdentityToken,
} from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { Chrome, Loader2 } from "lucide-react" // Added Loader2
import { loginWithPrivy } from "@/lib/api/auth"

interface ContinueProps {
  onSuccessRedirect?: string
}

const Continue: FC<ContinueProps> = ({ onSuccessRedirect = "/" }) => {
  const [isSyncing, setIsSyncing] = useState(false)
  const hasSynced = useRef(false) // 👈 Prevents double-syncing

  const { authenticated, ready } = usePrivy()
  const { initOAuth, loading: oauthLoading } = useLoginWithOAuth()
  const { identityToken } = useIdentityToken()

  useEffect(() => {
    const syncUser = async () => {
      // If session_token already exists, just redirect

      if (!identityToken || hasSynced.current) return

      hasSynced.current = true
      setIsSyncing(true)

      try {
        await loginWithPrivy(identityToken)
        // Give the cookie time to be set
        await new Promise((resolve) => setTimeout(resolve, 100))
        window.location.href = onSuccessRedirect
      } catch (err) {
        console.error("Auth sync failed:", err)
        setIsSyncing(false)
        hasSynced.current = false
      }
    }

    if (ready && authenticated && identityToken) {
      syncUser()
    }
  }, [ready, authenticated, identityToken, onSuccessRedirect])
  const handleGoogleLogin = async () => {
    try {
      await initOAuth({ provider: "google" })
    } catch (err) {
      console.error("Google login failed:", err)
    }
  }

  // Busy if Privy isn't ready, OAuth is redirecting, OR we are currently syncing with our backend
  const isBusy = !ready || oauthLoading || isSyncing

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8 h-screen bg-white">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome
        </h1>
        <p className="text-gray-500 text-sm max-w-[240px] mx-auto">
          {isSyncing
            ? "Securing your session..."
            : "Continue with Google to access your Kellon account."}
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center">
        <Button
          onClick={handleGoogleLogin}
          disabled={isBusy}
          className="w-full flex items-center justify-center gap-3 h-14 text-base font-semibold transition-all hover:scale-[1.01] rounded-2xl border-2 border-gray-100"
          variant="outline"
        >
          {isSyncing || oauthLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-[#a31d7e]" />
          ) : (
            <Chrome className="h-5 w-5 text-[#a31d7e]" />
          )}

          <span>
            {isSyncing
              ? "Syncing Account..."
              : oauthLoading
                ? "Redirecting..."
                : "Continue with Google"}
          </span>
        </Button>

        {!ready && !isSyncing && (
          <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest mt-6 animate-pulse">
            Initializing Secure Vault...
          </p>
        )}
      </div>

      <p className="text-[11px] text-center text-gray-400 max-w-[250px] leading-relaxed">
        By continuing, you agree to our{" "}
        <span className="underline cursor-pointer">Terms</span> and{" "}
        <span className="underline cursor-pointer">Privacy Policy</span>.
      </p>
    </div>
  )
}

export default Continue
