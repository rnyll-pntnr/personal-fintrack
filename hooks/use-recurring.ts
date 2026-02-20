'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRecurringItems,
  getPendingRecurringItems,
  addRecurringItem,
  updateRecurringItem,
  deleteRecurringItem,
  markRecurringAsPaid,
  getPendingRecurringTotal,
} from '@/actions/recurring'
import { RecurringItemInsert, RecurringItemUpdate } from '@/types/database'

// Query keys
export const recurringKeys = {
  all: ['recurring'] as const,
  lists: () => [...recurringKeys.all, 'list'] as const,
  pending: () => [...recurringKeys.all, 'pending'] as const,
  pendingTotal: () => [...recurringKeys.all, 'pendingTotal'] as const,
  details: () => [...recurringKeys.all, 'detail'] as const,
  detail: (id: string) => [...recurringKeys.details(), id] as const,
}

/**
 * Hook to fetch all recurring items
 */
export function useRecurringItems() {
  return useQuery({
    queryKey: recurringKeys.lists(),
    queryFn: () => getRecurringItems(),
    select: (data) => data.data,
  })
}

/**
 * Hook to fetch pending recurring items (not processed in current month)
 */
export function usePendingRecurringItems() {
  return useQuery({
    queryKey: recurringKeys.pending(),
    queryFn: () => getPendingRecurringItems(),
    select: (data) => data.data,
  })
}

/**
 * Hook to get total amount of pending recurring items
 */
export function usePendingRecurringTotal() {
  return useQuery({
    queryKey: recurringKeys.pendingTotal(),
    queryFn: () => getPendingRecurringTotal(),
    select: (data) => data.data,
  })
}

/**
 * Hook to add a new recurring item
 */
export function useAddRecurringItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (item: Omit<RecurringItemInsert, 'user_id'>) => addRecurringItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all })
    },
  })
}

/**
 * Hook to update a recurring item
 */
export function useUpdateRecurringItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: RecurringItemUpdate }) =>
      updateRecurringItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all })
    },
  })
}

/**
 * Hook to delete a recurring item
 */
export function useDeleteRecurringItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRecurringItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all })
    },
  })
}

/**
 * Hook to mark a recurring item as paid with optimistic update
 */
export function useMarkRecurringAsPaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => markRecurringAsPaid(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: recurringKeys.pending() })

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData(recurringKeys.pending())

      // Optimistically update by removing the item from pending list
      queryClient.setQueryData(recurringKeys.pending(), (old: { data: RecurringItemInsert[] } | undefined) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.filter((item) => item.id !== id),
        }
      })

      return { previousItems }
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousItems) {
        queryClient.setQueryData(recurringKeys.pending(), context.previousItems)
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: recurringKeys.all })
      // Also invalidate expenses since a new expense was created
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}
