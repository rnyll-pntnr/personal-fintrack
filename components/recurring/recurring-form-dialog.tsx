'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategories } from '@/hooks/use-categories'
import { useAddRecurringItem, useUpdateRecurringItem } from '@/hooks/use-recurring'
import { recurringItemSchema } from '@/lib/validations'
import { RECURRING_FREQUENCIES } from '@/lib/constants'
import { RecurringItemWithCategory } from '@/types/database'
import { formatDateForInput } from '@/lib/date-utils'
import { z } from 'zod'

// Form schema with string amount for input handling
const formSchema = recurringItemSchema.extend({
  amount: z.union([z.number(), z.string()]).transform((val) => {
    if (typeof val === 'string') {
      const parsed = parseFloat(val)
      return isNaN(parsed) ? 0 : parsed
    }
    return val
  }),
})

type FormData = z.infer<typeof formSchema>

interface RecurringFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editItem?: RecurringItemWithCategory | null
}

export function RecurringFormDialog({
  open,
  onOpenChange,
  editItem,
}: RecurringFormDialogProps) {
  const { data: categories } = useCategories('expense')
  const addMutation = useAddRecurringItem()
  const updateMutation = useUpdateRecurringItem()

  const isEditing = !!editItem

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      amount: 0,
      category_id: '',
      frequency: 'monthly',
      next_due_at: formatDateForInput(new Date()),
    },
  })

  // Reset form when dialog opens with edit data
  React.useEffect(() => {
    if (open) {
      if (editItem) {
        reset({
          name: editItem.name,
          amount: editItem.amount,
          category_id: editItem.category_id || '',
          frequency: editItem.frequency,
          next_due_at: formatDateForInput(editItem.next_due_at),
        })
      } else {
        reset({
          name: '',
          amount: 0,
          category_id: '',
          frequency: 'monthly',
          next_due_at: formatDateForInput(new Date()),
        })
      }
    }
  }, [open, editItem, reset])

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && editItem) {
        await updateMutation.mutateAsync({
          id: editItem.id,
          updates: {
            name: data.name,
            amount: data.amount,
            category_id: data.category_id || null,
            frequency: data.frequency,
            next_due_at: data.next_due_at,
          },
        })
      } else {
        await addMutation.mutateAsync({
          name: data.name,
          amount: data.amount,
          category_id: data.category_id || null,
          frequency: data.frequency,
          next_due_at: data.next_due_at,
        })
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save recurring item:', error)
    }
  }

  const isLoading = addMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Recurring Item' : 'Add Recurring Item'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of your recurring item.'
              : 'Add a new recurring bill or subscription to track.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Netflix Subscription"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Amount */}
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount')}
                disabled={isLoading}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                onValueChange={(value) => setValue('category_id', value)}
                defaultValue={editItem?.category_id || ''}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-destructive">{errors.category_id.message}</p>
              )}
            </div>

            {/* Frequency */}
            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                onValueChange={(value) =>
                  setValue('frequency', value as 'weekly' | 'monthly' | 'yearly')
                }
                defaultValue={editItem?.frequency || 'monthly'}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {RECURRING_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      <div>
                        <span className="font-medium">{freq.label}</span>
                        <span className="text-muted-foreground ml-2">
                          {freq.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.frequency && (
                <p className="text-sm text-destructive">{errors.frequency.message}</p>
              )}
            </div>

            {/* Next Due Date */}
            <div className="grid gap-2">
              <Label htmlFor="next_due_at">Next Due Date</Label>
              <Input
                id="next_due_at"
                type="date"
                {...register('next_due_at')}
                disabled={isLoading}
              />
              {errors.next_due_at && (
                <p className="text-sm text-destructive">{errors.next_due_at.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}