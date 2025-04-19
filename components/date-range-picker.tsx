"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"

interface DateRangePickerProps {
  onDateRangeChange: (startDate: string, endDate: string) => void
}

export function DateRangePicker({ onDateRangeChange }: DateRangePickerProps) {
  const today = new Date().toISOString().split("T")[0]
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onDateRangeChange(startDate, endDate)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <div className="relative">
          <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            id="startDate"
            type="date"
            className="pl-8"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={endDate}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endDate">End Date</Label>
        <div className="relative">
          <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            id="endDate"
            type="date"
            className="pl-8"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
          />
        </div>
      </div>

      <Button type="submit">Generate Report</Button>
    </form>
  )
}
