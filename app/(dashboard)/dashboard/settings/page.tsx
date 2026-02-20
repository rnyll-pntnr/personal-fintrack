'use client'

import * as React from 'react'
import { Moon, Sun, Check, CreditCard, Settings } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProfile, useUpdateThemePreference, useUpdateCurrency } from '@/hooks/use-user'
import { useThemeAccent } from '@/context/theme-context'
import { THEME_ACCENTS, CURRENCIES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { CategoryManagement } from '@/components/settings/category-management'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { accent, setAccent } = useThemeAccent()
  const { data: profile, isLoading } = useProfile()
  const updateThemePreference = useUpdateThemePreference()
  const updateCurrency = useUpdateCurrency()

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme)
  }

  const handleAccentChange = async (newAccent: 'blue' | 'emerald' | 'violet' | 'rose') => {
    // Update UI immediately (optimistic update)
    setAccent(newAccent)
    // Update database
    await updateThemePreference.mutateAsync(newAccent)
  }

  const handleCurrencyChange = async (newCurrency: string) => {
    await updateCurrency.mutateAsync(newCurrency)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how FinTrack looks for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Mode */}
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleThemeChange('light')}
                      className="flex-1"
                    >
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleThemeChange('dark')}
                      className="flex-1"
                    >
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleThemeChange('system')}
                      className="flex-1"
                    >
                      System
                    </Button>
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {THEME_ACCENTS.map((themeAccent) => (
                      <Button
                        key={themeAccent.value}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAccentChange(themeAccent.value)}
                        className={cn(
                          'relative flex flex-col items-center gap-1 h-auto py-2',
                          accent === themeAccent.value && 'ring-2 ring-primary'
                        )}
                      >
                        <div
                          className={cn('w-6 h-6 rounded-full', themeAccent.previewClass)}
                        />
                        <span className="text-xs">{themeAccent.label}</span>
                        {accent === themeAccent.value && (
                          <Check className="absolute top-1 right-1 h-3 w-3" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Currency */}
            <Card>
              <CardHeader>
                <CardTitle>Currency</CardTitle>
                <CardDescription>
                  Set your preferred currency for displaying amounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Select
                    value={profile?.currency || 'AED'}
                    onValueChange={handleCurrencyChange}
                    disabled={updateCurrency.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CURRENCIES).map(([code, info]) => (
                        <SelectItem key={code} value={code}>
                          {info.symbol} {code} - {info.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member since</p>
                    <p className="font-medium">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>
                Create, edit, and delete expense and income categories. Customize their
                colors and icons.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <CategoryManagement type="expense" />
              <CategoryManagement type="income" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}