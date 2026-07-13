"use client"

import * as React from "react"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CalendarProps = {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
}

const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

export function Calendar({
  selected,
  onSelect,
  className,
}: CalendarProps) {
  const [viewDate, setViewDate] = React.useState(selected ?? new Date())
  const monthStart = startOfMonth(viewDate)
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 }),
  })

  return (
    <div className={cn("w-72 p-3", className)}>
      <div className="mb-3 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setViewDate((current) => subMonths(current, 1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="text-sm font-medium text-foreground">
          {format(viewDate, "LLLL yyyy")}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setViewDate((current) => addMonths(current, 1))}
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
        {weekDays.map((day) => (
          <div key={day} className="h-7 leading-7">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = selected ? isSameDay(day, selected) : false
          const isMuted = !isSameMonth(day, viewDate)

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelect?.(day)}
              className={cn(
                "flex size-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-muted",
                isMuted && "text-muted-foreground/45",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary"
              )}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}
