"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { DateRange } from "react-day-picker"

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value)

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range)
    onChange?.(range)
  }

  const formatDateRange = () => {
    if (!date?.from) {
      return "选择日期范围"
    }
    if (!date.to) {
      return format(date.from, "yyyy-MM-dd", { locale: zhCN })
    }
    return `${format(date.from, "yyyy-MM-dd", { locale: zhCN })} - ${format(date.to, "yyyy-MM-dd", { locale: zhCN })}`
  }

  // 快捷选择函数
  const handleQuickSelect = (type: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    const today = new Date('2026-01-28') // 使用当前日期
    const from = new Date(today)
    const to = new Date(today)
    
    switch (type) {
      case 'today':
        // 今日：from和to都是今天
        break
      case 'week':
        // 本周：往前推7天
        from.setDate(today.getDate() - 6)
        break
      case 'month':
        // 本月：往前推30天
        from.setDate(today.getDate() - 29)
        break
      case 'quarter':
        // 本季度：往前推90天
        from.setDate(today.getDate() - 89)
        break
      case 'year':
        // 本年：往前推365天
        from.setDate(today.getDate() - 364)
        break
    }
    
    const newRange: DateRange = { from, to }
    handleSelect(newRange)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`justify-start text-left font-normal h-8 text-xs ${className}`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex flex-col">
          {/* 单个日历 */}
          <Calendar
            mode="range"
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={1}
            locale={zhCN}
            defaultMonth={new Date('2026-01-28')}
          />
          
          {/* 快捷选择按钮 */}
          <div className="flex items-center justify-center gap-2 p-3 border-t bg-muted/30">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect('today')}
              className="h-7 text-xs"
            >
              今日
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect('week')}
              className="h-7 text-xs"
            >
              本周
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect('month')}
              className="h-7 text-xs"
            >
              本月
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect('quarter')}
              className="h-7 text-xs"
            >
              本季度
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect('year')}
              className="h-7 text-xs"
            >
              本年
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
