'use client'

import * as React from 'react'
import { TrendingUp, TrendingDown, Minus, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useThemeAccent } from '@/context/theme-context'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  trend?: number
  icon?: React.ReactNode
  isLoading?: boolean
  className?: string
  isMasked?: boolean
  onToggleMask?: () => void
}

export function StatCard({
  title,
  value,
  description,
  trend,
  icon,
  isLoading,
  className,
  isMasked,
  onToggleMask,
}: StatCardProps) {
  const { accent } = useThemeAccent()
  const trendDirection = trend && trend > 0 ? 'up' : trend && trend < 0 ? 'down' : 'neutral'
  const TrendIcon = trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus

  // Get accent color for styling
  const getAccentColor = () => {
    switch (accent) {
      case 'blue':
        return 'text-blue-500'
      case 'emerald':
        return 'text-emerald-500'
      case 'violet':
        return 'text-violet-500'
      case 'rose':
        return 'text-rose-500'
      default:
        return 'text-blue-500'
    }
  }

  const getAccentBgColor = () => {
    switch (accent) {
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-950/20'
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-950/20'
      case 'violet':
        return 'bg-violet-50 dark:bg-violet-950/20'
      case 'rose':
        return 'bg-rose-50 dark:bg-rose-950/20'
      default:
        return 'bg-blue-50 dark:bg-blue-950/20'
    }
  }

  // Mask currency value - preserve currency symbol, mask digits
  const maskCurrencyValue = (valueStr: string): string => {
    // Extract currency symbol (letters or special characters at beginning)
    const symbolMatch = valueStr.match(/^[^\d]+/)
    const symbol = symbolMatch ? symbolMatch[0] : ''
    // Mask numeric part
    return symbol + '***.**'
  }

  return (
    <Card className={cn('border border-border/80', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {onToggleMask && (
            <button
              onClick={onToggleMask}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              title={isMasked ? 'Show balance' : 'Hide balance'}
            >
              {isMasked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          )}
          {icon && (
            <div className={cn('p-2 rounded-lg', getAccentBgColor(), getAccentColor())}>
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24 mb-1" />
            <Skeleton className="h-4 w-16" />
          </>
        ) : (
          <>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">
              {isMasked && typeof value === 'string' ? maskCurrencyValue(value) : value}
            </div>
            {(trend !== undefined || description) && (
              <div className="flex items-center gap-1 mt-1">
                {trend !== undefined && (
                  <span
                    className={cn(
                      'flex items-center text-xs font-medium',
                      trendDirection === 'up' && 'text-emerald-500',
                      trendDirection === 'down' && 'text-rose-500',
                      trendDirection === 'neutral' && 'text-muted-foreground'
                    )}
                  >
                    <TrendIcon className="h-3 w-3 mr-0.5" />
                    {Math.abs(trend).toFixed(1)}%
                  </span>
                )}
                {description && (
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {description}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
