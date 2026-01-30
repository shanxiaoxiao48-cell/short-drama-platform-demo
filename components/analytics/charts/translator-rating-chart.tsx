"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"

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

// 根据评分获取颜色
const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return "hsl(var(--chart-1))" // A级 - 绿色
  if (rating >= 4.0) return "hsl(var(--chart-2))" // B级 - 蓝色
  if (rating >= 3.5) return "hsl(var(--chart-3))" // C级 - 黄色
  return "hsl(var(--chart-4))" // D级 - 红色
}

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

  const handleBarClick = (data: any) => {
    if (onTranslatorClick && data) {
      onTranslatorClick(data.name)
    }
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="name"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          domain={[0, 5]}
          ticks={[0, 1, 2, 3, 4, 5]}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          label={{
            value: "评分",
            angle: -90,
            position: "insideLeft",
            style: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
          }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.1)" }} />
        <Legend
          wrapperStyle={{ fontSize: "11px" }}
          formatter={(value) => {
            if (value === "rating") return "译员评分"
            return value
          }}
        />
        <Bar
          dataKey="rating"
          radius={[4, 4, 0, 0]}
          onClick={handleBarClick}
          cursor="pointer"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getRatingColor(entry.rating)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
