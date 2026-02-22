'use client'

import * as React from 'react'
import { Plus, Edit, Trash2, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/use-categories'
import { Category } from '@/types/database'
import { CATEGORY_COLORS } from '@/lib/constants'

const ICON_OPTIONS = [
  { value: 'Utensils', label: '🍴 Utensils' },
  { value: 'Car', label: '🚗 Car' },
  { value: 'Zap', label: '⚡ Zap' },
  { value: 'Film', label: '🎥 Film' },
  { value: 'ShoppingBag', label: '🛍️ Shopping Bag' },
  { value: 'Heart', label: '❤️ Heart' },
  { value: 'GraduationCap', label: '🎓 Graduation Cap' },
  { value: 'Home', label: '🏠 Home' },
  { value: 'Sparkles', label: '✨ Sparkles' },
  { value: 'MoreHorizontal', label: '⋯ More' },
  { value: 'Briefcase', label: '💼 Briefcase' },
  { value: 'Laptop', label: '💻 Laptop' },
  { value: 'TrendingUp', label: '📈 Trending Up' },
]

interface CategoryManagementProps {
  type: 'expense' | 'income'
}

export function CategoryManagement({ type }: CategoryManagementProps) {
  const { data: categories, isLoading } = useCategories(type)
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<string | null>(null)

  const [formData, setFormData] = React.useState({
    name: '',
    color: CATEGORY_COLORS[0].color,
    icon_name: ICON_OPTIONS[0].value,
    type: type,
  })

  React.useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        color: editingCategory.color,
        icon_name: editingCategory.icon_name || ICON_OPTIONS[0].value,
        type: type,
      })
    } else {
      setFormData({
        name: '',
        color: CATEGORY_COLORS[0].color,
        icon_name: ICON_OPTIONS[0].value,
        type: type,
      })
    }
  }, [editingCategory, type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          updates: formData,
        })
      } else {
        await createCategory.mutateAsync(formData)
      }
      
      setIsDialogOpen(false)
      setEditingCategory(null)
    } catch (error) {
      console.error('Failed to save category:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id)
      setDeleteDialogOpen(null)
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingCategory(null)
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 w-full bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold capitalize">{type} Categories</h3>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-3">
        {categories?.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: category.color }}
              >
                <span className="text-white text-xs">
                  {(() => {
                    const iconMap: Record<string, string> = {
                      Utensils: '🍴',
                      Car: '🚗',
                      Zap: '⚡',
                      Film: '🎥',
                      ShoppingBag: '🛍️',
                      Heart: '❤️',
                      GraduationCap: '🎓',
                      Home: '🏠',
                      Sparkles: '✨',
                      MoreHorizontal: '⋯',
                      Briefcase: '💼',
                      Laptop: '💻',
                      TrendingUp: '📈',
                    }
                    return iconMap[category.icon_name || 'MoreHorizontal'] || '📦'
                  })()}
                </span>
              </div>
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-sm text-muted-foreground">{category.type}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(category)}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteDialogOpen(category.id)}
                className="h-8 w-8 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {(!categories || categories.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            No {type} categories found. Click &quot;Add Category&quot; to create one.
          </div>
        )}
      </div>

      {/* Category Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Update category details'
                : 'Create a new category for your transactions'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category name"
                disabled={createCategory.isPending || updateCategory.isPending}
              />
            </div>

            <div>
              <Label htmlFor="icon">Icon</Label>
              <Select
                value={formData.icon_name}
                onValueChange={(value) => setFormData({ ...formData, icon_name: value })}
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORY_COLORS.map((colorOption) => (
                  <Button
                    key={colorOption.value}
                    type="button"
                    variant={formData.color === colorOption.color ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, color: colorOption.color })}
                    className="relative p-2 h-10"
                    disabled={createCategory.isPending || updateCategory.isPending}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colorOption.color }}
                    />
                    {formData.color === colorOption.color && (
                      <Check className="absolute top-1 right-1 h-3 w-3" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {createCategory.isPending || updateCategory.isPending
                  ? 'Saving...'
                  : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This will remove the category
              from all existing transactions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(null)}
              disabled={deleteCategory.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteDialogOpen && handleDelete(deleteDialogOpen)}
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}