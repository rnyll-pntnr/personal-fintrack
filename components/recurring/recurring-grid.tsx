"use client";

import * as React from "react";
import { Plus, Loader2 } from "lucide-react";
import { RecurringCard } from "./recurring-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useRecurringItems,
  useMarkRecurringAsPaid,
  useDeleteRecurringItem,
} from "@/hooks/use-recurring";
import { useProfile } from "@/hooks/use-user";
import { RecurringItemWithCategory } from "@/types/database";

interface RecurringGridProps {
  onAddNew: () => void;
  onEdit: (item: RecurringItemWithCategory) => void;
}

// Helper function to determine if a recurring item is pending
const isItemPending = (item: RecurringItemWithCategory): boolean => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  if (!item.last_processed_date) return true;
  return item.last_processed_date.slice(0, 7) !== currentMonth;
};

export function RecurringGrid({ onAddNew, onEdit }: RecurringGridProps) {
  const { data: profile } = useProfile();
  const { data: items, isLoading } = useRecurringItems();
  const markAsPaid = useMarkRecurringAsPaid();
  const deleteItem = useDeleteRecurringItem();

  const currency = profile?.currency || "AED";
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<string | null>(
    null,
  );

  const handleMarkAsPaid = async (id: string) => {
    setProcessingId(id);
    try {
      await markAsPaid.mutateAsync(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteItem.mutateAsync(id);
    setDeleteDialogOpen(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Header with Add button */}
        <div className="flex items-center justify-start">
          <div>
            <h2 className="text-lg font-semibold">Recurring Items</h2>
            <p className="text-sm text-muted-foreground">
              All your recurring bills and payments
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Recurring Items</h2>
          <p className="text-sm text-muted-foreground">
            All your recurring bills and payments
          </p>
        </div>
        <Button onClick={onAddNew} className="gap-1">
          <Plus className="h-4 w-4" />
          Add Recurring
        </Button>
      </div>

      {/* Grid */}
      {items && items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item) => (
            <RecurringCard
              key={item.id}
              item={item}
              isPending={isItemPending(item)}
              onMarkAsPaid={handleMarkAsPaid}
              onEdit={onEdit}
              onDelete={() => setDeleteDialogOpen(item.id)}
              isProcessing={processingId === item.id}
              currency={currency}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No recurring items</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start by adding your first recurring bill or payment
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
            <h3 className="text-lg font-semibold mb-2">
              Delete recurring item?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone. The item will be permanently
              deleted.
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
                {deleteItem.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
