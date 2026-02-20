import { CategoryInsert, ThemeAccent, RecurringFrequency } from '@/types/database'


/**
 * Application constants
 */

// Theme accent colors with their display info
export const THEME_ACCENTS: Array<{
  value: ThemeAccent
  label: string
  color: string
  previewClass: string
}> = [
  {
    value: 'blue',
    label: 'Blue',
    color: '#3b82f6',
    previewClass: 'bg-blue-500',
  },
  {
    value: 'emerald',
    label: 'Emerald',
    color: '#10b981',
    previewClass: 'bg-emerald-500',
  },
  {
    value: 'violet',
    label: 'Violet',
    color: '#8b5cf6',
    previewClass: 'bg-violet-500',
  },
  {
    value: 'rose',
    label: 'Rose',
    color: '#f43f5e',
    previewClass: 'bg-rose-500',
  },
]

// Default categories to seed for new users
// Default expense categories
export const DEFAULT_EXPENSE_CATEGORIES: CategoryInsert[] = [
  {
    name: 'Food',
    color: '#f97316',
    icon_name: 'Utensils',
    type: 'expense',
  },
  {
    name: 'Transport',
    color: '#3b82f6',
    icon_name: 'Car',
    type: 'expense',
  },
  {
    name: 'Utilities',
    color: '#eab308',
    icon_name: 'Zap',
    type: 'expense',
  },
  {
    name: 'Entertainment',
    color: '#a855f7',
    icon_name: 'Film',
    type: 'expense',
  },
  {
    name: 'Grocery',
    color: '#ec4899',
    icon_name: 'ShoppingBag',
    type: 'expense',
  },
  {
    name: 'Healthcare',
    color: '#ef4444',
    icon_name: 'Heart',
    type: 'expense',
  },
  {
    name: 'Education',
    color: '#06b6d4',
    icon_name: 'GraduationCap',
    type: 'expense',
  },
  {
    name: 'Rent',
    color: '#14b8a6',
    icon_name: 'Home',
    type: 'expense',
  },
  {
    name: 'Personal Care',
    color: '#f472b6',
    icon_name: 'Sparkles',
    type: 'expense',
  },
  {
    name: 'Other',
    color: '#6b7280',
    icon_name: 'MoreHorizontal',
    type: 'expense',
  },
]

// Default income categories
export const DEFAULT_INCOME_CATEGORIES: CategoryInsert[] = [
  {
    name: 'Salary',
    color: '#10b981',
    icon_name: 'Briefcase',
    type: 'income',
  },
  {
    name: 'Freelance',
    color: '#3b82f6',
    icon_name: 'Laptop',
    type: 'income',
  },
  {
    name: 'Investments',
    color: '#8b5cf6',
    icon_name: 'TrendingUp',
    type: 'income',
  },
  {
    name: 'Side Hustle',
    color: '#f59e0b',
    icon_name: 'Zap',
    type: 'income',
  },
  {
    name: 'Rental Income',
    color: '#06b6d4',
    icon_name: 'Home',
    type: 'income',
  },
]

// All default categories combined
export const DEFAULT_CATEGORIES: CategoryInsert[] = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
]

// Recurring frequency options
export const RECURRING_FREQUENCIES: Array<{
  value: RecurringFrequency
  label: string
  description: string
}> = [
  {
    value: 'weekly',
    label: 'Weekly',
    description: 'Every week',
  },
  {
    value: 'monthly',
    label: 'Monthly',
    description: 'Every month',
  },
  {
    value: 'yearly',
    label: 'Yearly',
    description: 'Every year',
  },
]

// Time grain options for charts
export const TIME_GRAIN_OPTIONS = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
] as const

// Navigation items for sidebar
export const NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Recurring',
    href: '/recurring',
    icon: 'Repeat',
  },
  {
    title: 'Expenses',
    href: '/expenses',
    icon: 'Receipt',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: 'Settings',
  },
] as const

// Export currency constants
export { CURRENCIES } from '@/lib/currency'

// Default budget (can be made configurable later)
export const DEFAULT_MONTHLY_BUDGET = 10000

// Pagination defaults
export const ITEMS_PER_PAGE = 10

// Chart colors (for Recharts)
export const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  muted: 'hsl(var(--muted))',
  accent: 'hsl(var(--accent))',
  destructive: 'hsl(var(--destructive))',
  chart1: 'hsl(var(--chart-1))',
  chart2: 'hsl(var(--chart-2))',
  chart3: 'hsl(var(--chart-3))',
  chart4: 'hsl(var(--chart-4))',
  chart5: 'hsl(var(--chart-5))',
}

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'fintrack-theme',
  DARK_MODE: 'fintrack-dark-mode',
  SIDEBAR_COLLAPSED: 'fintrack-sidebar-collapsed',
} as const
