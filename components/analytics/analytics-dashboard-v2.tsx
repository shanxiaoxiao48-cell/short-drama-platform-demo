"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  Activity,
  Users,
  Clock,
  DollarSign,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Save,
  FileText,
  BarChart3,
} from "lucide-react"
import { SearchableSelect } from "@/components/ui/searchable-select"

// Mock数据 - 后续会扩展
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

// 二级菜单项定义
type SecondaryMenuItem = "task-progress" | "translator-performance" | "cost-settlement" | "business-effect" | "standardization"

interface MenuItem {
  id: SecondaryMenuItem
  label: string
  icon: any
  description: string
}

const menuItems: MenuItem[] = [
  {
    id: "task-progress",
    label: "任务进度",
    icon: Activity,
    description: "状态监控与时间统计"
  },
  {
    id: "translator-performance",
    label: "译员绩效",
    icon: Users,
    description: "质量评估与擅长领域"
  },
  {
    id: "cost-settlement",
    label: "成本结算",
    icon: DollarSign,
    description: "工作量与费用统计"
  },
  {
    id: "business-effect",
    label: "投放效果",
    icon: TrendingUp,
    description: "ROI与消耗分析"
  },
  {
    id: "standardization",
    label: "标准化",
    icon: FileText,
    description: "文档与评分体系"
  }
]

export function AnalyticsDashboardV2() {
  // 全局筛选器状态
  const [selectedView, setSelectedView] = useState("default")
  const [selectedDrama, setSelectedDrama] = useState("all")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [selectedTranslator, setSelectedTranslator] = useState("all")
  const [dateRange, setDateRange] = useState("month")
  
  // 二级菜单选中状态
  const [selectedMenuItem, setSelectedMenuItem] = useState<SecondaryMenuItem>("task-progress")

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

  // 6张核心概览卡片数据（缩减为6张，更紧凑）
  const overviewCards = [
    {
      title: "总任务数",
      value: "245",
      subtitle: "完成率 87%",
      icon: Activity,
      trend: "+12%",
      alert: false
    },
    {
      title: "在途任务",
      value: "32",
      subtitle: "翻译18 审核10",
      icon: Clock,
      trend: null,
      alert: false
    },
    {
      title: "活跃译员",
      value: "18",
      subtitle: "较上月 +3",
      icon: Users,
      trend: "+3",
      alert: false
    },
    {
      title: "整体修改率",
      value: "12.5%",
      subtitle: "审效8.2% 自修4.3%",
      icon: AlertCircle,
      trend: null,
      alert: false
    },
    {
      title: "本月成本",
      value: "¥27,200",
      subtitle: "较上月 +12%",
      icon: DollarSign,
      trend: "+12%",
      alert: false
    },
    {
      title: "投放ROI",
      value: "3.2x",
      subtitle: "《霸道总裁》领先",
      icon: TrendingUp,
      trend: "+0.3x",
      alert: false
    }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* 顶部全局筛选区 */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">运营数据仪表盘</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              运营决策中枢 · 译员管理核心 · 财务结算支撑
            </p>
          </div>
        </div>

        {/* 筛选器组 - 全局生效 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 保存的视图 */}
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="选择视图" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">默认视图</SelectItem>
              <SelectItem value="monthly-settlement">月度财务结算</SelectItem>
              <SelectItem value="performance-review">译员绩效复盘</SelectItem>
              <SelectItem value="weekly-monitor">本周任务监控</SelectItem>
              <SelectItem value="quality-track">质量问题追踪</SelectItem>
            </SelectContent>
          </Select>

          {/* 短剧筛选 */}
          <SearchableSelect
            value={selectedDrama}
            onValueChange={setSelectedDrama}
            options={dramaOptions}
            placeholder="选择短剧"
            searchPlaceholder="搜索短剧..."
            emptyText="未找到匹配的短剧"
            className="w-48 h-8 text-xs"
          />

          {/* 语种筛选 */}
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

          {/* 译员筛选 */}
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

          {/* 时间范围 */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">今日</SelectItem>
              <SelectItem value="week">本周</SelectItem>
              <SelectItem value="month">本月</SelectItem>
              <SelectItem value="quarter">本季度</SelectItem>
              <SelectItem value="year">本年</SelectItem>
            </SelectContent>
          </Select>

          {/* 保存视图按钮 */}
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Save className="w-3 h-3 mr-1" />
            保存视图
          </Button>
        </div>
      </div>

      {/* 主体内容区：左侧菜单 + 右侧内容 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧二级菜单 */}
        <div className="w-48 border-r border-border bg-muted/30">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = selectedMenuItem === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedMenuItem(item.id)}
                    className={cn(
                      "w-full flex items-start gap-2 p-2.5 rounded-lg text-left transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-sm font-medium", isActive ? "text-primary-foreground" : "text-foreground")}>
                        {item.label}
                      </div>
                      <div className={cn("text-xs mt-0.5", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
                        {item.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* 核心数据概览卡片组 - 6张卡片，3列2行，更紧凑 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {overviewCards.map((card, index) => {
                  const Icon = card.icon
                  return (
                    <Card 
                      key={index}
                      className="cursor-pointer hover:shadow-md transition-shadow relative"
                    >
                      {card.alert && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                      <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-3 px-4">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                          {card.title}
                        </CardTitle>
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="px-4 pb-3">
                        <div className="flex items-baseline gap-2">
                          <div className="text-xl font-bold">{card.value}</div>
                          {card.trend && (
                            <span className={`text-xs font-medium ${
                              card.trend.startsWith('+') ? 'text-green-600' : 
                              card.trend.startsWith('-') && card.title.includes('时长') ? 'text-green-600' :
                              'text-muted-foreground'
                            }`}>
                              {card.trend}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {card.subtitle}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* 详细内容区 - 根据左侧菜单显示不同内容 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {menuItems.find(item => item.id === selectedMenuItem)?.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedMenuItem === "task-progress" && (
                    <div className="h-96 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">任务进度与状态监控</p>
                        <p className="text-xs mt-2">将包含：状态看板、任务列表、时间统计</p>
                      </div>
                    </div>
                  )}

                  {selectedMenuItem === "translator-performance" && (
                    <div className="h-96 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">译员绩效与质量评估</p>
                        <p className="text-xs mt-2">将包含：修改率统计、质量评级、擅长领域分析</p>
                      </div>
                    </div>
                  )}

                  {selectedMenuItem === "cost-settlement" && (
                    <div className="h-96 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">结算与成本统计</p>
                        <p className="text-xs mt-2">将包含：工作量统计、派单完成对比</p>
                      </div>
                    </div>
                  )}

                  {selectedMenuItem === "business-effect" && (
                    <div className="h-96 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">业务效果匹配（投放数据）</p>
                        <p className="text-xs mt-2">将包含：消耗数据关联、ROI综合评估</p>
                      </div>
                    </div>
                  )}

                  {selectedMenuItem === "standardization" && (
                    <div className="h-96 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">标准化与评分体系</p>
                        <p className="text-xs mt-2">将包含：标准文档集成、自动评分系统</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
