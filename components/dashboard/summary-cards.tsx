'use client'

import * as React from 'react'
import { Wallet, Clock, DollarSign, CreditCard } from 'lucide-react'
import { StatCard } from '@/components/shared/stat-card'
import { useSpendingStats } from '@/hooks/use-expenses'
import { usePendingRecurringTotal } from '@/hooks/use-recurring'
import { useIncomeStats } from '@/hooks/use-income'
import { useCurrentBalance } from '@/hooks/use-balance'
import { useProfile } from '@/hooks/use-user'
import { formatCurrency } from '@/lib/currency'
import { TimeGrain } from '@/types/database'

interface SummaryCardsProps {
  timeGrain: TimeGrain
}

export function SummaryCards({ timeGrain }: SummaryCardsProps) {
  const { data: profile } = useProfile()
  const { currentTotal: totalSpent, trend: spendingTrend, isLoading: spendingLoading } = useSpendingStats(timeGrain)
  const { currentTotal: totalIncome, trend: incomeTrend, isLoading: incomeLoading } = useIncomeStats(timeGrain)
  const { data: currentBalance, isLoading: balanceLoading } = useCurrentBalance()
  const { data: recurringDue, isLoading: recurringLoading } = usePendingRecurringTotal()
  const [isBalanceMasked, setIsBalanceMasked] = React.useState(true)

  const currency = profile?.currency || 'AED'
  const netCashFlow = (totalIncome || 0) - (totalSpent || 0)

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <StatCard
        title="Total Spent"
        value={formatCurrency(totalSpent || 0, currency)}
        trend={spendingTrend}
        description="vs last period"
        icon={<Wallet className="h-4 w-4" />}
        isLoading={spendingLoading}
      />
      <StatCard
        title="Total Income"
        value={formatCurrency(totalIncome || 0, currency)}
        trend={incomeTrend}
        description="vs last period"
        icon={<DollarSign className="h-4 w-4" />}
        isLoading={incomeLoading}
      />
      <StatCard
        title="Recurring Due"
        value={formatCurrency(recurringDue || 0, currency)}
        description="Pending payments"
        icon={<Clock className="h-4 w-4" />}
        isLoading={recurringLoading}
      />
      <StatCard
        title="Current Balance"
        value={formatCurrency(currentBalance || 0, currency)}
        trend={netCashFlow > 0 ? 100 : -100}
        description="vs last period"
        icon={<CreditCard className="h-4 w-4" />}
        isLoading={balanceLoading}
        isMasked={isBalanceMasked}
        onToggleMask={() => setIsBalanceMasked(!isBalanceMasked)}
      />
    </div>
  )
}