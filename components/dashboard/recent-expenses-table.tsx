'use client'

import * as React from 'react'
import { Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoryBadge } from '@/components/shared/category-badge'
import { useExpenses, useDeleteExpense } from '@/hooks/use-expenses'
import { formatCurrency } from '@/lib/currency'
import { formatDate } from '@/lib/date-utils'
import { ExpenseWithCategory } from '@/types/database'

interface RecentExpensesTableProps {
  onEdit: (expense: ExpenseWithCategory) => void
}

export function RecentExpensesTable({ onEdit }: RecentExpensesTableProps) {
  const { data: expensesData, isLoading } = useExpenses()
  const deleteExpense = useDeleteExpense()

  const expenses = expensesData?.data || []

  // Get only the last 5 expenses sorted by date (most recent first)
  const recentExpenses = React.useMemo(() => {
    if (!expenses) return []
    
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [expenses])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense.mutateAsync(id)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Recent Expenses</CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Table - Responsive for mobile */}
        <div className="border rounded-lg overflow-hidden">
          {/* Desktop view */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      No recent expenses
                    </TableCell>
                  </TableRow>
                ) : (
                  recentExpenses.map(expense => (
                    <TableRow key={expense.id} className="group">
                      <TableCell className="text-left">
                        {expense.category ? (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: `${expense.category.color}20`,
                              color: expense.category.color,
                            }}
                          >
                            {(() => {
                              const iconMap = {
                                Utensils: '🍴',
                                Car: '🚗',
                                Zap: '⚡',
                                Film: '🎬',
                                ShoppingBag: '🛍️',
                                Heart: '❤️',
                                GraduationCap: '🎓',
                                Home: '🏠',
                                Sparkles: '✨',
                                MoreHorizontal: '⋯',
                              }
                              return iconMap[expense.category.icon_name as keyof typeof iconMap] || '📦'
                            })()}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            ⋯
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(expense.date)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {expense.description || 'No description'}
                      </TableCell>
                      <TableCell className="text-center">
                        <CategoryBadge category={expense.category} />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(expense.amount, expense.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(expense)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(expense.id)}
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile view */}
          <div className="md:hidden space-y-4">
            {recentExpenses.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-center text-muted-foreground">
                No recent expenses
              </div>
            ) : (
              recentExpenses.map(expense => (
                <div key={expense.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      {expense.category ? (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${expense.category.color}20`,
                            color: expense.category.color,
                          }}
                        >
                          {(() => {
                            const iconMap = {
                              Utensils: '🍴',
                              Car: '🚗',
                              Zap: '⚡',
                              Film: '🎬',
                              ShoppingBag: '🛍️',
                              Heart: '❤️',
                              GraduationCap: '🎓',
                              Home: '🏠',
                              Sparkles: '✨',
                              MoreHorizontal: '⋯',
                            }
                            return iconMap[expense.category.icon_name as keyof typeof iconMap] || '📦'
                          })()}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          ⋯
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{expense.description || 'No description'}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(expense.amount, expense.currency)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <CategoryBadge category={expense.category} />
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(expense)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(expense.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
