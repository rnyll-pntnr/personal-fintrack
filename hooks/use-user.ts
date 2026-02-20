'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile, updateThemePreference, updateDarkMode, updateCurrency } from '@/actions/settings'
import { ThemeAccent } from '@/types/database'

// Query keys
export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
}

/**
 * Hook to fetch the current user's profile
 */
export function useProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => getProfile(),
    select: (data) => data.data,
  })
}

/**
 * Hook to update the user's profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: Parameters<typeof updateProfile>[0]) => updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() })
    },
  })
}

/**
 * Hook to update theme preference
 */
export function useUpdateThemePreference() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (theme: ThemeAccent) => updateThemePreference(theme),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() })
    },
  })
}

/**
 * Hook to update dark mode preference
 */
export function useUpdateDarkMode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (darkMode: boolean) => updateDarkMode(darkMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() })
    },
  })
}

/**
 * Hook to update currency preference
 */
export function useUpdateCurrency() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (currency: string) => updateCurrency(currency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() })
    },
  })
}
