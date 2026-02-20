'use client'

import * as React from 'react'
import { createContext, useContext, useState, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
    
    if (toast.duration !== 0) {
      const duration = toast.duration || 5000
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const { accent } = useThemeAccent()
  const [isVisible, setIsVisible] = useState(true)

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => {
      onRemove(toast.id)
    }, 300)
  }

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-emerald-500',
          text: 'text-emerald-50',
          border: 'border-emerald-600',
        }
      case 'error':
        return {
          bg: 'bg-rose-500',
          text: 'text-rose-50',
          border: 'border-rose-600',
        }
      case 'warning':
        return {
          bg: 'bg-amber-500',
          text: 'text-amber-50',
          border: 'border-amber-600',
        }
      case 'info':
        return {
          bg: getAccentColor(accent),
          text: 'text-white',
          border: getAccentColor(accent, true),
        }
    }
  }

  const getAccentColor = (accent: string, isBorder = false) => {
    const colors = {
      blue: isBorder ? 'border-blue-600' : 'bg-blue-500',
      emerald: isBorder ? 'border-emerald-600' : 'bg-emerald-500',
      violet: isBorder ? 'border-violet-600' : 'bg-violet-500',
      rose: isBorder ? 'border-rose-600' : 'bg-rose-500',
    }
    return colors[accent as keyof typeof colors] || colors.blue
  }

  const styles = getToastStyles()

  return (
    <div
      className={`min-w-[320px] max-w-[400px] rounded-lg border p-4 shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      } ${styles.bg} ${styles.text} ${styles.border}`}
      role="alert"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        <button
          onClick={handleRemove}
          className="rounded-md p-1 hover:bg-black/10 transition-colors"
          aria-label="Close toast"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Import required hook
import { useThemeAccent } from './theme-context'
