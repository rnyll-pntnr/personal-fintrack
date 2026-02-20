"use client";

import * as React from "react";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { IncomeExpensesChart } from "@/components/dashboard/income-expenses-chart";
import { RecentExpensesTable } from "@/components/dashboard/recent-expenses-table";
import { TimeGrainToggle } from "@/components/dashboard/time-grain-toggle";
import { RecurringChecklist } from "@/components/dashboard/recurring-checklist";
import { RecurringFormDialog } from "@/components/recurring/recurring-form-dialog";
import { ExpenseFormDialog } from "@/components/expenses/expense-form-dialog";
import { TimeGrain } from "@/types/database";
import { ExpenseWithCategory, RecurringItemWithCategory } from "@/types/database";

export default function DashboardPage() {
  const [timeGrain, setTimeGrain] = React.useState<TimeGrain>("month");
  const [showAddExpenseDialog, setShowAddExpenseDialog] = React.useState(false);
  const [editingExpense, setEditingExpense] =
    React.useState<ExpenseWithCategory | null>(null);
  const [showRecurringDialog, setShowRecurringDialog] = React.useState(false);
  const [editingRecurring, setEditingRecurring] =
    React.useState<RecurringItemWithCategory | null>(null);

  const handleEditExpense = (expense: ExpenseWithCategory) => {
    setEditingExpense(expense);
    setShowAddExpenseDialog(true);
  };

  const handleAddRecurring = () => {
    setEditingRecurring(null);
    setShowRecurringDialog(true);
  };

  const handleEditRecurring = (item: RecurringItemWithCategory) => {
    setEditingRecurring(item);
    setShowRecurringDialog(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Time Grain Toggle - Full width on mobile, right-aligned on desktop */}
      <div className="flex justify-end">
        <TimeGrainToggle value={timeGrain} onChange={setTimeGrain} />
      </div>

      {/* Summary Cards */}
      <SummaryCards timeGrain={timeGrain} />

      {/* Smart Recurring Checklist */}
      <RecurringChecklist 
        onAddNew={handleAddRecurring}
        onEdit={handleEditRecurring}
      />

      {/* Charts - Stack on mobile, 2 columns on desktop */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <SpendingChart timeGrain={timeGrain} />
        <IncomeExpensesChart timeGrain={timeGrain} />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        {/* Category Distribution */}
        <CategoryPieChart timeGrain={timeGrain} />
        {/* Recent Expenses Table */}
        <RecentExpensesTable onEdit={handleEditExpense} />
      </div>

      {/* Dialogs */}
      <ExpenseFormDialog
        open={showAddExpenseDialog}
        onOpenChange={setShowAddExpenseDialog}
        editExpense={editingExpense}
      />
      <RecurringFormDialog
        open={showRecurringDialog}
        onOpenChange={setShowRecurringDialog}
        editItem={editingRecurring}
      />
    </div>
  );
}
