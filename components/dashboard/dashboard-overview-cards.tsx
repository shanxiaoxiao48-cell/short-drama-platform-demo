"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Clock, DollarSign, TrendingUp } from "lucide-react"
import { translatorStats } from "@/lib/mock-analytics-data"

export function DashboardOverviewCards() {
  // 4张卡片数据 - 使用与概览页面相同的数据源
  const cards = [
    {
      title: "进行中短剧数",
      value: "56",
      subtitle: "AI翻译中12 人工翻译中18 审核质检中15 成片压制中11",
      icon: Activity,
      trend: null,
    },
    {
      title: "本周完成短剧数",
      value: "15",
      subtitle: "较上周 +3部",
      icon: TrendingUp,
      trend: "+3",
    },
    {
      title: "本月翻译成本",
      value: `¥${Math.round(translatorStats.totalCost / 1000)}k`,
      subtitle: "较上月 +12%",
      icon: DollarSign,
      trend: "+12%",
    },
    {
      title: "短剧平均完成时长",
      value: "8.5",
      subtitle: "天 · 较上月 -1.2天",
      icon: Clock,
      trend: "-1.2天",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card 
            key={index}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-3xl font-bold">{card.value}</div>
                {card.trend && (
                  <span className={`text-sm font-semibold ${
                    card.trend.startsWith('+') ? 'text-green-600' : 
                    card.trend.startsWith('-') && card.title.includes('时长') ? 'text-green-600' :
                    'text-muted-foreground'
                  }`}>
                    {card.trend}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {card.subtitle}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
