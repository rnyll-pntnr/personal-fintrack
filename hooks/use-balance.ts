'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { calculateCurrentBalance, getCashFlow, getBalanceHistory, getFinancialHealth } from '@/actions/balance'
import { TimeGrain } from '@/types/database'
import { getDateRangeForGrain } from '@/lib/date-utils'

// Query keys
export const balanceKeys = {
  all: ['balance'] as const,
  current: () => [...balanceKeys.all, 'current'] as const,
  cashFlow: (startDate: string, endDate: string) => [...balanceKeys.all, 'cashFlow', startDate, endDate] as const,
  history: (days: number) => [...balanceKeys.all, 'history', days] as const,
  financialHealth: () => [...balanceKeys.all, 'financialHealth'] as const,
}

/**
 * Hook to fetch current balance
 */
export function useCurrentBalance() {
  return useQuery({
    queryKey: balanceKeys.current(),
    queryFn: () => calculateCurrentBalance(),
    select: (data) => data.data,
  })
}

/**
 * Hook to fetch cash flow data for a specific period
 */
export function useCashFlow(grain: TimeGrain = 'month') {
  const { start: currentStart, end: currentEnd } = getDateRangeForGrain(grain)
  
  return useQuery({
    queryKey: balanceKeys.cashFlow(currentStart.toISOString(), currentEnd.toISOString()),
    queryFn: () => getCashFlow(currentStart.toISOString(), currentEnd.toISOString()),
    select: (data) => data.data,
  })
}

/**
 * Hook to fetch balance history
 */
export function useBalanceHistory(days: number = 30) {
  return useQuery({
    queryKey: balanceKeys.history(days),
    queryFn: () => getBalanceHistory(days),
    select: (data) => data.data,
  })
}

/**
 * Hook to fetch financial health score
 */
export function useFinancialHealth() {
  return useQuery({
    queryKey: balanceKeys.financialHealth(),
    queryFn: () => getFinancialHealth(),
    select: (data) => data.data,
  })
}

/**
 * Hook to update current balance
 */
export function useUpdateCurrentBalance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const result = await calculateCurrentBalance()
      if (result.error) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: balanceKeys.all })
    },
  })
}

/**
 * Hook to get combined financial overview
 */
export function useFinancialOverview(grain: TimeGrain = 'month') {
  const currentBalance = useCurrentBalance()
  const cashFlow = useCashFlow(grain)

  return {
    currentBalance: currentBalance.data,
    cashFlow: cashFlow.data,
    isLoading: currentBalance.isLoading || cashFlow.isLoading,
  }
}

/**
 * Hook to get detailed financial insights
 */
export function useFinancialInsights() {
  const financialHealth = useFinancialHealth()

  return {
    financialHealth: financialHealth.data,
    isLoading: financialHealth.isLoading,
  }
}
