"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { mockTranslators } from "@/lib/mock-analytics-data"
import { PaginationControls } from "@/components/ui/pagination-controls"

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
  
  // 计算单价（基于总成本和工作时长）
  const unitPrice = t.totalMinutes > 0 ? Math.round((t.cost / t.totalMinutes) * 10) / 10 : 40.0
  
  // 确定译员类型（审校的selfModificationRate为0）
  const type = t.selfModificationRate === 0 ? "审校" : "翻译"
  
  // 随机分配状态（保持数据多样性）
  const statuses = ["空闲", "忙碌"]
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  
  // 修正：工作时长应该比视频时长长
  // 假设效率比为4.5（即1分钟视频需要4.5分钟工作时长）
  // 视频时长 = 工作时长 / 4.5
  const videoDuration = Math.round(t.totalMinutes / 4.5)
  
  return {
    id: t.id,
    name: t.name,
    type,
    rating,
    completedTasks: t.completedTasks,
    videoDuration,  // 视频时长（分钟）
    totalMinutes: t.totalMinutes,  // 工作时长（分钟）
    unitPrice,
    totalCost: t.cost,
    modificationRate: t.modificationRate,
    selfModificationRate: t.selfModificationRate,
    onTimeRate: 90 + Math.floor(Math.random() * 10), // 90-99%
    qualityScore: rating,
    status,
    languages: t.languages,
    specialties: t.specialties,
  }
})

type SortField = "rating" | "completedTasks" | "videoDuration" | "totalMinutes" | "unitPrice" | "totalCost" | "modificationRate" | "selfModificationRate" | "qualityScore"
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
}

export function AnalyticsTranslatorPerformanceV2({ onNavigateToTranslator, onNavigateToTaskProgress, initialTranslatorFilter }: AnalyticsTranslatorPerformanceV2Props) {
  // 筛选器状态
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [selectedTranslator, setSelectedTranslator] = useState(initialTranslatorFilter || "all")
  const [selectedRating, setSelectedRating] = useState("all")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  
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
      { value: "EN", label: "英语" },
      { value: "ES", label: "西班牙语" },
      { value: "PT", label: "葡萄牙语" },
      { value: "JA", label: "日语" },
      { value: "KO", label: "韩语" },
      { value: "FR", label: "法语" },
      { value: "DE", label: "德语" },
      { value: "AR", label: "阿拉伯语" },
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
  ]

  const statusOptions = [
    { value: "all", label: "全部状态" },
    { value: "空闲", label: "空闲" },
    { value: "忙碌", label: "忙碌" },
  ]

  // 筛选和排序后的数据
  const sortedData = useMemo(() => {
    // First filter the data
    let filtered = translatorData.filter(translator => {
      // Filter by translator
      if (selectedTranslator && selectedTranslator !== "all") {
        if (translator.id !== selectedTranslator && translator.name !== selectedTranslator) return false
      }
      
      // Filter by language
      if (selectedLanguage && selectedLanguage !== "all") {
        const languageMap: Record<string, string> = {
          "EN": "英语",
          "ES": "西班牙语",
          "PT": "葡萄牙语",
          "JA": "日语",
          "KO": "韩语",
          "FR": "法语",
          "DE": "德语",
          "AR": "阿拉伯语",
        }
        const languageName = languageMap[selectedLanguage] || selectedLanguage
        const hasLanguage = translator.languages.some(lang => 
          lang === languageName || lang === selectedLanguage
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
      if (selectedType && selectedType !== "all") {
        if (translator.type !== selectedType) return false
      }
      
      // Filter by status
      if (selectedStatus && selectedStatus !== "all") {
        if (translator.status !== selectedStatus) return false
      }
      
      return true
    })
    
    // Then sort the filtered data
    filtered.sort((a, b) => {
      const aValue = a[sortField] ?? 0
      const bValue = b[sortField] ?? 0
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    return filtered
  }, [sortField, sortOrder, selectedTranslator, selectedLanguage, selectedRating, selectedSpecialty, selectedType, selectedStatus])

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
  }, [selectedLanguage, selectedTranslator, selectedRating, selectedSpecialty, selectedType, selectedStatus])

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
      minutes: paginatedData.reduce((sum, t) => sum + t.totalMinutes, 0),
      cost: paginatedData.reduce((sum, t) => sum + t.totalCost, 0),
    }
  }, [paginatedData])

  // 重置所有筛选器
  const handleResetFilters = () => {
    setSelectedLanguage("all")
    setSelectedTranslator("all")
    setSelectedRating("all")
    setSelectedSpecialty("all")
    setSelectedType("all")
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

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue placeholder="译员类型" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">类型</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("rating")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    综合评分
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">评级</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("completedTasks")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    任务数量
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("videoDuration")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    视频时长
                    {getSortIcon("videoDuration")}
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("totalMinutes")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    有效工作时长
                    {getSortIcon("totalMinutes")}
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("unitPrice")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    单价
                    {getSortIcon("unitPrice")}
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("totalCost")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    结算金额
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("modificationRate")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    修改率
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("selfModificationRate")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    返修率
                    {getSortIcon("selfModificationRate")}
                  </button>
                </th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">语言</th>
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
                    <Badge variant={translator.type === "翻译" ? "default" : "secondary"} className="text-xs">
                      {translator.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-lg font-bold text-primary">{translator.rating.toFixed(1)}</span>
                  </td>
                  <td className="py-3 px-2">{getRatingBadge(translator.rating)}</td>
                  <td className="py-3 px-2 font-medium">
                    {translator.completedTasks}个
                  </td>
                  <td className="py-3 px-2">{formatMinutesToHoursAndMinutes(translator.videoDuration)}</td>
                  <td className="py-3 px-2">{formatMinutesToHoursAndMinutes(translator.totalMinutes)}</td>
                  <td className="py-3 px-2">¥{translator.unitPrice.toFixed(0)}</td>
                  <td className="py-3 px-2 font-semibold text-lg">¥{translator.totalCost.toLocaleString()}</td>
                  <td className="py-3 px-2">
                    <span className={translator.modificationRate > 15 ? "text-green-600 font-semibold" : translator.modificationRate < 10 ? "text-red-600 font-semibold" : ""}>
                      {translator.modificationRate.toFixed(1)}%
                    </span>
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
                    <div className="flex flex-wrap gap-1">
                      {translator.languages.map((lang) => (
                        <Badge key={lang} variant="outline" className="text-xs">{lang}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex gap-1">
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
                <td className="py-3 px-2">{formatMinutesToHoursAndMinutes(totals.minutes)}</td>
                <td className="py-3 px-2">-</td>
                <td className="py-3 px-2 text-lg">¥{totals.cost.toLocaleString()}</td>
                <td className="py-3 px-2" colSpan={5}>-</td>
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
