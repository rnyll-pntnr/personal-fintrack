'use client'

import { useEffect } from 'react'
import { useProfile } from '@/hooks/use-user'
import { useThemeAccent } from '@/context/theme-context'
import { ThemeAccent } from '@/types/database'

export function useThemeSync() {
  const { data: profile } = useProfile()

  // Safely get theme context
  let setAccent: (accent: ThemeAccent) => void = () => {}
  try {
    const themeContext = useThemeAccent()
    setAccent = themeContext.setAccent
  } catch {
    // If ThemeAccentProvider is not available (e.g., during static rendering), ignore
  }

  useEffect(() => {
    if (profile?.theme_preference && ['blue', 'emerald', 'violet', 'rose'].includes(profile.theme_preference)) {
      setAccent(profile.theme_preference as ThemeAccent)
    }
  }, [profile?.theme_preference])
}