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
import { useAddIncome, useUpdateIncome } from '@/hooks/use-income'
import { useCategories } from '@/hooks/use-categories'
import { incomeFormSchema } from '@/lib/validations'
import { z } from 'zod'
import { formatDateForInput } from '@/lib/date-utils'
import { IncomeWithCategory } from '@/types/database'
import { useToast } from '@/hooks/use-toast-context'

interface IncomeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editIncome?: IncomeWithCategory | null
}

export function IncomeFormDialog({
  open,
  onOpenChange,
  editIncome,
}: IncomeFormDialogProps) {
  const { data: categories } = useCategories('income')
  const addIncome = useAddIncome()
  const updateIncome = useUpdateIncome()
  const { toastSuccess, toastError } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      amount: '',
      description: '',
      category_id: '',
      date: formatDateForInput(new Date()),
    },
  })

  // Reset form when dialog opens with edit data
  React.useEffect(() => {
    if (editIncome) {
      reset({
        amount: editIncome.amount.toString(),
        description: editIncome.description || '',
        category_id: editIncome.category_id || '',
        date: formatDateForInput(new Date(editIncome.date)),
      })
    } else {
      reset({
        amount: '',
        description: '',
        category_id: '',
        date: formatDateForInput(new Date()),
      })
    }
  }, [editIncome, reset])

  const onSubmit = async (data: z.infer<typeof incomeFormSchema>) => {
    try {
      const incomeData = {
        ...data,
        category_id: data.category_id || null,
      }

      if (editIncome) {
        await updateIncome.mutateAsync({
          id: editIncome.id,
          updates: incomeData,
        })
        toastSuccess('Income updated successfully')
      } else {
        await addIncome.mutateAsync(incomeData)
        toastSuccess('Income added successfully')
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save income:', error)
      toastError('Failed to save income. Please try again.')
    }
  }

  const isLoading = addIncome.isPending || updateIncome.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editIncome ? 'Edit Income' : 'Add Income'}
          </DialogTitle>
          <DialogDescription>
            {editIncome ? 'Update income details' : 'Add a new income source'}
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
              placeholder="What is this income from?"
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
              defaultValue={editIncome?.category_id || ''}
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
