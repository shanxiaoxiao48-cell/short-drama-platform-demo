"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Activity,
  Users,
  Clock,
  DollarSign,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  PieChart,
} from "lucide-react"
import { TaskEfficiencyChart } from "./charts/task-efficiency-chart"
import { TaskStatusChart } from "./charts/task-status-chart"
import { TranslatorComparisonChart } from "./charts/translator-comparison-chart"
import { EfficiencyRatingChart } from "./charts/efficiency-rating-chart"
import { translatorStats } from "@/lib/mock-analytics-data"

interface AnalyticsOverviewProps {
  onNavigateToDataList?: (stageFilter?: string, dateRange?: { from: Date; to: Date }) => void
  onNavigateToTranslatorPerformance?: (translatorName?: string) => void
  onNavigateToBusinessEffect?: (drama?: string, language?: string) => void
}

export function AnalyticsOverview({ onNavigateToDataList, onNavigateToTranslatorPerformance, onNavigateToBusinessEffect }: AnalyticsOverviewProps) {

  // 处理状态点击，跳转到数据列表页面
  const handleStatusClick = (status: string) => {
    if (onNavigateToDataList) {
      onNavigateToDataList(status)
    }
  }

  // 处理效率趋势图点击，跳转到短剧进度页面
  const handleEfficiencyClick = (dateRange: { from: Date; to: Date }) => {
    if (onNavigateToDataList) {
      onNavigateToDataList("已完成", dateRange)
    }
  }

  // 处理译员点击，跳转到译员绩效页面
  const handleTranslatorClick = (translatorName: string) => {
    if (onNavigateToTranslatorPerformance) {
      onNavigateToTranslatorPerformance(translatorName)
    }
  }

  // 8张核心概览卡片数据（使用统一数据源）
  const overviewCards = [
    {
      title: "总短剧数",
      value: "328",
      subtitle: `本月 · 完成率 72%`,
      icon: Activity,
      trend: "+18%",
      alert: false
    },
    {
      title: "进行中短剧数",
      value: "56",
      subtitle: `AI译员中12 人工翻译中18 审核质检中15 成片压制中11`,
      icon: Clock,
      trend: null,
      alert: false
    },
    {
      title: "活跃译员数",
      value: translatorStats.totalTranslators.toString(),
      subtitle: `本月 · 较上月 +2`,
      icon: Users,
      trend: "+2",
      alert: false
    },
    {
      title: "短剧平均完成时长",
      value: "8.5",
      subtitle: "天 · 较上月 -1.2天",
      icon: TrendingUp,
      trend: "-1.2天",
      alert: false
    },
    {
      title: "平均修改率",
      value: `${translatorStats.avgModificationRate.toFixed(1)}%`,
      subtitle: `审校修改${translatorStats.avgModificationRate.toFixed(1)}% · 译员自修${translatorStats.avgSelfModificationRate.toFixed(1)}%`,
      icon: AlertCircle,
      trend: "-2.1%",
      alert: false
    },
    {
      title: "本月翻译成本",
      value: `¥${Math.round(translatorStats.totalCost / 1000)}k`,
      subtitle: "较上月 +12%",
      icon: DollarSign,
      trend: "+12%",
      alert: false
    },
    {
      title: "高评级译员占比",
      value: `${translatorStats.highRatingPercentage}%`,
      subtitle: `A级以上 ${translatorStats.highRatingCount}人 / 总${translatorStats.totalTranslators}人`,
      icon: CheckCircle2,
      trend: "+5%",
      alert: false
    },
    {
      title: "投放ROI Top1",
      value: "3.2x",
      subtitle: "《霸道总裁爱上我》英语版领先",
      icon: TrendingUp,
      trend: "+0.3x",
      alert: false
    }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* 顶部标题区 */}
      <div className="p-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold text-foreground">运营数据仪表盘 - 概览</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            运营决策中枢 · 译员管理核心 · 财务结算支撑
          </p>
        </div>
      </div>

      {/* 主体内容区 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* 核心数据概览卡片组 - 8张卡片，响应式布局 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

          {/* 4个可视化图表 - 响应式布局 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* 图表1：折线图 - 短剧完成效率趋势 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  短剧完成效率趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-72 lg:h-80">
                  <TaskEfficiencyChart
                    dateRange="month"
                    selectedDrama="all"
                    selectedLanguage="all"
                    onDateRangeClick={handleEfficiencyClick}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 图表2：饼图 - 短剧状态分布 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  短剧状态分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-72 lg:h-80">
                  <TaskStatusChart
                    dateRange="month"
                    selectedDrama="all"
                    selectedLanguage="all"
                    onStatusClick={handleStatusClick}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 图表3：柱状图 - TOP译员双维度对比 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  TOP译员双维度对比
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-72 lg:h-80">
                  <TranslatorComparisonChart
                    dateRange="month"
                    selectedDrama="all"
                    selectedLanguage="all"
                    onTranslatorClick={handleTranslatorClick}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 图表4：散点图 - 译员效率比监控（四象限分析） */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  译员效率比监控（四象限分析）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-72 lg:h-80">
                  <EfficiencyRatingChart onTranslatorClick={handleTranslatorClick} />
                </div>
              </CardContent>
            </Card>

            {/* 图表5、6、7已隐藏 - 根据产品需求简化页面展示 */}
            {/* 
            图表5：散点图 - 翻译质量vs投放消耗相关性
            图表6：双折线图 - 派单量vs完成量趋势
            图表7：条形图 - 译员综合ROI排名
            */}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
