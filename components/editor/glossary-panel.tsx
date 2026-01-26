"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Copy } from "lucide-react"

// Mock data - 翻译阶段的术语表（包含翻译和中文解释）
const translationGlossary = [
  { term: "总裁", translation: "CEO / President", explanation: "公司的最高管理者", category: "职位" },
  { term: "少爷", translation: "Young Master", explanation: "对富贵人家年轻男子的尊称", category: "称谓" },
  { term: "契约", translation: "Contract", explanation: "具有法律约束力的协议", category: "法律" },
  { term: "豪门", translation: "Wealthy family", explanation: "有钱有势的家族", category: "社会阶层" },
]

// Mock data - AI提取阶段的术语表（只有术语、类别和解释，无翻译）
const extractionGlossary = [
  { term: "总裁", category: "职位", explanation: "公司的最高管理者，负责公司的整体运营和决策" },
  { term: "少爷", category: "称谓", explanation: "对富贵人家年轻男子的尊称" },
  { term: "契约", category: "法律", explanation: "双方或多方之间具有法律约束力的协议" },
  { term: "豪门", category: "社会阶层", explanation: "指有钱有势的家族或家庭" },
]

interface GlossaryPanelProps {
  isReadOnly?: boolean
  isPending?: boolean // 待开始状态
  isReview?: boolean // AI提取待确认状态
  isAIExtractCompleted?: boolean // AI提取已完成状态
}

export function GlossaryPanel({ 
  isReadOnly = false, 
  isPending = false, 
  isReview = false, 
  isAIExtractCompleted = false
}: GlossaryPanelProps) {
  const [glossarySearch, setGlossarySearch] = useState("")
  
  // 本地状态管理术语表的翻译（只管理翻译字段，不管理中文解释）
  const [glossaryEdits, setGlossaryEdits] = useState<Record<string, string>>({})
  
  // 更新术语翻译
  const handleGlossaryChange = (term: string, value: string) => {
    setGlossaryEdits(prev => ({
      ...prev,
      [term]: value
    }))
  }
  
  // 根据状态选择不同的术语表数据
  // 待开始状态：空数据
  // AI提取待确认状态或AI提取已完成状态：显示术语、类别、解释
  // 人工翻译和质检状态：显示术语、翻译、解释、备注
  const glossary = isPending ? [] : (isReview || isAIExtractCompleted ? extractionGlossary : translationGlossary)
  
  // 判断是否使用提取阶段的术语表格式
  const isExtractionFormat = isReview || isAIExtractCompleted

  const filteredGlossary = glossary.filter((item) => {
    const searchLower = glossarySearch.toLowerCase()
    if (isExtractionFormat) {
      // AI提取阶段：搜索术语、类别、解释
      return (
        item.term.toLowerCase().includes(searchLower) ||
        (item as any).category?.toLowerCase().includes(searchLower) ||
        (item as any).explanation?.toLowerCase().includes(searchLower)
      )
    } else {
      // 翻译阶段：搜索术语、翻译
      return (
        item.term.toLowerCase().includes(searchLower) ||
        (item as any).translation?.toLowerCase().includes(searchLower)
      )
    }
  })

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <div className="p-3 border-b border-border shrink-0">
        <h3 className="text-sm font-semibold text-foreground mb-2">术语表</h3>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索术语..."
            className="pl-9 bg-input border-border h-8 text-sm"
            value={glossarySearch}
            onChange={(e) => setGlossarySearch(e.target.value)}
            disabled={isReadOnly}
          />
        </div>
        {!isReadOnly && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              // TODO: Open add term dialog
              alert("添加新术语功能开发中")
            }}
          >
            <Plus className="w-3 h-3 mr-1" />
            添加术语
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="p-4 space-y-2">
          {isPending ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              暂无数据
            </div>
          ) : filteredGlossary.length > 0 ? (
            filteredGlossary.map((item, index) => {
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
                          {(item as any).category}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {(item as any).explanation}
                      </p>
                    </>
                  ) : (
                    // 翻译状态：名称和类型在一行，显示翻译和中文解释
                    <>
                      {/* 名称和类型在一行 */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{item.term}</p>
                        <p className="text-xs text-primary font-medium shrink-0">
                          {(item as any).category}
                        </p>
                      </div>
                      
                      {/* 翻译 - 可编辑 */}
                      <Input
                        value={editedTranslation ?? (item as any).translation ?? ""}
                        onChange={(e) => handleGlossaryChange(item.term, e.target.value)}
                        placeholder="输入翻译..."
                        className="h-6 text-xs"
                        disabled={isReadOnly}
                      />
                      
                      {/* 中文解释和复制按钮在一行 */}
                      {(item as any).explanation && (
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground line-clamp-1 flex-1">{(item as any).explanation}</p>
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
    </div>
  )
}
