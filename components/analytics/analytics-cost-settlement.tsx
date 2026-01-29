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
import { Save, BarChart3, TrendingUp } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import {
  BarChart,
  Bar,
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

// 译员月度工作量对比（柱状图）
const workloadData = [
  { translator: "王五", workload: 5200, cost: 10400 },
  { translator: "张三", workload: 4800, cost: 9600 },
  { translator: "钱七", workload: 4200, cost: 8400 },
  { translator: "赵六", workload: 3800, cost: 7600 },
  { translator: "李四", workload: 3600, cost: 7200 },
]

// 派单量vs完成量趋势（双折线图）
const assignmentTrendData = [
  { week: "第1周", assigned: 45, completed: 42 },
  { week: "第2周", assigned: 52, completed: 48 },
  { week: "第3周", assigned: 48, completed: 50 },
  { week: "第4周", assigned: 55, completed: 52 },
]

// 结算明细列表
const costList = [
  { id: "1", translator: "王五", tasks: 52, totalMinutes: 5200, unitPrice: 2.0, totalCost: 10400, status: "已结算", settleDate: "2024-01-25" },
  { id: "2", translator: "张三", tasks: 45, totalMinutes: 4800, unitPrice: 2.0, totalCost: 9600, status: "已结算", settleDate: "2024-01-25" },
  { id: "3", translator: "钱七", tasks: 42, totalMinutes: 4200, unitPrice: 2.0, totalCost: 8400, status: "已结算", settleDate: "2024-01-25" },
  { id: "4", translator: "赵六", tasks: 38, totalMinutes: 3800, unitPrice: 2.0, totalCost: 7600, status: "待结算", settleDate: "-" },
  { id: "5", translator: "李四", tasks: 32, totalMinutes: 3600, unitPrice: 2.0, totalCost: 7200, status: "待结算", settleDate: "-" },
]

const getStatusBadge = (status: string) => {
  if (status === "已结算") {
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{status}</Badge>
  }
  return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">{status}</Badge>
}

export function AnalyticsCostSettlement() {
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
          <h1 className="text-xl font-bold text-foreground">结算与成本统计</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            工作量统计 · 派单完成对比 · 结算明细
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
              <SelectItem value="monthly-settlement">月度财务结算</SelectItem>
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
          {/* 译员月度工作量对比（柱状图） */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                译员月度工作量对比
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workloadData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="translator" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: "工作时长(分钟)", angle: -90, position: "insideLeft", style: { fontSize: 11 } }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: "成本(元)", angle: 90, position: "insideRight", style: { fontSize: 11 } }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar yAxisId="left" dataKey="workload" fill="#3b82f6" name="工作时长" />
                    <Bar yAxisId="right" dataKey="cost" fill="#22c55e" name="成本" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 派单量vs完成量趋势（双折线图） */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                派单量 vs 完成量趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={assignmentTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="assigned"
                      stroke="#f97316"
                      strokeWidth={2}
                      name="派单量"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#22c55e"
                      strokeWidth={2}
                      name="完成量"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 结算明细列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">本月结算明细</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">译员姓名</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">完成任务数</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">工作时长（分钟）</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">单价（元/分钟）</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">结算金额</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">结算状态</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">结算日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costList.map((item) => (
                      <tr key={item.id} className="border-b border-border hover:bg-muted/50 cursor-pointer">
                        <td className="py-3 px-2 font-medium">{item.translator}</td>
                        <td className="py-3 px-2">{item.tasks}个</td>
                        <td className="py-3 px-2">{item.totalMinutes.toLocaleString()}分钟</td>
                        <td className="py-3 px-2">¥{item.unitPrice.toFixed(1)}</td>
                        <td className="py-3 px-2 font-semibold text-lg">¥{item.totalCost.toLocaleString()}</td>
                        <td className="py-3 px-2">{getStatusBadge(item.status)}</td>
                        <td className="py-3 px-2 text-xs">{item.settleDate}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border font-semibold">
                      <td className="py-3 px-2">合计</td>
                      <td className="py-3 px-2">{costList.reduce((sum, item) => sum + item.tasks, 0)}个</td>
                      <td className="py-3 px-2">{costList.reduce((sum, item) => sum + item.totalMinutes, 0).toLocaleString()}分钟</td>
                      <td className="py-3 px-2">-</td>
                      <td className="py-3 px-2 text-lg">¥{costList.reduce((sum, item) => sum + item.totalCost, 0).toLocaleString()}</td>
                      <td className="py-3 px-2">-</td>
                      <td className="py-3 px-2">-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
