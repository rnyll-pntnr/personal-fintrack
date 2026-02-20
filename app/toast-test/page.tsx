'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast-context'

export default function ToastTestPage() {
  const { toastSuccess, toastError, toastWarning, toastInfo } = useToast()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Toast Notification Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <Button onClick={() => toastSuccess('Success!', 'Your operation was completed successfully')}>
          Show Success Toast
        </Button>
        
        <Button onClick={() => toastError('Error!', 'Something went wrong. Please try again.')} variant="destructive">
          Show Error Toast
        </Button>
        
        <Button onClick={() => toastWarning('Warning!', 'This action cannot be undone.')} variant="secondary">
          Show Warning Toast
        </Button>
        
        <Button onClick={() => toastInfo('Information', 'Please review the details before proceeding.')} variant="outline">
          Show Info Toast
        </Button>
      </div>
    </div>
  )
}
