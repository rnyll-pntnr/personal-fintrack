'use client'

import * as React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useExpenses } from '@/hooks/use-expenses'
import { useIncomes } from '@/hooks/use-income'
import { formatCurrency } from '@/lib/currency'
import { getDateRangeForGrain } from '@/lib/date-utils'
import { TimeGrain } from '@/types/database'

interface IncomeExpensesChartProps {
  timeGrain: TimeGrain
}

export function IncomeExpensesChart({ timeGrain }: IncomeExpensesChartProps) {
  const { start, end } = getDateRangeForGrain(timeGrain)
  const { data: expensesData } = useExpenses({
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  })
  const { data: incomesData } = useIncomes({
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  })

  const expenses = expensesData?.data || []
  const incomes = incomesData?.data || []

  // Process data to get income and expenses per day/week/month
  const chartData = React.useMemo(() => {
    const data: Array<{ date: string; income: number; expenses: number; balance: number }> = []

    // Helper function to format date based on time grain
    const getPeriodKey = (date: Date): string => {
      if (timeGrain === 'week') {
        // Get week number in year
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
        const dayNum = d.getUTCDay() || 7
        d.setUTCDate(d.getUTCDate() + 4 - dayNum)
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
        return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
      } else if (timeGrain === 'month') {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      } else { // year
        return `${date.getFullYear()}`
      }
    }

    // Create a map to track income and expenses by period
    const periodMap = new Map<string, { income: number; expenses: number }>()

    // Initialize all periods in the range with 0 values
    const currentDate = new Date(start)
    while (currentDate <= end) {
      const periodKey = getPeriodKey(currentDate)
      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, { income: 0, expenses: 0 })
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Add expenses to the map
    expenses?.forEach(expense => {
      const expenseDate = new Date(expense.date)
      const periodKey = getPeriodKey(expenseDate)
      if (periodMap.has(periodKey)) {
        const existing = periodMap.get(periodKey)!
        periodMap.set(periodKey, {
          ...existing,
          expenses: existing.expenses + expense.amount,
        })
      }
    })

    // Add incomes to the map
    incomes?.forEach(income => {
      const incomeDate = new Date(income.date)
      const periodKey = getPeriodKey(incomeDate)
      if (periodMap.has(periodKey)) {
        const existing = periodMap.get(periodKey)!
        periodMap.set(periodKey, {
          ...existing,
          income: existing.income + income.amount,
        })
      }
    })

    // Convert map to array with readable period labels
    periodMap.forEach((values, periodKey) => {
      let dateLabel: string
      if (timeGrain === 'week') {
        // Convert week number to date range (e.g., "Jan 1-7")
        const [year, weekStr] = periodKey.split('-W')
        const weekNumber = parseInt(weekStr)
        const d = new Date(parseInt(year), 0, 1)
        const dayNum = d.getDay() || 7
        d.setDate(d.getDate() + (weekNumber - 1) * 7 + (1 - dayNum))
        const weekStart = new Date(d)
        const weekEnd = new Date(d)
        weekEnd.setDate(weekEnd.getDate() + 6)
        const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
        dateLabel = `${weekStart.toLocaleDateString('en-US', formatOptions)} - ${weekEnd.toLocaleDateString('en-US', { day: 'numeric' })}`
      } else if (timeGrain === 'month') {
        // Format as month (e.g., "Jan 2024")
        const [year, monthStr] = periodKey.split('-')
        const date = new Date(parseInt(year), parseInt(monthStr) - 1)
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      } else { // year
        dateLabel = periodKey
      }

      data.push({
        date: dateLabel,
        income: values.income,
        expenses: values.expenses,
        balance: values.income - values.expenses,
      })
    })

    // Sort by actual date for week/month view
    if (timeGrain === 'week' || timeGrain === 'month') {
      data.sort((a, b) => {
        // Extract dates from labels for sorting
        if (timeGrain === 'week') {
          // For week labels like "Jan 1-7", extract the first day
          const [month, dayStr] = a.date.split(' ')
          const day = parseInt(dayStr.split('-')[0])
          const dateA = new Date(2024, new Date(Date.parse(month + ' 1, 2024')).getMonth(), day)
          
          const [monthB, dayStrB] = b.date.split(' ')
          const dayB = parseInt(dayStrB.split('-')[0])
          const dateB = new Date(2024, new Date(Date.parse(monthB + ' 1, 2024')).getMonth(), dayB)
          
          return dateA.getTime() - dateB.getTime()
        } else { // month
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        }
      })
    } else { // year is already sorted
      data.sort((a, b) => parseInt(a.date) - parseInt(b.date))
    }

    return data
  }, [expenses, incomes, start, end, timeGrain])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickMargin={8}
                interval={timeGrain === 'month' ? 3 : 0}
                angle={timeGrain === 'week' ? -45 : 0}
                textAnchor={timeGrain === 'week' ? 'end' : 'middle'}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value, 'AED')}
              />
              <Tooltip
                formatter={(value: number | undefined) => formatCurrency(value || 0, 'AED')}
              />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
              <Bar dataKey="balance" fill="#3b82f6" name="Balance" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
