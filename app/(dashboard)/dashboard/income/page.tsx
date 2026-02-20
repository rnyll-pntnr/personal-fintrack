'use client'

import * as React from 'react'
import { IncomeList } from '@/components/income/income-list'
import { IncomeFormDialog } from '@/components/income/income-form-dialog'
import { IncomeWithCategory } from '@/types/database'

export default function IncomePage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editItem, setEditItem] = React.useState<IncomeWithCategory | null>(null)

  const handleAddNew = () => {
    setEditItem(null)
    setDialogOpen(true)
  }

  const handleEdit = (item: IncomeWithCategory) => {
    setEditItem(item)
    setDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditItem(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Income</h2>
          <p className="text-muted-foreground">
            View and manage your income history
          </p>
        </div>
      </div>
      <IncomeList
        onAddNew={handleAddNew}
        onEdit={handleEdit}
      />
      
      <IncomeFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        editIncome={editItem}
      />
    </div>
  )
}
