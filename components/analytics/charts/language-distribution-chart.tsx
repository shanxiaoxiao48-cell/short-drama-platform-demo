"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

interface LanguageDistributionChartProps {
  data: Array<{
    language: string
    count: number
    percentage: number
  }>
}

export function LanguageDistributionChart({ data }: LanguageDistributionChartProps) {
  return (
    <>
      <ResponsiveContainer width="100%" height="60%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ language, percentage }) => `${language} ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={item.language} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span>{item.language}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">{item.count} 个任务</span>
              <span className="font-medium">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
