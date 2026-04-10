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
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { PaginationControls } from "@/components/ui/pagination-controls"

// ROI排行榜 - 增加投放时间字段
const roiList = [
  { id: "1", drama: "霸道总裁爱上我", language: "英语", translator: "张三", qaPersonnel: "小王", spend: 8736, translationCost: 3120, roi: 3.2, conversion: 3.8, launchDate: "2026-01-20" },
  { id: "2", drama: "穿越之王妃驾到", language: "日语", translator: "李四", qaPersonnel: "小李", spend: 16320, translationCost: 5100, roi: 2.9, conversion: 3.5, launchDate: "2026-01-10" },
  { id: "3", drama: "穿越之王妃驾到", language: "韩语", translator: "钱七", qaPersonnel: "小陈", spend: 16896, translationCost: 5280, roi: 2.7, conversion: 3.2, launchDate: "2026-01-08" },
  { id: "4", drama: "闪婚后大佬马甲藏不住了", language: "英语", translator: "王五", qaPersonnel: "小刘", spend: 13440, translationCost: 4200, roi: 2.5, conversion: 2.8, launchDate: "2026-01-25" },
  { id: "5", drama: "霸道总裁爱上我", language: "西班牙语", translator: "赵六", qaPersonnel: "小王", spend: 7728, translationCost: 2760, roi: 2.3, conversion: 2.5, launchDate: "2026-01-22" },
  { id: "6", drama: "重生之豪门千金", language: "英语", translator: "王五", qaPersonnel: "小李", spend: 9240, translationCost: 3600, roi: 2.6, conversion: 2.9, launchDate: "2026-01-18" },
  { id: "7", drama: "神医毒妃不好惹", language: "英语", translator: "王五", qaPersonnel: "小王", spend: 12600, translationCost: 4500, roi: 2.8, conversion: 3.1, launchDate: "2026-01-15" },
  { id: "8", drama: "霸道总裁爱上我", language: "日语", translator: "王五", qaPersonnel: "小李", spend: 8400, translationCost: 3000, roi: 2.8, conversion: 3.0, launchDate: "2026-01-12" },
  { id: "9", drama: "穿越之王妃驾到", language: "英语", translator: "张三", qaPersonnel: "小刘", spend: 18900, translationCost: 6000, roi: 3.2, conversion: 3.6, launchDate: "2025-12-28" },
  { id: "10", drama: "神医毒妃不好惹", language: "法语", translator: "吴十", qaPersonnel: "小李", spend: 11340, translationCost: 4200, roi: 2.7, conversion: 2.9, launchDate: "2026-01-05" },
  { id: "11", drama: "重生之豪门千金", language: "葡萄牙语", translator: "李四", qaPersonnel: "小陈", spend: 7560, translationCost: 2880, roi: 2.6, conversion: 2.7, launchDate: "2026-01-28" },
  { id: "12", drama: "闪婚后大佬马甲藏不住了", language: "葡萄牙语", translator: "孙八", qaPersonnel: "小陈", spend: 10500, translationCost: 3900, roi: 2.7, conversion: 2.8, launchDate: "2026-01-27" },
  { id: "13", drama: "神医毒妃不好惹", language: "日语", translator: "张三", qaPersonnel: "小王", spend: 13230, translationCost: 4800, roi: 2.8, conversion: 3.0, launchDate: "2026-01-14" },
  { id: "14", drama: "重生之豪门千金", language: "韩语", translator: "钱七", qaPersonnel: "小陈", spend: 8820, translationCost: 3300, roi: 2.7, conversion: 2.8, launchDate: "2026-01-24" },
  { id: "15", drama: "霸道总裁爱上我", language: "法语", translator: "吴十", qaPersonnel: "小李", spend: 9660, translationCost: 3600, roi: 2.7, conversion: 2.9, launchDate: "2026-01-16" },
]

// Mock数据 - 短剧列表
const mockDramas = [
  { id: "D001", title: "霸道总裁爱上我", episodes: 80 },
  { id: "D002", title: "穿越之王妃驾到", episodes: 100 },
  { id: "D003", title: "重生之豪门千金", episodes: 60 },
  { id: "D004", title: "神医毒妃不好惹", episodes: 90 },
  { id: "D005", title: "闪婚后大佬马甲藏不住了", episodes: 70 },
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

interface AnalyticsBusinessEffectProps {
  initialDramaFilter?: string
  initialLanguageFilter?: string
}

export function AnalyticsBusinessEffect({ initialDramaFilter, initialLanguageFilter }: AnalyticsBusinessEffectProps) {
  // 筛选器状态
  const [selectedDrama, setSelectedDrama] = useState(initialDramaFilter || "all")
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguageFilter || "all")
  const [selectedTranslator, setSelectedTranslator] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  
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

  // 从数据中提取所有译员
  const allTranslators = useMemo(() => {
    const translators = new Set<string>()
    roiList.forEach(item => {
      if (item.translator) {
        translators.add(item.translator)
      }
    })
    return Array.from(translators).sort()
  }, [])

  const translatorOptions = useMemo(
    () => [
      { value: "all", label: "全部译员" },
      ...allTranslators.map((name) => ({ value: name, label: name })),
    ],
    [allTranslators]
  )

  // 筛选和排序数据
  const sortedData = useMemo(() => {
    // First filter the data
    let filtered = roiList.filter(item => {
      // Filter by drama
      if (selectedDrama && selectedDrama !== "all") {
        const matchById = mockDramas.some(d => d.id === selectedDrama && item.drama === d.title)
        const matchByTitle = mockDramas.some(d => d.title === selectedDrama && item.drama === d.title)
        if (!matchById && !matchByTitle) return false
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
        if (item.language !== languageName && item.language !== selectedLanguage) return false
      }
      
      // Filter by translator
      if (selectedTranslator && selectedTranslator !== "all") {
        if (item.translator !== selectedTranslator) {
          return false
        }
      }
      
      // Filter by date range
      if (dateRange?.from) {
        const launchDate = new Date(item.launchDate)
        launchDate.setHours(0, 0, 0, 0)
        
        const fromDate = new Date(dateRange.from)
        fromDate.setHours(0, 0, 0, 0)
        
        if (launchDate < fromDate) return false
        
        if (dateRange.to) {
          const toDate = new Date(dateRange.to)
          toDate.setHours(23, 59, 59, 999)
          if (launchDate > toDate) return false
        }
      }
      
      return true
    })
    
    // Then sort if a sort field is selected
    if (!sortField) return filtered

    return [...filtered].sort((a, b) => {
      const aValue: any = a[sortField as keyof typeof a]
      const bValue: any = b[sortField as keyof typeof b]

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [sortField, sortOrder, selectedDrama, selectedLanguage, selectedTranslator, dateRange])

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
  }, [selectedDrama, selectedLanguage, selectedTranslator, dateRange])

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

  // 重置所有筛选器
  const handleResetFilters = () => {
    setSelectedDrama("all")
    setSelectedLanguage("all")
    setSelectedTranslator("all")
    setDateRange(undefined)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">ROI排行榜（按投入产出比）</CardTitle>
          
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
              placeholder="选择译员"
              searchPlaceholder="搜索译员..."
              emptyText="未找到匹配的译员"
              className="w-32 h-8 text-xs"
            />

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
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">排名</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("drama")}
                          className="flex items-center hover:text-foreground"
                        >
                          短剧名称
                          {getSortIcon("drama")}
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
                          质检
                          {getSortIcon("qaPersonnel")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("spend")}
                          className="flex items-center hover:text-foreground"
                        >
                          投放消耗
                          {getSortIcon("spend")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("translationCost")}
                          className="flex items-center hover:text-foreground"
                        >
                          翻译成本
                          {getSortIcon("translationCost")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("roi")}
                          className="flex items-center hover:text-foreground"
                        >
                          ROI
                          {getSortIcon("roi")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("conversion")}
                          className="flex items-center hover:text-foreground"
                        >
                          转化率
                          {getSortIcon("conversion")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("launchDate")}
                          className="flex items-center hover:text-foreground"
                        >
                          投放时间
                          {getSortIcon("launchDate")}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, index) => (
                      <tr key={item.id} className="border-b border-border hover:bg-muted/50 cursor-pointer">
                        <td className="py-3 px-2">
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-100 text-gray-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-muted'
                          }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="py-3 px-2">{item.drama}</td>
                        <td className="py-3 px-2">
                          <Badge variant="secondary" className="text-xs">{item.language}</Badge>
                        </td>
                        <td className="py-3 px-2">{item.translator}</td>
                        <td className="py-3 px-2">{item.qaPersonnel}</td>
                        <td className="py-3 px-2">¥{item.spend.toLocaleString()}</td>
                        <td className="py-3 px-2">¥{item.translationCost.toLocaleString()}</td>
                        <td className="py-3 px-2">
                          <span className={`font-semibold text-lg ${
                            item.roi >= 3.0 ? 'text-emerald-600' :
                            item.roi >= 2.5 ? 'text-green-600' :
                            item.roi >= 2.0 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {item.roi.toFixed(1)}x
                          </span>
                        </td>
                        <td className="py-3 px-2">{item.conversion.toFixed(1)}%</td>
                        <td className="py-3 px-2 text-xs">{item.launchDate}</td>
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
