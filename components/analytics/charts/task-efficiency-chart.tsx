"use client"

import { useMemo, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { Button } from "@/components/ui/button"

interface TaskEfficiencyChartProps {
  dateRange: string
  selectedDrama?: string
  selectedLanguage?: string
  onDateRangeClick?: (dateRange: { from: Date; to: Date }) => void
}

// Mock数据生成函数 - 以日期为维度，单位为天，以今天为基准往前推
function generateMockData(timeUnit: "day" | "week" | "month") {
  const baseline = 4 // 基准线：4天
  const today = new Date('2026-01-28')

  if (timeUnit === "day") {
    // 按天：最近30天，从今天往前推
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (29 - i))
      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        fullDate: new Date(date), // 保存完整日期用于点击事件
        completedTasks: Math.floor(Math.random() * 15) + 5, // 5-20个
        avgDuration: Math.random() * 3 + 2.5, // 2.5-5.5天
        baseline,
      }
    })
  } else if (timeUnit === "week") {
    // 按周：最近12周，从今天往前推
    return Array.from({ length: 12 }, (_, i) => {
      const weekEnd = new Date(today)
      weekEnd.setDate(today.getDate() - i * 7)
      const weekStart = new Date(weekEnd)
      weekStart.setDate(weekEnd.getDate() - 6)
      
      return {
        date: `第${12 - i}周`,
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd),
        completedTasks: Math.floor(Math.random() * 50) + 30, // 30-80个
        avgDuration: Math.random() * 2 + 3, // 3-5天
        baseline,
      }
    })
  } else {
    // 按月：最近12个月，从今天往前推
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(today)
      date.setMonth(today.getMonth() - (11 - i))
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      // 显示年月，如果不是当前年份则显示年份
      const displayDate = date.getFullYear() === today.getFullYear() 
        ? `${date.getMonth() + 1}月`
        : `${date.getFullYear()}年${date.getMonth() + 1}月`
      
      return {
        date: displayDate,
        monthStart: new Date(monthStart),
        monthEnd: new Date(monthEnd),
        completedTasks: Math.floor(Math.random() * 150) + 100, // 100-250个
        avgDuration: Math.random() * 2.5 + 2.5, // 2.5-5天
        baseline,
      }
    })
  }
}

// 自定义Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const isOverBaseline = data.avgDuration > data.baseline
    const overTime = isOverBaseline ? (data.avgDuration - data.baseline).toFixed(1) : 0

    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-blue-600">
            完成任务数：<span className="font-semibold">{data.completedTasks}</span> 个
          </p>
          <p className="text-orange-600">
            平均耗时：<span className="font-semibold">{data.avgDuration.toFixed(1)}</span> 天
          </p>
          <p className="text-muted-foreground">
            基准线：{data.baseline} 天
          </p>
          {isOverBaseline && (
            <p className="text-red-600 font-semibold">
              ⚠️ 超基准 {overTime} 天
            </p>
          )}
          <p className="text-muted-foreground text-[10px] mt-2">
            点击可跳转至短剧进度列表
          </p>
        </div>
      </div>
    )
  }
  return null
}

export function TaskEfficiencyChart({
  dateRange,
  selectedDrama,
  selectedLanguage,
  onDateRangeClick,
}: TaskEfficiencyChartProps) {
  const [timeUnit, setTimeUnit] = useState<"day" | "week" | "month">("month")
  const data = useMemo(() => generateMockData(timeUnit), [timeUnit])

  // 点击事件处理 - 使用数据中保存的日期范围
  const handleClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0 && onDateRangeClick) {
      const clickedData = data.activePayload[0].payload
      
      // 根据时间维度获取日期范围
      let from: Date
      let to: Date
      
      if (timeUnit === "day") {
        // 点击某一天，使用保存的完整日期
        from = new Date(clickedData.fullDate)
        to = new Date(clickedData.fullDate)
      } else if (timeUnit === "week") {
        // 点击某一周，使用保存的周起止日期
        from = new Date(clickedData.weekStart)
        to = new Date(clickedData.weekEnd)
      } else {
        // 点击某一月，使用保存的月起止日期
        from = new Date(clickedData.monthStart)
        to = new Date(clickedData.monthEnd)
      }
      
      onDateRangeClick({ from, to })
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 时间维度切换按钮 */}
      <div className="flex justify-end gap-2 mb-3">
        <Button
          variant={timeUnit === "day" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeUnit("day")}
          className="h-7 text-xs"
        >
          天
        </Button>
        <Button
          variant={timeUnit === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeUnit("week")}
          className="h-7 text-xs"
        >
          周
        </Button>
        <Button
          variant={timeUnit === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeUnit("month")}
          className="h-7 text-xs"
        >
          月
        </Button>
      </div>

      {/* 图表 */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            onClick={handleClick}
            style={{ cursor: "pointer" }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              stroke="#6b7280"
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11 }}
              stroke="#3b82f6"
              label={{ value: "完成任务数", angle: -90, position: "insideLeft", style: { fontSize: 11 } }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              stroke="#f97316"
              label={{ value: "平均耗时(天)", angle: 90, position: "insideRight", style: { fontSize: 11 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              iconType="line"
            />
            
            {/* 基准线 */}
            <ReferenceLine
              yAxisId="right"
              y={4}
              stroke="#9ca3af"
              strokeDasharray="5 5"
              label={{ value: "基准线(4天)", position: "right", fontSize: 10, fill: "#6b7280" }}
            />
            
            {/* 完成任务数 - 蓝色实线 */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="completedTasks"
              stroke="#3b82f6"
              strokeWidth={2}
              name="完成任务数"
              dot={{ r: 3, fill: "#3b82f6" }}
              activeDot={{ r: 5 }}
            />
            
            {/* 平均耗时 - 橙色实线 */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgDuration"
              stroke="#f97316"
              strokeWidth={2}
              name="平均耗时"
              dot={{ r: 3, fill: "#f97316" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
