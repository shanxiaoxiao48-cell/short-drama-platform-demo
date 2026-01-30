"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

// 扩展颜色方案，支持20+种语言
const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
  '#06b6d4', '#84cc16', '#f97316', '#14b8a6', '#a855f7', '#f43f5e',
  '#0ea5e9', '#22c55e', '#eab308', '#dc2626', '#9333ea', '#db2777',
  '#0284c7', '#16a34a', '#ca8a04', '#b91c1c', '#7c3aed', '#be123c',
  '#0369a1', '#15803d', '#a16207', '#991b1b', '#6d28d9', '#9f1239'
]

interface LanguageDistributionChartProps {
  data: Array<{
    language: string
    count: number
    percentage: number
  }>
}

// 自定义Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
        <p className="font-semibold text-sm mb-1">{data.language}</p>
        <p className="text-xs text-muted-foreground">任务数：{data.count} 个</p>
        <p className="text-xs text-muted-foreground">占比：{data.percentage}%</p>
      </div>
    )
  }
  return null
}

export function LanguageDistributionChart({ data }: LanguageDistributionChartProps) {
  // 使用固定的浅色文字颜色
  const textColor = "#e5e7eb" // 浅灰色，适合深色背景
  
  // 按任务数排序，取前10个语种
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 10)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={sortedData}
        margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="language"
          tick={{ fill: textColor, fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          tick={{ fill: textColor, fontSize: 11 }}
          label={{
            value: "任务数",
            angle: -90,
            position: "insideLeft",
            style: { fill: textColor, fontSize: 11 },
          }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.1)" }} />
        <Bar
          dataKey="count"
          radius={[4, 4, 0, 0]}
        >
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
