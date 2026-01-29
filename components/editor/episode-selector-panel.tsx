"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Check, ChevronDown, ChevronUp, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { SubtitleStylePanel, SubtitleStyle } from "./subtitle-style-panel"

interface EpisodeSelectorPanelProps {
  currentEpisode: number
  totalEpisodes: number
  completedEpisodes?: number[] // 已完成的集数列表
  rejectedEpisodes?: number[] // 驳回的集数列表（质检环节）
  subtitleStyle: SubtitleStyle
  onStyleChange: (style: SubtitleStyle) => void
  onEpisodeChange?: (episode: number) => void
  showStylePanel?: boolean // 是否显示字幕样式面板
  showCompletedMarks?: boolean // 是否显示已完成的打勾标记
  showViewAllButton?: boolean // 是否显示查看全部按钮
  onCollapse?: () => void // 收起面板回调
}

export function EpisodeSelectorPanel({
  currentEpisode,
  totalEpisodes,
  completedEpisodes = [],
  rejectedEpisodes = [],
  subtitleStyle,
  onStyleChange,
  onEpisodeChange,
  showStylePanel = true, // 默认显示字幕样式面板
  showCompletedMarks = true, // 默认显示已完成标记
  showViewAllButton = true, // 默认显示查看全部按钮
  onCollapse,
}: EpisodeSelectorPanelProps) {
  const [showAll, setShowAll] = useState(false)
  
  const ROWS = 5
  const COLS = 5
  const ITEMS_PER_PAGE = ROWS * COLS
  
  // 计算初始偏移量，让当前集数显示在第一行
  const getInitialOffset = () => {
    // 计算当前集数应该在第几行（从0开始）
    const currentRow = Math.floor((currentEpisode - 1) / COLS)
    // 偏移量 = 当前行 * 每行的列数
    return currentRow * COLS
  }
  
  const [matrixOffset, setMatrixOffset] = useState(getInitialOffset())

  // 计算当前显示的集数范围
  const getVisibleEpisodes = () => {
    if (showAll) {
      return Array.from({ length: totalEpisodes }, (_, i) => i + 1)
    }
    
    const start = matrixOffset
    const end = Math.min(start + ITEMS_PER_PAGE, totalEpisodes)
    const episodes = Array.from({ length: end - start }, (_, i) => start + i + 1)
    
    // 如果不是最后一页，最后一个显示为省略号
    if (end < totalEpisodes && episodes.length === ITEMS_PER_PAGE) {
      episodes[episodes.length - 1] = -1 // -1 表示省略号
    }
    
    return episodes
  }

  const handleEpisodeClick = (ep: number, index: number) => {
    if (ep === -1) {
      // 点击省略号，向下滚动一行
      const newOffset = Math.min(matrixOffset + COLS, totalEpisodes - ITEMS_PER_PAGE)
      setMatrixOffset(Math.max(0, newOffset))
    } else {
      // 检查点击的是第几排
      const rowIndex = Math.floor(index / COLS)
      const isFirstRow = rowIndex === 0
      const isLastRow = rowIndex === ROWS - 1
      
      // 检查是否已显示第一集和最后一集
      const isFirstEpisodeInMatrix = matrixOffset === 0
      const isLastEpisodeInMatrix = matrixOffset + ITEMS_PER_PAGE >= totalEpisodes
      
      // 如果点击第一排且不是第一集，向上滚动4行（20个集数），让被点击的行变成最后一排
      if (isFirstRow && !isFirstEpisodeInMatrix) {
        const scrollAmount = COLS * 4 // 4行 = 20个集数
        const newOffset = Math.max(0, matrixOffset - scrollAmount)
        setMatrixOffset(newOffset)
      }
      // 如果点击最后一排且不是最后一集，向下滚动4行（20个集数），让被点击的行变成第一排
      else if (isLastRow && !isLastEpisodeInMatrix) {
        const scrollAmount = COLS * 4 // 4行 = 20个集数
        const newOffset = matrixOffset + scrollAmount
        // 确保不超过最大偏移量
        const maxOffset = Math.max(0, totalEpisodes - ITEMS_PER_PAGE)
        setMatrixOffset(Math.min(newOffset, maxOffset))
      }
      
      onEpisodeChange?.(ep)
    }
  }

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
      {/* Header - 与术语表标题保持一致 */}
      <div className="px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
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

      {/* Scrollable area - 占据剩余空间 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="p-2 space-y-3">
          {/* 集数选择 */}
          <div>
            <div 
              className={cn(
                "grid grid-cols-5 gap-1.5",
                showAll && "max-h-[400px] overflow-y-auto"
              )}
            >
              {visibleEpisodes.map((ep, index) => {
                if (ep === -1) {
                  // 省略号
                  return (
                    <Button
                      key={`ellipsis-${index}`}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 aspect-square p-0 text-[10px]"
                      onClick={() => handleEpisodeClick(ep, index)}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  )
                }
                
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
                    onClick={() => handleEpisodeClick(ep, index)}
                  >
                    {ep}
                    {isCompleted && showCompletedMarks && !isRejected && (
                      <Check className="w-1.5 h-1.5 absolute top-0 right-0" />
                    )}
                  </Button>
                )
              })}
            </div>
            
            {/* 查看全部/收起按钮 - 根据集数和showViewAllButton控制显示 */}
            {showViewAllButton && totalEpisodes > ITEMS_PER_PAGE && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 h-7 text-[10px]"
                onClick={toggleShowAll}
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-3 h-3 mr-1" />
                    收起
                  </>
                ) : (
                  <>
                    查看全部 ({totalEpisodes})
                  </>
                )}
              </Button>
            )}
          </div>

          <Separator />

          {/* 字幕样式调节 - 使用新的 SubtitleStylePanel 组件 */}
          <SubtitleStylePanel
            subtitleStyle={subtitleStyle}
            onStyleChange={onStyleChange}
            showStylePanel={showStylePanel}
          />
        </div>
      </div>
    </div>
  )
}
