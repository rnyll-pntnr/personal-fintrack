'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAddExpense, useUpdateExpense } from '@/hooks/use-expenses'
import { useCategories } from '@/hooks/use-categories'
import { expenseFormSchema } from '@/lib/validations'
import { z } from 'zod'
import { formatDateForInput } from '@/lib/date-utils'
import { ExpenseWithCategory } from '@/types/database'

interface ExpenseFormDialogProps {
  editExpense?: ExpenseWithCategory | null
  onOpenChange: (open: boolean) => void
  open: boolean
}

export function ExpenseFormDialog({ editExpense, onOpenChange, open }: ExpenseFormDialogProps) {
  const { data: categories } = useCategories('expense')
  const addExpense = useAddExpense()
  const updateExpense = useUpdateExpense()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: '',
      description: '',
      category_id: '',
      date: formatDateForInput(new Date()),
    },
  })

  // Reset form when dialog opens with edit data
  React.useEffect(() => {
    if (editExpense) {
      reset({
        amount: editExpense.amount.toString(),
        description: editExpense.description || '',
        category_id: editExpense.category_id || '',
        date: formatDateForInput(new Date(editExpense.date)),
      })
    } else {
      reset({
        amount: '',
        description: '',
        category_id: '',
        date: formatDateForInput(new Date()),
      })
    }
  }, [editExpense, reset])

  const onSubmit = async (data: z.infer<typeof expenseFormSchema>) => {
    try {
      const expenseData = {
        ...data,
        category_id: data.category_id || null,
      }

      if (editExpense) {
        await updateExpense.mutateAsync({
          id: editExpense.id,
          updates: expenseData,
        })
      } else {
        await addExpense.mutateAsync(expenseData)
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save expense:', error)
    }
  }

  const isLoading = addExpense.isPending || updateExpense.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editExpense ? 'Edit Expense' : 'Add Expense'}
          </DialogTitle>
          <DialogDescription>
            {editExpense ? 'Update expense details' : 'Add a new expense'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
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
              <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What did you spend on?"
              {...register('description')}
              disabled={isLoading}
              rows={2}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              onValueChange={(value) => setValue('category_id', value)}
              defaultValue={editExpense?.category_id || ''}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map(category => (
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
              <p className="text-sm text-destructive mt-1">{errors.category_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
              disabled={isLoading}
            />
            {errors.date && (
              <p className="text-sm text-destructive mt-1">{errors.date.message}</p>
            )}
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
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}