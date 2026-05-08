"use client"

import { FC } from "react"
import Image from "next/image"

const AuthHero: FC = () => {
  return (
    <div className="relative hidden lg:flex w-1/2 overflow-hidden border-r border-white/10 bg-gradient-to-br from-primary-50 via-primary-0 to-secondary-50 p-20 text-white">
      {/* Ambient Glow */}
      <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-pink-400/20 blur-3xl" />

      <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-white/10 blur-3xl" />

      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')]" />

      {/* GLOBAL DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/20 z-[1]" />

      {/* TEXT FOCUS OVERLAY */}
      <div className="absolute inset-y-0 left-0 w-[60%] bg-gradient-to-r from-black/55 via-black/25 to-transparent z-[2]" />

      {/* BOTTOM FADE */}
      <div className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-black/30 to-transparent z-[2]" />

      {/* CONTENT */}
      <div className="relative z-30 flex h-full flex-col">
        {/* HERO */}
        <div className="max-w-[420px] space-y-8 animate-in fade-in slide-in-from-top-6 duration-700">
          <h1 className="text-6xl font-bold leading-[1] tracking-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)]">
            Your money. <br />
            <span className="font-extrabold text-pink-300">One app.</span>
          </h1>

          <p className="max-w-[360px] text-[17px] leading-relaxed text-white/80 drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
            Send money, manage assets, and invest globally with a secure modern
            finance app.
          </p>
        </div>

        {/* BOTTOM TEXT */}
        <div className="mt-auto z-30">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/55">
            Secure • Simple • Global
          </p>
        </div>
      </div>

      {/* DEVICE MOCKUP */}
      <div className="absolute right-[-16%] bottom-[-10%] z-10 h-[88%] w-[110%] animate-in fade-in slide-in-from-right-12 duration-1000 delay-30 ">
        <Image
          src="https://res.cloudinary.com/djd1gxvwm/image/upload/v1778092378/Mockuuups_Free_mockup_of_female_hand_holding_iPhone_14_Pro_qjbyhg.png"
          alt="Kellon App"
          fill
          priority
          className="object-contain object-right-bottom drop-shadow-[0_40px_55px_rgba(0,0,0,0.38)] "
        />
      </div>

      {/* FULL SECTION IMAGE OVERLAY */}
      <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/45 via-black/15 to-black/35 pointer-events-none" />
    </div>
  )
}

export default AuthHero
