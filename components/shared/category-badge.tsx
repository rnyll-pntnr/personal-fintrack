'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Category } from '@/types/database'
import { cn } from '@/lib/utils'
import {
  Utensils,
  Car,
  Zap,
  Film,
  ShoppingBag,
  Heart,
  GraduationCap,
  Home,
  Sparkles,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  ArrowDownToLine,
  DollarSign,
  Banknote,
} from 'lucide-react'

interface CategoryBadgeProps {
  category: Category | null
  className?: string
}

// Map icon names to Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Utensils,
  Car,
  Zap,
  Film,
  ShoppingBag,
  Heart,
  GraduationCap,
  Home,
  Sparkles,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  ArrowDownToLine,
  DollarSign,
  Banknote,
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  if (!category) {
    return (
      <Badge variant="secondary"
        className={cn('text-xs flex items-center gap-1', className)}>
        <MoreHorizontal className="h-3 w-3" />
        Uncategorized
      </Badge>
    )
  }

  const Icon = iconMap[category.icon_name || 'MoreHorizontal']

  return (
    <Badge
      variant="secondary"
      className={cn('text-xs flex items-center gap-1', className)}
      style={{
        backgroundColor: `${category.color}20`,
        color: category.color,
        borderColor: category.color,
      }}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {category.name}
    </Badge>
  )
}
