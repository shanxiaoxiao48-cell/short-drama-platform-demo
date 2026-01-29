"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown, List, RotateCcw } from "lucide-react"
import { PaginationControls } from "@/components/ui/pagination-controls"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formatMinutesToHoursAndMinutes = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)
  if (hours === 0) return `${minutes}分钟`
  if (minutes === 0) return `${hours}小时`
  return `${hours}小时${minutes}分钟`
}

export interface TranslatorTask {
  id: string
  dramaId: string
  dramaName: string
  language: string
  videoDuration: number
  workDuration: number
  modificationRate: number
  rejectionRate: number
  settlementAmount: number
  startedAt: string
  completedAt: string
  status: "in_progress" | "pending_review" | "pending_settlement" | "settled"
}

interface TranslatorTaskListProps {
  tasks: TranslatorTask[]
}

type SortField = "videoDuration" | "workDuration" | "modificationRate" | "rejectionRate" | "settlementAmount" | "startedAt" | "completedAt"
type SortOrder = "asc" | "desc"

const getStatusBadge = (status: string) => {
  switch (status) {
    case "in_progress": return <Badge className="bg-blue-100 text-blue-700 border-blue-200">进行中</Badge>
    case "pending_review": return <Badge className="bg-orange-100 text-orange-700 border-orange-200">待审核</Badge>
    case "pending_settlement": return <Badge className="bg-purple-100 text-purple-700 border-purple-200">待结算</Badge>
    case "settled": return <Badge className="bg-green-100 text-green-700 border-green-200">已结算</Badge>
    default: return <Badge variant="outline">{status}</Badge>
  }
}

export function TranslatorTaskList({ tasks }: TranslatorTaskListProps) {
  const [sortField, setSortField] = useState<SortField>("completedAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selectedDrama, setSelectedDrama] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const dramaOptions = useMemo(() => {
    const dramas = new Set<string>()
    if (tasks && tasks.length > 0) {
      tasks.forEach(task => { if (task && task.dramaName) dramas.add(task.dramaName) })
    }
    return [{ value: "all", label: "全部短剧" }, ...Array.from(dramas).sort().map(drama => ({ value: drama, label: drama }))]
  }, [tasks])

  const statusOptions = [
    { value: "all", label: "全部状态" },
    { value: "in_progress", label: "进行中" },
    { value: "pending_review", label: "待审核" },
    { value: "pending_settlement", label: "待结算" },
    { value: "settled", label: "已结算" },
  ]

  const filteredTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return []
    return tasks.filter(task => {
      if (!task) return false
      if (selectedDrama && selectedDrama !== "all" && task.dramaName !== selectedDrama) return false
      if (selectedStatus && selectedStatus !== "all" && task.status !== selectedStatus) return false
      if (dateRange?.from && task.completedAt) {
        const taskDate = new Date(task.completedAt); taskDate.setHours(0, 0, 0, 0)
        const fromDate = new Date(dateRange.from); fromDate.setHours(0, 0, 0, 0)
        if (taskDate < fromDate) return false
        if (dateRange.to) { const toDate = new Date(dateRange.to); toDate.setHours(23, 59, 59, 999); if (taskDate > toDate) return false }
      }
      return true
    })
  }, [tasks, selectedDrama, selectedStatus, dateRange])

  const sortedTasks = useMemo(() => {
    if (!filteredTasks || filteredTasks.length === 0) return []
    return [...filteredTasks].sort((a, b) => {
      const aValue = a[sortField]; const bValue = b[sortField]
      if (aValue === bValue) return 0
      return sortOrder === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1)
    })
  }, [filteredTasks, sortField, sortOrder])

  const paginatedTasks = useMemo(() => {
    if (!sortedTasks || sortedTasks.length === 0) return []
    const startIndex = (currentPage - 1) * pageSize
    return sortedTasks.slice(startIndex, startIndex + pageSize)
  }, [sortedTasks, currentPage, pageSize])

  const totalPages = Math.max(1, Math.ceil((sortedTasks?.length || 0) / pageSize))
  useEffect(() => { setCurrentPage(1) }, [selectedDrama, selectedStatus, dateRange])

  const handleResetFilters = () => { setSelectedDrama("all"); setSelectedStatus("all"); setDateRange(undefined) }
  const handleSort = (field: SortField) => {
    if (sortField === field) { setSortOrder(sortOrder === "asc" ? "desc" : "asc") }
    else { setSortField(field); setSortOrder("desc") }
  }
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3" />
    return sortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
  }

  const totals = useMemo(() => {
    const validTasks = filteredTasks || []
    return {
      tasks: validTasks.length,
      videoDuration: validTasks.reduce((sum, t) => sum + (t?.videoDuration || 0), 0),
      workDuration: validTasks.reduce((sum, t) => sum + (t?.workDuration || 0), 0),
      settlementAmount: validTasks.reduce((sum, t) => sum + (t?.settlementAmount || 0), 0),
      avgModificationRate: validTasks.length > 0 ? validTasks.reduce((sum, t) => sum + (t?.modificationRate || 0), 0) / validTasks.length : 0,
      avgRejectionRate: validTasks.length > 0 ? validTasks.reduce((sum, t) => sum + (t?.rejectionRate || 0), 0) / validTasks.length : 0,
    }
  }, [filteredTasks])

  const taskCount = tasks?.length || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <List className="w-4 h-4" />短剧任务列表 ({taskCount}条)
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <SearchableSelect value={selectedDrama} onValueChange={setSelectedDrama} options={dramaOptions} placeholder="选择短剧" searchPlaceholder="搜索短剧..." emptyText="未找到匹配的短剧" className="w-48 h-8 text-xs" />
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="选择状态" /></SelectTrigger>
              <SelectContent>{statusOptions.map((option) => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}</SelectContent>
            </Select>
            <DateRangePicker value={dateRange} onChange={setDateRange} className="w-64" />
            <Button variant="outline" size="sm" onClick={handleResetFilters} className="h-8 text-xs"><RotateCcw className="w-3 h-3 mr-1" />重置</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">短剧ID</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">短剧名称</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">语种</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground"><button onClick={() => handleSort("videoDuration")} className="flex items-center gap-1 hover:text-foreground">视频时长 {getSortIcon("videoDuration")}</button></th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground"><button onClick={() => handleSort("workDuration")} className="flex items-center gap-1 hover:text-foreground">有效工作时长 {getSortIcon("workDuration")}</button></th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground"><button onClick={() => handleSort("modificationRate")} className="flex items-center gap-1 hover:text-foreground">修改率 {getSortIcon("modificationRate")}</button></th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground"><button onClick={() => handleSort("rejectionRate")} className="flex items-center gap-1 hover:text-foreground">返修率 {getSortIcon("rejectionRate")}</button></th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground"><button onClick={() => handleSort("settlementAmount")} className="flex items-center gap-1 hover:text-foreground">结算金额 {getSortIcon("settlementAmount")}</button></th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground"><button onClick={() => handleSort("startedAt")} className="flex items-center gap-1 hover:text-foreground">开始时间 {getSortIcon("startedAt")}</button></th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground"><button onClick={() => handleSort("completedAt")} className="flex items-center gap-1 hover:text-foreground">完成时间 {getSortIcon("completedAt")}</button></th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">状态</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTasks.length > 0 ? (paginatedTasks.map((task) => (
                <tr key={task.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-2 font-mono text-xs">{task.dramaId}</td>
                  <td className="py-3 px-2 font-medium">{task.dramaName}</td>
                  <td className="py-3 px-2"><Badge variant="outline" className="text-xs">{task.language}</Badge></td>
                  <td className="py-3 px-2">{formatMinutesToHoursAndMinutes(task.videoDuration)}</td>
                  <td className="py-3 px-2">{formatMinutesToHoursAndMinutes(Math.round(task.workDuration * 60))}</td>
                  <td className="py-3 px-2"><span className={task.modificationRate < 10 ? "text-green-600 font-semibold" : ""}>{task.modificationRate.toFixed(1)}%</span></td>
                  <td className="py-3 px-2"><span className={task.rejectionRate < 5 ? "text-green-600 font-semibold" : task.rejectionRate > 8 ? "text-red-600 font-semibold" : ""}>{task.rejectionRate.toFixed(1)}%</span></td>
                  <td className="py-3 px-2 font-semibold text-green-600">¥{task.settlementAmount.toLocaleString()}</td>
                  <td className="py-3 px-2 text-xs">{task.startedAt}</td>
                  <td className="py-3 px-2 text-xs">{task.completedAt}</td>
                  <td className="py-3 px-2">{getStatusBadge(task.status)}</td>
                </tr>
              ))) : (<tr><td colSpan={11} className="py-8 text-center text-muted-foreground">暂无任务数据</td></tr>)}
            </tbody>
            {paginatedTasks.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border font-semibold bg-muted/30">
                  <td className="py-3 px-2" colSpan={3}>合计 ({totals.tasks}个任务)</td>
                  <td className="py-3 px-2">{formatMinutesToHoursAndMinutes(totals.videoDuration)}</td>
                  <td className="py-3 px-2">{formatMinutesToHoursAndMinutes(Math.round(totals.workDuration * 60))}</td>
                  <td className="py-3 px-2">{totals.avgModificationRate.toFixed(1)}%</td>
                  <td className="py-3 px-2">{totals.avgRejectionRate.toFixed(1)}%</td>
                  <td className="py-3 px-2 text-lg text-green-600">¥{totals.settlementAmount.toLocaleString()}</td>
                  <td className="py-3 px-2" colSpan={3}>-</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {paginatedTasks.length > 0 && (<PaginationControls currentPage={currentPage} totalPages={totalPages} pageSize={pageSize} totalItems={sortedTasks.length} onPageChange={setCurrentPage} onPageSizeChange={(newPageSize) => { setPageSize(newPageSize); setCurrentPage(1) }} />)}
      </CardContent>
    </Card>
  )
}
