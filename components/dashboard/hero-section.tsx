"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Film, Clock, CheckCircle, Plus } from "lucide-react"

interface HeroSectionProps {
  onNavigateToProjects: () => void
}

const stats = [
  {
    label: "进行中项目",
    value: "12",
    change: "+2",
    icon: Film,
    color: "text-primary",
  },
  {
    label: "待审核任务",
    value: "48",
    change: "+8",
    icon: Clock,
    color: "text-warning",
  },
  {
    label: "本周完成",
    value: "156",
    change: "+23%",
    icon: CheckCircle,
    color: "text-success",
  },
  {
    label: "总集数",
    value: "2,847",
    change: "+156",
    icon: TrendingUp,
    color: "text-chart-2",
  },
]

export function HeroSection({ onNavigateToProjects }: HeroSectionProps) {
  return (
    <div className="space-y-4">
      {/* Welcome message with quick create */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">欢迎回来，Admin</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            这是您的短剧出海工作台，当前有 48 个任务待处理
          </p>
        </div>
        <Button onClick={onNavigateToProjects}>
          <Plus className="w-4 h-4 mr-2" />
          快速创建项目
        </Button>
      </div>

      {/* Stats grid - 更紧凑 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-3 bg-card border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold text-foreground mt-0.5">{stat.value}</p>
                  <p className="text-[10px] text-success mt-0.5">{stat.change} 本周</p>
                </div>
                <div className={`p-1.5 rounded-lg bg-muted ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
