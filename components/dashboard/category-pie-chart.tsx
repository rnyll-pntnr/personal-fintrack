'use client'

import * as React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCategoryStats } from '@/hooks/use-categories'
import { useProfile } from '@/hooks/use-user'
import { formatCurrency } from '@/lib/currency'
import { getDateRangeForGrain } from '@/lib/date-utils'
import { TimeGrain } from '@/types/database'

interface CategoryPieChartProps {
  timeGrain: TimeGrain
}

// Custom legend component
function CustomLegend({ payload, currency }: { payload?: Array<{ value: string; payload: { amount: number; percentage: number; color: string } }>; currency: string }) {
  if (!payload) return null
  
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5 text-xs">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.payload.color }}
          />
          <span className="text-muted-foreground">{entry.value === 'value' ? 'Uncategorized' : entry.value}</span>
          <span className="font-medium">
            {formatCurrency(entry.payload.amount, currency)}
          </span>
          <span className="text-muted-foreground">
            ({entry.payload.percentage.toFixed(0)}%)
          </span>
        </div>
      ))}
    </div>
  )
}

export function CategoryPieChart({ timeGrain }: CategoryPieChartProps) {
  const { data: profile } = useProfile()
  const { start, end } = getDateRangeForGrain(timeGrain)
  
  const { data: categoryStats, isLoading } = useCategoryStats(
    start.toISOString(),
    end.toISOString()
  )

  const currency = profile?.currency || 'AED'

  // Transform data for the pie chart
  const chartData = React.useMemo(() => {
    if (!categoryStats) return []
    return categoryStats.map((stat) => ({
      name: stat.category.name,
      value: stat.amount,
      amount: stat.amount,
      percentage: stat.percentage,
      color: stat.category.color,
    }))
  }, [categoryStats])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
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
        <CardTitle>Category Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No expenses recorded for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), currency)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend
                content={<CustomLegend currency={currency} />}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}