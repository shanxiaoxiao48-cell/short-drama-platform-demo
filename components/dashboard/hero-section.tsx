"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface HeroSectionProps {
  onNavigateToProjects: () => void
}

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
    </div>
  )
}
