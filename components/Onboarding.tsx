"use client"
import { useState } from "react"
import { Globe, Mail, FileCheck, ArrowRight } from "lucide-react"
import { Icons } from "./Icons"
import { Button } from "./ui/button"

const SLIDES = [
  {
    title: "Finance Without Borders",
    desc: "Experience a financial system as global as you are. Manage and move USDC & USDT with instant settlements.",
    icon: <Globe className="w-12 h-12 text-[#a31d7e]" />,
  },
  {
    title: "Send to Any Email",
    desc: "The end of wallet-address anxiety. Send funds to any email instantly—we'll secure it in a magic wallet.",
    icon: <Mail className="w-12 h-12 text-[#a31d7e]" />,
  },
  {
    title: "Global Payouts, Simplified",
    desc: "Get paid like a local, anywhere on Earth. Issue smart invoices and receive instant settlements.",
    icon: <FileCheck className="w-12 h-12 text-[#a31d7e]" />,
  },
]

interface WebOnboardingProps {
  onComplete: () => void
}

export default function WebOnboarding({ onComplete }: WebOnboardingProps) {
  const [current, setCurrent] = useState(0)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      {/* Container Card */}
      <div className="w-full max-w-2xl bg-white rounded-[32px] shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Visual/Icon (Magenta Brand Area) */}
        <div className="md:w-1/3 bg-[#a31d7e] p-12 flex flex-col items-center justify-center space-y-2">
          <div className="bg-white/20 p-6 rounded-3xl backdrop-blur-sm text-white ye">
            {SLIDES[current].icon && (
              <div className="text-white">{/* Icon logic */}</div>
            )}
            <Icons.Logo />
          </div>
          <h1 className="text-3xl font-bold">Kellon</h1>
        </div>

        {/* Right Side: Content */}
        <div className="md:w-2/3 p-12 flex flex-col justify-between">
          <div>
            <div className="flex gap-1.5 mb-8">
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${i === current ? "w-8 bg-[#a31d7e]" : "w-4 bg-gray-200"}`}
                />
              ))}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {SLIDES[current].title}
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              {SLIDES[current].desc}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              size={"full"}
              onClick={() =>
                current === SLIDES.length - 1
                  ? onComplete()
                  : setCurrent(current + 1)
              }
              className="text-white text-lg font-medium cursor-pointer"
            >
              {current === SLIDES.length - 1 ? "Get Started" : "Next"}
              <ArrowRight size={20} />
            </Button>
            <button
              onClick={onComplete}
              className="text-gray-400 font-medium hover:text-gray-600 transition-colors cursor-pointer"
            >
              Skip intro
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
