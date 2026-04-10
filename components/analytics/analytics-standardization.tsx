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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, BarChart3, FileText } from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import {
  BarChart,
  Bar,
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

// 评分分布直方图数据
const scoreDistributionData = [
  { range: "9.0-10.0", count: 12, label: "优秀" },
  { range: "8.5-8.9", count: 18, label: "优秀" },
  { range: "8.0-8.4", count: 25, label: "良好" },
  { range: "7.5-7.9", count: 15, label: "待改进" },
  { range: "7.0-7.4", count: 8, label: "待改进" },
  { range: "<7.0", count: 3, label: "不合格" },
]

// 评分明细列表
const standardList = [
  { id: "1", drama: "霸道总裁爱上我", language: "英语", translator: "张三", score: 8.5, terminology: 9.0, format: 8.5, timing: 8.0, consistency: 8.5, status: "优秀" },
  { id: "2", drama: "穿越之王妃驾到", language: "日语", translator: "李四", score: 8.3, terminology: 8.5, format: 8.0, timing: 8.5, consistency: 8.2, status: "良好" },
  { id: "3", drama: "重生之豪门千金", language: "英语", translator: "王五", score: 9.0, terminology: 9.5, format: 9.0, timing: 8.5, consistency: 9.0, status: "优秀" },
  { id: "4", drama: "穿越之王妃驾到", language: "韩语", translator: "钱七", score: 8.8, terminology: 9.0, format: 8.5, timing: 9.0, consistency: 8.8, status: "优秀" },
  { id: "5", drama: "霸道总裁爱上我", language: "西班牙语", translator: "赵六", score: 7.5, terminology: 7.0, format: 8.0, timing: 7.5, consistency: 7.5, status: "待改进" },
]

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, string> = {
    "优秀": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "良好": "bg-green-100 text-green-700 border-green-200",
    "待改进": "bg-orange-100 text-orange-700 border-orange-200",
    "不合格": "bg-red-100 text-red-700 border-red-200",
  }
  return <Badge variant="outline" className={statusConfig[status]}>{status}</Badge>
}

const getScoreColor = (score: number) => {
  if (score >= 9.0) return "text-emerald-600"
  if (score >= 8.0) return "text-green-600"
  if (score >= 7.0) return "text-orange-600"
  return "text-red-600"
}

export function AnalyticsStandardization() {
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
          <h1 className="text-xl font-bold text-foreground">标准化与评分体系</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            标准文档集成 · 自动评分系统 · 质量监控
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
              <SelectItem value="quality-track">质量问题追踪</SelectItem>
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
          {/* 标准文档集成 - 标签页 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                标准文档集成
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="translation" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="translation">翻译标准</TabsTrigger>
                  <TabsTrigger value="interaction">交互标准</TabsTrigger>
                  <TabsTrigger value="selfcheck">自检标准</TabsTrigger>
                </TabsList>
                <TabsContent value="translation" className="space-y-3 mt-4">
                  <div className="text-sm space-y-2">
                    <h4 className="font-semibold">术语规范</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>专业术语必须使用标准译法</li>
                      <li>人名、地名保持一致性</li>
                      <li>品牌名称不翻译</li>
                    </ul>
                    <h4 className="font-semibold mt-3">句式要求</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>符合目标语言习惯</li>
                      <li>避免直译和生硬表达</li>
                      <li>保持原文语气和风格</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="interaction" className="space-y-3 mt-4">
                  <div className="text-sm space-y-2">
                    <h4 className="font-semibold">任务操作流程</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>接收任务后24小时内开始翻译</li>
                      <li>完成后提交审核</li>
                      <li>根据反馈及时修改</li>
                    </ul>
                    <h4 className="font-semibold mt-3">修改标注规范</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>使用标准修改标记</li>
                      <li>注明修改原因</li>
                      <li>保留修改历史</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="selfcheck" className="space-y-3 mt-4">
                  <div className="text-sm space-y-2">
                    <h4 className="font-semibold">译员自检清单</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>术语准确性检查</li>
                      <li>时间轴同步检查</li>
                      <li>格式规范检查</li>
                      <li>拼写语法检查</li>
                    </ul>
                    <h4 className="font-semibold mt-3">质量核查要点</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>对照原文逐句检查</li>
                      <li>确保无遗漏和错译</li>
                      <li>检查前后一致性</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* 评分分布直方图 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                评分分布直方图
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: "任务数量", angle: -90, position: "insideLeft", style: { fontSize: 11 } }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="count" fill="#3b82f6" name="任务数量" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 标准化评分列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">标准化评分明细</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">短剧名称</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">语种</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">译员</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">综合评分</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">术语准确性</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">格式规范性</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">时间轴精准度</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">一致性</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">评估</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standardList.map((item) => (
                      <tr key={item.id} className="border-b border-border hover:bg-muted/50 cursor-pointer">
                        <td className="py-3 px-2">{item.drama}</td>
                        <td className="py-3 px-2">
                          <Badge variant="secondary" className="text-xs">{item.language}</Badge>
                        </td>
                        <td className="py-3 px-2">{item.translator}</td>
                        <td className="py-3 px-2">
                          <span className={`font-semibold text-lg ${getScoreColor(item.score)}`}>
                            {item.score.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={getScoreColor(item.terminology)}>{item.terminology.toFixed(1)}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={getScoreColor(item.format)}>{item.format.toFixed(1)}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={getScoreColor(item.timing)}>{item.timing.toFixed(1)}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={getScoreColor(item.consistency)}>{item.consistency.toFixed(1)}</span>
                        </td>
                        <td className="py-3 px-2">{getStatusBadge(item.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 评分说明 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">评分标准说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">评分维度</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 术语准确性：专业术语翻译准确度</li>
                    <li>• 格式规范性：字幕格式符合标准</li>
                    <li>• 时间轴精准度：时间轴与音频同步</li>
                    <li>• 一致性：前后翻译风格统一</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">评级标准</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 优秀：综合评分 ≥ 8.5分</li>
                    <li>• 良好：综合评分 8.0-8.4分</li>
                    <li>• 待改进：综合评分 7.0-7.9分</li>
                    <li>• 不合格：综合评分 &lt; 7.0分</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
