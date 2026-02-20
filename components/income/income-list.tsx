'use client'

import * as React from 'react'
import { Search, Plus, ArrowUpDown, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { CategoryBadge } from '@/components/shared/category-badge'
import { useIncomes, useDeleteIncome } from '@/hooks/use-income'
import { useCategories } from '@/hooks/use-categories'

import { formatCurrency } from '@/lib/currency'
import { formatDate } from '@/lib/date-utils'
import { IncomeWithCategory } from '@/types/database'

interface IncomeListProps {
  onAddNew: () => void
  onEdit: (item: IncomeWithCategory) => void
}

export function IncomeList({ onAddNew, onEdit }: IncomeListProps) {

  const [searchQuery, setSearchQuery] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState('all')
  const [sortBy, setSortBy] = React.useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  const { data: incomeData, isLoading } = useIncomes({
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  })
  const { data: categories } = useCategories('income')
  const deleteIncome = useDeleteIncome()

  const incomeItems = incomeData?.data || []
  const totalIncomeItems = incomeData?.count || 0
  const totalPages = Math.ceil(totalIncomeItems / itemsPerPage)



  // Filter and sort income items
  const filteredIncomeItems = React.useMemo(() => {
    if (!incomeItems) return []
    
    return incomeItems
      .filter(item => {
        const matchesSearch = !searchQuery || 
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.category?.name && item.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
        
        const matchesCategory = categoryFilter === 'all' || item.category_id === categoryFilter
        
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
        } else {
          const amountA = a.amount
          const amountB = b.amount
          return sortOrder === 'asc' ? amountA - amountB : amountB - amountA
        }
      })
  }, [incomeItems, searchQuery, categoryFilter, sortBy, sortOrder])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this income?')) {
      await deleteIncome.mutateAsync(id)
    }
  }

  const toggleSort = (column: 'date' | 'amount') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-xl">Income</CardTitle>
          <Button onClick={onAddNew} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Income
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search income..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table - Responsive for mobile */}
        <div className="border rounded-lg overflow-hidden">
          {/* Desktop view */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-[120px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort('date')}
                      className="h-8 p-0 hover:bg-transparent"
                    >
                      Date
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Category</TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort('amount')}
                      className="h-8 p-0 hover:bg-transparent"
                    >
                      Amount
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncomeItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      No income records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIncomeItems.map(item => (
                    <TableRow key={item.id} className="group">
                      <TableCell className="text-left">
                        {item.category ? (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: `${item.category.color}20`,
                              color: item.category.color,
                            }}
                          >
                            {(() => {
                              const iconMap = {
                                Briefcase: '💼',
                                Laptop: '💻',
                                TrendingUp: '📈',
                                Zap: '⚡',
                                Home: '🏠',
                                DollarSign: '💵',
                                Banknote: '💴',
                                Gift: '🎁',
                                ArrowDownToLine: '⬇️',
                                MoreHorizontal: '⋯',
                              }
                              return iconMap[item.category.icon_name as keyof typeof iconMap] || '📦'
                            })()}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            ⋯
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(item.date)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.description || 'No description'}
                      </TableCell>
                      <TableCell className="text-center">
                        <CategoryBadge category={item.category} />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.amount, item.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
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
            {filteredIncomeItems.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-center text-muted-foreground">
                No income records found
              </div>
            ) : (
              filteredIncomeItems.map(item => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      {item.category ? (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${item.category.color}20`,
                            color: item.category.color,
                          }}
                        >
                          {(() => {
                            const iconMap = {
                              Briefcase: '💼',
                              Laptop: '💻',
                              TrendingUp: '📈',
                              Zap: '⚡',
                              Home: '🏠',
                              DollarSign: '💵',
                              Banknote: '💴',
                              Gift: '🎁',
                              ArrowDownToLine: '⬇️',
                              MoreHorizontal: '⋯',
                            }
                            return iconMap[item.category.icon_name as keyof typeof iconMap] || '📦'
                          })()}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          ⋯
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.description || 'No description'}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(item.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.amount, item.currency)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <CategoryBadge category={item.category} />
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
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
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <div className="text-center mt-2 text-sm text-muted-foreground mx-4">
              Page {currentPage} of {totalPages}
            </div>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1)
                    }
                  }}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              
              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage(page)
                    }}
                    isActive={page === currentPage}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1)
                    }
                  }}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </Card>
  )
}
