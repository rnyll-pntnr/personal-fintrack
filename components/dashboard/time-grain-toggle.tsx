'use client'

import * as React from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Label } from '@/components/ui/label'
import { TimeGrain } from '@/types/database'
import { TIME_GRAIN_OPTIONS } from '@/lib/constants'

interface TimeGrainToggleProps {
  value: TimeGrain
  onChange: (value: TimeGrain) => void
}

export function TimeGrainToggle({ value, onChange }: TimeGrainToggleProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
      <Label className="text-xs sm:text-sm text-muted-foreground w-full sm:w-auto">
        View by:
      </Label>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(val) => val && onChange(val as TimeGrain)}
        className="border rounded-lg p-0.5 w-full sm:w-auto"
      >
        {TIME_GRAIN_OPTIONS.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="px-3 sm:px-4 py-2 sm:py-1 text-xs sm:text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex-1 sm:flex-none"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}