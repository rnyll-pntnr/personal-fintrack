'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Repeat,
  Receipt,
  Settings,
  Wallet,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Recurring',
    href: '/dashboard/recurring',
    icon: Repeat,
  },
  {
    title: 'Income',
    href: '/dashboard/income',
    icon: DollarSign,
  },
  {
    title: 'Expenses',
    href: '/dashboard/expenses',
    icon: Receipt,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Logo */}
      <div className="flex items-center h-14 px-3 sm:h-16 sm:px-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">FinTrack</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 sm:py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
    (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors sm:gap-4 sm:px-4 sm:py-3 sm:text-base',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
