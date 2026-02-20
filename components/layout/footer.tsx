'use client'

import * as React from 'react'
import { CreditCard } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-4 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          <span>© {new Date().getFullYear()} Expense Tracking made by Ranyll Puntanar. All rights reserved.</span>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="hidden sm:inline">Version 1.0.0</span>
        </div>
      </div>
    </footer>
  )
}