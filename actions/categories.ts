'use server'

import { createClient } from '@/lib/supabase/server'
import { Category, CategoryInsert } from '@/types/database'

/**
 * Get categories with optional type filter
 */
export async function getCategories(type?: string): Promise<{ data: Category[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    let query = supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch {
    return { data: null, error: 'Failed to fetch categories' }
  }
}

/**
 * Get category by ID
 */
export async function getCategory(id: string): Promise<{ data: Category | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch {
    return { data: null, error: 'Failed to fetch category' }
  }
}

/**
 * Create a new category
 */
export async function createCategory(category: CategoryInsert): Promise<{ data: Category | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...category,
        user_id: user.id,
      })
      .select('*')
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: data as Category, error: null }
  } catch {
    return { data: null, error: 'Failed to create category' }
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(id: string, updates: Partial<Category>): Promise<{ data: Category | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: data as Category, error: null }
  } catch {
    return { data: null, error: 'Failed to update category' }
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch {
    return { success: false, error: 'Failed to delete category' }
  }
}

/**
 * Get expense statistics by category for a date range
 */
export async function getCategoryStats(
  startDate: string,
  endDate: string
): Promise<{ 
  data: Array<{ category: Category; amount: number; percentage: number }> | null; 
  error: string | null 
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    // Use the database function
    const { data, error } = await supabase
      .rpc('get_expense_stats', {
        p_user_id: user.id,
        p_start_date: startDate,
        p_end_date: endDate,
      })

    if (error) {
      return { data: null, error: error.message }
    }

    // Calculate total for percentage
    const total = data?.reduce((sum: number, item: { total_amount: number }) => sum + Number(item.total_amount), 0) || 0

    // Format the result
    const result = data?.map((item: { 
      total_amount: number
      category_id: string
      category_name: string
      category_color: string
    }) => ({
      category: {
        id: item.category_id,
        name: item.category_name,
        color: item.category_color,
        icon_name: null,
        created_at: new Date().toISOString(),
      } as Category,
      amount: Number(item.total_amount),
      percentage: total > 0 ? (Number(item.total_amount) / total) * 100 : 0,
    })) || []

    return { data: result, error: null }
  } catch {
    return { data: null, error: 'Failed to fetch category statistics' }
  }
}
