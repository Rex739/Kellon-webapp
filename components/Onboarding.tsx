"use client"

import { useState } from "react"
import { Globe, Mail, FileCheck, ArrowRight } from "lucide-react"
import { Icons } from "./Icons"
import { Button } from "./ui/button"

const SLIDES = [
  {
    title: "Finance Without Borders",
    desc: "Experience a financial system as global as you are. Manage and move USDC & USDT with instant settlements.",
    icon: <Globe className="w-12 h-12 text-white" />, // Changed to white for the magenta background
  },
  {
    title: "Send to Any Email",
    desc: "The end of wallet-address anxiety. Send funds to any email instantly—we'll secure it in a magic wallet.",
    icon: <Mail className="w-12 h-12 text-white" />,
  },
  {
    title: "Global Payouts, Simplified",
    desc: "Get paid like a local, anywhere on Earth. Issue smart invoices and receive instant settlements.",
    icon: <FileCheck className="w-12 h-12 text-white" />,
  },
]

interface WebOnboardingProps {
  onComplete: () => void
}

export default function WebOnboarding({ onComplete }: WebOnboardingProps) {
  const [current, setCurrent] = useState(0)

  const handleNext = () => {
    if (current === SLIDES.length - 1) {
      onComplete()
    } else {
      setCurrent((prev) => prev + 1)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      {/* Container Card */}
      <div className="w-full max-w-3xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Left Side: Brand Identity Area */}
        <div className="md:w-2/5 bg-[#a31d7e] p-12 flex flex-col items-center justify-center text-center space-y-6 transition-colors duration-500">
          <div className="relative">
            {/* Ambient pulse effect behind the icon */}
            <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full animate-pulse" />

            <div className="relative bg-white/10 p-8 rounded-[32px] backdrop-blur-md border border-white/20 shadow-inner">
              {/* Dynamic Icon Rendering */}
              <div
                key={current}
                className="animate-in fade-in zoom-in duration-500"
              >
                {SLIDES[current].icon}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Icons.Logo className="w-10 h-10 mx-auto bg-white/20 p-2 rounded-md" />
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Kellon
            </h2>
          </div>
        </div>

        {/* Right Side: Content & Navigation */}
        <div className="md:w-3/5 p-10 md:p-14 flex flex-col justify-between bg-white">
          <div className="space-y-8">
            {/* Progress Indicators */}
            <div className="flex gap-2">
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? "w-10 bg-[#a31d7e]" : "w-4 bg-gray-100"
                  }`}
                />
              ))}
            </div>

            {/* Text Content with simple transition key */}
            <div
              key={current}
              className="animate-in slide-in-from-right-4 fade-in duration-500"
            >
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                {SLIDES[current].title}
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed">
                {SLIDES[current].desc}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-12">
            <Button
              size="full"
              onClick={handleNext}
              className="bg-[#a31d7e] hover:bg-[#861668] text-white text-lg h-14 rounded-2xl shadow-lg shadow-magenta-900/10 transition-all active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                {current === SLIDES.length - 1 ? "Get Started" : "Continue"}
                <ArrowRight
                  className={`w-5 h-5 transition-transform ${current !== SLIDES.length - 1 ? "group-hover:translate-x-1" : ""}`}
                />
              </span>
            </Button>

            <button
              onClick={onComplete}
              className="text-gray-400 font-semibold text-sm py-2 hover:text-[#a31d7e] transition-colors flex items-center justify-center gap-1"
            >
              Skip exploration
            </button>
          </div>
        </div>
      </div>

      {/* Visual Footer */}
      <p className="mt-8 text-gray-400 text-xs font-medium uppercase tracking-widest">
        Secure • Non-Custodial • Global
      </p>
    </div>
  )
}
