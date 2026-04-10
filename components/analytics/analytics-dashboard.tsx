"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart3,
  Users,
  Clock,
  DollarSign,
  Download,
  Star,
  Activity,
} from "lucide-react"
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select"
import {
  aggregateAnalyticsData,
  generateOverviewCards,
  updateFilterOptions,
  type FilterConditions
} from "@/lib/analytics-utils"
import { mockRawAnalyticsData, mockTranslators } from "@/lib/mock-analytics-data"

// 为了兼容现有代码，保留mockProjects
const mockProjects = [
  {
    id: "1",
    title: "霸道总裁爱上我",
    status: "翻译中",
    languages: ["英语", "西班牙语", "葡萄牙语"],
    progress: 65,
    startDate: "2024-01-15",
    deadline: "2024-02-15",
    translator: "张三",
    cost: 3200,
    roi: 2.8,
  },
  {
    id: "2",
    title: "穿越之王妃驾到",
    status: "质检中",
    languages: ["日语", "韩语"],
    progress: 85,
    startDate: "2024-01-10",
    deadline: "2024-02-10",
    translator: "李四",
    cost: 2800,
    roi: 3.2,
  },
]

export function AnalyticsDashboard() {
  // 筛选器状态
  const [selectedDrama, setSelectedDrama] = useState("all")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [selectedTranslator, setSelectedTranslator] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  // 可用选项（根据选择的短剧动态更新）
  const [availableLanguages, setAvailableLanguages] = useState<Array<{ code: string; name: string }>>([])
  const [availableTranslators, setAvailableTranslators] = useState<typeof mockTranslators>([])

  // 准备短剧选项
  const dramaOptions: SearchableSelectOption[] = useMemo(() => {
    return [
      { value: "all", label: "全部短剧" },
      ...mockRawAnalyticsData.dramas.map(drama => ({
        value: drama.id,
        label: drama.title,
        subtitle: `${drama.totalEpisodes}集 · ${drama.status}`
      }))
    ]
  }, [])

  // 监听短剧选择变化，更新可用选项
  useEffect(() => {
    const options = updateFilterOptions(mockRawAnalyticsData, selectedDrama)
    setAvailableLanguages(options.availableLanguages)
    setAvailableTranslators(options.availableTranslators)

    // 如果当前选择的语种/译员不在新列表中，重置为"all"
    if (selectedLanguage !== "all" && !options.availableLanguages.some(l => l.code === selectedLanguage)) {
      setSelectedLanguage("all")
    }
    if (selectedTranslator !== "all" && !options.availableTranslators.some(t => t.id === selectedTranslator)) {
      setSelectedTranslator("all")
    }
  }, [selectedDrama, selectedLanguage, selectedTranslator])

  // 聚合数据
  const aggregatedData = useMemo(() => {
    const filters: FilterConditions = {
      dramaId: selectedDrama,
      language: selectedLanguage,
      translatorId: selectedTranslator,
      period: selectedPeriod
    }
    return aggregateAnalyticsData(mockRawAnalyticsData, filters)
  }, [selectedDrama, selectedLanguage, selectedTranslator, selectedPeriod])

  // 生成概览卡片
  const overviewCards = useMemo(() => {
    const filters: FilterConditions = {
      dramaId: selectedDrama,
      language: selectedLanguage,
      translatorId: selectedTranslator,
      period: selectedPeriod
    }
    return generateOverviewCards(aggregatedData, filters)
  }, [aggregatedData, selectedDrama, selectedLanguage, selectedTranslator, selectedPeriod])

  // 准备语种选项
  const languageOptions = useMemo(() => {
    return [
      { value: "all", label: "全部语种" },
      ...availableLanguages.map(lang => ({
        value: lang.code,
        label: lang.name
      }))
    ]
  }, [availableLanguages])

  // 准备译员选项
  const translatorOptions = useMemo(() => {
    return [
      { value: "all", label: "全部译员" },
      ...availableTranslators.map(t => ({
        value: t.id,
        label: t.name
      }))
    ]
  }, [availableTranslators])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">数据仪表盘</h1>
            <p className="text-sm text-muted-foreground mt-1">
              灵活筛选，多维度查看翻译数据
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            导出报表
          </Button>
        </div>
        
        {/* 筛选器 */}
        <div className="flex items-center gap-3 flex-wrap">
          <SearchableSelect
            value={selectedDrama}
            onValueChange={setSelectedDrama}
            options={dramaOptions}
            placeholder="选择短剧"
            searchPlaceholder="搜索短剧..."
            emptyText="未找到匹配的短剧"
            className="w-64"
          />

          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-40">
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

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">本周</SelectItem>
              <SelectItem value="month">本月</SelectItem>
              <SelectItem value="quarter">本季度</SelectItem>
              <SelectItem value="year">本年</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Overview Cards - 动态显示 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewCards.map((card, index) => {
              const iconMap: Record<string, any> = {
                Activity,
                Users,
                Clock,
                DollarSign
              }
              const Icon = iconMap[card.icon] || Activity
              
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.subtitle}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="progress" className="space-y-4">
            <TabsList>
              <TabsTrigger value="progress">任务进度</TabsTrigger>
              <TabsTrigger value="translators">译员绩效</TabsTrigger>
              <TabsTrigger value="cost">成本统计</TabsTrigger>
              <TabsTrigger value="roi">ROI分析</TabsTrigger>
            </TabsList>

            {/* 任务进度 Tab */}
            <TabsContent value="progress" className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="选择语种" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部语种</SelectItem>
                    <SelectItem value="en">英语</SelectItem>
                    <SelectItem value="es">西班牙语</SelectItem>
                    <SelectItem value="pt">葡萄牙语</SelectItem>
                    <SelectItem value="ja">日语</SelectItem>
                    <SelectItem value="ko">韩语</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 项目状态分布 */}
                <Card>
                  <CardHeader>
                    <CardTitle>项目状态分布</CardTitle>
                    <CardDescription>各阶段项目数量统计</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm">物料完成</span>
                      </div>
                      <span className="text-sm font-medium">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-sm">翻译中</span>
                      </div>
                      <span className="text-sm font-medium">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span className="text-sm">质检中</span>
                      </div>
                      <span className="text-sm font-medium">6</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">已完成</span>
                      </div>
                      <span className="text-sm font-medium">18</span>
                    </div>
                  </CardContent>
                </Card>

                {/* 项目列表 */}
                <Card>
                  <CardHeader>
                    <CardTitle>进行中项目</CardTitle>
                    <CardDescription>实时进度监控</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-4">
                        {mockProjects.map((project) => (
                          <div key={project.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{project.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {project.translator} · {project.languages.join(", ")}
                                </p>
                              </div>
                              <Badge variant={project.status === "翻译中" ? "default" : "secondary"}>
                                {project.status}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">进度</span>
                                <span className="font-medium">{project.progress}%</span>
                              </div>
                              <Progress value={project.progress} className="h-1.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* 时间统计 */}
              <Card>
                <CardHeader>
                  <CardTitle>任务时间统计</CardTitle>
                  <CardDescription>开始时间、结束时间与完成耗时</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockProjects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{project.title}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>开始: {project.startDate}</span>
                            <span>截止: {project.deadline}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {Math.floor((new Date(project.deadline).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} 天
                          </p>
                          <p className="text-xs text-muted-foreground">预计耗时</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 译员绩效 Tab */}
            <TabsContent value="translators" className="space-y-4">
              {/* 译员列表 */}
              <Card>
                <CardHeader>
                  <CardTitle>译员绩效排行</CardTitle>
                  <CardDescription>综合质量评估与工作量统计</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTranslators.map((translator, index) => (
                      <div
                        key={translator.id}
                        className="p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{translator.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {translator.languages.join(" · ")}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              translator.qualityRating === "A+" ? "default" :
                              translator.qualityRating === "A" ? "secondary" : "outline"
                            }
                          >
                            {translator.qualityRating}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">翻译时长</p>
                            <p className="font-medium">{translator.totalMinutes} 分钟</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">审核修改率</p>
                            <p className="font-medium text-orange-600">{translator.modificationRate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">自修率</p>
                            <p className="font-medium text-blue-600">{translator.selfModificationRate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">完成任务</p>
                            <p className="font-medium">{translator.completedTasks} 个</p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">擅长领域:</span>
                          {translator.specialties.map((specialty) => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 修改率详情 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>修改率趋势</CardTitle>
                    <CardDescription>近30天修改率变化</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <BarChart3 className="w-8 h-8 mr-2" />
                      <span>图表区域（可集成 recharts）</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>质量评级分布</CardTitle>
                    <CardDescription>译员质量等级统计</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm">A+ 级</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={20} className="w-32 h-2" />
                        <span className="text-sm font-medium">3人</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-blue-500 fill-blue-500" />
                        <span className="text-sm">A 级</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={60} className="w-32 h-2" />
                        <span className="text-sm font-medium">9人</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-gray-500 fill-gray-500" />
                        <span className="text-sm">B 级</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={40} className="w-32 h-2" />
                        <span className="text-sm font-medium">6人</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 成本统计 Tab */}
            <TabsContent value="cost" className="space-y-4">
              {/* 译员工作量统计 */}
              <Card>
                <CardHeader>
                  <CardTitle>译员工作量统计</CardTitle>
                  <CardDescription>翻译时长与成本明细</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockTranslators.map((translator) => (
                      <div key={translator.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div className="flex-1 grid grid-cols-5 gap-4">
                          <div>
                            <p className="text-sm font-medium">{translator.name}</p>
                            <p className="text-xs text-muted-foreground">{translator.languages.join(", ")}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">{translator.totalMinutes}</p>
                            <p className="text-xs text-muted-foreground">分钟</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">¥2.00</p>
                            <p className="text-xs text-muted-foreground">单价/分钟</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-primary">¥{translator.cost.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">总成本</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">{translator.completedTasks}</p>
                            <p className="text-xs text-muted-foreground">完成任务</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 成本分析 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>成本趋势</CardTitle>
                    <CardDescription>近30天成本变化</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <BarChart3 className="w-8 h-8 mr-2" />
                      <span>图表区域（可集成 recharts）</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>派单与完成对比</CardTitle>
                    <CardDescription>任务完成率统计</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">派发任务总量</span>
                      <span className="text-lg font-bold">129 个</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">实际完成任务</span>
                      <span className="text-lg font-bold text-green-600">129 个</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">完成率</span>
                      <span className="text-lg font-bold text-primary">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">超时任务</span>
                      <span className="text-lg font-bold text-orange-600">0 个</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 项目成本明细 */}
              <Card>
                <CardHeader>
                  <CardTitle>项目成本明细</CardTitle>
                  <CardDescription>各项目翻译成本统计</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockProjects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{project.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {project.languages.join(", ")} · {project.translator}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">¥{project.cost.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">成本</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ROI分析 Tab */}
            <TabsContent value="roi" className="space-y-4">
              {/* 项目ROI排行 */}
              <Card>
                <CardHeader>
                  <CardTitle>项目ROI排行</CardTitle>
                  <CardDescription>翻译成本与投放效果对比</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockProjects.map((project, index) => (
                      <div key={project.id} className="p-4 rounded-lg border border-border">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{project.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {project.languages.join(", ")} · {project.translator}
                              </p>
                            </div>
                          </div>
                          <Badge variant={project.roi >= 3 ? "default" : "secondary"}>
                            ROI {project.roi}x
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">翻译成本</p>
                            <p className="font-medium">¥{project.cost.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">投放消耗</p>
                            <p className="font-medium text-green-600">¥{(project.cost * project.roi).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">质量评级</p>
                            <p className="font-medium">{project.status === "质检中" ? "A" : "A+"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ROI分析 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>ROI趋势分析</CardTitle>
                    <CardDescription>不同语种ROI对比</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <BarChart3 className="w-8 h-8 mr-2" />
                      <span>图表区域（可集成 recharts）</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>译员产出价值评估</CardTitle>
                    <CardDescription>综合ROI与质量评分</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockTranslators.slice(0, 3).map((translator) => (
                        <div key={translator.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{translator.name}</p>
                            <p className="text-xs text-muted-foreground">
                              成本: ¥{translator.cost.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">ROI 2.8x</p>
                            <p className="text-xs text-muted-foreground">平均投放效果</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 综合评估 */}
              <Card>
                <CardHeader>
                  <CardTitle>投放数据关联分析</CardTitle>
                  <CardDescription>翻译质量与投放效果相关性</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">质量评级 A+ 作品</span>
                        <span className="text-sm font-bold text-green-600">平均ROI 3.2x</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">质量评级 A 作品</span>
                        <span className="text-sm font-bold text-blue-600">平均ROI 2.8x</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">质量评级 B 作品</span>
                        <span className="text-sm font-bold text-orange-600">平均ROI 2.1x</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                  </div>
                  <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">分析结论：</strong>
                      翻译质量与投放效果呈正相关。A+级作品的平均ROI比B级作品高出52%，建议优先分配高质量译员处理重点项目。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}
