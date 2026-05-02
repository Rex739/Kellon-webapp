"use client"

import { Delete } from "lucide-react"

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "delete"]

interface KeypadProps {
  onPress: (val: string) => void
}

export default function Keypad({ onPress }: KeypadProps) {
  return (
    <div className="w-full grid grid-cols-3 gap-2">
      {KEYS.map((key) => (
        <button
          key={key}
          onClick={() => onPress(key)}
          className="h-14 flex items-center justify-center rounded-2xl
            bg-gray-50 dark:bg-secondary-60/40
            hover:bg-gray-100 dark:hover:bg-secondary-60/60
            transition-colors text-xl font-bold
            active:scale-95 select-none"
        >
          {key === "delete" ? (
            <Delete className="w-6 h-6 text-gray-500" />
          ) : (
            key
          )}
        </button>
      ))}
    </div>
  )
}