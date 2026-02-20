'use client'

import * as React from 'react'
import { Check, MoreVertical, Pencil, Trash2, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CategoryBadge } from '@/components/shared/category-badge'
import { RecurringItemWithCategory } from '@/types/database'
import { formatCurrency } from '@/lib/currency'
import { getRelativeTime } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

interface RecurringCardProps {
  item: RecurringItemWithCategory
  isPending: boolean
  onMarkAsPaid: (id: string) => void
  onEdit: (item: RecurringItemWithCategory) => void
  onDelete: (id: string) => void
  isProcessing?: boolean
  currency: string
}

const frequencyColors: Record<string, string> = {
  weekly: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  monthly: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  yearly: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
}

export function RecurringCard({
  item,
  isPending,
  onMarkAsPaid,
  onEdit,
  onDelete,
  isProcessing,
  currency,
}: RecurringCardProps) {
  const dueText = getRelativeTime(item.next_due_at)

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-200',
      !isPending && 'opacity-75 bg-muted/30'
    )}>
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ 
          backgroundColor: isPending 
            ? (item.category?.color || '#6b7280') 
            : '#10b981' // Green for paid items
        }}
      />
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold line-clamp-1">
            {item.name}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(item.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">
            {formatCurrency(item.amount, currency)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className={cn('text-xs', frequencyColors[item.frequency])}>
            {item.frequency}
          </Badge>
          <CategoryBadge category={item.category} />
          {!isPending && (
            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
              Paid
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Due: {dueText}
        </span>
        {isPending ? (
          <Button
            size="sm"
            onClick={() => onMarkAsPaid(item.id)}
            disabled={isProcessing}
            className="gap-1"
          >
            <Check className="h-3.5 w-3.5" />
            Mark as Paid
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            disabled={true}
            className="gap-1 bg-green-500/20 text-green-600 hover:bg-green-500/30 border-green-500/30"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Paid
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
