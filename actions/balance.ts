'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Calculate current balance for user
 */
export async function calculateCurrentBalance(): Promise<{ data: number | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    // Calculate total income
    const { data: incomeData, error: incomeError } = await supabase
      .from('income')
      .select('amount')
      .eq('user_id', user.id)

    if (incomeError) {
      return { data: null, error: incomeError.message }
    }

    const totalIncome = incomeData?.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0) || 0

    // Calculate total expenses
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)

    if (expenseError) {
      return { data: null, error: expenseError.message }
    }

    const totalExpenses = expenseData?.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0) || 0

    // Calculate current balance
    const currentBalance = totalIncome - totalExpenses

    // Update user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ current_balance: currentBalance })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating current balance:', updateError)
    }

    revalidatePath('/dashboard')
    
    return { data: currentBalance, error: null }
  } catch {
    return { data: null, error: 'Failed to calculate current balance' }
  }
}

/**
 * Get cash flow for a specific period
 */
interface CashFlowData {
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
  cashFlowPercentage: number
}

export async function getCashFlow(startDate: string, endDate: string): Promise<{ data: CashFlowData | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    // Calculate income for period
    const { data: incomeData, error: incomeError } = await supabase
      .from('income')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)

    if (incomeError) {
      return { data: null, error: incomeError.message }
    }

    const totalIncome = incomeData?.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0) || 0

    // Calculate expenses for period
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)

    if (expenseError) {
      return { data: null, error: expenseError.message }
    }

    const totalExpenses = expenseData?.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0) || 0

    // Calculate net cash flow
    const netCashFlow = totalIncome - totalExpenses

    return { 
      data: { 
        totalIncome,
        totalExpenses,
        netCashFlow,
        cashFlowPercentage: totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0
      }, 
      error: null 
    }
  } catch {
    return { data: null, error: 'Failed to get cash flow' }
  }
}

/**
 * Get balance history
 */
interface BalanceHistoryItem {
  date: string
  balance: number
}

export async function getBalanceHistory(days: number = 30): Promise<{ data: BalanceHistoryItem[] | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - days)

    // Fetch income and expenses for each day
    const { data: incomeData, error: incomeError } = await supabase
      .from('income')
      .select('date, amount')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date')

    if (incomeError) {
      return { data: null, error: incomeError.message }
    }

    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .select('date, amount')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date')

    if (expenseError) {
      return { data: null, error: expenseError.message }
    }

    // Process data into daily balance
    const balanceHistory = []
    let currentBalance = 0
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]

      // Add daily income
      const dailyIncome = incomeData.filter(item => item.date.startsWith(dateStr))
        .reduce((sum: number, item: { amount: number }) => sum + item.amount, 0)

      // Subtract daily expenses
      const dailyExpenses = expenseData.filter(item => item.date.startsWith(dateStr))
        .reduce((sum: number, item: { amount: number }) => sum + item.amount, 0)

      currentBalance += dailyIncome - dailyExpenses

      balanceHistory.push({
        date: dateStr,
        balance: currentBalance,
        income: dailyIncome,
        expenses: dailyExpenses
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return { data: balanceHistory, error: null }
  } catch {
    return { data: null, error: 'Failed to get balance history' }
  }
}

/**
 * Get financial health score
 */
interface FinancialHealthData {
  score: number
  category: string
  recommendations: string[]
}

export async function getFinancialHealth(): Promise<{ data: FinancialHealthData | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    // Calculate current balance
    const { data: balance, error: balanceError } = await calculateCurrentBalance()
    if (balanceError) {
      return { data: null, error: balanceError }
    }

    // Calculate monthly income and expenses
    const endDate = new Date()
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)

    const { data: cashFlow, error: cashFlowError } = await getCashFlow(
      startDate.toISOString(),
      endDate.toISOString()
    )

    if (cashFlowError || !cashFlow) {
      return { data: null, error: cashFlowError || 'Failed to calculate cash flow' }
    }

    // Calculate financial health score (0-100)
    let score = 50
    const safeBalance = balance || 0

    // Balance health (30% weight)
    if (safeBalance > 0) {
      score += 15
    }
    if (safeBalance > cashFlow.totalIncome) {
      score += 15
    }

    // Cash flow health (40% weight)
    if (cashFlow.netCashFlow > 0) {
      score += 20
    }
    if (cashFlow.cashFlowPercentage > 20) {
      score += 20
    }

    // Savings rate (30% weight)
    const savingsRate = cashFlow.totalIncome > 0 ? (cashFlow.netCashFlow / cashFlow.totalIncome) * 100 : 0
    if (savingsRate > 10) {
      score += 15
    }
    if (savingsRate > 20) {
      score += 15
    }

    score = Math.max(0, Math.min(100, score))

    // Determine health category
    let category = 'Fair'
    if (score >= 80) {
      category = 'Excellent'
    } else if (score >= 60) {
      category = 'Good'
    } else if (score >= 40) {
      category = 'Fair'
    } else {
      category = 'Poor'
    }

    return { 
      data: { 
        score,
        category,
        recommendations: getRecommendations(score, cashFlow, safeBalance)
      }, 
      error: null 
    }
  } catch {
    return { data: null, error: 'Failed to get financial health' }
  }
}

/**
 * Generate personalized recommendations based on financial health
 */
function getRecommendations(score: number, cashFlow: CashFlowData, balance: number): string[] {
  const recommendations: string[] = []

  if (cashFlow.netCashFlow <= 0) {
    recommendations.push('Your expenses exceed your income. Consider reducing discretionary spending or increasing your income.')
  }

  if (cashFlow.cashFlowPercentage < 10) {
    recommendations.push('Your savings rate is below the recommended 10%. Look for ways to reduce expenses or increase income.')
  }

  if (balance < cashFlow.totalExpenses) {
    recommendations.push('Your current balance is less than one month of expenses. Build an emergency fund.')
  }

  if (score < 60) {
    recommendations.push('Create a monthly budget to track your income and expenses more closely.')
  }

  if (score < 40) {
    recommendations.push('Consider working with a financial advisor to develop a debt repayment plan.')
  }

  return recommendations
}
