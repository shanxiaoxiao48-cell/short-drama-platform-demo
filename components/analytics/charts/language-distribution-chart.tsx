"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

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

// 自定义标签渲染函数 - 带引导线
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  language,
  percentage,
}: any) => {
  const RADIAN = Math.PI / 180
  // 引导线起点（饼图外边缘）
  const radius = outerRadius + 10
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  
  // 引导线终点（标签位置）
  const labelRadius = outerRadius + 35
  const labelX = cx + labelRadius * Math.cos(-midAngle * RADIAN)
  const labelY = cy + labelRadius * Math.sin(-midAngle * RADIAN)
  
  // 文字对齐方式
  const textAnchor = labelX > cx ? 'start' : 'end'
  
  return (
    <g>
      {/* 引导线 */}
      <path
        d={`M ${x},${y} L ${labelX},${labelY}`}
        stroke="hsl(var(--muted-foreground))"
        strokeWidth={1}
        fill="none"
      />
      {/* 标签文字 */}
      <text
        x={labelX}
        y={labelY}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fill="hsl(var(--foreground))"
        fontSize={11}
        fontWeight={500}
      >
        {language} {percentage}%
      </text>
    </g>
  )
}

export function LanguageDistributionChart({ data }: LanguageDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          paddingAngle={2}
          dataKey="count"
          label={renderCustomLabel}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
