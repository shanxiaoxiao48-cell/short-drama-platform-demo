"use client"

import { useMemo } from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

interface TaskStatusChartProps {
  dateRange: string
  selectedDrama?: string
  selectedLanguage?: string
  onStatusClick?: (status: string) => void
}

// 5个状态的固定配色
const STATUS_COLORS = {
  "已完成": "#22c55e",      // 深绿
  "成片压制": "#86efac",    // 浅绿
  "审核质检": "#38bdf8",    // 天蓝
  "人工翻译": "#3b82f6",    // 深蓝
  "AI翻译": "#a855f7",      // 紫色
}

// Mock数据生成函数
function generateMockData() {
  return [
    { status: "已完成", count: 180, color: STATUS_COLORS["已完成"] },
    { status: "成片压制", count: 25, color: STATUS_COLORS["成片压制"] },
    { status: "审核质检", count: 15, color: STATUS_COLORS["审核质检"] },
    { status: "人工翻译", count: 32, color: STATUS_COLORS["人工翻译"] },
    { status: "AI翻译", count: 12, color: STATUS_COLORS["AI翻译"] },
  ]
}

// 自定义Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    const total = payload[0].payload.total || 264
    const percentage = ((data.value / total) * 100).toFixed(1)

    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold mb-2" style={{ color: data.payload.color }}>
          {data.name}
        </p>
        <div className="space-y-1">
          <p>
            任务数：<span className="font-semibold">{data.value}</span> 单
          </p>
          <p>
            占比：<span className="font-semibold">{percentage}%</span>
          </p>
          <p className="text-muted-foreground text-[10px] mt-2">
            点击可跳转至数据列表
          </p>
        </div>
      </div>
    )
  }
  return null
}

// 自定义Label - 显示百分比
const renderLabel = (entry: any) => {
  const total = 264 // 总数
  const percentage = ((entry.value / total) * 100).toFixed(0)
  return `${percentage}%`
}

export function TaskStatusChart({
  dateRange,
  selectedDrama,
  selectedLanguage,
  onStatusClick,
}: TaskStatusChartProps) {
  const data = useMemo(() => {
    const mockData = generateMockData()
    const total = mockData.reduce((sum, item) => sum + item.count, 0)
    return mockData.map(item => ({ ...item, total }))
  }, [])

  // 点击事件处理
  const handleClick = (data: any) => {
    if (data && onStatusClick) {
      onStatusClick(data.status)
    }
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
          nameKey="status"
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ fontSize: 12 }}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
