'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch {
    return { error: 'Failed to sign in' }
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch {
    return { error: 'Failed to sign up' }
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  } catch {
    redirect('/login')
  }
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(provider: 'google' | 'github'): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch {
    return { error: 'Failed to sign in with OAuth' }
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
    })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch {
    return { error: 'Failed to send reset password email' }
  }
}

/**
 * Update password
 */
export async function updatePassword(password: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch {
    return { error: 'Failed to update password' }
  }
}
