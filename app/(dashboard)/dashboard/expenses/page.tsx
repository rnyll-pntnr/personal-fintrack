'use client'

import * as React from 'react'
import { ExpensesList } from '@/components/expenses/expenses-list'
import { ExpenseFormDialog } from '@/components/expenses/expense-form-dialog'
import { ExpenseWithCategory } from '@/types/database'

export default function ExpensesPage() {
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editExpense, setEditExpense] = React.useState<ExpenseWithCategory | null>(null)

  const handleAddNew = () => {
    setEditExpense(null)
    setIsFormOpen(true)
  }

  const handleEdit = (expense: ExpenseWithCategory) => {
    setEditExpense(expense)
    setIsFormOpen(true)
  }

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open)
    if (!open) {
      setEditExpense(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">
            View and manage your expense history
          </p>
        </div>
      </div>

      <ExpensesList
        onAddNew={handleAddNew}
        onEdit={handleEdit}
      />

      <ExpenseFormDialog
        editExpense={editExpense}
        onOpenChange={handleFormClose}
        open={isFormOpen}
      />
    </div>
  )
}