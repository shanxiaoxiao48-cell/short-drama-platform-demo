"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AnalyticsDramaProgress } from "./analytics-drama-progress"
import { AnalyticsTaskProgress } from "./analytics-task-progress"
import { AnalyticsTranslatorPerformanceV2 } from "./analytics-translator-performance-v2"
import { AnalyticsBusinessEffect } from "./analytics-business-effect"

export function AnalyticsDataList({ 
  initialStageFilter, 
  initialDateRange,
  initialTaskDramaFilter,
  initialTaskLanguageFilter,
  initialTranslatorFilter,
  onNavigateToDrama,
  onNavigateToTranslator
}: { 
  initialStageFilter?: string
  initialDateRange?: { from: Date; to: Date }
  initialTaskDramaFilter?: string
  initialTaskLanguageFilter?: string
  initialTranslatorFilter?: string
  onNavigateToDrama?: (dramaName: string, language: string) => void
  onNavigateToTranslator?: (translatorName: string) => void
}) {
  // 根据初始筛选参数决定默认显示哪个tab
  const getInitialTab = () => {
    if (initialTranslatorFilter) return "translator-performance"
    if (initialTaskDramaFilter || initialTaskLanguageFilter) return "task-progress"
    return "drama-progress"
  }
  
  const [activeTab, setActiveTab] = useState(getInitialTab())
  const [taskProgressFilters, setTaskProgressFilters] = useState<{
    drama?: string
    language?: string
    translator?: string
  }>({
    drama: initialTaskDramaFilter,
    language: initialTaskLanguageFilter,
  })
  const [translatorFilter, setTranslatorFilter] = useState<string | undefined>(initialTranslatorFilter)

  const handleNavigateToDramaAndLanguage = (dramaName: string, language: string) => {
    setTaskProgressFilters({ drama: dramaName, language })
    setActiveTab("task-progress")
  }

  const handleNavigateToTaskProgress = (drama?: string, translator?: string) => {
    setTaskProgressFilters({ drama, translator })
    setActiveTab("task-progress")
  }

  const handleNavigateToTranslatorPerformance = (translatorName: string) => {
    setTranslatorFilter(translatorName)
    setActiveTab("translator-performance")
  }

  return (
    <div className="flex flex-col h-full">
      {/* 顶部标题 */}
      <div className="p-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold text-foreground">数据列表</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            短剧进度 · 任务进度 · 译员绩效 · 投放效果
          </p>
        </div>
      </div>

      {/* Tab标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-3 border-b border-border">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="drama-progress" className="text-xs">
              短剧进度
            </TabsTrigger>
            <TabsTrigger value="task-progress" className="text-xs">
              任务进度
            </TabsTrigger>
            <TabsTrigger value="translator-performance" className="text-xs">
              译员绩效
            </TabsTrigger>
            <TabsTrigger value="business-effect" className="text-xs">
              投放效果
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="drama-progress" className="m-0 p-4">
            <AnalyticsDramaProgress 
              initialStageFilter={initialStageFilter}
              initialDateRange={initialDateRange}
              onNavigateToDrama={handleNavigateToDramaAndLanguage}
              onNavigateToTranslator={handleNavigateToTranslatorPerformance}
            />
          </TabsContent>

          <TabsContent value="task-progress" className="m-0 p-4">
            <AnalyticsTaskProgress 
              initialDramaFilter={taskProgressFilters.drama}
              initialLanguageFilter={taskProgressFilters.language}
              initialTranslatorFilter={taskProgressFilters.translator}
              onNavigateToTranslator={handleNavigateToTranslatorPerformance}
            />
          </TabsContent>

          <TabsContent value="translator-performance" className="m-0 p-4">
            <AnalyticsTranslatorPerformanceV2 
              initialTranslatorFilter={translatorFilter}
              onNavigateToTranslator={onNavigateToTranslator}
              onNavigateToTaskProgress={(translatorName) => handleNavigateToTaskProgress(undefined, translatorName)}
            />
          </TabsContent>

          <TabsContent value="business-effect" className="m-0 p-4">
            <AnalyticsBusinessEffect />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
