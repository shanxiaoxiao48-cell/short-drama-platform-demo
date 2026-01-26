"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface OnScreenTextPanelProps {
  currentTime: number
  onScreenText: Array<{
    id: string
    startTime: number
    endTime: number
    text: string
    translatedText?: string // 翻译文本
    type?: string // 画面字类型
  }>
  isReadOnly?: boolean // 只读模式
  showTranslation?: boolean // 是否显示翻译
}

export function OnScreenTextPanel({
  currentTime,
  onScreenText,
  isReadOnly = false,
  showTranslation = false,
}: OnScreenTextPanelProps) {
  // 本地状态管理画面字的翻译
  const [translations, setTranslations] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    onScreenText.forEach(item => {
      if (item.translatedText) {
        initial[item.id] = item.translatedText
      }
    })
    return initial
  })

  // 更新翻译
  const handleTranslationChange = (id: string, value: string) => {
    setTranslations(prev => ({
      ...prev,
      [id]: value
    }))
  }

  // Check if on-screen text is current
  const isCurrentOnScreenText = (item: typeof onScreenText[0]) => {
    return currentTime >= item.startTime && currentTime < item.endTime
  }

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <div className="p-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">画面字</h3>
          {!isReadOnly && (
            <Button variant="ghost" size="sm" className="h-7">
              <Plus className="w-3 h-3 mr-1" />
              添加
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {onScreenText.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
            <p>暂无画面字数据</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {onScreenText.map((item) => {
              const isCurrent = isCurrentOnScreenText(item)
              return (
                <Card
                  key={item.id}
                  className={cn(
                    "p-2 border transition-colors",
                    isCurrent
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/50 border-border hover:border-primary/50"
                  )}
                >
                  <div className="space-y-1.5">
                    {/* 原文和类型在一行 */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground truncate flex-1">{item.text}</span>
                      {item.type && (
                        <span className="text-xs text-primary font-medium shrink-0">{item.type}</span>
                      )}
                    </div>
                    
                    {/* 翻译和复制按钮在一行 */}
                    {showTranslation && (
                      <div className="flex items-center gap-2">
                        <Input
                          value={translations[item.id] || item.translatedText || ""}
                          onChange={(e) => handleTranslationChange(item.id, e.target.value)}
                          placeholder="输入翻译..."
                          className="h-7 text-xs flex-1"
                          disabled={isReadOnly}
                        />
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
