"use client"

import { useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SubtitleModificationTooltip } from "./subtitle-modification-tooltip"
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"

interface ModificationRecord {
  userId: string
  userName: string
  role: "translator" | "reviewer"
  originalText: string
  modifiedText: string
  timestamp: string // 改为字符串以避免 hydration 问题
}

interface SubtitleEntry {
  id: string
  startTime: number
  endTime: number
  originalText: string
  translatedText: string
  modifications?: ModificationRecord[]
}

interface SubtitleDualPanelProps {
  subtitles: SubtitleEntry[]
  currentTime: number
  selectedId: string | null
  onSelectSubtitle: (id: string) => void
  onUpdateSubtitle: (id: string, field: "originalText" | "translatedText", value: string) => void
  onTimeChange: (time: number) => void
  onCompleteEpisode?: () => void
  showTranslation?: boolean // 是否显示翻译字幕
  isReadOnly?: boolean // 只读模式
  isPending?: boolean // 待开始状态
  showCompleteButton?: boolean // 是否显示完成本集按钮
  showModifications?: boolean // 是否显示修改标记（质检环节显示）
  // AI提取待确认状态的导航参数
  isReview?: boolean // 是否是AI提取待确认状态
  currentEpisode?: number // 当前集数
  totalEpisodes?: number // 总集数
  onPrevEpisode?: () => void // 上一集
  onNextEpisode?: () => void // 下一集
  onConfirmEpisode?: () => void // 确认本集
}

export function SubtitleDualPanel({
  subtitles,
  currentTime,
  selectedId,
  onSelectSubtitle,
  onUpdateSubtitle,
  onTimeChange,
  onCompleteEpisode,
  showTranslation = true, // 默认显示翻译
  isReadOnly = false, // 默认可编辑
  isPending = false, // 默认不是待开始状态
  showCompleteButton = true, // 默认显示完成本集按钮
  showModifications = false, // 默认不显示修改标记（只在质检环节显示）
  isReview = false, // 默认不是AI提取待确认状态
  currentEpisode = 1,
  totalEpisodes = 1,
  onPrevEpisode,
  onNextEpisode,
  onConfirmEpisode,
}: SubtitleDualPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLDivElement>(null)

  const isCurrentSubtitle = (sub: SubtitleEntry) => {
    return currentTime >= sub.startTime && currentTime < sub.endTime
  }

  // Auto-scroll to selected subtitle
  useEffect(() => {
    if (selectedRef.current && scrollAreaRef.current) {
      selectedRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [selectedId])

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border shrink-0">
        <h3 className="text-sm font-semibold text-foreground">字幕编辑</h3>
        <p className="text-xs text-muted-foreground">
          {subtitles.length > 0 ? `${subtitles.length} 条字幕` : "暂无字幕数据"}
        </p>
      </div>

      {/* Subtitle list - scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar" ref={scrollAreaRef}>
        {subtitles.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            <p>请先完成AI提取任务</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {subtitles.map((subtitle) => {
              const isCurrent = isCurrentSubtitle(subtitle)
              // selectedId 可能是带前缀的（orig-1, trans-1），需要提取基础ID进行匹配
              const baseSelectedId = selectedId?.replace(/^(orig|trans|os)-/, "")
              const isSelected = baseSelectedId === subtitle.id

            return (
              <div
                key={subtitle.id}
                ref={isSelected ? selectedRef : null}
                className={cn(
                  "p-1.5 border rounded cursor-pointer transition-all space-y-1",
                  isCurrent && "border-primary/50 bg-primary/5",
                  isSelected && "border-primary bg-primary/10 shadow-sm",
                  !isCurrent && !isSelected && "border-border hover:border-primary/30"
                )}
                onClick={() => {
                  onSelectSubtitle(subtitle.id)
                  onTimeChange(subtitle.startTime)
                }}
              >
                {/* 原文 - 不可编辑，上方 */}
                <div className="text-xs bg-muted/30 rounded px-2 py-1.5 text-muted-foreground">
                  {subtitle.originalText}
                </div>

                {/* 译文 - 可编辑，下方 - 只在showTranslation为true时显示 */}
                {showTranslation && (
                  <div className="relative">
                    <Textarea
                      value={subtitle.translatedText}
                      onChange={(e) => {
                        e.stopPropagation()
                        onUpdateSubtitle(subtitle.id, "translatedText", e.target.value)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "min-h-[40px] max-h-[120px] text-xs resize-none py-1.5 px-2 border-0",
                        showModifications && subtitle.modifications && subtitle.modifications.length > 0 && "pr-8"
                      )}
                      rows={2}
                      placeholder="译文"
                      disabled={isReadOnly}
                    />
                    {/* 只在质检环节显示修改标记 */}
                    {showModifications && subtitle.modifications && subtitle.modifications.length > 0 && (
                      <div className="absolute right-2 top-1.5">
                        <SubtitleModificationTooltip
                          currentText={subtitle.translatedText}
                          modifications={subtitle.modifications}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          </div>
        )}
      </div>

      {/* Footer - 导航按钮 */}
      {/* AI提取待确认状态、人工翻译和质检状态的导航按钮 */}
      {(isReview || (!isPending && !isReadOnly && showCompleteButton)) && (
        <div className="px-3 py-2 border-t border-border shrink-0">
          <div className="flex items-center gap-2">
            {/* 上一集按钮 - 第一集时禁用 */}
            {onPrevEpisode && (
              <Button 
                variant="outline"
                size="sm"
                onClick={onPrevEpisode}
                disabled={currentEpisode === 1}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                上一集
              </Button>
            )}
            
            {/* 中间按钮 - AI提取待确认状态显示"确认本集"，人工翻译和质检状态显示"完成本集" */}
            {isReview && onConfirmEpisode ? (
              <Button 
                size="sm"
                onClick={onConfirmEpisode}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                确认本集
              </Button>
            ) : (
              <Button 
                size="sm"
                onClick={onCompleteEpisode}
                disabled={subtitles.length === 0 || isReadOnly}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                完成本集
              </Button>
            )}
            
            {/* 下一集按钮 - 最后一集时禁用 */}
            {onNextEpisode && (
              <Button 
                variant="outline"
                size="sm"
                onClick={onNextEpisode}
                disabled={currentEpisode === totalEpisodes}
                className="flex-1"
              >
                下一集
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
