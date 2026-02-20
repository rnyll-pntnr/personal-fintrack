'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getExpenses, addExpense, updateExpense, deleteExpense, getTotalSpending } from '@/actions/expenses'
import { ExpenseInsert, ExpenseUpdate, TimeGrain } from '@/types/database'
import { getDateRangeForGrain, getPreviousPeriodRange } from '@/lib/date-utils'

// Query keys
export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...expenseKeys.lists(), filters] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  stats: () => [...expenseKeys.all, 'stats'] as const,
  total: (startDate: string, endDate: string) => [...expenseKeys.stats(), 'total', startDate, endDate] as const,
}

/**
 * Hook to fetch expenses with optional filters
 */
export function useExpenses(options?: {
  startDate?: string
  endDate?: string
  categoryId?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: expenseKeys.list(options || {}),
    queryFn: () => getExpenses(options),
  })
}

/**
 * Hook to fetch total spending for a date range
 */
export function useTotalSpending(startDate: string, endDate: string) {
  return useQuery({
    queryKey: expenseKeys.total(startDate, endDate),
    queryFn: () => getTotalSpending(startDate, endDate),
    select: (data) => data.data,
  })
}

/**
 * Hook to get spending stats for dashboard
 */
export function useSpendingStats(grain: TimeGrain = 'month') {
  const { start: currentStart, end: currentEnd } = getDateRangeForGrain(grain)
  const { start: prevStart, end: prevEnd } = getPreviousPeriodRange(grain)

  const currentSpending = useTotalSpending(currentStart.toISOString(), currentEnd.toISOString())
  const previousSpending = useTotalSpending(prevStart.toISOString(), prevEnd.toISOString())

  const currentTotal = currentSpending.data || 0
  const previousTotal = previousSpending.data || 0

  // Calculate trend percentage
  const trend = previousTotal > 0 
    ? ((currentTotal - previousTotal) / previousTotal) * 100 
    : 0

  return {
    currentTotal,
    previousTotal,
    trend,
    isLoading: currentSpending.isLoading || previousSpending.isLoading,
  }
}

/**
 * Hook to add a new expense
 */
export function useAddExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (expense: Omit<ExpenseInsert, 'user_id'>) => addExpense(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all })
    },
  })
}

/**
 * Hook to update an expense
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ExpenseUpdate }) =>
      updateExpense(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all })
    },
  })
}

/**
 * Hook to delete an expense
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all })
    },
  })
}
