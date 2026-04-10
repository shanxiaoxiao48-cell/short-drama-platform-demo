"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  ComposedChart,
} from "recharts"

interface TranslatorComparisonChartProps {
  dateRange: string
  selectedDrama?: string
  selectedLanguage?: string
  onTranslatorClick?: (translatorName: string) => void
}

// Mock数据生成函数 - TOP10译员
function generateMockData() {
  const translators = [
    { name: "王五", duration: 5200, modificationRate: 9.8 },
    { name: "张三", duration: 4800, modificationRate: 12.5 },
    { name: "钱七", duration: 4200, modificationRate: 8.5 },
    { name: "赵六", duration: 3800, modificationRate: 11.2 },
    { name: "李四", duration: 3600, modificationRate: 18.2 },
    { name: "孙八", duration: 3200, modificationRate: 15.6 },
    { name: "周九", duration: 2800, modificationRate: 22.3 },
    { name: "吴十", duration: 2400, modificationRate: 19.8 },
    { name: "郑十一", duration: 2100, modificationRate: 16.5 },
    { name: "陈十二", duration: 1800, modificationRate: 24.1 },
  ]

  return translators.map(t => ({
    ...t,
    baseline: 20, // 修改率基准线 20‰
  }))
}

// 自定义Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const duration = payload.find((p: any) => p.dataKey === "duration")?.value || 0
    const modificationRate = payload.find((p: any) => p.dataKey === "modificationRate")?.value || 0
    const baseline = 20
    const isOverBaseline = modificationRate > baseline
    const isGood = modificationRate < baseline

    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-blue-600">
            翻译时长：<span className="font-semibold">{duration}</span> 分钟
          </p>
          <p className={isOverBaseline ? "text-red-600" : isGood ? "text-green-600" : "text-orange-600"}>
            修改率：<span className="font-semibold">{modificationRate}‰</span>
          </p>
          <p className="text-muted-foreground">
            基准线：{baseline}‰（越低越好）
          </p>
          {isOverBaseline && (
            <p className="text-red-600 font-semibold">
              ⚠️ 超基准 {(modificationRate - baseline).toFixed(1)}‰
            </p>
          )}
          {isGood && (
            <p className="text-green-600 font-semibold">
              ✓ 优于基准 {(baseline - modificationRate).toFixed(1)}‰
            </p>
          )}
          <p className="text-muted-foreground text-[10px] mt-2">
            点击可跳转至译员信息列表
          </p>
        </div>
      </div>
    )
  }
  return null
}

// 自定义柱状标签
const renderBarLabel = (props: any) => {
  const { x, y, width, value } = props
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="#6b7280"
      textAnchor="middle"
      fontSize={10}
    >
      {value}
    </text>
  )
}

// 自定义折线点 - 超基准标红，低于基准标绿
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props
  const isOverBaseline = payload.modificationRate > payload.baseline
  const isGood = payload.modificationRate < payload.baseline
  
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={isOverBaseline ? "#ef4444" : isGood ? "#22c55e" : "#f97316"}
      stroke="#fff"
      strokeWidth={2}
    />
  )
}

export function TranslatorComparisonChart({
  dateRange,
  selectedDrama,
  selectedLanguage,
  onTranslatorClick,
}: TranslatorComparisonChartProps) {
  const data = useMemo(() => generateMockData(), [])

  // 点击事件处理
  const handleClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedData = data.activePayload[0].payload
      if (onTranslatorClick) {
        onTranslatorClick(clickedData.name)
      }
    }
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart 
        data={data} 
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          stroke="#6b7280"
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11 }}
          stroke="#3b82f6"
          label={{ value: "翻译时长(分钟)", angle: -90, position: "insideLeft", style: { fontSize: 11 } }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 11 }}
          stroke="#f97316"
          label={{ value: "修改率(‰)", angle: 90, position: "insideRight", style: { fontSize: 11 } }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "hsl(var(--foreground))" }}
        />
        
        {/* 修改率基准线 */}
        <ReferenceLine
          yAxisId="right"
          y={20}
          stroke="#ef4444"
          strokeDasharray="5 5"
          label={{ value: "基准线(20‰)", position: "right", fontSize: 10, fill: "#ef4444" }}
        />
        
        {/* 翻译时长 - 蓝色柱状 */}
        <Bar
          yAxisId="left"
          dataKey="duration"
          fill="#3b82f6"
          name="翻译时长"
          label={renderBarLabel}
          radius={[4, 4, 0, 0]}
        />
        
        {/* 修改率 - 橙色折线 */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="modificationRate"
          stroke="#f97316"
          strokeWidth={2}
          name="修改率"
          dot={<CustomDot />}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
