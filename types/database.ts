export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          theme_preference: ThemeAccent
          dark_mode: boolean
          currency: string
          current_balance: number
          monthly_income: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          theme_preference?: ThemeAccent
          dark_mode?: boolean
          currency?: string
          current_balance?: number
          monthly_income?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          theme_preference?: ThemeAccent
          dark_mode?: boolean
          currency?: string
          current_balance?: number
          monthly_income?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          color: string
          icon_name: string | null
          created_at: string
          type: string
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          color: string
          icon_name?: string | null
          created_at?: string
          type?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          color?: string
          icon_name?: string | null
          created_at?: string
          type?: string
          user_id?: string | null
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          description: string | null
          category_id: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency?: string
          description?: string | null
          category_id?: string | null
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          description?: string | null
          category_id?: string | null
          date?: string
          created_at?: string
        }
      }
      recurring_items: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          category_id: string | null
          frequency: RecurringFrequency
          last_processed_date: string | null
          next_due_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          category_id?: string | null
          frequency: RecurringFrequency
          last_processed_date?: string | null
          next_due_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          category_id?: string | null
          frequency?: RecurringFrequency
          last_processed_date?: string | null
          next_due_at?: string
          created_at?: string
        }
      }
      income: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          description: string | null
          category_id: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency?: string
          description?: string | null
          category_id?: string | null
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          description?: string | null
          category_id?: string | null
          date?: string
          created_at?: string
        }
      }
      income_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon_name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          icon_name?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon_name?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      theme_accent: 'blue' | 'emerald' | 'violet' | 'rose'
      recurring_frequency: 'weekly' | 'monthly' | 'yearly'
    }
  }
}

export type ThemeAccent = Database['public']['Enums']['theme_accent']
export type RecurringFrequency = Database['public']['Enums']['recurring_frequency']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']

export type RecurringItem = Database['public']['Tables']['recurring_items']['Row']
export type RecurringItemInsert = Database['public']['Tables']['recurring_items']['Insert']
export type RecurringItemUpdate = Database['public']['Tables']['recurring_items']['Update']

export type Income = Database['public']['Tables']['income']['Row']
export type IncomeInsert = Database['public']['Tables']['income']['Insert']
export type IncomeUpdate = Database['public']['Tables']['income']['Update']

// Extended types with relations
export interface ExpenseWithCategory extends Expense {
  category: Category | null
}

export interface RecurringItemWithCategory extends RecurringItem {
  category: Category | null
}

export interface IncomeWithCategory extends Income {
  category: Category | null
}

// Dashboard types
export interface SummaryStats {
  totalSpent: number
  budgetRemaining: number
  recurringDue: number
  totalSpentTrend: number
  budgetRemainingTrend: number
  recurringDueTrend: number
  currentBalance: number
  totalIncome: number
  netCashFlow: number
  currentBalanceTrend: number
  totalIncomeTrend: number
  netCashFlowTrend: number
}

export interface ChartDataPoint {
  date: string
  amount: number
  label: string
}

export interface CategoryDistribution {
  category: Category
  amount: number
  percentage: number
}

// Time grain types
export type TimeGrain = 'week' | 'month' | 'year'

// Form types
export interface ExpenseFormData {
  amount: number
  description: string
  category_id: string
  date: string
}

export interface RecurringItemFormData {
  name: string
  amount: number
  category_id: string
  frequency: RecurringFrequency
  next_due_at: string
}
