'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'

export function useRealtimeExpenses() {
  const queryClient = useQueryClient()

  React.useEffect(() => {
    const supabase = createClient()

    // Subscribe to changes in the expenses table
    const channel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
        },
        (payload) => {
          console.log('Expense change:', payload)
          
          // Invalidate queries to update data
          queryClient.invalidateQueries({ queryKey: ['expenses'] })
          
          // For more specific invalidation based on event type
          if (payload.eventType === 'DELETE') {
            queryClient.invalidateQueries({
              queryKey: ['expenses', 'detail', payload.old.id],
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}

export function useRealtimeRecurring() {
  const queryClient = useQueryClient()

  React.useEffect(() => {
    const supabase = createClient()

    // Subscribe to changes in the recurring_items table
    const channel = supabase
      .channel('recurring-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recurring_items',
        },
        (payload) => {
          console.log('Recurring item change:', payload)
          
          // Invalidate queries to update data
          queryClient.invalidateQueries({ queryKey: ['recurring'] })
          
          // For more specific invalidation based on event type
          if (payload.eventType === 'DELETE') {
            queryClient.invalidateQueries({
              queryKey: ['recurring', 'detail', payload.old.id],
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}

export function useRealtimeProfile() {
  const queryClient = useQueryClient()

  React.useEffect(() => {
    const supabase = createClient()

    // Subscribe to changes in the profiles table
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          console.log('Profile change:', payload)
          
          // Invalidate profile query
          queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}

export function useRealtimeAll() {
  useRealtimeExpenses()
  useRealtimeRecurring()
  useRealtimeProfile()
}