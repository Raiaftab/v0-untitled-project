"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const notificationVariants = cva(
  "fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md p-4 shadow-md transition-all duration-300 transform",
  {
    variants: {
      variant: {
        default: "bg-white text-gray-800 border-l-4 border-gray-300",
        success: "bg-white text-gray-800 border-l-4 border-green-500",
        error: "bg-white text-gray-800 border-l-4 border-red-500",
        warning: "bg-white text-gray-800 border-l-4 border-yellow-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface NotificationProps extends VariantProps<typeof notificationVariants> {
  message: string
  duration?: number
  onClose?: () => void
  show: boolean
}

export function Notification({ message, variant, duration = 3000, onClose, show }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(show)

  useEffect(() => {
    setIsVisible(show)

    if (show) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        if (onClose) onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        notificationVariants({ variant }),
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
      )}
    >
      <span>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false)
          if (onClose) onClose()
        }}
        className="ml-2 text-gray-500 hover:text-gray-700"
      >
        <X size={16} />
      </button>
    </div>
  )
}
