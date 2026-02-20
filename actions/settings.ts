'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Profile, ProfileUpdate, ThemeAccent } from '@/types/database'

/**
 * Get the current user's profile
 */
export async function getProfile(): Promise<{ data: Profile | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch {
    return { data: null, error: 'Failed to fetch profile' }
  }
}

/**
 * Update the current user's profile
 */
export async function updateProfile(updates: ProfileUpdate): Promise<{ data: Profile | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    revalidatePath('/settings')
    revalidatePath('/dashboard')
    
    return { data, error: null }
  } catch {
    return { data: null, error: 'Failed to update profile' }
  }
}

/**
 * Update theme preference
 */
export async function updateThemePreference(theme: ThemeAccent): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ theme_preference: theme })
      .eq('id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch {
    return { success: false, error: 'Failed to update theme preference' }
  }
}

/**
 * Update dark mode preference
 */
export async function updateDarkMode(darkMode: boolean): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ dark_mode: darkMode })
      .eq('id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch {
    return { success: false, error: 'Failed to update dark mode preference' }
  }
}

/**
 * Update currency preference
 */
export async function updateCurrency(currency: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ currency })
      .eq('id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/settings')
    
    return { success: true, error: null }
  } catch {
    return { success: false, error: 'Failed to update currency preference' }
  }
}
