'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { RecurringItemInsert, RecurringItemUpdate, RecurringItemWithCategory } from '@/types/database'

/**
 * Get all recurring items for the current user
 */
export async function getRecurringItems(): Promise<{ data: RecurringItemWithCategory[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('recurring_items')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', user.id)
      .order('next_due_at', { ascending: true })

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: data as RecurringItemWithCategory[], error: null }
  } catch {
    return { data: null, error: 'Failed to fetch recurring items' }
  }
}

/**
 * Get pending recurring items (not processed in current month)
 */
export async function getPendingRecurringItems(): Promise<{ data: RecurringItemWithCategory[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    // Fetch directly instead of using RPC to ensure consistent category structure
    const { data, error } = await supabase
      .from('recurring_items')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', user.id)
      .order('next_due_at', { ascending: true })

    if (error) {
      return { data: null, error: error.message }
    }

    // Filter to get items with due dates within the last 7 days or upcoming, and not processed in current month
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const currentMonth = now.toISOString().slice(0, 7)
    
    const pendingItems = data.filter(item => {
      const isNotProcessed = !item.last_processed_date || item.last_processed_date.slice(0, 7) !== currentMonth
      const nextDueDate = new Date(item.next_due_at)
      const isWithinDateRange = nextDueDate >= sevenDaysAgo

      return isNotProcessed && isWithinDateRange
    })

    return { data: pendingItems as RecurringItemWithCategory[], error: null }
  } catch {
    return { data: null, error: 'Failed to fetch pending recurring items' }
  }
}

/**
 * Create a new recurring item
 */
export async function addRecurringItem(item: Omit<RecurringItemInsert, 'user_id'>): Promise<{ data: RecurringItemWithCategory | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('recurring_items')
      .insert({
        ...item,
        user_id: user.id,
      })
      .select(`
        *,
        category:categories(*)
      `)
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/recurring')
    
    return { data: data as RecurringItemWithCategory, error: null }
  } catch {
    return { data: null, error: 'Failed to add recurring item' }
  }
}

/**
 * Update a recurring item
 */
export async function updateRecurringItem(id: string, updates: RecurringItemUpdate): Promise<{ data: RecurringItemWithCategory | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('recurring_items')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        category:categories(*)
      `)
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/recurring')
    
    return { data: data as RecurringItemWithCategory, error: null }
  } catch {
    return { data: null, error: 'Failed to update recurring item' }
  }
}

/**
 * Delete a recurring item
 */
export async function deleteRecurringItem(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('recurring_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/recurring')
    
    return { success: true, error: null }
  } catch {
    return { success: false, error: 'Failed to delete recurring item' }
  }
}

/**
 * Mark a recurring item as paid
 * This updates the recurring item and creates an expense record
 */
export async function markRecurringAsPaid(id: string): Promise<{ 
  success: boolean; 
  expenseId?: string; 
  error: string | null 
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Use the database function
    const { data, error } = await supabase
      .rpc('mark_recurring_as_paid', { 
        p_recurring_id: id, 
        p_user_id: user.id 
      })

    if (error) {
      return { success: false, error: error.message }
    }

    const result = data?.[0]
    if (!result?.success) {
      return { success: false, error: 'Failed to mark as paid' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/recurring')
    revalidatePath('/expenses')
    
    return { 
      success: true, 
      expenseId: result.expense_id,
      error: null 
    }
  } catch {
    return { success: false, error: 'Failed to mark recurring item as paid' }
  }
}

/**
 * Get total amount of pending recurring items
 */
export async function getPendingRecurringTotal(): Promise<{ data: number | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    // Fetch directly instead of using RPC to ensure consistent logic with getPendingRecurringItems
    const { data, error } = await supabase
      .from('recurring_items')
      .select('amount, last_processed_date, next_due_at')
      .eq('user_id', user.id)

    if (error) {
      return { data: null, error: error.message }
    }

    // Filter to get items with due dates within the last 7 days or upcoming, and not processed in current month
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const currentMonth = now.toISOString().slice(0, 7)
    
    const pendingItems = data.filter(item => {
      const isNotProcessed = !item.last_processed_date || item.last_processed_date.slice(0, 7) !== currentMonth
      const nextDueDate = new Date(item.next_due_at)
      const isWithinDateRange = nextDueDate >= sevenDaysAgo

      return isNotProcessed && isWithinDateRange
    })

interface PendingRecurringItem {
  amount: number
  last_processed_date: string | null
  next_due_at: string
}

    const total = pendingItems.reduce((sum: number, item: PendingRecurringItem) => sum + Number(item.amount), 0)
    return { data: total, error: null }
  } catch {
    return { data: null, error: 'Failed to calculate pending recurring total' }
  }
}
