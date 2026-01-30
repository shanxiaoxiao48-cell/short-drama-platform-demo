"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

// 扩展颜色方案，每个译员使用不同颜色
const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
  '#06b6d4', '#84cc16', '#f97316', '#14b8a6', '#a855f7', '#f43f5e',
  '#0ea5e9', '#22c55e', '#eab308', '#dc2626', '#9333ea', '#db2777',
  '#0284c7', '#16a34a', '#ca8a04', '#b91c1c', '#7c3aed', '#be123c',
  '#0369a1', '#15803d', '#a16207', '#991b1b', '#6d28d9', '#9f1239'
]

interface TranslatorRatingChartProps {
  onTranslatorClick?: (translatorName: string) => void
}

// Mock数据：译员评分分布
const mockRatingData = [
  { name: "张译员", rating: 4.8, tasks: 156, category: "A级" },
  { name: "李译员", rating: 4.6, tasks: 142, category: "A级" },
  { name: "王译员", rating: 4.5, tasks: 128, category: "A级" },
  { name: "赵译员", rating: 4.2, tasks: 98, category: "B级" },
  { name: "刘译员", rating: 4.0, tasks: 87, category: "B级" },
  { name: "陈译员", rating: 3.8, tasks: 76, category: "B级" },
  { name: "杨译员", rating: 3.5, tasks: 54, category: "C级" },
  { name: "周译员", rating: 3.2, tasks: 42, category: "C级" },
]

// 自定义Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        <p className="font-semibold text-sm mb-1">{data.name}</p>
        <p className="text-xs text-muted-foreground">评分：{data.rating.toFixed(1)} 分</p>
        <p className="text-xs text-muted-foreground">完成任务：{data.tasks} 个</p>
        <p className="text-xs text-muted-foreground">等级：{data.category}</p>
      </div>
    )
  }
  return null
}

export function TranslatorRatingChart({ onTranslatorClick }: TranslatorRatingChartProps) {
  const chartData = useMemo(() => mockRatingData, [])
  // 使用固定的浅色文字颜色
  const textColor = "#e5e7eb" // 浅灰色，适合深色背景

  const handleBarClick = (data: any) => {
    if (onTranslatorClick && data) {
      onTranslatorClick(data.name)
    }
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="name"
          tick={{ fill: textColor, fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          domain={[0, 5]}
          ticks={[0, 1, 2, 3, 4, 5]}
          tick={{ fill: textColor, fontSize: 11 }}
          label={{
            value: "评分",
            angle: -90,
            position: "insideLeft",
            style: { fill: textColor, fontSize: 11 },
          }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.1)" }} />
        <Bar
          dataKey="rating"
          radius={[4, 4, 0, 0]}
          onClick={handleBarClick}
          cursor="pointer"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
