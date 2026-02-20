import { TimeGrain, ChartDataPoint, Expense } from '@/types/database'

/**
 * Date formatting and manipulation utilities
 */

/**
 * Format a date string for display
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

/**
 * Format a date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

/**
 * Format a date with time
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 days")
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 1) return `In ${diffDays} days`
  return `${Math.abs(diffDays)} days ago`
}

/**
 * Get the start and end dates for a time grain
 */
export function getDateRangeForGrain(grain: TimeGrain, referenceDate: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(referenceDate)
  const end = new Date(referenceDate)
  
  switch (grain) {
    case 'week':
      // Start from Sunday (or Monday based on locale)
      const dayOfWeek = start.getDay()
      start.setDate(start.getDate() - dayOfWeek)
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
      
    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(end.getMonth() + 1, 0) // Last day of current month
      end.setHours(23, 59, 59, 999)
      break
      
    case 'year':
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(11, 31)
      end.setHours(23, 59, 59, 999)
      break
  }
  
  return { start, end }
}

/**
 * Get date ranges for previous period comparison
 */
export function getPreviousPeriodRange(grain: TimeGrain, referenceDate: Date = new Date()): { start: Date; end: Date } {
  const current = getDateRangeForGrain(grain, referenceDate)
  const previous = new Date(current.start)
  
  switch (grain) {
    case 'week':
      previous.setDate(previous.getDate() - 7)
      break
    case 'month':
      previous.setMonth(previous.getMonth() - 1)
      break
    case 'year':
      previous.setFullYear(previous.getFullYear() - 1)
      break
  }
  
  const end = new Date(previous)
  switch (grain) {
    case 'week':
      end.setDate(end.getDate() + 6)
      break
    case 'month':
      end.setMonth(end.getMonth() + 1, 0)
      break
    case 'year':
      end.setMonth(11, 31)
      break
  }
  
  return { start: previous, end }
}

/**
 * Aggregate expenses by time grain for charts
 */
export function aggregateExpensesByGrain(
  expenses: Expense[],
  grain: TimeGrain
): ChartDataPoint[] {
  const aggregated = new Map<string, number>()
  
  expenses.forEach((expense) => {
    const date = new Date(expense.date)
    let key: string

    
    switch (grain) {
      case 'week':
        // Group by day within the week
        key = date.toISOString().split('T')[0]

        break
        
      case 'month':
        // Group by week within the month
        const weekNum = Math.ceil(date.getDate() / 7)
        key = `Week ${weekNum}`

        break
        
      case 'year':
        // Group by month
        key = date.toLocaleDateString('en-US', { month: 'short' })

        break
        
      default:
        key = date.toISOString().split('T')[0]

    }
    
    aggregated.set(key, (aggregated.get(key) || 0) + expense.amount)
  })
  
  // Convert to array and sort by date
  return Array.from(aggregated.entries())
    .map(([date, amount]) => ({
      date,
      amount,
      label: grain === 'month' ? date : date,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Check if a date is in the current calendar month
 */
export function isInCurrentMonth(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  return (
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}

/**
 * Calculate the next due date for a recurring item
 */
export function calculateNextDueDate(
  frequency: 'weekly' | 'monthly' | 'yearly',
  fromDate: Date = new Date()
): Date {
  const next = new Date(fromDate)
  
  switch (frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1)
      break
  }
  
  return next
}

/**
 * Get month name
 */
export function getMonthName(month: number): string {
  const date = new Date(2000, month, 1)
  return date.toLocaleDateString('en-US', { month: 'long' })
}

/**
 * Get days in month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}
