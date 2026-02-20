"use client"

import * as React from "react"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider as RadixToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import type { ToastProps } from "@/components/ui/toast"

interface ToastContextValue {
  toast: (props: ToastProps) => void
  toastSuccess: (title: string, description?: string) => void
  toastError: (title: string, description?: string) => void
  toastWarning: (title: string, description?: string) => void
  toastInfo: (title: string, description?: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>([])

  const toast = React.useCallback((props: ToastProps) => {
    setToasts((prev) => [...prev, { ...props, id: Math.random().toString(36).substring(2, 9) }])
  }, [])

  const toastSuccess = React.useCallback((title: string, description?: string) => {
    toast({
      variant: "success",
      title,
      description,
    })
  }, [toast])

  const toastError = React.useCallback((title: string, description?: string) => {
    toast({
      variant: "destructive",
      title,
      description,
    })
  }, [toast])

  const toastWarning = React.useCallback((title: string, description?: string) => {
    toast({
      variant: "warning",
      title,
      description,
    })
  }, [toast])

  const toastInfo = React.useCallback((title: string, description?: string) => {
    toast({
      variant: "info",
      title,
      description,
    })
  }, [toast])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const handleOpenChange = React.useCallback(
    (open: boolean, id: string) => {
      if (!open) {
        removeToast(id)
      }
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toast, toastSuccess, toastError, toastWarning, toastInfo }}>
      <RadixToastProvider>
        {toasts.map((toastItem) => (
          <Toast
            key={toastItem.id}
            variant={toastItem.variant}
            open={true}
            onOpenChange={(open) => handleOpenChange(open, toastItem.id!)}
          >
            <div className="grid gap-1">
              {toastItem.title && <ToastTitle>{toastItem.title}</ToastTitle>}
              {toastItem.description && (
                <ToastDescription>{toastItem.description}</ToastDescription>
              )}
            </div>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
        {children}
      </RadixToastProvider>
    </ToastContext.Provider>
  )
}
