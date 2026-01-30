"use client"

import { Button } from "@/components/ui/button"
import { Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface EpisodeSelectorPanelProps {
  currentEpisode: number
  totalEpisodes: number
  completedEpisodes?: number[] // 已完成的集数列表
  rejectedEpisodes?: number[] // 驳回的集数列表（质检环节）
  onEpisodeChange?: (episode: number) => void
  showCompletedMarks?: boolean // 是否显示已完成的打勾标记
  showViewAllButton?: boolean // 是否显示查看全部按钮
  onCollapse?: () => void // 收起面板回调
}

export function EpisodeSelectorPanel({
  currentEpisode,
  totalEpisodes,
  completedEpisodes = [],
  rejectedEpisodes = [],
  onEpisodeChange,
  showCompletedMarks = true, // 默认显示已完成标记
  showViewAllButton = true, // 默认显示查看全部按钮（已废弃，保留参数兼容性）
  onCollapse,
}: EpisodeSelectorPanelProps) {
  // 直接显示所有集数
  const allEpisodes = Array.from({ length: totalEpisodes }, (_, i) => i + 1)

  const handleEpisodeClick = (ep: number) => {
    onEpisodeChange?.(ep)
  }

  const isEpisodeCompleted = (ep: number) => completedEpisodes.includes(ep)
  const isEpisodeRejected = (ep: number) => rejectedEpisodes.includes(ep)

  const toggleShowAll = () => {
    setShowAll(!showAll)
    if (!showAll) {
      setMatrixOffset(0)
    }
  }

  const visibleEpisodes = getVisibleEpisodes()
  const isEpisodeCompleted = (ep: number) => completedEpisodes.includes(ep)
  const isEpisodeRejected = (ep: number) => rejectedEpisodes.includes(ep)

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header - 固定高度 h-[52px] */}
      <div className="px-3 py-2 border-b border-border shrink-0 h-[52px]">
        <div className="flex items-center justify-between h-full">
          <h4 className="text-sm font-medium text-foreground">
            选集 <span className="text-xs text-muted-foreground">({totalEpisodes}集)</span>
          </h4>
          {onCollapse && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={onCollapse}
              title="收起面板"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable area - 占据剩余空间，高度撑满 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="p-2">
          {/* 集数选择 - 直接显示所有集数 */}
          <div className="grid grid-cols-5 gap-1.5">
            {allEpisodes.map((ep) => {
              const isCompleted = isEpisodeCompleted(ep)
              const isRejected = isEpisodeRejected(ep)
              const isCurrent = ep === currentEpisode
              
              return (
                <Button
                  key={ep}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 w-8 aspect-square p-0 text-[10px] relative transition-all",
                    isCompleted && !isCurrent && showCompletedMarks && "border-success text-success",
                    isRejected && !isCurrent && "border-destructive text-destructive bg-destructive/10",
                    !isCurrent && "hover:border-primary hover:border-2"
                  )}
                  onClick={() => handleEpisodeClick(ep)}
                >
                  {ep}
                  {isCompleted && showCompletedMarks && !isRejected && (
                    <Check className="w-1.5 h-1.5 absolute top-0 right-0" />
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
