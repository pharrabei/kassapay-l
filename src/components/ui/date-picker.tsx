"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({
  value,
  onChange,
  placeholder,
  className,
}: {
  value?: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}) {
  const date = value ? parseISO(value) : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className={
            className ??
            "h-10 w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
          }
        >
          <CalendarIcon className="size-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(nextDate) =>
            onChange(nextDate ? format(nextDate, "yyyy-MM-dd") : "")
          }
        />
      </PopoverContent>
    </Popover>
  )
}
