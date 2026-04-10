"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Save, Trash2, Plus } from "lucide-react"

interface SubtitleEntry {
  id: string
  startTime: number
  endTime: number
  originalText: string
  translatedText: string
}

interface SubtitleEditPanelProps {
  selectedSubtitle: SubtitleEntry | null
  onSave: (subtitle: SubtitleEntry) => void
  onDelete: (id: string) => void
  onTimeChange: (time: number) => void
}

export function SubtitleEditPanel({
  selectedSubtitle,
  onSave,
  onDelete,
  onTimeChange,
}: SubtitleEditPanelProps) {
  const [editedSubtitle, setEditedSubtitle] = useState<SubtitleEntry | null>(
    selectedSubtitle
  )

  // Update edited subtitle when selection changes
  if (selectedSubtitle?.id !== editedSubtitle?.id) {
    setEditedSubtitle(selectedSubtitle)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(2)
    return `${mins}:${secs.padStart(5, "0")}`
  }

  const parseTime = (timeStr: string): number => {
    const [mins, secs] = timeStr.split(":")
    return parseInt(mins) * 60 + parseFloat(secs)
  }

  const handleSave = () => {
    if (editedSubtitle) {
      onSave(editedSubtitle)
    }
  }

  if (!editedSubtitle) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-muted-foreground mb-2">未选择字幕</p>
          <p className="text-sm text-muted-foreground">
            点击时间轴上的字幕块进行编辑
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-foreground">字幕编辑</h3>
        <p className="text-xs text-muted-foreground mt-1">
          ID: {editedSubtitle.id}
        </p>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Time controls */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm">开始时间</Label>
              <div className="flex gap-2">
                <Input
                  value={formatTime(editedSubtitle.startTime)}
                  onChange={(e) => {
                    const newTime = parseTime(e.target.value)
                    if (!isNaN(newTime)) {
                      setEditedSubtitle({
                        ...editedSubtitle,
                        startTime: newTime,
                      })
                    }
                  }}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTimeChange(editedSubtitle.startTime)}
                >
                  跳转
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">结束时间</Label>
              <div className="flex gap-2">
                <Input
                  value={formatTime(editedSubtitle.endTime)}
                  onChange={(e) => {
                    const newTime = parseTime(e.target.value)
                    if (!isNaN(newTime)) {
                      setEditedSubtitle({
                        ...editedSubtitle,
                        endTime: newTime,
                      })
                    }
                  }}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTimeChange(editedSubtitle.endTime)}
                >
                  跳转
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              时长: {(editedSubtitle.endTime - editedSubtitle.startTime).toFixed(2)}秒
            </div>
          </div>

          <Separator />

          {/* Original text */}
          <div className="space-y-2">
            <Label className="text-sm">原文</Label>
            <Textarea
              value={editedSubtitle.originalText}
              onChange={(e) =>
                setEditedSubtitle({
                  ...editedSubtitle,
                  originalText: e.target.value,
                })
              }
              className="min-h-20 resize-none bg-muted/50"
              placeholder="原文字幕..."
            />
          </div>

          <Separator />

          {/* Translated text */}
          <div className="space-y-2">
            <Label className="text-sm">译文</Label>
            <Textarea
              value={editedSubtitle.translatedText}
              onChange={(e) =>
                setEditedSubtitle({
                  ...editedSubtitle,
                  translatedText: e.target.value,
                })
              }
              className="min-h-24 resize-none"
              placeholder="翻译字幕..."
            />
            <div className="text-xs text-muted-foreground">
              字符数: {editedSubtitle.translatedText.length}
            </div>
          </div>

          <Separator />

          {/* Quick actions */}
          <div className="space-y-2">
            <Label className="text-sm">快速操作</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Plus className="w-3 h-3 mr-1" />
                分割字幕
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Plus className="w-3 h-3 mr-1" />
                合并字幕
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button className="w-full" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          保存修改
        </Button>
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive"
          onClick={() => onDelete(editedSubtitle.id)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          删除字幕
        </Button>
      </div>
    </div>
  )
}
