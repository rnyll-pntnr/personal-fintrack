'use client'

import * as React from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { RecurringCard } from '@/components/recurring/recurring-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePendingRecurringItems, useMarkRecurringAsPaid, useDeleteRecurringItem } from '@/hooks/use-recurring'
import { useProfile } from '@/hooks/use-user'
import { RecurringItemWithCategory } from '@/types/database'

interface RecurringChecklistProps {
  onAddNew: () => void
  onEdit: (item: RecurringItemWithCategory) => void
}

export function RecurringChecklist({ onAddNew, onEdit }: RecurringChecklistProps) {
  const { data: profile } = useProfile()
  const { data: pendingItems, isLoading } = usePendingRecurringItems()
  const markAsPaid = useMarkRecurringAsPaid()
  const deleteItem = useDeleteRecurringItem()

  const currency = profile?.currency || 'AED'
  const [processingId, setProcessingId] = React.useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<string | null>(null)

  const handleMarkAsPaid = async (id: string) => {
    setProcessingId(id)
    try {
      await markAsPaid.mutateAsync(id)
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteItem.mutateAsync(id)
    setDeleteDialogOpen(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Smart Recurring Checklist</h2>
            <p className="text-sm text-muted-foreground">
              Bills and payments due this month
            </p>
          </div>
          <Button onClick={onAddNew} className="gap-1">
            <Plus className="h-4 w-4" />
            Add Recurring
          </Button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 sm:mx-0 px-1 sm:px-0 scrollbar-hide snap-x snap-mandatory">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64 snap-start">
              <Skeleton className="h-40 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Smart Recurring Checklist</h2>
          <p className="text-sm text-muted-foreground">
            Bills and payments due this month
          </p>
        </div>
        <Button onClick={onAddNew} className="gap-1">
          <Plus className="h-4 w-4" />
          Add Recurring
        </Button>
      </div>

      {/* Horizontal Slider */}
      {pendingItems && pendingItems.length > 0 ? (
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 sm:mx-0 px-1 sm:px-0 scrollbar-hide snap-x snap-mandatory">
            {pendingItems.map((item) => (
              <div key={item.id} className="flex-shrink-0 w-64 snap-start">
                <RecurringCard
                  key={item.id}
                  item={item}
                  isPending={true}
                  onMarkAsPaid={handleMarkAsPaid}
                  onEdit={onEdit}
                  onDelete={() => setDeleteDialogOpen(item.id)}
                  isProcessing={processingId === item.id}
                  currency={currency}
                />
              </div>
            ))}
          </div>
          
          {/* Gradient overlays for visual effect */}
          <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none hidden sm:block" />
          <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none hidden sm:block" />
          
          {/* Scroll indicators */}
          {(pendingItems.length > 3) && (
            <div className="text-center text-xs text-muted-foreground mt-2">
              Swipe left or right to view all items
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No pending recurring items</h3>
          <p className="text-sm text-muted-foreground mb-4">
            All your recurring bills have been paid this month
          </p>
          <Button onClick={onAddNew} variant="outline">
            Add your first recurring item
          </Button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Delete recurring item?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone. The item will be permanently deleted.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteDialogOpen)}
                disabled={deleteItem.isPending}
              >
                {deleteItem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
