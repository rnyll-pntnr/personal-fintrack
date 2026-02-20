'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ExpenseInsert, ExpenseUpdate, ExpenseWithCategory } from '@/types/database'

/**
 * Get all expenses for the current user with optional filters
 */
export async function getExpenses(options?: {
  startDate?: string
  endDate?: string
  categoryId?: string
  limit?: number
  offset?: number
}): Promise<{ data: ExpenseWithCategory[] | null; error: string | null; count: number | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated', count: null }
    }

    // First get count
    let countQuery = supabase
      .from('expenses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (options?.startDate) {
      countQuery = countQuery.gte('date', options.startDate)
    }
    if (options?.endDate) {
      countQuery = countQuery.lte('date', options.endDate)
    }
    if (options?.categoryId) {
      countQuery = countQuery.eq('category_id', options.categoryId)
    }

    const { count: totalCount } = await countQuery

    // Then get data
    let query = supabase
      .from('expenses')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (options?.startDate) {
      query = query.gte('date', options.startDate)
    }
    if (options?.endDate) {
      query = query.lte('date', options.endDate)
    }
    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      return { data: null, error: error.message, count: null }
    }

    return { data: data as ExpenseWithCategory[], error: null, count: totalCount || 0 }
  } catch {
    return { data: null, error: 'Failed to fetch expenses', count: null }
  }
}

/**
 * Get a single expense by ID
 */
export async function getExpense(id: string): Promise<{ data: ExpenseWithCategory | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: data as ExpenseWithCategory, error: null }
  } catch {
    return { data: null, error: 'Failed to fetch expense' }
  }
}

/**
 * Create a new expense
 */
export async function addExpense(expense: Omit<ExpenseInsert, 'user_id'>): Promise<{ data: ExpenseWithCategory | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        ...expense,
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
    revalidatePath('/expenses')
    
    return { data: data as ExpenseWithCategory, error: null }
  } catch {
    return { data: null, error: 'Failed to add expense' }
  }
}

/**
 * Update an existing expense
 */
export async function updateExpense(id: string, updates: ExpenseUpdate): Promise<{ data: ExpenseWithCategory | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('expenses')
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
    revalidatePath('/expenses')
    
    return { data: data as ExpenseWithCategory, error: null }
  } catch {
    return { data: null, error: 'Failed to update expense' }
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath('/expenses')
    
    return { success: true, error: null }
  } catch {
    return { success: false, error: 'Failed to delete expense' }
  }
}

/**
 * Get total spending for a date range
 */
export async function getTotalSpending(startDate: string, endDate: string): Promise<{ data: number | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) {
      return { data: null, error: error.message }
    }

    const total = data.reduce((sum, expense) => sum + Number(expense.amount), 0)
    return { data: total, error: null }
  } catch {
    return { data: null, error: 'Failed to calculate total spending' }
  }
}
