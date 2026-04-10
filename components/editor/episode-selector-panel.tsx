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

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border shrink-0 h-[52px] flex items-center">
        <div className="flex items-center justify-between w-full">
          <h4 className="text-sm font-medium text-foreground">
            选集
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {completedEpisodes.length} / {totalEpisodes}
            </span>
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
      </div>

      {/* Scrollable area - 占据剩余空间，高度撑满 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="p-3">
          {/* 集数选择 - 直接显示所有集数 */}
          <div className="grid grid-cols-8 gap-1">
            {allEpisodes.map((ep) => {
              const isCurrent = ep === currentEpisode
              const isCompleted = isEpisodeCompleted(ep)
              const isRejected = isEpisodeRejected(ep)
              
              return (
                <div
                  key={ep}
                  className={cn(
                    "flex items-center justify-center aspect-square rounded text-xs font-medium transition-colors border border-border",
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isRejected
                      ? "bg-destructive/20 text-destructive"
                      : isCompleted
                      ? "bg-success/20 text-success"
                      : "bg-background hover:bg-muted"
                  )}
                  onClick={() => handleEpisodeClick(ep)}
                  title={`第${ep}集${isCompleted ? " - 已完成" : isRejected ? " - 已驳回" : ""}`}
                >
                  {ep}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
