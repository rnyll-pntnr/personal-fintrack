'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getIncomes, getIncome, addIncome, updateIncome, deleteIncome, getTotalIncome } from '@/actions/income'
import { IncomeInsert, IncomeUpdate, TimeGrain } from '@/types/database'
import { getDateRangeForGrain, getPreviousPeriodRange } from '@/lib/date-utils'

// Query keys
export const incomeKeys = {
  all: ['income'] as const,
  lists: () => [...incomeKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...incomeKeys.lists(), filters] as const,
  details: () => [...incomeKeys.all, 'detail'] as const,
  detail: (id: string) => [...incomeKeys.details(), id] as const,
  stats: () => [...incomeKeys.all, 'stats'] as const,
  total: (startDate: string, endDate: string) => [...incomeKeys.stats(), 'total', startDate, endDate] as const,
}

/**
 * Hook to fetch income records with optional filters
 */
export function useIncomes(options?: {
  startDate?: string
  endDate?: string
  categoryId?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: incomeKeys.list(options || {}),
    queryFn: () => getIncomes(options),
  })
}

/**
 * Hook to fetch a single income record
 */
export function useIncome(id: string) {
  return useQuery({
    queryKey: incomeKeys.detail(id),
    queryFn: () => getIncome(id),
    select: (data) => data.data,
    enabled: !!id,
  })
}

/**
 * Hook to fetch total income for a date range
 */
export function useTotalIncome(startDate: string, endDate: string) {
  return useQuery({
    queryKey: incomeKeys.total(startDate, endDate),
    queryFn: () => getTotalIncome(startDate, endDate),
    select: (data) => data.data,
  })
}

/**
 * Hook to get income stats for dashboard
 */
export function useIncomeStats(grain: TimeGrain = 'month') {
  const { start: currentStart, end: currentEnd } = getDateRangeForGrain(grain)
  const { start: prevStart, end: prevEnd } = getPreviousPeriodRange(grain)

  const currentIncome = useTotalIncome(currentStart.toISOString(), currentEnd.toISOString())
  const previousIncome = useTotalIncome(prevStart.toISOString(), prevEnd.toISOString())

  const currentTotal = currentIncome.data || 0
  const previousTotal = previousIncome.data || 0

  // Calculate trend percentage
  const trend = previousTotal > 0 
    ? ((currentTotal - previousTotal) / previousTotal) * 100 
    : 0

  return {
    currentTotal,
    previousTotal,
    trend,
    isLoading: currentIncome.isLoading || previousIncome.isLoading,
  }
}

/**
 * Hook to add a new income record
 */
export function useAddIncome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (income: Omit<IncomeInsert, 'user_id'>) => addIncome(income),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.all })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

/**
 * Hook to update an income record
 */
export function useUpdateIncome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: IncomeUpdate }) =>
      updateIncome(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.all })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

/**
 * Hook to delete an income record
 */
export function useDeleteIncome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.all })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}
