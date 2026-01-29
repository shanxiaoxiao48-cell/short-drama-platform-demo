"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RotateCcw, History } from "lucide-react"
import { cn } from "@/lib/utils"

interface VersionRecord {
  id: string
  version: number
  type: "ai" | "manual" | "review"
  text: string
  userId: string
  userName: string
  timestamp: string
}

interface SubtitleWithHistory {
  id: string
  startTime: number
  endTime: number
  originalText: string
  currentText: string
  versions: VersionRecord[]
}

interface SubtitleHistoryPanelProps {
  subtitles: SubtitleWithHistory[]
  currentTime: number
  selectedId: string | null
  onSelectSubtitle: (id: string) => void
  onTimeChange: (time: number) => void
  onRevertVersion: (subtitleId: string, versionId: string) => void
  onRevertAll: () => void
  isReadOnly?: boolean
}

export function SubtitleHistoryPanel({
  subtitles,
  currentTime,
  selectedId,
  onSelectSubtitle,
  onTimeChange,
  onRevertVersion,
  onRevertAll,
  isReadOnly = false,
}: SubtitleHistoryPanelProps) {
  const [expandedSubtitle, setExpandedSubtitle] = useState<string | null>(null)

  const isCurrentSubtitle = (sub: SubtitleWithHistory) => {
    return currentTime >= sub.startTime && currentTime < sub.endTime
  }

  const getVersionTypeBadge = (type: "ai" | "manual" | "review") => {
    const config = {
      ai: { label: "AI", className: "bg-blue-500" },
      manual: { label: "人工", className: "bg-green-500" },
      review: { label: "审核", className: "bg-purple-500" },
    }
    const { label, className } = config[type]
    return (
      <Badge className={cn("text-xs", className)}>
        {label}
      </Badge>
    )
  }

  // 计算文本差异并高亮显示
  const renderTextDiff = (oldText: string, newText: string) => {
    if (oldText === newText) {
      return <span>{newText}</span>
    }

    // 简单的差异算法：按字符比较
    const maxLen = Math.max(oldText.length, newText.length)
    const result: JSX.Element[] = []
    let diffStart = -1
    let diffEnd = -1

    // 找到第一个不同的位置
    for (let i = 0; i < maxLen; i++) {
      if (oldText[i] !== newText[i]) {
        diffStart = i
        break
      }
    }

    // 找到最后一个不同的位置
    for (let i = 0; i < maxLen; i++) {
      const oldIdx = oldText.length - 1 - i
      const newIdx = newText.length - 1 - i
      if (oldText[oldIdx] !== newText[newIdx]) {
        diffEnd = newIdx + 1
        break
      }
    }

    if (diffStart === -1) {
      return <span>{newText}</span>
    }

    // 渲染带高亮的文本
    return (
      <span>
        {newText.substring(0, diffStart)}
        <span className="bg-red-100 text-red-700 px-0.5 rounded">
          {newText.substring(diffStart, diffEnd)}
        </span>
        {newText.substring(diffEnd)}
      </span>
    )
  }

  // 检查字幕是否有修改
  const hasModifications = (subtitle: SubtitleWithHistory) => {
    return subtitle.versions.length > 1
  }

  return (
    <div className="flex h-full">
      {/* 左侧：最新版本列表 */}
      <div className="flex-1 flex flex-col border-r border-border">
        <div className="px-3 py-2 border-b border-border shrink-0 bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">当前版本</h3>
            {!isReadOnly && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7"
                onClick={onRevertAll}
                disabled={!subtitles.some(hasModifications)}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                全部回退
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {subtitles.map((subtitle) => {
              const isCurrent = isCurrentSubtitle(subtitle)
              const isSelected = selectedId === subtitle.id
              const hasHistory = hasModifications(subtitle)
              const latestVersion = subtitle.versions[subtitle.versions.length - 1]

              return (
                <Card
                  key={subtitle.id}
                  className={cn(
                    "p-2 cursor-pointer transition-all",
                    isCurrent && "border-primary/50 bg-primary/5",
                    isSelected && "border-primary bg-primary/10 shadow-sm",
                    !isCurrent && !isSelected && "hover:border-primary/30"
                  )}
                  onClick={() => {
                    onSelectSubtitle(subtitle.id)
                    onTimeChange(subtitle.startTime)
                    setExpandedSubtitle(subtitle.id)
                  }}
                >
                  <div className="space-y-1">
                    {/* 原文 */}
                    <div className="text-xs text-muted-foreground">
                      {subtitle.originalText}
                    </div>

                    {/* 当前译文 */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs flex-1">
                        {hasHistory && subtitle.versions.length > 1
                          ? renderTextDiff(
                              subtitle.versions[subtitle.versions.length - 2].text,
                              subtitle.currentText
                            )
                          : subtitle.currentText}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {latestVersion && getVersionTypeBadge(latestVersion.type)}
                        {hasHistory && (
                          <Badge variant="outline" className="text-xs">
                            <History className="w-2.5 h-2.5 mr-0.5" />
                            {subtitle.versions.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* 右侧：历史版本详情 */}
      <div className="w-80 flex flex-col">
        <div className="px-3 py-2 border-b border-border shrink-0 bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">历史版本</h3>
        </div>

        <ScrollArea className="flex-1">
          {expandedSubtitle ? (
            <div className="p-3 space-y-2">
              {(() => {
                const subtitle = subtitles.find((s) => s.id === expandedSubtitle)
                if (!subtitle) return <p className="text-xs text-muted-foreground">未选择字幕</p>

                return (
                  <>
                    {/* 原文参考 */}
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground mb-1">原文</p>
                      <p className="text-xs">{subtitle.originalText}</p>
                    </div>

                    {/* 版本历史 */}
                    <div className="space-y-2">
                      {subtitle.versions
                        .slice()
                        .reverse()
                        .map((version, index) => {
                          const isLatest = index === 0
                          return (
                            <Card
                              key={version.id}
                              className={cn(
                                "p-2",
                                isLatest && "border-primary bg-primary/5"
                              )}
                            >
                              <div className="space-y-1.5">
                                {/* 版本信息 */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    {getVersionTypeBadge(version.type)}
                                    <span className="text-xs text-muted-foreground">
                                      v{version.version}
                                    </span>
                                  </div>
                                  {!isLatest && !isReadOnly && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-xs"
                                      onClick={() => onRevertVersion(subtitle.id, version.id)}
                                    >
                                      <RotateCcw className="w-3 h-3 mr-1" />
                                      回退
                                    </Button>
                                  )}
                                </div>

                                {/* 版本文本 */}
                                <p className="text-xs">{version.text}</p>

                                {/* 修改信息 */}
                                <div className="text-xs text-muted-foreground">
                                  <p>{version.userName}</p>
                                  <p>{new Date(version.timestamp).toLocaleString("zh-CN")}</p>
                                </div>
                              </div>
                            </Card>
                          )
                        })}
                    </div>
                  </>
                )
              })()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
              <p>点击左侧字幕查看历史版本</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
