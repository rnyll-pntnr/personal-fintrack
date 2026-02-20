'use client'

import * as React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useExpenses } from '@/hooks/use-expenses'
import { useProfile } from '@/hooks/use-user'
import { formatCurrency } from '@/lib/currency'
import { getDateRangeForGrain, aggregateExpensesByGrain } from '@/lib/date-utils'
import { TimeGrain, ChartDataPoint } from '@/types/database'
import { useThemeAccent } from '@/context/theme-context'

interface SpendingChartProps {
  timeGrain: TimeGrain
}

// Custom tooltip component
function CustomTooltip({ 
  active, 
  payload, 
  label, 
  currency 
}: { 
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  currency: string 
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(payload[0].value, currency)}
        </p>
      </div>
    )
  }
  return null
}

export function SpendingChart({ timeGrain }: SpendingChartProps) {
  const { data: profile } = useProfile()
  const { accent } = useThemeAccent()
  const { start, end } = getDateRangeForGrain(timeGrain)
  
  const { data: expensesData, isLoading } = useExpenses({
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  })

  const expenses = expensesData?.data || []
  const currency = profile?.currency || 'AED'

  // Get chart colors based on accent
  const getChartColor = () => {
    switch (accent) {
      case 'blue':
        return '#3b82f6' // Blue
      case 'emerald':
        return '#10b981' // Emerald
      case 'violet':
        return '#8b5cf6' // Violet
      case 'rose':
        return '#f43f5e' // Rose
      default:
        return '#3b82f6' // Blue
    }
  }

  // Aggregate expenses by time grain
  const chartData: ChartDataPoint[] = React.useMemo(() => {
    if (!expenses) return []
    return aggregateExpensesByGrain(expenses, timeGrain)
  }, [expenses, timeGrain])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No expenses recorded for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value, currency, undefined).split('.')[0]}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Bar
                dataKey="amount"
                fill={getChartColor()}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}