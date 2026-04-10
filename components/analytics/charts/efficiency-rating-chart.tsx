"use client"

import { useMemo } from "react"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  ReferenceArea,
} from "recharts"

interface EfficiencyData {
  translatorId: string
  translatorName: string
  efficiencyRatio: number // 效率比 = 视频时长 / 工作时长
  rating: number // 评分
  taskCount: number // 任务数
  grade: "S" | "A" | "B" | "C" | "D" // 评级
}

interface EfficiencyRatingChartProps {
  onTranslatorClick?: (translatorName: string) => void
}

// Mock数据
const mockData: EfficiencyData[] = [
  { translatorId: "1", translatorName: "王五", efficiencyRatio: 0.25, rating: 9.2, taskCount: 18, grade: "S" },
  { translatorId: "2", translatorName: "张三", efficiencyRatio: 0.22, rating: 8.8, taskCount: 15, grade: "A" },
  { translatorId: "3", translatorName: "钱七", efficiencyRatio: 0.20, rating: 8.5, taskCount: 12, grade: "A" },
  { translatorId: "4", translatorName: "李四", efficiencyRatio: 0.18, rating: 8.2, taskCount: 14, grade: "B" },
  { translatorId: "5", translatorName: "赵六", efficiencyRatio: 0.15, rating: 7.8, taskCount: 10, grade: "B" },
  { translatorId: "6", translatorName: "孙八", efficiencyRatio: 0.23, rating: 8.6, taskCount: 13, grade: "A" },
  { translatorId: "7", translatorName: "周九", efficiencyRatio: 0.16, rating: 7.5, taskCount: 9, grade: "C" },
  { translatorId: "8", translatorName: "吴十", efficiencyRatio: 0.19, rating: 8.3, taskCount: 11, grade: "B" },
]

// 评级颜色映射
const gradeColors: Record<string, string> = {
  S: "#10b981", // emerald-500
  A: "#3b82f6", // blue-500
  B: "#f59e0b", // amber-500
  C: "#ef4444", // red-500
  D: "#6b7280", // gray-500
}

// 四象限背景颜色（更明显的颜色）
const quadrantColors = {
  topRight: "rgba(16, 185, 129, 0.08)",    // 绿色 - 优秀译员
  topLeft: "rgba(59, 130, 246, 0.08)",     // 蓝色 - 质量优先
  bottomRight: "rgba(245, 158, 11, 0.08)", // 橙色 - 速度优先
  bottomLeft: "rgba(239, 68, 68, 0.08)",   // 红色 - 需改进
}

export function EfficiencyRatingChart({ onTranslatorClick }: EfficiencyRatingChartProps) {
  // 计算中位数用于四象限分割
  const { medianEfficiency, medianRating } = useMemo(() => {
    const efficiencies = mockData.map(d => d.efficiencyRatio).sort((a, b) => a - b)
    const ratings = mockData.map(d => d.rating).sort((a, b) => a - b)
    
    const medianEfficiency = efficiencies[Math.floor(efficiencies.length / 2)]
    const medianRating = ratings[Math.floor(ratings.length / 2)]
    
    return { medianEfficiency, medianRating }
  }, [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
        margin={{ top: 30, right: 30, bottom: 30, left: 30 }}
        onClick={(data) => {
          if (data && data.activePayload && data.activePayload.length > 0) {
            const clickedData = data.activePayload[0].payload as EfficiencyData
            onTranslatorClick?.(clickedData.translatorName)
          }
        }}
        style={{ cursor: "pointer" }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        
        {/* 四象限背景区域 */}
        {/* 左下象限 - 需改进 */}
        <ReferenceArea
          x1={0.1}
          x2={medianEfficiency}
          y1={7}
          y2={medianRating}
          fill={quadrantColors.bottomLeft}
          fillOpacity={1}
        />
        
        {/* 右下象限 - 速度优先 */}
        <ReferenceArea
          x1={medianEfficiency}
          x2={0.3}
          y1={7}
          y2={medianRating}
          fill={quadrantColors.bottomRight}
          fillOpacity={1}
        />
        
        {/* 左上象限 - 质量优先 */}
        <ReferenceArea
          x1={0.1}
          x2={medianEfficiency}
          y1={medianRating}
          y2={10}
          fill={quadrantColors.topLeft}
          fillOpacity={1}
        />
        
        {/* 右上象限 - 优秀译员 */}
        <ReferenceArea
          x1={medianEfficiency}
          x2={0.3}
          y1={medianRating}
          y2={10}
          fill={quadrantColors.topRight}
          fillOpacity={1}
        />
        
        {/* 四象限分割线 - 加粗并使用更明显的颜色 */}
        <ReferenceLine 
          x={medianEfficiency} 
          stroke="#64748b" 
          strokeWidth={2}
          strokeDasharray="5 5" 
          label={{ 
            value: "效率中位线", 
            position: "top", 
            fontSize: 11,
            fill: "#475569",
            fontWeight: 600
          }}
        />
        <ReferenceLine 
          y={medianRating} 
          stroke="#64748b" 
          strokeWidth={2}
          strokeDasharray="5 5"
          label={{ 
            value: "评分中位线", 
            position: "right", 
            fontSize: 11,
            fill: "#475569",
            fontWeight: 600
          }}
        />
        
        {/* 四象限标签 */}
        <text x="15%" y="15%" textAnchor="middle" fontSize={12} fill="#3b82f6" fontWeight={600}>
          质量优先
        </text>
        <text x="15%" y="18%" textAnchor="middle" fontSize={10} fill="#64748b">
          高质量 低效率
        </text>
        
        <text x="85%" y="15%" textAnchor="middle" fontSize={12} fill="#10b981" fontWeight={600}>
          优秀译员
        </text>
        <text x="85%" y="18%" textAnchor="middle" fontSize={10} fill="#64748b">
          高质量 高效率
        </text>
        
        <text x="15%" y="85%" textAnchor="middle" fontSize={12} fill="#ef4444" fontWeight={600}>
          需改进
        </text>
        <text x="15%" y="88%" textAnchor="middle" fontSize={10} fill="#64748b">
          低质量 低效率
        </text>
        
        <text x="85%" y="85%" textAnchor="middle" fontSize={12} fill="#f59e0b" fontWeight={600}>
          速度优先
        </text>
        <text x="85%" y="88%" textAnchor="middle" fontSize={10} fill="#64748b">
          低质量 高效率
        </text>
        
        <XAxis
          type="number"
          dataKey="efficiencyRatio"
          name="效率比"
          domain={[0.1, 0.3]}
          tick={{ fontSize: 11 }}
          label={{ 
            value: "效率比 (视频时长/工作时长) →", 
            position: "insideBottom", 
            offset: -15, 
            style: { fontSize: 12, fontWeight: 600 } 
          }}
          tickFormatter={(value) => value.toFixed(2)}
        />
        <YAxis
          type="number"
          dataKey="rating"
          name="评分"
          domain={[7, 10]}
          tick={{ fontSize: 11 }}
          label={{ 
            value: "译员评分 ↑", 
            angle: -90, 
            position: "insideLeft", 
            style: { fontSize: 12, fontWeight: 600 } 
          }}
        />
        <ZAxis 
          type="number" 
          dataKey="taskCount" 
          range={[150, 700]} 
          name="任务数"
        />
        
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload as EfficiencyData
              return (
                <div className="bg-background border-2 border-border rounded-lg shadow-xl p-3 text-xs">
                  <p className="font-semibold mb-2 text-sm">{data.translatorName}</p>
                  <p>效率比：{data.efficiencyRatio.toFixed(3)}</p>
                  <p>评分：{data.rating.toFixed(1)}</p>
                  <p>任务数：{data.taskCount}个</p>
                  <p>评级：{data.grade}级</p>
                  <div className="mt-2 pt-2 border-t-2 border-border">
                    <p className="text-[11px] font-semibold" style={{
                      color: data.efficiencyRatio >= medianEfficiency && data.rating >= medianRating ? "#10b981" :
                             data.efficiencyRatio < medianEfficiency && data.rating >= medianRating ? "#3b82f6" :
                             data.efficiencyRatio >= medianEfficiency && data.rating < medianRating ? "#f59e0b" : "#ef4444"
                    }}>
                      {data.efficiencyRatio >= medianEfficiency && data.rating >= medianRating && "🌟 优秀译员 - 高效率高质量"}
                      {data.efficiencyRatio < medianEfficiency && data.rating >= medianRating && "⚖️ 质量优先 - 注重品质"}
                      {data.efficiencyRatio >= medianEfficiency && data.rating < medianRating && "⚡ 速度优先 - 效率为主"}
                      {data.efficiencyRatio < medianEfficiency && data.rating < medianRating && "📈 需改进 - 提升空间大"}
                    </p>
                  </div>
                  <p className="text-muted-foreground text-[10px] mt-2">
                    点击可查看译员详情
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        
        <Scatter name="译员" data={mockData}>
          {mockData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={gradeColors[entry.grade]}
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}
