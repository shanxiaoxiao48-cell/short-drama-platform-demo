"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  Search,
  Filter,
  Play,
  Clock,
  AlertCircle,
  CheckCircle,
  MessageSquare,
} from "lucide-react"

interface SubtitleEditorProps {
  currentTime: number
  onTimeChange: (time: number) => void
  selectedSubtitleId: string | null
  onSelectSubtitle: (id: string | null) => void
}

// Mock subtitle data
const subtitles = [
  {
    id: "1",
    startTime: 0,
    endTime: 3.5,
    original: "我从来没有想过会爱上你",
    translation: "I never thought I would fall in love with you",
    status: "completed",
    hasComment: false,
  },
  {
    id: "2",
    startTime: 3.5,
    endTime: 6.2,
    original: "你是我生命中最重要的人",
    translation: "You are the most important person in my life",
    status: "completed",
    hasComment: true,
  },
  {
    id: "3",
    startTime: 6.2,
    endTime: 9.8,
    original: "我愿意为你做任何事情",
    translation: "I am willing to do anything for you",
    status: "in_progress",
    hasComment: false,
  },
  {
    id: "4",
    startTime: 9.8,
    endTime: 13.0,
    original: "请相信我，我会永远保护你",
    translation: "Please believe me, I will always protect you",
    status: "pending",
    hasComment: false,
  },
  {
    id: "5",
    startTime: 13.0,
    endTime: 16.5,
    original: "不管发生什么，我都会在你身边",
    translation: "No matter what happens, I will be by your side",
    status: "pending",
    hasComment: false,
  },
  {
    id: "6",
    startTime: 16.5,
    endTime: 20.0,
    original: "这就是爱情的力量",
    translation: "This is the power of love",
    status: "pending",
    hasComment: false,
  },
  {
    id: "7",
    startTime: 20.0,
    endTime: 24.5,
    original: "我的心永远属于你",
    translation: "My heart belongs to you forever",
    status: "pending",
    hasComment: false,
  },
  {
    id: "8",
    startTime: 24.5,
    endTime: 28.0,
    original: "让我们一起面对未来",
    translation: "Let us face the future together",
    status: "pending",
    hasComment: false,
  },
]

const statusMap: Record<string, { color: string; icon: typeof CheckCircle }> = {
  completed: { color: "text-success", icon: CheckCircle },
  in_progress: { color: "text-primary", icon: Clock },
  pending: { color: "text-muted-foreground", icon: AlertCircle },
}

export function SubtitleEditor({
  currentTime,
  onTimeChange,
  selectedSubtitleId,
  onSelectSubtitle,
}: SubtitleEditorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`
  }

  const handleStartEdit = (subtitle: (typeof subtitles)[0]) => {
    setEditingId(subtitle.id)
    setEditValue(subtitle.translation)
  }

  const handleSaveEdit = () => {
    // Save logic here
    setEditingId(null)
  }

  const isCurrentSubtitle = (sub: (typeof subtitles)[0]) => {
    return currentTime >= sub.startTime && currentTime < sub.endTime
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索字幕内容..."
            className="pl-9 bg-input border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-1" />
          筛选
        </Button>
        <Badge variant="outline" className="text-muted-foreground">
          {subtitles.length} 条字幕
        </Badge>
      </div>

      {/* Subtitle list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {subtitles.map((subtitle) => {
            const status = statusMap[subtitle.status]
            const StatusIcon = status.icon
            const isCurrent = isCurrentSubtitle(subtitle)
            const isSelected = selectedSubtitleId === subtitle.id
            const isEditing = editingId === subtitle.id

            return (
              <Card
                key={subtitle.id}
                className={cn(
                  "p-3 bg-card border-border hover:border-primary/50 cursor-pointer transition-colors",
                  isCurrent && "border-primary bg-primary/5",
                  isSelected && "ring-2 ring-primary"
                )}
                onClick={() => {
                  onSelectSubtitle(subtitle.id)
                  onTimeChange(subtitle.startTime)
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Timeline */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTimeChange(subtitle.startTime)
                      }}
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatTime(subtitle.startTime)}
                    </span>
                    <span className="text-xs text-muted-foreground">|</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatTime(subtitle.endTime)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2 min-w-0">
                    {/* Original */}
                    <div className="text-sm text-muted-foreground">{subtitle.original}</div>

                    {/* Translation */}
                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="min-h-[60px] bg-input border-border"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            保存
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingId(null)
                            }}
                          >
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="text-sm text-foreground hover:bg-muted/50 rounded px-2 py-1 -mx-2"
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          handleStartEdit(subtitle)
                        }}
                      >
                        {subtitle.translation}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <StatusIcon className={cn("w-4 h-4", status.color)} />
                    {subtitle.hasComment && (
                      <MessageSquare className="w-4 h-4 text-warning" />
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
