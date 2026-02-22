'use client'

import * as React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
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
    <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto pr-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-2 p-1.5 rounded hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${entry.payload.color ? '' : 'bg-primary'}`}
              style={{ backgroundColor: entry.payload.color }}
            />
            <span className="text-sm text-muted-foreground">{entry.value === 'value' || !entry.value ? 'Uncategorized' : entry.value}</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium">
              {formatCurrency(entry.payload.amount, currency)}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              ({entry.payload.percentage.toFixed(2)}%)
            </span>
          </div>
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

  // Transform data for the pie chart - group small categories into "Other"
  const chartData = React.useMemo(() => {
    if (!categoryStats) return []
    
    const OTHER_CATEGORY_THRESHOLD = 5 // Percentage threshold for grouping
    const smallCategories = []
    const mainCategories = []
    
    let otherAmount = 0
    let otherPercentage = 0
    
    categoryStats.forEach((stat) => {
      if (stat.percentage < OTHER_CATEGORY_THRESHOLD) {
        smallCategories.push(stat)
        otherAmount += stat.amount
        otherPercentage += stat.percentage
      } else {
        mainCategories.push(stat)
      }
    })
    
    if (smallCategories.length > 0) {
      mainCategories.push({
        category: {
          name: 'Other',
          color: '#94a3b8' // Gray color for other category
        },
        amount: otherAmount,
        percentage: otherPercentage
      })
    }
    
    return mainCategories.map((stat) => ({
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
        <p className="text-sm text-muted-foreground">
          {chartData.length} categories
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No expenses recorded for this period
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
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
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <CustomLegend currency={currency} payload={chartData.map(entry => ({
                value: entry.name,
                payload: entry
              }))} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}