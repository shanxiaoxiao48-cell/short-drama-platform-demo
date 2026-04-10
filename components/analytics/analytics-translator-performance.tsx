"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, Radar, TrendingUp, Activity } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import {
  RadarChart,
  Radar as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Mock数据
const mockDramas = [
  { id: "1", title: "霸道总裁爱上我", episodes: 80, status: "翻译中" },
  { id: "2", title: "穿越之王妃驾到", episodes: 100, status: "质检中" },
  { id: "3", title: "重生之豪门千金", episodes: 60, status: "翻译中" },
]

const mockLanguages = [
  { code: "en", name: "英语" },
  { code: "es", name: "西班牙语" },
  { code: "pt", name: "葡萄牙语" },
  { code: "ja", name: "日语" },
  { code: "ko", name: "韩语" },
]

const mockTranslators = [
  { id: "1", name: "张三" },
  { id: "2", name: "李四" },
  { id: "3", name: "王五" },
]

// 雷达图数据：多译员修改率对比
const radarData = [
  { indicator: "审效修改率", 张三: 12.5, 李四: 18.2, 王五: 9.8, fullMark: 30 },
  { indicator: "自修率", 张三: 8.3, 李四: 12.1, 王五: 6.2, fullMark: 20 },
  { indicator: "按时完成率", 张三: 92, 李四: 85, 王五: 95, fullMark: 100 },
  { indicator: "标准化评分", 张三: 8.2, 李四: 7.5, 王五: 8.8, fullMark: 10 },
]

// 评分趋势数据：单译员历史评级变化
const ratingTrendData = [
  { month: "10月", rating: 8.0 },
  { month: "11月", rating: 8.3 },
  { month: "12月", rating: 8.5 },
  { month: "1月", rating: 8.8 },
  { month: "2月", rating: 9.0 },
]

// 热力图数据：译员-题材匹配度（用表格展示）
const genreMatchData = [
  { translator: "张三", 古装: 85, 现代: 92, 男频: 78, 女频: 88, 悬疑: 75 },
  { translator: "李四", 古装: 72, 现代: 68, 男频: 82, 女频: 70, 悬疑: 88 },
  { translator: "王五", 古装: 90, 现代: 95, 男频: 85, 女频: 92, 悬疑: 80 },
  { translator: "赵六", 古装: 78, 现代: 82, 男频: 88, 女频: 80, 悬疑: 75 },
]

// 修改明细表格
const modificationList = [
  { id: "1", translator: "张三", drama: "霸道总裁爱上我", task: "T001", modCount: 12, reason: "时态错误", modifiedBy: "审核员A", date: "2024-02-10" },
  { id: "2", translator: "李四", drama: "穿越之王妃驾到", task: "T002", modCount: 18, reason: "术语不准确", modifiedBy: "审核员B", date: "2024-02-09" },
  { id: "3", translator: "王五", drama: "重生之豪门千金", task: "T003", modCount: 8, reason: "格式调整", modifiedBy: "审核员A", date: "2024-02-08" },
]

const getScoreColor = (score: number) => {
  if (score >= 90) return "bg-emerald-100 text-emerald-700"
  if (score >= 80) return "bg-green-100 text-green-700"
  if (score >= 70) return "bg-orange-100 text-orange-700"
  return "bg-red-100 text-red-700"
}

export function AnalyticsTranslatorPerformance() {
  // 全局筛选器状态
  const [selectedView, setSelectedView] = useState("default")
  const [selectedDrama, setSelectedDrama] = useState("all")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [selectedTranslator, setSelectedTranslator] = useState("all")
  const [dateRange, setDateRange] = useState("month")

  // 准备筛选器选项
  const dramaOptions = useMemo(() => [
    { value: "all", label: "全部短剧" },
    ...mockDramas.map(d => ({
      value: d.id,
      label: d.title,
      subtitle: `${d.episodes}集 · ${d.status}`
    }))
  ], [])

  const languageOptions = useMemo(() => [
    { value: "all", label: "全部语种" },
    ...mockLanguages.map(l => ({ value: l.code, label: l.name }))
  ], [])

  const translatorOptions = useMemo(() => [
    { value: "all", label: "全部译员" },
    ...mockTranslators.map(t => ({ value: t.id, label: t.name }))
  ], [])

  return (
    <div className="flex flex-col h-full">
      {/* 顶部筛选区 */}
      <div className="p-4 border-b border-border space-y-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">译员绩效与质量评估</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            修改率统计 · 质量评级 · 擅长领域分析
          </p>
        </div>

        {/* 筛选器组 */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="选择视图" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">默认视图</SelectItem>
              <SelectItem value="performance-review">译员绩效复盘</SelectItem>
            </SelectContent>
          </Select>

          <SearchableSelect
            value={selectedDrama}
            onValueChange={setSelectedDrama}
            options={dramaOptions}
            placeholder="选择短剧"
            searchPlaceholder="搜索短剧..."
            emptyText="未找到匹配的短剧"
            className="w-48 h-8 text-xs"
          />

          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="选择语种" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTranslator} onValueChange={setSelectedTranslator}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="选择译员" />
            </SelectTrigger>
            <SelectContent>
              {translatorOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">今日</SelectItem>
              <SelectItem value="week">本周</SelectItem>
              <SelectItem value="month">本月</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Save className="w-3 h-3 mr-1" />
            保存视图
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* 雷达图：多译员修改率对比 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Radar className="w-4 h-4" />
                多译员修改率对比（雷达图）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="indicator" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, "auto"]} tick={{ fontSize: 10 }} />
                    <RechartsRadar
                      name="张三"
                      dataKey="张三"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <RechartsRadar
                      name="李四"
                      dataKey="李四"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <RechartsRadar
                      name="王五"
                      dataKey="王五"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 评分趋势图：单译员历史评级变化 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                译员评分趋势（王五 - 近5个月）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ratingTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis domain={[7, 10]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#22c55e"
                      strokeWidth={2}
                      name="综合评分"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 热力图：译员-题材匹配度（表格形式） */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                译员-题材匹配度热力图
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">译员</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">古装</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">现代</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">男频</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">女频</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">悬疑</th>
                    </tr>
                  </thead>
                  <tbody>
                    {genreMatchData.map((row) => (
                      <tr key={row.translator} className="border-b border-border">
                        <td className="py-3 px-2 font-medium">{row.translator}</td>
                        <td className="py-3 px-2 text-center">
                          <Badge variant="outline" className={getScoreColor(row.古装)}>
                            {row.古装}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge variant="outline" className={getScoreColor(row.现代)}>
                            {row.现代}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge variant="outline" className={getScoreColor(row.男频)}>
                            {row.男频}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge variant="outline" className={getScoreColor(row.女频)}>
                            {row.女频}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge variant="outline" className={getScoreColor(row.悬疑)}>
                            {row.悬疑}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 修改明细表格 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">修改明细记录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">译员</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">短剧名称</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">任务ID</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">修改次数</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">修改原因</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">修改人</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">修改日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modificationList.map((item) => (
                      <tr key={item.id} className="border-b border-border hover:bg-muted/50 cursor-pointer">
                        <td className="py-3 px-2 font-medium">{item.translator}</td>
                        <td className="py-3 px-2">{item.drama}</td>
                        <td className="py-3 px-2 font-mono text-xs">{item.task}</td>
                        <td className="py-3 px-2">
                          <span className={item.modCount > 15 ? "text-red-600 font-semibold" : ""}>
                            {item.modCount}处
                          </span>
                        </td>
                        <td className="py-3 px-2">{item.reason}</td>
                        <td className="py-3 px-2">{item.modifiedBy}</td>
                        <td className="py-3 px-2 text-xs">{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
