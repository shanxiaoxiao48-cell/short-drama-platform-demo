"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  MoreHorizontal,
  Pencil,
  Eye,
  Trash2,
  Download,
  Loader2,
} from "lucide-react"

interface TasksPageProps {
  onOpenEditor: (projectId: string, episodeId: string) => void
  onOpenTaskDetail?: (taskType: string, taskId: string) => void
}

// Mock task data - updated with new task types and reviewing status
const allTasks = [
  {
    id: "1",
    project: "霸道总裁爱上我",
    projectId: "1",
    episode: "第23集",
    episodeId: "ep-23",
    taskType: "AI提取",
    translator: "系统",
    priority: "high",
    deadline: "2024-01-15",
    status: "pending_review",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    project: "霸道总裁爱上我",
    projectId: "1",
    episode: "第24集",
    episodeId: "ep-24",
    taskType: "AI翻译",
    translator: "系统",
    priority: "medium",
    deadline: "2024-01-16",
    status: "reviewing",
    createdAt: "2024-01-11",
  },
  {
    id: "3",
    project: "重生之商业帝国",
    projectId: "3",
    episode: "第5集",
    episodeId: "ep-5",
    taskType: "视频擦除",
    translator: "王五",
    priority: "low",
    deadline: "2024-01-18",
    status: "pending_review",
    createdAt: "2024-01-12",
  },
  {
    id: "4",
    project: "穿越之锦绣良缘",
    projectId: "2",
    episode: "第60集",
    episodeId: "ep-60",
    taskType: "人工翻译",
    translator: "赵六",
    priority: "high",
    deadline: "2024-01-14",
    status: "pending_review",
    createdAt: "2024-01-09",
  },
  {
    id: "5",
    project: "霸道总裁爱上我",
    projectId: "1",
    episode: "第25集",
    episodeId: "ep-25",
    taskType: "字幕挂载",
    translator: "系统",
    priority: "medium",
    deadline: "2024-01-15",
    status: "completed",
    createdAt: "2024-01-08",
  },
  {
    id: "6",
    project: "甜蜜复仇",
    projectId: "5",
    episode: "第18集",
    episodeId: "ep-18",
    taskType: "人工翻译",
    translator: "张三",
    priority: "high",
    deadline: "2024-01-14",
    status: "in_progress",
    createdAt: "2024-01-07",
  },
  {
    id: "7",
    project: "都市修仙传",
    projectId: "6",
    episode: "第115集",
    episodeId: "ep-115",
    taskType: "视频压制",
    translator: "孙七",
    priority: "medium",
    deadline: "2024-01-17",
    status: "reviewing",
    createdAt: "2024-01-13",
  },
  {
    id: "8",
    project: "重生之商业帝国",
    projectId: "3",
    episode: "第6集",
    episodeId: "ep-6",
    taskType: "AI提取",
    translator: "系统",
    priority: "low",
    deadline: "2024-01-19",
    status: "in_progress",
    createdAt: "2024-01-14",
  },
]

const priorityMap: Record<string, { label: string; className: string }> = {
  high: { label: "高", className: "bg-destructive/20 text-destructive border-destructive/30" },
  medium: { label: "中", className: "bg-warning/20 text-warning border-warning/30" },
  low: { label: "低", className: "bg-muted text-muted-foreground border-border" },
}

const statusMap: Record<string, { label: string; className: string; icon: typeof CheckCircle }> = {
  pending_review: {
    label: "待审核",
    className: "bg-warning/20 text-warning",
    icon: AlertCircle,
  },
  reviewing: {
    label: "审核中",
    className: "bg-chart-4/20 text-chart-4",
    icon: Loader2,
  },
  in_progress: {
    label: "进行中",
    className: "bg-primary/20 text-primary",
    icon: Clock,
  },
  completed: {
    label: "已完成",
    className: "bg-success/20 text-success",
    icon: CheckCircle,
  },
}

const taskTypes = ["全部类型", "AI提取", "AI翻译", "人工翻译", "视频擦除", "字幕挂载", "视频压制"]
const translators = ["全部人员", "张三", "李四", "王五", "赵六", "孙七", "系统"]

export function TasksPage({ onOpenEditor, onOpenTaskDetail }: TasksPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("全部类型")
  const [translatorFilter, setTranslatorFilter] = useState("全部人员")
  const [activeTab, setActiveTab] = useState("all")

  const filteredTasks = allTasks.filter((task) => {
    const matchesSearch =
      task.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.episode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.translator.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      activeTab === "all" ||
      (activeTab === "pending_review" && task.status === "pending_review") ||
      (activeTab === "reviewing" && task.status === "reviewing") ||
      (activeTab === "in_progress" && task.status === "in_progress") ||
      (activeTab === "completed" && task.status === "completed")

    const matchesType = typeFilter === "全部类型" || task.taskType === typeFilter
    const matchesTranslator = translatorFilter === "全部人员" || task.translator === translatorFilter

    return matchesSearch && matchesStatus && matchesType && matchesTranslator
  })

  const pendingReviewCount = allTasks.filter((t) => t.status === "pending_review").length
  const reviewingCount = allTasks.filter((t) => t.status === "reviewing").length
  const inProgressCount = allTasks.filter((t) => t.status === "in_progress").length
  const completedCount = allTasks.filter((t) => t.status === "completed").length

  const handleViewDetail = (task: typeof allTasks[0]) => {
    if (onOpenTaskDetail) {
      onOpenTaskDetail(task.taskType, task.id)
    } else {
      onOpenEditor(task.projectId, task.episodeId)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">任务中心</h1>
        <p className="text-muted-foreground mt-1">管理和追踪所有翻译任务</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">全部任务</p>
              <p className="text-2xl font-bold text-foreground">{allTasks.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-muted">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">待审核</p>
              <p className="text-2xl font-bold text-warning">{pendingReviewCount}</p>
            </div>
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="w-5 h-5 text-warning" />
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">审核中</p>
              <p className="text-2xl font-bold text-chart-4">{reviewingCount}</p>
            </div>
            <div className="p-2 rounded-lg bg-chart-4/10">
              <Loader2 className="w-5 h-5 text-chart-4" />
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">进行中</p>
              <p className="text-2xl font-bold text-primary">{inProgressCount}</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">已完成</p>
              <p className="text-2xl font-bold text-success">{completedCount}</p>
            </div>
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="pending_review">
              待审核 <Badge className="ml-1 bg-warning/20 text-warning">{pendingReviewCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="reviewing">
              审核中 <Badge className="ml-1 bg-chart-4/20 text-chart-4">{reviewingCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="in_progress">进行中</TabsTrigger>
            <TabsTrigger value="completed">已完成</TabsTrigger>
          </TabsList>

          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索任务..."
                className="pl-9 w-64 bg-input border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32 bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {taskTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={translatorFilter} onValueChange={setTranslatorFilter}>
              <SelectTrigger className="w-32 bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {translators.map((translator) => (
                  <SelectItem key={translator} value={translator}>
                    {translator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Task Table */}
        <TabsContent value={activeTab} className="mt-4">
          <Card className="bg-card border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">项目</TableHead>
                  <TableHead className="text-muted-foreground">集数</TableHead>
                  <TableHead className="text-muted-foreground">任务类型</TableHead>
                  <TableHead className="text-muted-foreground">翻译人员</TableHead>
                  <TableHead className="text-muted-foreground">优先级</TableHead>
                  <TableHead className="text-muted-foreground">截止日期</TableHead>
                  <TableHead className="text-muted-foreground">状态</TableHead>
                  <TableHead className="text-muted-foreground w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const priority = priorityMap[task.priority]
                  const status = statusMap[task.status]
                  const StatusIcon = status.icon

                  return (
                    <TableRow
                      key={task.id}
                      className="border-border hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleViewDetail(task)}
                    >
                      <TableCell className="font-medium text-foreground">{task.project}</TableCell>
                      <TableCell className="text-muted-foreground">{task.episode}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                          {task.taskType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-3 h-3 text-muted-foreground" />
                          </div>
                          <span className="text-muted-foreground">{task.translator}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={priority.className}>
                          {priority.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span className="text-sm">{task.deadline}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.className}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Pencil className="w-4 h-4 mr-2" />
                              重命名
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewDetail(task)}>
                              <Eye className="w-4 h-4 mr-2" />
                              查看详情
                            </DropdownMenuItem>
                            {(task.taskType === "AI提取" || task.taskType === "AI翻译" || task.taskType === "人工翻译") && (
                              <>
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  下载原文字幕
                                </DropdownMenuItem>
                                {task.taskType !== "AI提取" && (
                                  <DropdownMenuItem>
                                    <Download className="w-4 h-4 mr-2" />
                                    下载译文字幕
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                            {(task.taskType === "视频擦除" || task.taskType === "字幕挂载" || task.taskType === "视频压制") && (
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                下载视频
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {filteredTasks.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                没有找到匹配的任务
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
