"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, CheckCircle2, Clock, ArrowRight } from "lucide-react"

interface LanguageVariantCardProps {
  targetLanguage: string
  progress: number
  totalEpisodes: number
  completedEpisodes: number
  currentStage: string
  image: string
  onClick: () => void
  onDoubleClick?: () => void
  onEnterEditor?: () => void
  isSelected?: boolean
  isPinned?: boolean
  className?: string
}

const stageColors: Record<string, string> = {
  "待开始": "bg-muted text-muted-foreground border-border",
  "AI提取": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "AI提取-进行中": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "AI提取-待确认": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "AI提取-已完成": "bg-green-500/10 text-green-500 border-green-500/20",
  "AI翻译": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "AI翻译-进行中": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "AI翻译-待确认": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "AI翻译-已完成": "bg-green-500/10 text-green-500 border-green-500/20",
  "人工翻译": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "质检审核": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "视频擦除": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "视频擦除-进行中": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "视频擦除-待确认": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "视频擦除-已完成": "bg-green-500/10 text-green-500 border-green-500/20",
  "字幕挂载": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "视频压制": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "任务分配": "bg-green-500/10 text-green-500 border-green-500/20",
  "已完成": "bg-green-500/10 text-green-500 border-green-500/20",
}

const stageIcons: Record<string, typeof Clock> = {
  "待开始": Clock,
  "AI提取": Clock,
  "AI提取-进行中": Clock,
  "AI提取-待确认": Clock,
  "AI提取-已完成": CheckCircle2,
  "AI翻译": Clock,
  "AI翻译-进行中": Clock,
  "AI翻译-待确认": Clock,
  "AI翻译-已完成": CheckCircle2,
  "人工翻译": Clock,
  "质检审核": Clock,
  "视频擦除": Clock,
  "视频擦除-进行中": Clock,
  "视频擦除-待确认": Clock,
  "视频擦除-已完成": CheckCircle2,
  "字幕挂载": Clock,
  "视频压制": Clock,
  "任务分配": CheckCircle2,
  "已完成": CheckCircle2,
}

export function LanguageVariantCard({
  targetLanguage,
  progress,
  totalEpisodes,
  completedEpisodes,
  currentStage,
  image,
  onClick,
  onDoubleClick,
  onEnterEditor,
  isSelected = false,
  isPinned = false,
  className = "",
}: LanguageVariantCardProps) {
  const StageIcon = stageIcons[currentStage] || Clock
  const stageColorClass = stageColors[currentStage] || "bg-muted text-muted-foreground"

  return (
    <Card
      className={`overflow-hidden bg-card border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer group ${
        isPinned ? 'border-primary border-2 shadow-md' : isSelected ? 'border-primary/70 border-2' : ''
      } ${className}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className="flex flex-col">
        {/* 短剧图片 - 方形 */}
        <div className="relative w-full aspect-square bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 overflow-hidden">
          <img
            src={image}
            alt={targetLanguage}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className={`${stageColorClass} border backdrop-blur-sm`}>
              <StageIcon className="w-3 h-3 mr-1" />
              {currentStage}
            </Badge>
          </div>
        </div>

        {/* 内容区域 - 添加平滑过渡 */}
        <div className="p-3 space-y-2 transition-all duration-300 ease-in-out">
          {/* 语言标题 */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Globe className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-foreground">{targetLanguage}</h3>
              <p className="text-[10px] text-muted-foreground">
                共 {totalEpisodes} 集
              </p>
            </div>
          </div>

          {/* 进度条 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">完成进度</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>

          {/* 进入编辑器按钮 - 平滑展开/收起，增加上边距 */}
          {/* 始终显示按钮，包括待开始状态 */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isPinned ? 'max-h-20 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
            }`}
          >
            {onEnterEditor && (
              <Button
                variant="default"
                size="sm"
                className="w-full gap-2"
                onClick={(e) => {
                  e.stopPropagation()
                  onEnterEditor()
                }}
              >
                进入编辑器
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
