"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Copy, ChevronRight, RefreshCw } from "lucide-react"
import { AddTermDialog } from "./add-term-dialog"
import { cn } from "@/lib/utils"

interface GlossaryEntry {
  term: string
  category: string
  explanation: string
  translation?: string
}

interface GlossaryPanelProps {
  isReadOnly?: boolean
  isPending?: boolean // 待开始状态
  isReview?: boolean // AI提取待确认状态
  isAIExtractCompleted?: boolean // AI提取已完成状态
  onCollapse?: () => void // 收起面板回调
  onAddTerm?: (term: { term: string; category: string; explanation: string; translation?: string }) => void
  glossary?: GlossaryEntry[] // 术语表数据
  onRefresh?: () => Promise<void> // 重新提取回调
}

export function GlossaryPanel({
  isReadOnly = false,
  isPending = false,
  isReview = false,
  isAIExtractCompleted = false,
  onCollapse,
  onAddTerm,
  glossary = [],
  onRefresh,
}: GlossaryPanelProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 本地状态管理术语表的翻译（只管理翻译字段，不管理中文解释）
  const [glossaryEdits, setGlossaryEdits] = useState<Record<string, string>>({})

  // 更新术语翻译
  const handleGlossaryChange = (term: string, value: string) => {
    setGlossaryEdits(prev => ({
      ...prev,
      [term]: value
    }))
  }

  // 处理添加术语
  const handleAddTermClick = (termData: { term: string; category: string; explanation: string; translation?: string }) => {
    if (onAddTerm) {
      onAddTerm(termData)
    }
  }

  // 判断是否使用提取阶段的术语表格式
  const isExtractionFormat = isReview || isAIExtractCompleted

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <div className="p-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">术语表</h3>
          <div className="flex items-center gap-1">
            {/* 重新提取按钮 - 只在AI提取待确认状态显示 */}
            {isReview && onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={async () => {
                  setIsRefreshing(true)
                  try {
                    await onRefresh()
                  } finally {
                    setIsRefreshing(false)
                  }
                }}
                disabled={isRefreshing}
                title="重新提取"
              >
                <RefreshCw className={cn("w-3 h-3", isRefreshing && "animate-spin")} />
              </Button>
            )}
            {/* 添加术语按钮 - 所有非只读环节都显示 */}
            {!isReadOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setAddDialogOpen(true)}
                title="添加术语"
              >
                <Plus className="w-3 h-3" />
              </Button>
            )}
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

      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="p-4 space-y-2">
          {isPending ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              暂无数据
            </div>
          ) : glossary.length > 0 ? (
            glossary.map((item, index) => {
              const editedTranslation = glossaryEdits[item.term]
              return (
              <Card
                key={index}
                className="p-2 bg-muted/50 border-border hover:border-primary/50 transition-colors"
              >
                <div className="space-y-1">
                  {isExtractionFormat ? (
                    // AI提取待确认或已完成状态：术语和类别在一行
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{item.term}</p>
                        <p className="text-xs text-primary font-medium shrink-0">
                          {item.category}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.explanation}
                      </p>
                    </>
                  ) : (
                    // 翻译状态：名称和类型在一行，显示翻译和中文解释
                    <>
                      {/* 名称和类型在一行 */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{item.term}</p>
                        <p className="text-xs text-primary font-medium shrink-0">
                          {item.category}
                        </p>
                      </div>

                      {/* 翻译 - 可编辑 */}
                      <Input
                        value={editedTranslation ?? item.translation ?? ""}
                        onChange={(e) => handleGlossaryChange(item.term, e.target.value)}
                        placeholder="输入翻译..."
                        className="h-6 text-xs"
                        disabled={isReadOnly}
                      />

                      {/* 中文解释和复制按钮在一行 */}
                      {item.explanation && (
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground line-clamp-1 flex-1">{item.explanation}</p>
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            )})
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              未找到匹配的术语
            </div>
          )}
        </div>
      </div>

      {/* 添加术语对话框 */}
      <AddTermDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAddTerm={handleAddTermClick}
        isAIExtractionStage={isReview || isAIExtractCompleted}
      />
    </div>
  )
}
