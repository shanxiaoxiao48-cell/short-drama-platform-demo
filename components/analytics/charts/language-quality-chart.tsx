"use client"

import { useMemo } from "react"
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

interface LanguageQualityChartProps {
  dateRange: string
  selectedDrama?: string
  selectedLanguage?: string
}

// 语种固定配色
const LANGUAGE_COLORS = {
  "英文": "#3b82f6",    // 蓝色
  "西语": "#f97316",    // 橙色
  "泰语": "#a855f7",    // 紫色
  "印尼语": "#22c55e",  // 绿色
}

// Mock数据生成函数
function generateMockData() {
  // 4个指标轴
  const indicators = [
    { indicator: "省效修改率", fullMark: 30, baseline: 20 },
    { indicator: "自修率", fullMark: 20, baseline: 10 },
    { indicator: "按时完成率", fullMark: 100, baseline: 90 },
    { indicator: "标准化评分", fullMark: 10, baseline: 8 },
  ]

  // 4个语种的数据
  const languages = {
    "英文": [12, 8, 95, 8.5],
    "西语": [15, 9, 92, 8.2],
    "泰语": [22, 12, 88, 7.5],
    "印尼语": [18, 10, 90, 7.8],
  }

  return indicators.map((ind, index) => {
    const dataPoint: any = {
      indicator: ind.indicator,
      fullMark: ind.fullMark,
      baseline: ind.baseline,
    }
    
    Object.entries(languages).forEach(([lang, values]) => {
      dataPoint[lang] = values[index]
    })
    
    return dataPoint
  })
}

// 自定义Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const indicator = payload[0].payload.indicator
    const baseline = payload[0].payload.baseline

    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold mb-2">{indicator}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}：<span className="font-semibold">{entry.value}</span>
              {indicator.includes("率") && !indicator.includes("评分") ? "‰" : 
               indicator.includes("完成率") ? "%" : "分"}
            </p>
          ))}
          <p className="text-muted-foreground border-t border-border pt-1 mt-1">
            基准线：{baseline}
            {indicator.includes("率") && !indicator.includes("评分") ? "‰" : 
             indicator.includes("完成率") ? "%" : "分"}
          </p>
        </div>
      </div>
    )
  }
  return null
}

export function LanguageQualityChart({
  dateRange,
  selectedDrama,
  selectedLanguage,
}: LanguageQualityChartProps) {
  const data = useMemo(() => generateMockData(), [])

  // 点击事件处理
  const handleClick = (data: any) => {
    if (data && data.payload) {
      const indicator = data.payload.indicator
      alert(`功能开发中\n\n点击穿透至：\n指标：${indicator}\n查看各语种在该指标下的详细数据`)
    }
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart 
        data={data} 
        margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="indicator"
          tick={{ fontSize: 11, fill: "#6b7280" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, "auto"]}
          tick={{ fontSize: 10, fill: "#9ca3af" }}
        />
        
        {/* 基准圈 - 灰色虚线 */}
        <Radar
          name="基准线"
          dataKey="baseline"
          stroke="#9ca3af"
          fill="#9ca3af"
          fillOpacity={0.1}
          strokeDasharray="5 5"
          strokeWidth={1}
        />
        
        {/* 英文 - 蓝色 */}
        <Radar
          name="英文"
          dataKey="英文"
          stroke={LANGUAGE_COLORS["英文"]}
          fill={LANGUAGE_COLORS["英文"]}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        
        {/* 西语 - 橙色 */}
        <Radar
          name="西语"
          dataKey="西语"
          stroke={LANGUAGE_COLORS["西语"]}
          fill={LANGUAGE_COLORS["西语"]}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        
        {/* 泰语 - 紫色 */}
        <Radar
          name="泰语"
          dataKey="泰语"
          stroke={LANGUAGE_COLORS["泰语"]}
          fill={LANGUAGE_COLORS["泰语"]}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        
        {/* 印尼语 - 绿色 */}
        <Radar
          name="印尼语"
          dataKey="印尼语"
          stroke={LANGUAGE_COLORS["印尼语"]}
          fill={LANGUAGE_COLORS["印尼语"]}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "hsl(var(--foreground))" }}
          iconType="circle"
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
