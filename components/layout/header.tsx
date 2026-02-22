'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { ProfileDropdown } from './profile-dropdown'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { MobileNav } from './mobile-nav'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

// Map paths to breadcrumb titles
const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/recurring': 'Recurring Items',
  '/dashboard/income': 'Income',
  '/dashboard/expenses': 'Expenses',
  '/dashboard/settings': 'Settings',
}

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Get the current page title
  const pageTitle = breadcrumbMap[pathname] || 'Dashboard'

  return (
    <header className="sticky top-0 z-40 h-14 sm:h-16 md:h-20 border-b">
      <div className="flex h-full items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Left side - Mobile menu and title */}
        <div className="flex items-center gap-4">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <VisuallyHidden>
                <SheetTitle>Navigation</SheetTitle>
              </VisuallyHidden>
              <MobileNav />
            </SheetContent>
          </Sheet>

          {/* Page title */}
          <h1 className="text-base sm:text-lg font-semibold">{pageTitle}</h1>
        </div>

        {/* Right side - Theme toggle and profile */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          {mounted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="h-10 w-10"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">
                  Switch to {theme === 'dark' ? 'light' : 'dark'} mode
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Profile dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  )
}
