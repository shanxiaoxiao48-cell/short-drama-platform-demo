"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown, RotateCcw } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { PaginationControls } from "@/components/ui/pagination-controls"

// Mock数据 - 短剧进度数据（基于2026年1月28日）- 扩展更多数据
const mockDramaProgress = [
  // 霸道总裁爱上我 - 5个语种
  { id: "DJ26021101-EN", dramaId: "D001", dramaName: "霸道总裁爱上我", language: "英语", languageCode: "EN", episodes: 80, currentStage: "视频压制", progress: 85, translator: "张三", qaPersonnel: "小王", startDate: "2026-01-15 09:00", endDate: null },
  { id: "DJ26021101-ES", dramaId: "D001", dramaName: "霸道总裁爱上我", language: "西班牙语", languageCode: "ES", episodes: 80, currentStage: "成片质检", progress: 85, translator: "李四", qaPersonnel: "小王", startDate: "2026-01-18 10:30", endDate: null },
  { id: "DJ26021101-JA", dramaId: "D001", dramaName: "霸道总裁爱上我", language: "日语", languageCode: "JA", episodes: 80, currentStage: "人工翻译", progress: 52, translator: "王五", qaPersonnel: null, startDate: "2026-01-20 14:15", endDate: null },
  { id: "DJ26021101-FR", dramaId: "D001", dramaName: "霸道总裁爱上我", language: "法语", languageCode: "FR", episodes: 80, currentStage: "AI翻译", progress: 15, translator: "系统", qaPersonnel: null, startDate: "2026-01-26 09:30", endDate: null },
  { id: "DJ26021101-PT", dramaId: "D001", dramaName: "霸道总裁爱上我", language: "葡萄牙语", languageCode: "PT", episodes: 80, currentStage: "人工翻译", progress: 38, translator: "赵六", qaPersonnel: null, startDate: "2026-01-27 11:00", endDate: null },
  { id: "DJ26021101-ZH", dramaId: "D001", dramaName: "霸道总裁爱上我", language: "中文", languageCode: "ZH", episodes: 80, currentStage: "字体调整", progress: 65, translator: "张三", qaPersonnel: null, startDate: "2026-01-22 10:00", endDate: null },
  
  // 穿越之王妃驾到 - 5个语种
  { id: "DJ26021102-EN", dramaId: "D002", dramaName: "穿越之王妃驾到", language: "英语", languageCode: "EN", episodes: 100, currentStage: "已完成", progress: 100, translator: "张三", qaPersonnel: "小刘", startDate: "2025-12-20 08:30", endDate: "2026-01-25 16:45" },
  { id: "DJ26021102-KO", dramaId: "D002", dramaName: "穿越之王妃驾到", language: "韩语", languageCode: "KO", episodes: 100, currentStage: "已完成", progress: 100, translator: "钱七", qaPersonnel: "小陈", startDate: "2025-12-25 09:15", endDate: "2026-01-26 17:20" },
  { id: "DJ26021102-JA", dramaId: "D002", dramaName: "穿越之王妃驾到", language: "日语", languageCode: "JA", episodes: 100, currentStage: "成片质检", progress: 75, translator: "李四", qaPersonnel: "小王", startDate: "2026-01-05 10:00", endDate: null },
  { id: "DJ26021102-ES", dramaId: "D002", dramaName: "穿越之王妃驾到", language: "西班牙语", languageCode: "ES", episodes: 100, currentStage: "视频压制", progress: 92, translator: "孙八", qaPersonnel: "小李", startDate: "2026-01-08 13:30", endDate: null },
  { id: "DJ26021102-DE", dramaId: "D002", dramaName: "穿越之王妃驾到", language: "德语", languageCode: "DE", episodes: 100, currentStage: "人工翻译", progress: 45, translator: "周九", qaPersonnel: null, startDate: "2026-01-22 15:45", endDate: null },
  { id: "DJ26021102-ZH", dramaId: "D002", dramaName: "穿越之王妃驾到", language: "中文", languageCode: "ZH", episodes: 100, currentStage: "字体调整", progress: 72, translator: "李四", qaPersonnel: null, startDate: "2026-01-19 09:30", endDate: null },
  
  // 重生之豪门千金 - 5个语种
  { id: "DJ26021103-EN", dramaId: "D003", dramaName: "重生之豪门千金", language: "英语", languageCode: "EN", episodes: 60, currentStage: "人工翻译", progress: 45, translator: "王五", qaPersonnel: null, startDate: "2026-01-22 09:20", endDate: null },
  { id: "DJ26021103-PT", dramaId: "D003", dramaName: "重生之豪门千金", language: "葡萄牙语", languageCode: "PT", episodes: 60, currentStage: "人工翻译", progress: 30, translator: "李四", qaPersonnel: null, startDate: "2026-01-25 11:30", endDate: null },
  { id: "DJ26021103-KO", dramaId: "D003", dramaName: "重生之豪门千金", language: "韩语", languageCode: "KO", episodes: 60, currentStage: "AI翻译", progress: 8, translator: "系统", qaPersonnel: null, startDate: "2026-01-28 10:15", endDate: null },
  { id: "DJ26021103-FR", dramaId: "D003", dramaName: "重生之豪门千金", language: "法语", languageCode: "FR", episodes: 60, currentStage: "成片质检", progress: 68, translator: "吴十", qaPersonnel: "小陈", startDate: "2026-01-19 14:00", endDate: null },
  { id: "DJ26021103-AR", dramaId: "D003", dramaName: "重生之豪门千金", language: "阿拉伯语", languageCode: "AR", episodes: 60, currentStage: "AI翻译", progress: 12, translator: "系统", qaPersonnel: null, startDate: "2026-01-27 14:20", endDate: null },
  { id: "DJ26021103-ZH", dramaId: "D003", dramaName: "重生之豪门千金", language: "中文", languageCode: "ZH", episodes: 60, currentStage: "字体调整", progress: 58, translator: "王五", qaPersonnel: null, startDate: "2026-01-23 11:15", endDate: null },
  
  // 神医毒妃不好惹 - 5个语种
  { id: "DJ26021104-EN", dramaId: "D004", dramaName: "神医毒妃不好惹", language: "英语", languageCode: "EN", episodes: 90, currentStage: "成片质检", progress: 75, translator: "王五", qaPersonnel: "小王", startDate: "2026-01-10 08:45", endDate: null },
  { id: "DJ26021104-JA", dramaId: "D004", dramaName: "神医毒妃不好惹", language: "日语", languageCode: "JA", episodes: 90, currentStage: "人工翻译", progress: 55, translator: "张三", qaPersonnel: null, startDate: "2026-01-12 10:15", endDate: null },
  { id: "DJ26021104-FR", dramaId: "D004", dramaName: "神医毒妃不好惹", language: "法语", languageCode: "FR", episodes: 90, currentStage: "成片质检", progress: 91, translator: "吴十", qaPersonnel: "小李", startDate: "2026-01-16 13:20", endDate: null },
  { id: "DJ26021104-ES", dramaId: "D004", dramaName: "神医毒妃不好惹", language: "西班牙语", languageCode: "ES", episodes: 90, currentStage: "已完成", progress: 100, translator: "赵六", qaPersonnel: "小刘", startDate: "2026-01-05 09:00", endDate: "2026-01-24 18:30" },
  { id: "DJ26021104-PT", dramaId: "D004", dramaName: "神医毒妃不好惹", language: "葡萄牙语", languageCode: "PT", episodes: 90, currentStage: "视频压制", progress: 88, translator: "李四", qaPersonnel: "小陈", startDate: "2026-01-14 11:45", endDate: null },
  { id: "DJ26021104-ZH", dramaId: "D004", dramaName: "神医毒妃不好惹", language: "中文", languageCode: "ZH", episodes: 90, currentStage: "字体调整", progress: 68, translator: "张三", qaPersonnel: null, startDate: "2026-01-13 10:00", endDate: null },
  
  // 闪婚后大佬马甲藏不住了 - 4个语种
  { id: "DJ26021105-EN", dramaId: "D005", dramaName: "闪婚后大佬马甲藏不住了", language: "英语", languageCode: "EN", episodes: 70, currentStage: "人工翻译", progress: 72, translator: "周九", qaPersonnel: null, startDate: "2026-01-24 10:30", endDate: null },
  { id: "DJ26021105-PT", dramaId: "D005", dramaName: "闪婚后大佬马甲藏不住了", language: "葡萄牙语", languageCode: "PT", episodes: 70, currentStage: "已完成", progress: 100, translator: "孙八", qaPersonnel: "小陈", startDate: "2026-01-18 09:15", endDate: "2026-01-27 17:00" },
  { id: "DJ26021105-JA", dramaId: "D005", dramaName: "闪婚后大佬马甲藏不住了", language: "日语", languageCode: "JA", episodes: 70, currentStage: "成片质检", progress: 82, translator: "王五", qaPersonnel: "小王", startDate: "2026-01-20 14:00", endDate: null },
  { id: "DJ26021105-KO", dramaId: "D005", dramaName: "闪婚后大佬马甲藏不住了", language: "韩语", languageCode: "KO", episodes: 70, currentStage: "视频压制", progress: 95, translator: "钱七", qaPersonnel: "小李", startDate: "2026-01-16 08:30", endDate: null },
  { id: "DJ26021105-ZH", dramaId: "D005", dramaName: "闪婚后大佬马甲藏不住了", language: "中文", languageCode: "ZH", episodes: 70, currentStage: "字体调整", progress: 75, translator: "周九", qaPersonnel: null, startDate: "2026-01-25 09:30", endDate: null },
  
  // 豪门继承人的秘密 - 4个语种
  { id: "DJ26021106-EN", dramaId: "D006", dramaName: "豪门继承人的秘密", language: "英语", languageCode: "EN", episodes: 85, currentStage: "人工翻译", progress: 28, translator: "张三", qaPersonnel: null, startDate: "2026-01-26 13:15", endDate: null },
  { id: "DJ26021106-ES", dramaId: "D006", dramaName: "豪门继承人的秘密", language: "西班牙语", languageCode: "ES", episodes: 85, currentStage: "AI翻译", progress: 20, translator: "系统", qaPersonnel: null, startDate: "2026-01-28 08:45", endDate: null },
  { id: "DJ26021106-JA", dramaId: "D006", dramaName: "豪门继承人的秘密", language: "日语", languageCode: "JA", episodes: 85, currentStage: "人工翻译", progress: 15, translator: "李四", qaPersonnel: null, startDate: "2026-01-27 15:30", endDate: null },
  { id: "DJ26021106-FR", dramaId: "D006", dramaName: "豪门继承人的秘密", language: "法语", languageCode: "FR", episodes: 85, currentStage: "成片质检", progress: 62, translator: "吴十", qaPersonnel: "小陈", startDate: "2026-01-21 10:00", endDate: null },
  { id: "DJ26021106-ZH", dramaId: "D006", dramaName: "豪门继承人的秘密", language: "中文", languageCode: "ZH", episodes: 85, currentStage: "字体调整", progress: 45, translator: "吴十", qaPersonnel: null, startDate: "2026-01-24 14:20", endDate: null },
]

// Mock数据 - 短剧列表
const mockDramas = [
  { id: "D001", title: "霸道总裁爱上我", episodes: 80 },
  { id: "D002", title: "穿越之王妃驾到", episodes: 100 },
  { id: "D003", title: "重生之豪门千金", episodes: 60 },
  { id: "D004", title: "神医毒妃不好惹", episodes: 90 },
  { id: "D005", title: "闪婚后大佬每天都在吃醋", episodes: 70 },
]

// Mock数据 - 语种列表（移除中文）
const mockLanguages = [
  { code: "EN", name: "英语" },
  { code: "ES", name: "西班牙语" },
  { code: "PT", name: "葡萄牙语" },
  { code: "JA", name: "日语" },
  { code: "KO", name: "韩语" },
  { code: "FR", name: "法语" },
  { code: "DE", name: "德语" },
  { code: "AR", name: "阿拉伯语" },
]

interface AnalyticsDramaProgressProps {
  onNavigateToDrama?: (dramaName: string, language: string) => void
  onNavigateToTranslator?: (translatorName: string) => void
  initialStageFilter?: string
  initialDateRange?: { from: Date; to: Date }
}

const getStageColor = (stage: string) => {
  const colors: Record<string, string> = {
    "AI提取": "bg-purple-100 text-purple-700 border-purple-200",
    "视频擦除": "bg-pink-100 text-pink-700 border-pink-200",
  "AI翻译": "bg-blue-100 text-blue-700 border-blue-200",
  "人工翻译": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "字体调整": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "人工调整": "bg-orange-100 text-orange-700 border-orange-200",
  "成片质检": "bg-orange-100 text-orange-700 border-orange-200",
  "视频压制": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "已完成": "bg-green-100 text-green-700 border-green-200",
  }
  return colors[stage] || "bg-gray-100 text-gray-700 border-gray-200"
}

export function AnalyticsDramaProgress({ 
  onNavigateToDrama,
  onNavigateToTranslator,
  initialStageFilter,
  initialDateRange
}: AnalyticsDramaProgressProps) {
  // 筛选器状态
  const [selectedDrama, setSelectedDrama] = useState("all")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [selectedTranslator, setSelectedTranslator] = useState("all")
  const [selectedStage, setSelectedStage] = useState(initialStageFilter || "all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialDateRange ? { from: initialDateRange.from, to: initialDateRange.to } : undefined
  )
  
  // 排序状态
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 准备筛选器选项
  const dramaOptions = useMemo(
    () => [
      { value: "all", label: "全部短剧" },
      ...mockDramas.map((d) => ({
        value: d.id,
        label: d.title,
        subtitle: `${d.episodes}集`,
      })),
    ],
    []
  )

  const languageOptions = useMemo(
    () => [
      { value: "all", label: "全部语种" },
      ...mockLanguages.map((l) => ({ value: l.code, label: l.name })),
    ],
    []
  )

  // 从数据中提取所有译员和质检人员
  const allPersonnel = useMemo(() => {
    const personnel = new Set<string>()
    mockDramaProgress.forEach(item => {
      if (item.translator && item.translator !== "系统") {
        personnel.add(item.translator)
      }
      if (item.qaPersonnel) {
        personnel.add(item.qaPersonnel)
      }
    })
    return Array.from(personnel).sort()
  }, [])

  const translatorOptions = useMemo(
    () => [
      { value: "all", label: "全部译员/审校" },
      ...allPersonnel.map((name) => ({ value: name, label: name })),
    ],
    [allPersonnel]
  )

  const stageOptions = [
    { value: "all", label: "全部环节" },
    { value: "AI提取", label: "AI提取" },
    { value: "视频擦除", label: "视频擦除" },
    { value: "AI翻译", label: "AI翻译" },
    { value: "人工翻译", label: "人工翻译" },
  { value: "字体调整", label: "字体调整" },
  { value: "人工调整", label: "人工调整" },
  { value: "成片质检", label: "成片质检" },
  { value: "视频压制", label: "视频压制" },
    { value: "已完成", label: "已完成" },
  ]

  // 筛选数据
  const filteredData = useMemo(() => {
    return mockDramaProgress.filter(item => {
      if (selectedDrama && selectedDrama !== "all") {
        const matchById = item.dramaId === selectedDrama
        const matchByName = item.dramaName === selectedDrama
        if (!matchById && !matchByName) return false
      }
      
      if (selectedLanguage && selectedLanguage !== "all") {
        const matchByCode = item.languageCode === selectedLanguage
        const matchByName = item.language === selectedLanguage
        if (!matchByCode && !matchByName) return false
      }

      if (selectedTranslator && selectedTranslator !== "all") {
        // 匹配译员或质检人员
        if (item.translator !== selectedTranslator && item.qaPersonnel !== selectedTranslator) {
          return false
        }
      }

      if (selectedStage && selectedStage !== "all") {
        if (item.currentStage !== selectedStage) return false
      }
      
      // Filter by date range (using startDate)
      if (dateRange?.from) {
        const itemStartDate = new Date(item.startDate)
        itemStartDate.setHours(0, 0, 0, 0)
        
        const fromDate = new Date(dateRange.from)
        fromDate.setHours(0, 0, 0, 0)
        
        if (itemStartDate < fromDate) return false
        
        if (dateRange.to) {
          const toDate = new Date(dateRange.to)
          toDate.setHours(23, 59, 59, 999)
          if (itemStartDate > toDate) return false
        }
      }
      
      return true
    })
  }, [selectedDrama, selectedLanguage, selectedTranslator, selectedStage, dateRange])

  // 排序数据
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData

    return [...filteredData].sort((a, b) => {
      // 特别处理译员字段的排序，因为显示时会将系统任务的译员显示为"-"
      if (sortField === "translator") {
        const aHasTranslator = a.translator && a.translator !== "系统"
        const bHasTranslator = b.translator && b.translator !== "系统"
        
        // 有译员的排在前面，没有译员的排在后面
        if (aHasTranslator && !bHasTranslator) return -1
        if (!aHasTranslator && bHasTranslator) return 1
        if (!aHasTranslator && !bHasTranslator) return 0
      }
      
      // 特别处理审校字段的排序，因为显示时会将非成片质检任务的审校显示为"-"
      if (sortField === "qaPersonnel") {
        const aHasQA = a.qaPersonnel
        const bHasQA = b.qaPersonnel
        
        // 有审校的排在前面，没有审校的排在后面
        if (aHasQA && !bHasQA) return -1
        if (!aHasQA && bHasQA) return 1
        if (!aHasQA && !bHasQA) return 0
      }
      
      // 特别处理结束时间字段的排序，因为显示时会将进行中的任务结束时间显示为"-"
      if (sortField === "endDate") {
        const aHasEndDate = a.endDate
        const bHasEndDate = b.endDate
        
        // 有结束时间的排在前面，没有结束时间的排在后面
        if (aHasEndDate && !bHasEndDate) return -1
        if (!aHasEndDate && bHasEndDate) return 1
        if (!aHasEndDate && !bHasEndDate) return 0
      }

      let aValue: any = a[sortField as keyof typeof a]
      let bValue: any = b[sortField as keyof typeof b]

      // 检查是否为空值
      const isANull = aValue === null || aValue === undefined || aValue === ""
      const isBNull = bValue === null || bValue === undefined || bValue === ""
      
      // 如果a是空值，b不是，a排在后面
      if (isANull && !isBNull) {
        return 1
      }
      // 如果b是空值，a不是，b排在后面
      if (!isANull && isBNull) {
        return -1
      }
      // 如果都是空值，保持原有顺序
      if (isANull && isBNull) {
        return 0
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [filteredData, sortField, sortOrder])

  // 分页数据
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, currentPage, pageSize])

  // 总页数
  const totalPages = Math.ceil(sortedData.length / pageSize)

  // 筛选条件改变时重置到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedDrama, selectedLanguage, selectedTranslator, selectedStage, dateRange])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1" />
    return sortOrder === "asc" ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
  }

  const handleRowClick = (dramaName: string, language: string) => {
    if (onNavigateToDrama) {
      onNavigateToDrama(dramaName, language)
    }
  }

  const handleTranslatorClick = (translatorName: string, e: React.MouseEvent) => {
    e.stopPropagation() // 阻止行点击事件
    if (onNavigateToTranslator && translatorName !== "系统") {
      onNavigateToTranslator(translatorName)
    }
  }

  // 重置所有筛选器
  const handleResetFilters = () => {
    setSelectedDrama("all")
    setSelectedLanguage("all")
    setSelectedTranslator("all")
    setSelectedStage("all")
    setDateRange(undefined)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">短剧进度列表</CardTitle>
          
          {/* 筛选器 */}
          <div className="flex items-center gap-2 flex-wrap">
            <SearchableSelect
              value={selectedDrama}
              onValueChange={setSelectedDrama}
              options={dramaOptions}
              placeholder="选择短剧"
              searchPlaceholder="搜索短剧..."
              emptyText="未找到匹配的短剧"
              className="w-48 h-8 text-xs"
            />

            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="选择语种" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <SearchableSelect
              value={selectedTranslator}
              onValueChange={setSelectedTranslator}
              options={translatorOptions}
              placeholder="选择译员/审校"
              searchPlaceholder="搜索译员/审校..."
              emptyText="未找到匹配的译员/审校"
              className="w-36 h-8 text-xs"
            />

            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="选择环节" />
              </SelectTrigger>
              <SelectContent>
                {stageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              className="w-64"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="h-8 text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              重置
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">短剧ID</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("dramaName")}
                          className="flex items-center hover:text-foreground"
                        >
                          短剧名称
                          {getSortIcon("dramaName")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("language")}
                          className="flex items-center hover:text-foreground"
                        >
                          语种
                          {getSortIcon("language")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("episodes")}
                          className="flex items-center hover:text-foreground"
                        >
                          集数
                          {getSortIcon("episodes")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("currentStage")}
                          className="flex items-center hover:text-foreground"
                        >
                          当前环节
                          {getSortIcon("currentStage")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground w-48">
                        <button
                          onClick={() => handleSort("progress")}
                          className="flex items-center hover:text-foreground"
                        >
                          进度
                          {getSortIcon("progress")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("translator")}
                          className="flex items-center hover:text-foreground"
                        >
                          译员
                          {getSortIcon("translator")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("qaPersonnel")}
                          className="flex items-center hover:text-foreground"
                        >
                          审校
                          {getSortIcon("qaPersonnel")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("startDate")}
                          className="flex items-center hover:text-foreground"
                        >
                          开始时间
                          {getSortIcon("startDate")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("endDate")}
                          className="flex items-center hover:text-foreground"
                        >
                          结束时间
                          {getSortIcon("endDate")}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item) => (
                      <tr 
                        key={item.id} 
                        className="border-b border-border hover:bg-muted/50"
                      >
                        <td className="py-3 px-2 font-mono text-xs">{item.id}</td>
                        <td 
                          className="py-3 px-2 font-medium text-primary hover:underline cursor-pointer"
                          onClick={() => handleRowClick(item.dramaName, item.language)}
                        >
                          {item.dramaName}
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="secondary" className="text-xs">{item.language}</Badge>
                        </td>
                        <td className="py-3 px-2">{item.episodes}集</td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className={getStageColor(item.currentStage)}>
                            {item.currentStage}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Progress value={item.progress} className="h-2 flex-1" />
                            <span className="text-xs font-medium w-10 text-right">{item.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {item.translator === "系统" ? (
                            <span className="text-xs text-muted-foreground">-</span>
                          ) : (
                            <span 
                              className="text-xs text-primary hover:underline cursor-pointer"
                              onClick={(e) => handleTranslatorClick(item.translator, e)}
                            >
                              {item.translator}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {item.qaPersonnel ? (
                            <span 
                              className="text-xs text-primary hover:underline cursor-pointer"
                              onClick={(e) => handleTranslatorClick(item.qaPersonnel, e)}
                            >
                              {item.qaPersonnel}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-xs">{item.startDate}</td>
                        <td className="py-3 px-2 text-xs">{item.endDate || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页控件 */}
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={sortedData.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newPageSize) => {
                  setPageSize(newPageSize)
                  setCurrentPage(1)
                }}
              />
            </CardContent>
          </Card>
  )
}
