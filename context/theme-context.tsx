'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeAccent } from '@/types/database'

interface ThemeContextValue {
  accent: ThemeAccent
  setAccent: (accent: ThemeAccent) => void
}

const ThemeAccentContext = React.createContext<ThemeContextValue | undefined>(undefined)

export function useThemeAccent() {
  const context = React.useContext(ThemeAccentContext)
  if (!context) {
    throw new Error('useThemeAccent must be used within a ThemeAccentProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultAccent?: ThemeAccent
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultAccent = 'blue',
  storageKey = 'fintrack-theme-accent',
  ...props
}: ThemeProviderProps) {
  const [accent, setAccentState] = React.useState<ThemeAccent>(defaultAccent)
  const [mounted, setMounted] = React.useState(false)

  // Define callbacks BEFORE any conditional returns to maintain Hook order
  const setAccent = React.useCallback(
    (newAccent: ThemeAccent) => {
      setAccentState(newAccent)
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newAccent)
        document.documentElement.setAttribute('data-theme', newAccent)
      }
    },
    [storageKey]
  )

  // Load initial accent from localStorage after component mounts (browser only)
  React.useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey) as ThemeAccent | null
      
      let initialAccent: ThemeAccent = defaultAccent
      if (stored && ['blue', 'emerald', 'violet', 'rose'].includes(stored)) {
        initialAccent = stored
      }
      
      setAccentState(initialAccent)
      document.documentElement.setAttribute('data-theme', initialAccent)
    }
  }, [storageKey, defaultAccent])

  // Sync accent state to data-theme attribute whenever it changes
  React.useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', accent)
    }
  }, [accent, mounted])

  // Render nothing or fallback before component mounts to avoid hydration mismatch
  if (!mounted) {
    return (
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        {...props}
      >
        {children}
      </NextThemesProvider>
    )
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeAccentContext.Provider value={{ accent, setAccent }}>
        {children}
      </ThemeAccentContext.Provider>
    </NextThemesProvider>
  )
}
