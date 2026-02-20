'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCategories, getCategoryStats, createCategory, updateCategory, deleteCategory } from '@/actions/categories'
import { CategoryInsert, CategoryUpdate } from '@/types/database'

// Query keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: (type?: string) => [...categoryKeys.all, 'list', type || 'all'] as const,
  stats: (startDate: string, endDate: string) => [...categoryKeys.all, 'stats', startDate, endDate] as const,
}

/**
 * Hook to fetch all categories with optional type filter
 */
export function useCategories(type?: string) {
  return useQuery({
    queryKey: categoryKeys.lists(type),
    queryFn: () => getCategories(type),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes - categories don't change often
  })
}

/**
 * Hook to fetch category statistics for a date range
 */
export function useCategoryStats(startDate: string, endDate: string) {
  return useQuery({
    queryKey: categoryKeys.stats(startDate, endDate),
    queryFn: () => getCategoryStats(startDate, endDate),
    select: (data) => data.data,
  })
}

/**
 * Hook to create a new category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (category: CategoryInsert) => createCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

/**
 * Hook to update an existing category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CategoryUpdate }) => updateCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}
