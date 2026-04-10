"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search, Filter, Film, BookOpen, Globe, ClipboardList, UserCheck,
  Play, Clock, X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePermission } from "@/contexts/permission-context"
import { PaginationControls } from "@/components/ui/pagination-controls"

// 任务类型
type TaskCategory = "短剧翻译" | "短剧擦除" | "小说翻译" | "提取处理"
type TaskWorkType = "翻译" | "审校" | "质检" | "压制"
type TaskStatus = "待接单" | "已接单" | "进行中" | "已完成"
type ProjectType = "短剧" | "小说"

interface PoolTask {
  id: string
  taskCategory: TaskCategory
  workType: TaskWorkType
  projectName: string
  projectType: ProjectType
  language: string
  episodeOrChapter: string
  status: TaskStatus
  assignee: string | null
  assignedAt: string | null
  createdAt: string
  deadline: string
}

// Mock data
const mockTasks: PoolTask[] = [
  { id: "T001", taskCategory: "短剧翻译", workType: "翻译", projectName: "霸道总裁爱上我", projectType: "短剧", language: "英语", episodeOrChapter: "第1-10集", status: "待接单", assignee: null, assignedAt: null, createdAt: "2026-03-18 10:00", deadline: "2026-03-25 18:00" },
  { id: "T002", taskCategory: "短剧翻译", workType: "翻译", projectName: "霸道总裁爱上我", projectType: "短剧", language: "西班牙语", episodeOrChapter: "第1-10集", status: "待接单", assignee: null, assignedAt: null, createdAt: "2026-03-18 10:00", deadline: "2026-03-25 18:00" },
  { id: "T003", taskCategory: "短剧翻译", workType: "审校", projectName: "霸道总裁爱上我", projectType: "短剧", language: "英语", episodeOrChapter: "第1-10集", status: "已接单", assignee: "赵质检", assignedAt: "2026-03-20 09:00", createdAt: "2026-03-19 14:00", deadline: "2026-03-26 18:00" },
  { id: "T004", taskCategory: "短剧擦除", workType: "压制", projectName: "霸道总裁爱上我", projectType: "短剧", language: "英语", episodeOrChapter: "第1-5集", status: "进行中", assignee: "刘压制", assignedAt: "2026-03-19 10:00", createdAt: "2026-03-18 16:00", deadline: "2026-03-24 18:00" },
  { id: "T005", taskCategory: "小说翻译", workType: "翻译", projectName: "都市修仙传", projectType: "小说", language: "英语", episodeOrChapter: "第1-50章", status: "待接单", assignee: null, assignedAt: null, createdAt: "2026-03-20 08:00", deadline: "2026-04-05 18:00" },
  { id: "T006", taskCategory: "小说翻译", workType: "审校", projectName: "都市修仙传", projectType: "小说", language: "英语", episodeOrChapter: "第1-50章", status: "待接单", assignee: null, assignedAt: null, createdAt: "2026-03-20 08:00", deadline: "2026-04-10 18:00" },
  { id: "T007", taskCategory: "小说翻译", workType: "质检", projectName: "都市修仙传", projectType: "小说", language: "英语", episodeOrChapter: "第1-50章", status: "已接单", assignee: "赵质检", assignedAt: "2026-03-21 11:00", createdAt: "2026-03-20 08:00", deadline: "2026-04-15 18:00" },
  { id: "T008", taskCategory: "短剧翻译", workType: "翻译", projectName: "重生之都市逆袭", projectType: "短剧", language: "英语", episodeOrChapter: "第1-20集", status: "进行中", assignee: "王译员", assignedAt: "2026-03-17 09:00", createdAt: "2026-03-16 14:00", deadline: "2026-03-28 18:00" },
  { id: "T009", taskCategory: "短剧翻译", workType: "质检", projectName: "重生之都市逆袭", projectType: "短剧", language: "西班牙语", episodeOrChapter: "第1-20集", status: "已完成", assignee: "赵质检", assignedAt: "2026-03-15 10:00", createdAt: "2026-03-14 08:00", deadline: "2026-03-22 18:00" },
  { id: "T010", taskCategory: "提取处理", workType: "翻译", projectName: "甜蜜暴击", projectType: "短剧", language: "日语", episodeOrChapter: "第1-15集", status: "待接单", assignee: null, assignedAt: null, createdAt: "2026-03-21 10:00", deadline: "2026-04-01 18:00" },
  { id: "T011", taskCategory: "小说翻译", workType: "翻译", projectName: "星际争霸之路", projectType: "小说", language: "韩语", episodeOrChapter: "第1-30章", status: "进行中", assignee: "王译员", assignedAt: "2026-03-10 09:00", createdAt: "2026-03-09 08:00", deadline: "2026-03-20 18:00" },
  { id: "T012", taskCategory: "短剧翻译", workType: "压制", projectName: "甜蜜暴击", projectType: "短剧", language: "英语", episodeOrChapter: "第1-15集", status: "待接单", assignee: null, assignedAt: null, createdAt: "2026-03-22 08:00", deadline: "2026-04-02 18:00" },
]

const mockAssignableUsers = [
  { id: "tr001", name: "王译员", role: "translator" },
  { id: "tr002", name: "陈译员", role: "translator" },
  { id: "qc001", name: "赵质检", role: "quality_checker" },
  { id: "ve001", name: "刘压制", role: "video_encoder" },
]

interface TaskPoolPageProps {
  onNavigateToProject?: (projectId: string, projectType: ProjectType) => void
}

export function TaskPoolPage({ onNavigateToProject }: TaskPoolPageProps) {
  const { user } = usePermission()
  const isAdmin = user.role === "admin" || user.role === "project_manager"

  const [tasks, setTasks] = useState<PoolTask[]>(mockTasks)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterWorkTypes, setFilterWorkTypes] = useState<TaskWorkType[]>([])
  const [filterLanguages, setFilterLanguages] = useState<string[]>([])
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 接单对话框
  const [showClaimDialog, setShowClaimDialog] = useState(false)
  const [claimingTask, setClaimingTask] = useState<PoolTask | null>(null)
  const [_selectedEpisodes, setSelectedEpisodes] = useState<string[]>([])

  // 任务分配对话框
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [assigningTask, setAssigningTask] = useState<PoolTask | null>(null)
  const [assignUserId, setAssignUserId] = useState("")

  // 筛选逻辑
  const filteredTasks = tasks.filter(t => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!t.projectName.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q) && !t.taskCategory.includes(q)) return false
    }
    if (filterWorkTypes.length > 0 && !filterWorkTypes.includes(t.workType)) return false
    if (filterLanguages.length > 0 && !filterLanguages.includes(t.language)) return false
    if (filterCategory !== "all" && t.taskCategory !== filterCategory) return false
    return true
  })

  const allLanguages = [...new Set(tasks.map(t => t.language))]
  const allWorkTypes: TaskWorkType[] = ["翻译", "审校", "质检", "压制"]

  // 接单
  const handleClaim = (task: PoolTask) => {
    setClaimingTask(task)
    setSelectedEpisodes([])
    setShowClaimDialog(true)
  }

  const handleConfirmClaim = () => {
    if (!claimingTask) return
    setTasks(prev => prev.map(t =>
      t.id === claimingTask.id
        ? { ...t, status: "已接单" as TaskStatus, assignee: user.name, assignedAt: new Date().toISOString().slice(0, 16).replace("T", " ") }
        : t
    ))
    setShowClaimDialog(false)
    setClaimingTask(null)
  }

  // 开始工作
  const handleStartWork = (task: PoolTask) => {
    setTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, status: "进行中" as TaskStatus } : t
    ))
  }

  // 任务分配
  const handleAssign = (task: PoolTask) => {
    setAssigningTask(task)
    setAssignUserId("")
    setShowAssignDialog(true)
  }

  const handleConfirmAssign = () => {
    if (!assigningTask || !assignUserId) return
    const assignedUser = mockAssignableUsers.find(u => u.id === assignUserId)
    setTasks(prev => prev.map(t =>
      t.id === assigningTask.id
        ? { ...t, status: "已接单" as TaskStatus, assignee: assignedUser?.name || "", assignedAt: new Date().toISOString().slice(0, 16).replace("T", " ") }
        : t
    ))
    setShowAssignDialog(false)
    setAssigningTask(null)
  }

  const toggleWorkTypeFilter = (wt: TaskWorkType) => {
    setFilterWorkTypes(prev => prev.includes(wt) ? prev.filter(x => x !== wt) : [...prev, wt])
  }
  const toggleLanguageFilter = (lang: string) => {
    setFilterLanguages(prev => prev.includes(lang) ? prev.filter(x => x !== lang) : [...prev, lang])
  }

  // 分页
  const totalPages = Math.ceil(filteredTasks.length / pageSize)
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="flex flex-col h-full">
      {/* 顶部 */}
      <div className="shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">任务池</h1>
            <p className="text-sm text-muted-foreground mt-0.5">浏览和接取可用任务</p>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索任务名称、项目名称..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="任务类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="短剧翻译">短剧翻译</SelectItem>
              <SelectItem value="短剧擦除">短剧擦除</SelectItem>
              <SelectItem value="小说翻译">小说翻译</SelectItem>
              <SelectItem value="提取处理">提取处理</SelectItem>
            </SelectContent>
          </Select>
          <Button variant={showFilters ? "default" : "outline"} size="sm" className="h-9 gap-1" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4" />筛选
          </Button>
        </div>

        {/* 展开筛选面板 */}
        {showFilters && (
          <div className="mt-3 p-3 rounded-lg border border-border bg-muted/30 flex items-start gap-6">
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">任务类型</span>
              <div className="flex flex-wrap gap-1.5">
                {allWorkTypes.map(wt => (
                  <button key={wt} onClick={() => toggleWorkTypeFilter(wt)}
                    className={cn("px-2.5 py-1 rounded-full text-xs border transition-colors",
                      filterWorkTypes.includes(wt) ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/40"
                    )}>{wt}</button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-1.5 block">语言</span>
              <div className="flex flex-wrap gap-1.5">
                {allLanguages.map(lang => (
                  <button key={lang} onClick={() => toggleLanguageFilter(lang)}
                    className={cn("px-2.5 py-1 rounded-full text-xs border transition-colors",
                      filterLanguages.includes(lang) ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/40"
                    )}>{lang}</button>
                ))}
              </div>
            </div>
            {(filterWorkTypes.length > 0 || filterLanguages.length > 0) && (
              <Button variant="ghost" size="sm" className="text-xs mt-4" onClick={() => { setFilterWorkTypes([]); setFilterLanguages([]) }}>
                <X className="w-3 h-3 mr-1" />清除筛选
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 任务列表 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="rounded-lg border border-border overflow-hidden">
              {/* 表头 */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr_2fr] gap-3 px-4 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground border-b border-border">
                <span>项目名称</span>
                <span>项目类型</span>
                <span>语言</span>
                <span>集数/章节</span>
                <span>工作类型</span>
                <span className="text-right">操作</span>
              </div>
              {/* 列表 */}
              {filteredTasks.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  <ClipboardList className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                  暂无匹配的任务
                </div>
              ) : (
                paginatedTasks.map(task => {
                  return (
                    <div key={task.id} className="grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr_2fr] gap-3 px-4 py-3 border-b border-border/50 items-center hover:bg-muted/20 transition-colors text-sm">
                      {/* 项目名称 */}
                      <span className="font-medium truncate cursor-pointer hover:text-primary transition-colors"
                        onClick={() => onNavigateToProject?.(task.id, task.projectType)}>
                        {task.projectName}
                      </span>
                      {/* 项目类型 */}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {task.projectType === "短剧" ? <Film className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                        {task.projectType}
                      </span>
                      {/* 语言 */}
                      <span className="flex items-center gap-1 text-xs">
                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />{task.language}
                      </span>
                      {/* 集数/章节 */}
                      <span className="text-xs text-muted-foreground">{task.episodeOrChapter}</span>
                      {/* 工作类型 */}
                      <span className="text-xs">{task.workType}</span>
                      {/* 操作 */}
                      <div className="flex items-center gap-1.5 justify-end">
                        {task.status === "待接单" && (
                          <Button size="sm" className="h-7 text-xs gap-1" onClick={() => handleClaim(task)}>
                            <UserCheck className="w-3.5 h-3.5" />接单
                          </Button>
                        )}
                        {task.status === "已接单" && (
                          <>
                            {task.assignee === user.name && (
                              <Button size="sm" className="h-7 text-xs gap-1" onClick={() => handleStartWork(task)}>
                                <Play className="w-3.5 h-3.5" />开始工作
                              </Button>
                            )}
                            {task.assignee && task.assignee !== user.name && (
                              <span className="text-xs text-muted-foreground">{task.assignee}</span>
                            )}
                            {isAdmin && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleAssign(task)}>
                                任务分配
                              </Button>
                            )}
                          </>
                        )}
                        {(task.status === "进行中" || task.status === "已完成") && task.assignee && (
                          <span className="text-xs text-muted-foreground">{task.assignee}</span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </ScrollArea>
        {/* 分页 */}
        <div className="shrink-0 px-6">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredTasks.length}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1) }}
          />
        </div>
      </div>

      {/* 接单对话框 */}
      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>接取任务</DialogTitle>
            <DialogDescription>确认接取以下任务，接单后请在24小时内开始工作</DialogDescription>
          </DialogHeader>
          {claimingTask && (
            <div className="space-y-3 py-2">
              <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">项目：</span><span className="font-medium">{claimingTask.projectName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">类型：</span><span>{claimingTask.taskCategory} · {claimingTask.workType}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">语言：</span><span>{claimingTask.language}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">范围：</span><span>{claimingTask.episodeOrChapter}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">截止：</span><span className="text-orange-600">{claimingTask.deadline}</span></div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800 text-xs">
                <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-amber-800 dark:text-amber-200">接单后24小时内未开始工作将收到提醒，48小时未开始将自动释放任务。</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClaimDialog(false)}>取消</Button>
            <Button onClick={handleConfirmClaim}>确认接单</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 任务分配对话框 */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>任务分配</DialogTitle>
            <DialogDescription>将任务分配给指定人员</DialogDescription>
          </DialogHeader>
          {assigningTask && (
            <div className="space-y-3 py-2">
              <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">任务：</span><span className="font-medium">{assigningTask.taskCategory} · {assigningTask.workType}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">项目：</span><span>{assigningTask.projectName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">语言：</span><span>{assigningTask.language}</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">分配给</label>
                <Select value={assignUserId} onValueChange={setAssignUserId}>
                  <SelectTrigger><SelectValue placeholder="选择人员" /></SelectTrigger>
                  <SelectContent>
                    {mockAssignableUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>取消</Button>
            <Button onClick={handleConfirmAssign} disabled={!assignUserId}>确认分配</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
