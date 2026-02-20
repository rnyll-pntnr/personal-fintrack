'use client'

import * as React from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
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
import { IncomeWithCategory } from '@/types/database'
import { formatCurrency } from '@/lib/currency'
import { formatDate } from '@/lib/date-utils'


interface IncomeCardProps {
  item: IncomeWithCategory
  onEdit: (item: IncomeWithCategory) => void
  onDelete: (id: string) => void
  currency: string
}

export function IncomeCard({
  item,
  onEdit,
  onDelete,
  currency,
}: IncomeCardProps) {
  return (
    <Card className="relative overflow-hidden">
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: item.category?.color || '#3b82f6' }}
      />
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold line-clamp-1">
            {item.description || 'Income'}
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
          <span className="text-2xl font-bold text-green-600">
            +{formatCurrency(item.amount, currency)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <CategoryBadge category={item.category} />
          <Badge variant="secondary" className="text-xs">
            {formatDate(item.date)}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {item.category?.name || 'Uncategorized'}
        </span>
      </CardFooter>
    </Card>
  )
}
