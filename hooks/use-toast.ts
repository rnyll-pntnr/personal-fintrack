'use client'

import { useToast } from '@/context/toast-context'
import { ToastType } from '@/context/toast-context'

export function useToastMessage() {
  const { addToast } = useToast()

  const showToast = (type: ToastType, message: string, duration?: number) => {
    addToast({
      type,
      message,
      duration,
    })
  }

  const showSuccess = (message: string, duration?: number) => {
    showToast('success', message, duration)
  }

  const showError = (message: string, duration?: number) => {
    showToast('error', message, duration)
  }

  const showWarning = (message: string, duration?: number) => {
    showToast('warning', message, duration)
  }

  const showInfo = (message: string, duration?: number) => {
    showToast('info', message, duration)
  }

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}
