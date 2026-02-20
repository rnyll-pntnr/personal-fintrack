'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { IncomeInsert, IncomeUpdate, IncomeWithCategory } from '@/types/database'

/**
 * Get all income records for the current user
 */
export async function getIncomes(options?: {
  startDate?: string
  endDate?: string
  categoryId?: string
  limit?: number
  offset?: number
}): Promise<{ data: IncomeWithCategory[] | null; error: string | null; count: number | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated', count: null }
    }

    // First get count
    let countQuery = supabase
      .from('income')
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
      .from('income')
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

    return { data: data as IncomeWithCategory[], error: null, count: totalCount || 0 }
  } catch {
    return { data: null, error: 'Failed to fetch income records', count: null }
  }
}

/**
 * Get a single income record
 */
export async function getIncome(id: string): Promise<{ data: IncomeWithCategory | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('income')
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

    return { data: data as IncomeWithCategory, error: null }
  } catch {
    return { data: null, error: 'Failed to fetch income record' }
  }
}

/**
 * Create a new income record
 */
export async function addIncome(income: Omit<IncomeInsert, 'user_id'>): Promise<{ data: IncomeWithCategory | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

     const { data, error } = await supabase
      .from('income')
      .insert({
        ...income,
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

    // Update current balance
    await updateCurrentBalance(user.id)

    revalidatePath('/dashboard')
    revalidatePath('/income')
    
    return { data: data as IncomeWithCategory, error: null }
  } catch {
    return { data: null, error: 'Failed to add income' }
  }
}

/**
 * Update an existing income record
 */
export async function updateIncome(id: string, updates: IncomeUpdate): Promise<{ data: IncomeWithCategory | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

     const { data, error } = await supabase
      .from('income')
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

    // Update current balance
    await updateCurrentBalance(user.id)

    revalidatePath('/dashboard')
    revalidatePath('/income')
    
    return { data: data as IncomeWithCategory, error: null }
  } catch {
    return { data: null, error: 'Failed to update income' }
  }
}

/**
 * Delete an income record
 */
export async function deleteIncome(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('income')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    // Update current balance
    await updateCurrentBalance(user.id)

    revalidatePath('/dashboard')
    revalidatePath('/income')
    
    return { success: true, error: null }
  } catch {
    return { success: false, error: 'Failed to delete income' }
  }
}

/**
 * Get total income for a date range
 */
export async function getTotalIncome(startDate: string, endDate: string): Promise<{ data: number | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('income')
      .select('amount', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) {
      return { data: null, error: error.message }
    }

    const total = data?.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0) || 0
    return { data: total, error: null }
  } catch {
    return { data: null, error: 'Failed to calculate total income' }
  }
}

/**
 * Get income stats for dashboard
 */
interface IncomeStatsData {
  totalIncome: number
  averageIncome: number
}

export async function getIncomeStats(startDate: string, endDate: string): Promise<{ data: IncomeStatsData | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: totalIncome, error: incomeError } = await getTotalIncome(startDate, endDate)
    if (incomeError) {
      return { data: null, error: incomeError }
    }

    return { 
      data: { 
        totalIncome: totalIncome || 0,
        averageIncome: (totalIncome || 0) / 30, // Assuming 30 days for simplicity
      }, 
      error: null 
    }
  } catch {
    return { data: null, error: 'Failed to get income stats' }
  }
}

/**
 * Calculate and update current balance
 */
async function updateCurrentBalance(userId: string) {
  try {
    const supabase = await createClient()

    // Calculate total income
    const { data: incomeData, error: incomeError } = await supabase
      .from('income')
      .select('amount')
      .eq('user_id', userId)

    if (incomeError) {
      console.error('Error calculating total income:', incomeError)
      return
    }

    const totalIncome = incomeData?.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0) || 0

    // Calculate total expenses
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId)

    if (expenseError) {
      console.error('Error calculating total expenses:', expenseError)
      return
    }

    const totalExpenses = expenseData?.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0) || 0

    // Calculate current balance
    const currentBalance = totalIncome - totalExpenses

    // Update user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ current_balance: currentBalance })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating current balance:', updateError)
    }
  } catch (err) {
    console.error('Error in updateCurrentBalance:', err)
  }
}
