"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown, RotateCcw, ChevronsUpDown, Check } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { mockTranslators } from "@/lib/mock-analytics-data"
import { getLanguagePrice } from "@/lib/language-prices"
import { PaginationControls } from "@/components/ui/pagination-controls"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

// 格式化分钟为"X小时X分钟"
const formatMinutesToHoursAndMinutes = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)

  if (hours === 0) {
    return `${minutes}分钟`
  } else if (minutes === 0) {
    return `${hours}小时`
  } else {
    return `${hours}小时${minutes}分钟`
  }
}

// 将统一数据源的译员数据转换为绩效列表所需的格式
const translatorData = mockTranslators.map(t => {
  // 根据评级计算数值评分
  const ratingMap: Record<string, number> = {
    "S": 9.2,
    "A+": 8.7,
    "A": 8.2,
    "B": 7.8,
    "C": 7.0
  }
  const rating = ratingMap[t.qualityRating] || 8.0

  // 计算各语种单价
  const getLanguageUnitPrice = (lang: string) => {
    // 将语种名称转换为代码并获取单价
    const languageCodeMap: Record<string, string> = {
      "英语": "en",
      "日语": "ja",
      "韩语": "ko",
      "西班牙语": "es",
      "葡萄牙语": "pt",
      "法语": "fr",
      "德语": "de",
      "阿拉伯语": "ar",
      "简体中文": "zh-Hans",
      "繁体中文": "zh-Hant",
      "泰语": "th",
      "菲律宾语": "tl",
      "印尼语": "id",
      "越南语": "vi",
      "马来语": "ms",
      "俄语": "ru",
      "意大利语": "it",
      "土耳其语": "tr",
      "印地语": "hi",
    }
    const code = languageCodeMap[lang] || lang
    return getLanguagePrice(code)
  }

  // 计算单价（取该译员擅长语种的平均单价）
  const languagePrices = t.languages.map(lang => getLanguageUnitPrice(lang))
  const unitPrice = languagePrices.length > 0
    ? Math.round((languagePrices.reduce((sum, p) => sum + p, 0) / languagePrices.length) * 10) / 10
    : 40.0

  // 确定译员类型（支持既是翻译又是审校的情况）
  // 随机为部分译员设置为两种类型
  const isBothType = Math.random() > 0.7 // 30%的概率为两种类型
  const type = isBothType ? ["翻译", "审校"] : (t.selfModificationRate === 0 ? "审校" : "翻译")

  // 随机分配状态（保持数据多样性）
  const statuses = ["空闲", "忙碌"]
  const status = statuses[Math.floor(Math.random() * statuses.length)]

  // 修正：工作时长应该比视频时长长
  // 假设效率比为4.5（即1分钟视频需要4.5分钟工作时长）
  // 视频时长 = 工作时长 / 4.5
  const videoDuration = Math.round(t.totalMinutes / 4.5)

  // 计算翻译和审校工作时长
  const translationMinutes = Math.round(t.totalMinutes * (Math.random() * 0.4 + 0.6)) // 60-100%
  const reviewMinutes = t.totalMinutes - translationMinutes
  
  // 计算翻译和审校单价
  const translationUnitPrice = unitPrice
  const reviewUnitPrice = Math.round(unitPrice * 0.8 * 10) / 10 // 审校单价为翻译的80%

  // 计算抽检比例（随机生成 5%-20% 之间的值）
  const spotCheckRate = Math.round((Math.random() * 15 + 5) * 10) / 10

  return {
    id: t.id,
    name: t.name,
    type,
    rating,
    completedTasks: t.completedTasks,
    videoDuration,  // 视频时长（分钟）
    translationMinutes,  // 翻译工作总时长（分钟）
    reviewMinutes,  // 审校工作总时长（分钟）
    translationUnitPrice,  // 翻译单价
    reviewUnitPrice,  // 审校单价
    totalCost: t.cost,
    modificationRate: t.modificationRate,
    selfModificationRate: t.selfModificationRate,
    onTimeRate: 90 + Math.floor(Math.random() * 10), // 90-99%
    spotCheckRate,  // 抽检比例
    qualityScore: rating,
    status,
    languages: t.languages,
    languageUnitPrices: Object.fromEntries(t.languages.map(lang => [lang, getLanguageUnitPrice(lang)])),
    specialties: t.specialties,
  }
})

type SortField = "rating" | "completedTasks" | "videoDuration" | "translationMinutes" | "reviewMinutes" | "translationUnitPrice" | "reviewUnitPrice" | "totalCost" | "modificationRate" | "selfModificationRate" | "qualityScore" | "spotCheckRate"
type SortOrder = "asc" | "desc"

const getRatingBadge = (rating: number) => {
  if (rating >= 9.0) return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">S级</Badge>
  if (rating >= 8.5) return <Badge className="bg-green-100 text-green-700 border-green-200">A+级</Badge>
  if (rating >= 8.0) return <Badge className="bg-blue-100 text-blue-700 border-blue-200">A级</Badge>
  if (rating >= 7.5) return <Badge className="bg-orange-100 text-orange-700 border-orange-200">B级</Badge>
  return <Badge className="bg-red-100 text-red-700 border-red-200">C级</Badge>
}

interface AnalyticsTranslatorPerformanceV2Props {
  onNavigateToTranslator?: (translatorName: string) => void
  onNavigateToTaskProgress?: (translatorName: string) => void
  initialTranslatorFilter?: string
  initialFilters?: {
    language: string
    translator: string
    rating: string
    specialty: string
    types: string[]
    status: string
  }
  onFiltersChange?: (filters: {
    language: string
    translator: string
    rating: string
    specialty: string
    types: string[]
    status: string
  }) => void
}

export function AnalyticsTranslatorPerformanceV2({ onNavigateToTranslator, onNavigateToTaskProgress, initialTranslatorFilter, initialFilters, onFiltersChange }: AnalyticsTranslatorPerformanceV2Props) {
  // 筛选器状态
  const [selectedLanguage, setSelectedLanguage] = useState(initialFilters?.language || "all")
  const [selectedTranslator, setSelectedTranslator] = useState(initialFilters?.translator || initialTranslatorFilter || "all")
  const [selectedRating, setSelectedRating] = useState(initialFilters?.rating || "all")
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialFilters?.specialty || "all")
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialFilters?.types || ["all"])
  const [selectedStatus, setSelectedStatus] = useState(initialFilters?.status || "all")
  
  // 当筛选器变化时，调用onFiltersChange
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        language: selectedLanguage,
        translator: selectedTranslator,
        rating: selectedRating,
        specialty: selectedSpecialty,
        types: selectedTypes,
        status: selectedStatus
      })
    }
  }, [selectedLanguage, selectedTranslator, selectedRating, selectedSpecialty, selectedTypes, selectedStatus, onFiltersChange])

  // 排序状态
  const [sortField, setSortField] = useState<SortField>("rating")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 准备筛选器选项
  const languageOptions = useMemo(
    () => [
      { value: "all", label: "全部语种" },
      { value: "en", label: "英语" },
      { value: "zh-Hans", label: "简体中文" },
      { value: "zh-Hant", label: "繁体中文" },
      { value: "es", label: "西班牙语" },
      { value: "tl", label: "菲律宾语" },
      { value: "ko", label: "韩语" },
      { value: "ja", label: "日语" },
      { value: "id", label: "印尼语" },
      { value: "ar", label: "阿拉伯语" },
      { value: "hi", label: "印地语" },
      { value: "pt", label: "葡萄牙语" },
      { value: "vi", label: "越南语" },
      { value: "de", label: "德语" },
      { value: "fr", label: "法语" },
      { value: "ms", label: "马来语" },
      { value: "ru", label: "俄语" },
      { value: "it", label: "意大利语" },
      { value: "tr", label: "土耳其语" },
      { value: "th", label: "泰语" },
    ],
    []
  )

  const translatorOptions = useMemo(
    () => [
      { value: "all", label: "全部译员" },
      ...translatorData.map((t) => ({ value: t.name, label: t.name })),
    ],
    []
  )

  const ratingOptions = [
    { value: "all", label: "全部评级" },
    { value: "S", label: "S级 (≥9.0)" },
    { value: "A+", label: "A+级 (8.5-8.9)" },
    { value: "A", label: "A级 (8.0-8.4)" },
    { value: "B", label: "B级 (7.5-7.9)" },
    { value: "C", label: "C级 (<7.5)" },
  ]

  const specialtyOptions = [
    { value: "all", label: "全部剧本类型" },
    { value: "现代剧", label: "现代剧" },
    { value: "都市剧", label: "都市剧" },
    { value: "古装剧", label: "古装剧" },
    { value: "武侠剧", label: "武侠剧" },
    { value: "悬疑剧", label: "悬疑剧" },
    { value: "推理剧", label: "推理剧" },
    { value: "宫廷剧", label: "宫廷剧" },
    { value: "爱情剧", label: "爱情剧" },
    { value: "青春剧", label: "青春剧" },
  ]

  const typeOptions = [
    { value: "all", label: "全部译员类型" },
    { value: "翻译", label: "翻译" },
    { value: "审校", label: "审校" },
    { value: "both", label: "翻译和审校" },
  ]

  const statusOptions = [
    { value: "all", label: "全部状态" },
    { value: "空闲", label: "空闲" },
    { value: "忙碌", label: "忙碌" },
  ]

  // 筛选和排序后的数据
  const sortedData = useMemo(() => {
    // First filter by data
    let filtered = translatorData.filter(translator => {
      // Filter by translator
      if (selectedTranslator && selectedTranslator !== "all") {
        if (translator.id !== selectedTranslator && translator.name !== selectedTranslator) return false
      }

      // Filter by language
      if (selectedLanguage && selectedLanguage !== "all") {
        const hasLanguage = translator.languages.some(lang =>
          lang === selectedLanguage
        )
        if (!hasLanguage) return false
      }

      // Filter by rating
      if (selectedRating && selectedRating !== "all") {
        const rating = translator.rating
        switch(selectedRating) {
          case "S":
            if (rating < 9.0) return false
            break
          case "A+":
            if (rating < 8.5 || rating >= 9.0) return false
            break
          case "A":
            if (rating < 8.0 || rating >= 8.5) return false
            break
          case "B":
            if (rating < 7.5 || rating >= 8.0) return false
            break
          case "C":
            if (rating >= 7.5) return false
            break
        }
      }

      // Filter by specialty
      if (selectedSpecialty && selectedSpecialty !== "all") {
        if (!translator.specialties.includes(selectedSpecialty)) return false
      }

      // Filter by type
      if (selectedTypes.length > 0 && !selectedTypes.includes("all")) {
        const translatorTypes = Array.isArray(translator.type) ? translator.type : [translator.type]
        const selectedType = selectedTypes[0]
        
        if (selectedType === "both") {
          // 选择了"翻译和审校"，只显示既是翻译又是审校的译员
          if (!Array.isArray(translator.type) || translator.type.length < 2) return false
        } else {
          // 选择了单一类型，显示该类型的译员（包括既是该类型又是其他类型的）
          const hasMatchingType = translatorTypes.includes(selectedType)
          if (!hasMatchingType) return false
        }
      }

      // Filter by status
      if (selectedStatus && selectedStatus !== "all") {
        if (translator.status !== selectedStatus) return false
      }

      return true
    })

    // Then sort the filtered data
    filtered.sort((a, b) => {
      // 首先处理译员类型筛选时的优先级排序
      if (selectedTypes.length > 0 && !selectedTypes.includes("all")) {
        const selectedType = selectedTypes[0]
        if (selectedType !== "both") {
          const isAPureType = !Array.isArray(a.type) && a.type === selectedType
          const isBPureType = !Array.isArray(b.type) && b.type === selectedType
          const isABothType = Array.isArray(a.type) && a.type.includes(selectedType)
          const isBBothType = Array.isArray(b.type) && b.type.includes(selectedType)
          
          // 纯类型排在前面，混合类型排在后面
          if (isAPureType && !isBPureType) return -1
          if (!isAPureType && isBPureType) return 1
          if (isABothType && !isBBothType) return 1
          if (!isABothType && isBBothType) return -1
        }
      }
      
      // 处理空值排序：空值始终排在后面，有数值的排在前面
      // 特别处理：根据译员类型，某些字段对特定类型的译员应视为空值
      let aValue = a[sortField]
      let bValue = b[sortField]
      
      // 检查是否为空值，考虑译员类型
      let isANull = aValue === null || aValue === undefined || (typeof aValue === "string" && aValue === "")
      let isBNull = bValue === null || bValue === undefined || (typeof bValue === "string" && bValue === "")
      
      // 对于翻译工作总时长，非翻译类型的译员视为空值
      if (sortField === "translationMinutes") {
        const aIsTranslator = !Array.isArray(a.type) ? a.type === "翻译" : a.type.includes("翻译")
        const bIsTranslator = !Array.isArray(b.type) ? b.type === "翻译" : b.type.includes("翻译")
        if (!aIsTranslator) isANull = true
        if (!bIsTranslator) isBNull = true
      }
      
      // 对于审校工作总时长，非审校类型的译员视为空值
      if (sortField === "reviewMinutes") {
        const aIsReviewer = !Array.isArray(a.type) ? a.type === "审校" : a.type.includes("审校")
        const bIsReviewer = !Array.isArray(b.type) ? b.type === "审校" : b.type.includes("审校")
        if (!aIsReviewer) isANull = true
        if (!bIsReviewer) isBNull = true
      }
      
      // 对于翻译单价，非翻译类型的译员视为空值
      if (sortField === "translationUnitPrice") {
        const aIsTranslator = !Array.isArray(a.type) ? a.type === "翻译" : a.type.includes("翻译")
        const bIsTranslator = !Array.isArray(b.type) ? b.type === "翻译" : b.type.includes("翻译")
        if (!aIsTranslator) isANull = true
        if (!bIsTranslator) isBNull = true
      }
      
      // 对于审校单价，非审校类型的译员视为空值
      if (sortField === "reviewUnitPrice") {
        const aIsReviewer = !Array.isArray(a.type) ? a.type === "审校" : a.type.includes("审校")
        const bIsReviewer = !Array.isArray(b.type) ? b.type === "审校" : b.type.includes("审校")
        if (!aIsReviewer) isANull = true
        if (!bIsReviewer) isBNull = true
      }
      
      // 对于修改率，非翻译类型的译员视为空值
      if (sortField === "modificationRate") {
        const aIsTranslator = !Array.isArray(a.type) ? a.type === "翻译" : a.type.includes("翻译")
        const bIsTranslator = !Array.isArray(b.type) ? b.type === "翻译" : b.type.includes("翻译")
        if (!aIsTranslator) isANull = true
        if (!bIsTranslator) isBNull = true
      }
      
      // 对于抽检比例，非审校类型的译员视为空值
      if (sortField === "spotCheckRate") {
        const aIsReviewer = !Array.isArray(a.type) ? a.type === "审校" : a.type.includes("审校")
        const bIsReviewer = !Array.isArray(b.type) ? b.type === "审校" : b.type.includes("审校")
        if (!aIsReviewer) isANull = true
        if (!bIsReviewer) isBNull = true
      }
      
      // 对于评级和综合评分，非翻译类型的译员视为空值
      if (sortField === "rating" || sortField === "qualityScore") {
        const aIsTranslator = !Array.isArray(a.type) ? a.type === "翻译" : a.type.includes("翻译")
        const bIsTranslator = !Array.isArray(b.type) ? b.type === "翻译" : b.type.includes("翻译")
        if (!aIsTranslator) isANull = true
        if (!bIsTranslator) isBNull = true
      }
      
      // 对于返修修改率，值为0或null的视为空值
      if (sortField === "selfModificationRate") {
        if (a.selfModificationRate === null || a.selfModificationRate === undefined || a.selfModificationRate <= 0) {
          isANull = true
        }
        if (b.selfModificationRate === null || b.selfModificationRate === undefined || b.selfModificationRate <= 0) {
          isBNull = true
        }
      }
      
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
      
      // 正常排序（只有当两个值都不是空值时才执行）
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [sortField, sortOrder, selectedTranslator, selectedLanguage, selectedRating, selectedSpecialty, selectedTypes, selectedStatus])

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
  }, [selectedLanguage, selectedTranslator, selectedRating, selectedSpecialty, selectedTypes, selectedStatus])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3" />
    return sortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
  }

  // 计算总计 - 基于筛选后的数据
  const totals = useMemo(() => {
    return {
      tasks: paginatedData.reduce((sum, t) => sum + t.completedTasks, 0),
      videoDuration: paginatedData.reduce((sum, t) => sum + t.videoDuration, 0),
      translationMinutes: paginatedData.reduce((sum, t) => sum + t.translationMinutes, 0),
      reviewMinutes: paginatedData.reduce((sum, t) => sum + t.reviewMinutes, 0),
      cost: paginatedData.reduce((sum, t) => sum + t.totalCost, 0),
    }
  }, [paginatedData])

  // 重置所有筛选器
  const handleResetFilters = () => {
    setSelectedLanguage("all")
    setSelectedTranslator("all")
    setSelectedRating("all")
    setSelectedSpecialty("all")
    setSelectedTypes(["all"])
    setSelectedStatus("all")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">译员综合数据表</CardTitle>

          {/* 筛选器 */}
          <div className="flex items-center gap-2 flex-wrap">
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
              placeholder="选择译员"
              searchPlaceholder="搜索译员..."
              emptyText="未找到匹配的译员"
              className="w-32 h-8 text-xs"
            />

            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="选择评级" />
              </SelectTrigger>
              <SelectContent>
                {ratingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="擅长类型" />
              </SelectTrigger>
              <SelectContent>
                {specialtyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 译员类型多选筛选器 */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-28 h-8 text-xs justify-between">
                  <span>
                    {selectedTypes.includes("all") ? "全部译员类型" : selectedTypes.join(", ")}
                  </span>
                  <ChevronsUpDown className="w-3 h-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-0" align="start">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {typeOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={(value) => {
                            // 单选逻辑
                            setSelectedTypes([value]);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedTypes.includes(option.value) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">译员姓名</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">译员类型</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("rating")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    综合评分
                    {getSortIcon("rating")}
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">评级</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("completedTasks")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    任务数量
                    {getSortIcon("completedTasks")}
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("videoDuration")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    视频总时长
                    {getSortIcon("videoDuration")}
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("translationMinutes")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    翻译工作总时长
                    {getSortIcon("translationMinutes")}
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("reviewMinutes")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    审校工作总时长
                    {getSortIcon("reviewMinutes")}
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">语言</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("translationUnitPrice")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    翻译单价
                    {getSortIcon("translationUnitPrice")}
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("reviewUnitPrice")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    审校单价
                    {getSortIcon("reviewUnitPrice")}
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("totalCost")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    结算总额
                    {getSortIcon("totalCost")}
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("modificationRate")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    修改率
                    {getSortIcon("modificationRate")}
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("selfModificationRate")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    返修修改率
                    {getSortIcon("selfModificationRate")}
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("spotCheckRate")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    抽检比例
                    {getSortIcon("spotCheckRate")}
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">擅长剧本</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">状态</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((translator) => (
                <tr
                  key={translator.id}
                  className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onNavigateToTranslator?.(translator.name)}
                >
                  <td className="py-3 px-2 font-medium">{translator.name}</td>
                  <td className="py-3 px-2">
                    <div className={`gap-1 ${Array.isArray(translator.type) && translator.type.length > 1 ? 'flex flex-col' : 'flex flex-wrap'}`}>
                      {Array.isArray(translator.type) ? (
                        translator.type.map((type) => (
                          <Badge key={type} variant={type === "翻译" ? "default" : "secondary"} className="text-xs">
                            {type}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant={translator.type === "翻译" ? "default" : "secondary"} className="text-xs">
                          {translator.type}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    {(!Array.isArray(translator.type) && translator.type === "翻译") || (Array.isArray(translator.type) && translator.type.includes("翻译")) ? (
                      <span className="text-lg font-bold text-primary">{translator.rating.toFixed(1)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    {(!Array.isArray(translator.type) && translator.type === "翻译") || (Array.isArray(translator.type) && translator.type.includes("翻译")) ? (
                      getRatingBadge(translator.rating)
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2 font-medium">
                    {translator.completedTasks}个
                  </td>
                  <td className="py-3 px-2">{formatMinutesToHoursAndMinutes(translator.videoDuration)}</td>
                  <td className="py-3 px-2">
                    {(!Array.isArray(translator.type) && translator.type === "翻译") || (Array.isArray(translator.type) && translator.type.includes("翻译")) ? (
                      formatMinutesToHoursAndMinutes(translator.translationMinutes)
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    {(!Array.isArray(translator.type) && translator.type === "审校") || (Array.isArray(translator.type) && translator.type.includes("审校")) ? (
                      formatMinutesToHoursAndMinutes(translator.reviewMinutes)
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex flex-col gap-1">
                      {translator.languages.map((lang) => (
                        <div key={lang} className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">{lang}</Badge>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    {(!Array.isArray(translator.type) && translator.type === "翻译") || (Array.isArray(translator.type) && translator.type.includes("翻译")) ? (
                      <div className="flex flex-col gap-1">
                        {translator.languages.map((lang) => (
                          <div key={lang} className="text-sm">
                            ¥{translator.translationUnitPrice.toFixed(0)}/分
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    {(!Array.isArray(translator.type) && translator.type === "审校") || (Array.isArray(translator.type) && translator.type.includes("审校")) ? (
                      <div className="flex flex-col gap-1">
                        {translator.languages.map((lang) => (
                          <div key={lang} className="text-sm">
                            ¥{translator.reviewUnitPrice.toFixed(0)}/分
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2 font-semibold text-lg">¥{translator.totalCost.toLocaleString()}</td>
                  <td className="py-3 px-2">
                    {(!Array.isArray(translator.type) && translator.type === "翻译") || (Array.isArray(translator.type) && translator.type.includes("翻译")) ? (
                      <span className={translator.modificationRate > 15 ? "text-green-600 font-semibold" : translator.modificationRate < 10 ? "text-red-600 font-semibold" : ""}>
                        {translator.modificationRate.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    {translator.selfModificationRate !== null && translator.selfModificationRate > 0 ? (
                      <span className={translator.selfModificationRate < 5 ? "text-green-600 font-semibold" : translator.selfModificationRate > 8 ? "text-red-600 font-semibold" : ""}>
                        {translator.selfModificationRate.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    {(!Array.isArray(translator.type) && translator.type === "审校") || (Array.isArray(translator.type) && translator.type.includes("审校")) ? (
                      <span className="font-semibold">
                        {translator.spotCheckRate.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex flex-col gap-1">
                      {translator.specialties.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <Badge
                      variant="outline"
                      className={translator.status === "空闲" ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}
                    >
                      {translator.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border font-semibold bg-muted/30">
                <td className="py-3 px-2" colSpan={4}>合计</td>
                <td className="py-3 px-2">{totals.tasks}个</td>
                <td className="py-3 px-2">{formatMinutesToHoursAndMinutes(totals.videoDuration)}</td>
                <td className="py-3 px-2">{formatMinutesToHoursAndMinutes(paginatedData.reduce((sum, t) => sum + t.translationMinutes, 0))}</td>
                <td className="py-3 px-2">{formatMinutesToHoursAndMinutes(paginatedData.reduce((sum, t) => sum + t.reviewMinutes, 0))}</td>
                <td className="py-3 px-2">-</td>
                <td className="py-3 px-2">-</td>
                <td className="py-3 px-2">-</td>
                <td className="py-3 px-2 text-lg">¥{totals.cost.toLocaleString()}</td>
                <td className="py-3 px-2" colSpan={4}>-</td>
              </tr>
            </tfoot>
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
