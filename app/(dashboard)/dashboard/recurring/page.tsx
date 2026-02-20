'use client'

import * as React from 'react'
import { RecurringGrid } from '@/components/recurring/recurring-grid'
import { RecurringFormDialog } from '@/components/recurring/recurring-form-dialog'
import { RecurringItemWithCategory } from '@/types/database'

export default function RecurringPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editItem, setEditItem] = React.useState<RecurringItemWithCategory | null>(null)

  const handleAddNew = () => {
    setEditItem(null)
    setDialogOpen(true)
  }

  const handleEdit = (item: RecurringItemWithCategory) => {
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
      <RecurringGrid onAddNew={handleAddNew} onEdit={handleEdit} />
      
      <RecurringFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        editItem={editItem}
      />
    </div>
  )
}