"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Eye,
  Trash2,
  Download,
  Save,
  CheckCircle,
  RefreshCw,
  Play,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  XCircle,
  Home,
} from "lucide-react"

// Breadcrumb component
interface BreadcrumbProps {
  items: { label: string; onClick?: () => void }[]
}

function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <span className="text-muted-foreground">/</span>}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  )
}

// Status map with "审核中" added
const statusMap: Record<string, { label: string; className: string }> = {
  completed: { label: "已完成", className: "bg-success/20 text-success" },
  in_progress: { label: "进行中", className: "bg-primary/20 text-primary" },
  pending_review: { label: "待审核", className: "bg-warning/20 text-warning" },
  reviewing: { label: "审核中", className: "bg-chart-4/20 text-chart-4" },
  failed: { label: "失败", className: "bg-destructive/20 text-destructive" },
}

// Common task list component
interface TaskListPageProps {
  taskType: string
  projectName?: string
  onBack: () => void
  onViewDetail: (taskId: string) => void
  breadcrumbs: { label: string; onClick?: () => void }[]
}

// Mock data for different task types
const generateTaskList = (taskType: string) => {
  const baseData = Array.from({ length: 10 }, (_, index) => ({
    id: `${index + 1}`,
    title: `第${index + 1}集 - 霸道总裁爱上我`,
    duration: `${Math.floor(Math.random() * 3) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
    createdAt: `2024-01-${String(14 - (index % 7)).padStart(2, "0")}`,
    status: ["completed", "in_progress", "pending_review", "reviewing"][index % 4],
  }))

  if (taskType === "AI提取" || taskType === "AI翻译" || taskType === "人工翻译") {
    return baseData.map((item, i) => ({
      ...item,
      sourceLanguage: "中文",
      targetLanguage: taskType === "AI提取" ? undefined : ["English", "Spanish", "Portuguese"][i % 3],
    }))
  }

  if (taskType === "视频压制") {
    return baseData.map((item, i) => ({
      ...item,
      language: ["English", "Spanish", "Portuguese"][i % 3],
    }))
  }

  return baseData
}

export function TaskListPage({ taskType, projectName, onBack, onViewDetail, breadcrumbs }: TaskListPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const tasks = generateTaskList(taskType)

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getColumns = () => {
    switch (taskType) {
      case "AI提取":
        return ["ID", "标题", "时长", "语言", "创建时间", "状态", "操作"]
      case "AI翻译":
      case "人工翻译":
        return ["ID", "标题", "时长", "原语言", "翻译语言", "创建时间", "状态", "操作"]
      case "视频擦除":
      case "字幕挂载":
        return ["ID", "标题", "时长", "创建时间", "状态", "操作"]
      case "视频压制":
        return ["ID", "标题", "时长", "语言", "创建时间", "状态", "操作"]
      default:
        return ["ID", "标题", "时长", "创建时间", "状态", "操作"]
    }
  }

  const columns = getColumns()

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbs} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{taskType}任务列表</h1>
        <p className="text-muted-foreground mt-1">
          {projectName ? `${projectName} - ` : ""}查看和管理{taskType}任务
        </p>
      </div>

      {/* Filters */}
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
        <Button variant="outline" size="sm" className="bg-transparent">
          <Filter className="w-4 h-4 mr-1" />
          筛选
        </Button>
        <Button variant="outline" size="sm" className="bg-transparent">
          <ArrowUpDown className="w-4 h-4 mr-1" />
          排序
        </Button>
      </div>

      {/* Task Table */}
      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {columns.map(col => (
                <TableHead key={col} className="text-muted-foreground">{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task, index) => {
              const status = statusMap[task.status]
              return (
                <TableRow
                  key={task.id}
                  className="border-border hover:bg-muted/50 cursor-pointer"
                  onClick={() => onViewDetail(task.id)}
                >
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium text-foreground">{task.title}</TableCell>
                  <TableCell className="text-muted-foreground">{task.duration}</TableCell>
                  {(taskType === "AI提取" || taskType === "视频压制") && (
                    <TableCell className="text-muted-foreground">
                      {(task as any).sourceLanguage || (task as any).language || "中文"}
                    </TableCell>
                  )}
                  {(taskType === "AI翻译" || taskType === "人工翻译") && (
                    <>
                      <TableCell className="text-muted-foreground">{(task as any).sourceLanguage}</TableCell>
                      <TableCell className="text-muted-foreground">{(task as any).targetLanguage}</TableCell>
                    </>
                  )}
                  <TableCell className="text-muted-foreground">{task.createdAt}</TableCell>
                  <TableCell>
                    <Badge className={status.className}>{status.label}</Badge>
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
                        <DropdownMenuItem onClick={() => onViewDetail(task.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          查看
                        </DropdownMenuItem>
                        {(taskType === "视频擦除" || taskType === "字幕挂载" || taskType === "视频压制") && (
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            下载视频
                          </DropdownMenuItem>
                        )}
                        {(taskType === "AI提取" || taskType === "AI翻译" || taskType === "人工翻译" || taskType === "视频压制") && (
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            下载原文字幕
                          </DropdownMenuItem>
                        )}
                        {taskType === "AI提取" && (
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            下载提取内容
                          </DropdownMenuItem>
                        )}
                        {(taskType === "AI翻译" || taskType === "人工翻译" || taskType === "视频压制") && (
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            下载译文字幕
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
      </Card>
    </div>
  )
}

// Mock subtitle data
const mockSubtitles = [
  { id: "1", startTime: "00:00:05", endTime: "00:00:08", original: "在这个世界上，有很多种爱情", translation: "In this world, there are many kinds of love", screenText: "" },
  { id: "2", startTime: "00:00:10", endTime: "00:00:15", original: "但最让人心动的，是那种不期而遇", translation: "But the most exciting one is the unexpected encounter", screenText: "" },
  { id: "3", startTime: "00:00:18", endTime: "00:00:22", original: "我叫林小美，今年25岁", translation: "My name is Lin Xiaomei, I'm 25 years old", screenText: "" },
  { id: "4", startTime: "00:00:25", endTime: "00:00:30", original: "是一家小公司的普通员工", translation: "I'm an ordinary employee of a small company", screenText: "" },
]

// AI Extract Detail Page - Updated to match AI Translation layout
interface AIExtractDetailPageProps {
  taskId: string
  episodeIndex: number
  totalEpisodes: number
  onBack: () => void
  onPrevEpisode: () => void
  onNextEpisode: () => void
  breadcrumbs: { label: string; onClick?: () => void }[]
}

export function AIExtractDetailPage({
  taskId,
  episodeIndex,
  totalEpisodes,
  onBack,
  onPrevEpisode,
  onNextEpisode,
  breadcrumbs,
}: AIExtractDetailPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [subtitles, setSubtitles] = useState([
    { id: "1", startTime: "00:00:05", endTime: "00:00:08", text: "在这个世界上，有很多种爱情" },
    { id: "2", startTime: "00:00:10", endTime: "00:00:15", text: "但最让人心动的，是那种不期而遇" },
    { id: "3", startTime: "00:00:18", endTime: "00:00:22", text: "我叫林小美，今年25岁" },
    { id: "4", startTime: "00:00:25", endTime: "00:00:30", text: "是一家小公司的普通员工" },
  ])
  const [screenTexts, setScreenTexts] = useState([
    { id: "1", time: "00:15", text: "霸道总裁" },
    { id: "2", time: "00:45", text: "爱上我" },
    { id: "3", time: "01:20", text: "第一集" },
  ])
  const [glossary, setGlossary] = useState([
    { id: "1", term: "霸道总裁", translation: "Domineering CEO" },
    { id: "2", term: "甜宠", translation: "Sweet romance" },
  ])
  const [synopsis, setSynopsis] = useState("一个普通女孩与霸道总裁的爱情故事，讲述了他们从相遇到相爱的浪漫历程...")

  const currentSubtitle = subtitles[currentIndex]
  const [currentTime, setCurrentTime] = useState([30])

  const handleComplete = () => {
    if (episodeIndex < totalEpisodes - 1) {
      onNextEpisode()
    } else {
      onBack()
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Breadcrumb items={breadcrumbs} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevEpisode}
            disabled={episodeIndex === 0}
            className="bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            上一集
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {episodeIndex + 1} / {totalEpisodes}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextEpisode}
            disabled={episodeIndex === totalEpisodes - 1}
            className="bg-transparent"
          >
            下一集
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Save className="w-4 h-4 mr-1" />
            保存
          </Button>
          <Button size="sm" onClick={handleComplete}>
            <CheckCircle className="w-4 h-4 mr-1" />
            审核完成
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Video Preview */}
        <div className="w-72 shrink-0 border-r border-border bg-card p-4 flex flex-col">
          <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: "9/16" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Button variant="secondary" size="icon" className="rounded-full">
                <Play className="w-6 h-6" />
              </Button>
            </div>
            {/* Current subtitle overlay */}
            <div className="absolute bottom-4 left-2 right-2 text-center">
              <p className="text-white text-sm bg-black/60 px-2 py-1 rounded">{currentSubtitle?.text}</p>
            </div>
          </div>
          {/* Timeline */}
          <div className="space-y-2">
            <Slider
              value={currentTime}
              onValueChange={setCurrentTime}
              max={180}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0:00</span>
              <span>3:00</span>
            </div>
          </div>
          {/* Timeline navigation */}
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">{currentIndex + 1} / {subtitles.length}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentIndex(Math.min(subtitles.length - 1, currentIndex + 1))}
              disabled={currentIndex === subtitles.length - 1}
              className="bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Subtitle List */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">提取字幕</h3>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {subtitles.map((sub, index) => (
                <Card
                  key={sub.id}
                  className={`p-3 bg-card border-border cursor-pointer transition-colors ${index === currentIndex ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-muted-foreground w-24 shrink-0">{sub.startTime}</span>
                    <div className="flex-1">
                      <Input
                        value={sub.text}
                        onChange={(e) => setSubtitles(prev => prev.map(s => s.id === sub.id ? { ...s, text: e.target.value } : s))}
                        className="h-8"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Reference Panel - Screen texts, Glossary, Synopsis */}
        <div className="w-80 shrink-0 border-l border-border bg-card overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* Screen Texts */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">画面字</h3>
                <div className="space-y-2">
                  {screenTexts.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-12">{item.time}</span>
                      <Input
                        value={item.text}
                        onChange={(e) => setScreenTexts(prev => prev.map(s => s.id === item.id ? { ...s, text: e.target.value } : s))}
                        className="flex-1 h-8"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Glossary */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">术语表</h3>
                <div className="space-y-2">
                  {glossary.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Input
                        value={item.term}
                        onChange={(e) => setGlossary(prev => prev.map(g => g.id === item.id ? { ...g, term: e.target.value } : g))}
                        className="flex-1 h-8"
                        placeholder="术语"
                      />
                      <Input
                        value={item.translation}
                        onChange={(e) => setGlossary(prev => prev.map(g => g.id === item.id ? { ...g, translation: e.target.value } : g))}
                        className="flex-1 h-8"
                        placeholder="翻译"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Synopsis */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">简介</h3>
                <Textarea
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  className="h-32 resize-none"
                />
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

// AI Translation Detail Page
interface AITranslationDetailPageProps {
  taskId: string
  episodeIndex: number
  totalEpisodes: number
  onBack: () => void
  onPrevEpisode: () => void
  onNextEpisode: () => void
  breadcrumbs: { label: string; onClick?: () => void }[]
}

export function AITranslationDetailPage({
  taskId,
  episodeIndex,
  totalEpisodes,
  onBack,
  onPrevEpisode,
  onNextEpisode,
  breadcrumbs,
}: AITranslationDetailPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [subtitles, setSubtitles] = useState(mockSubtitles)
  const [feedback, setFeedback] = useState("")
  const currentSubtitle = subtitles[currentIndex]
  const [currentTime, setCurrentTime] = useState([30])

  const handleComplete = () => {
    if (episodeIndex < totalEpisodes - 1) {
      onNextEpisode()
    } else {
      onBack()
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Breadcrumb items={breadcrumbs} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevEpisode}
            disabled={episodeIndex === 0}
            className="bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            上一集
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {episodeIndex + 1} / {totalEpisodes}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextEpisode}
            disabled={episodeIndex === totalEpisodes - 1}
            className="bg-transparent"
          >
            下一集
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Save className="w-4 h-4 mr-1" />
            保存
          </Button>
          <Button size="sm" onClick={handleComplete}>
            <CheckCircle className="w-4 h-4 mr-1" />
            审核完成
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Video Preview */}
        <div className="w-72 shrink-0 border-r border-border bg-card p-4 flex flex-col">
          <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: "9/16" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Button variant="secondary" size="icon" className="rounded-full">
                <Play className="w-6 h-6" />
              </Button>
            </div>
            {/* Current subtitle overlay */}
            <div className="absolute bottom-4 left-2 right-2 text-center">
              <p className="text-white text-sm bg-black/60 px-2 py-1 rounded">{currentSubtitle?.translation}</p>
            </div>
          </div>
          {/* Timeline */}
          <div className="space-y-2">
            <Slider
              value={currentTime}
              onValueChange={setCurrentTime}
              max={180}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0:00</span>
              <span>3:00</span>
            </div>
          </div>
          {/* Timeline navigation */}
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">{currentIndex + 1} / {subtitles.length}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentIndex(Math.min(subtitles.length - 1, currentIndex + 1))}
              disabled={currentIndex === subtitles.length - 1}
              className="bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Subtitle List */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {subtitles.map((sub, index) => (
                <Card
                  key={sub.id}
                  className={`p-3 bg-card border-border cursor-pointer transition-colors ${index === currentIndex ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-muted-foreground w-24 shrink-0">{sub.startTime}</span>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-muted-foreground">{sub.original}</p>
                      <div className="flex items-center gap-2">
                        <Input
                          value={sub.translation}
                          onChange={(e) => setSubtitles(prev => prev.map(s => s.id === sub.id ? { ...s, translation: e.target.value } : s))}
                          className="flex-1 h-8"
                        />
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Reference Panel */}
        <div className="w-72 shrink-0 border-l border-border bg-card p-4 overflow-y-auto space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-2">画面字</h3>
            <p className="text-sm text-muted-foreground">霸道总裁</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">简介</h3>
            <p className="text-sm text-muted-foreground">普通女孩与霸道总裁的爱情故事...</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">术语表</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">霸道总裁</span>
                <span className="text-foreground">Domineering CEO</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">修改意见</h3>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="填写需要人工翻译修改的意见..."
              className="h-32 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Manual Translation Detail Page
interface ManualTranslationDetailPageProps {
  taskId: string
  episodeIndex: number
  totalEpisodes: number
  onBack: () => void
  onPrevEpisode: () => void
  onNextEpisode: () => void
  isReviewer?: boolean
  breadcrumbs: { label: string; onClick?: () => void }[]
}

export function ManualTranslationDetailPage({
  taskId,
  episodeIndex,
  totalEpisodes,
  onBack,
  onPrevEpisode,
  onNextEpisode,
  isReviewer = false,
  breadcrumbs,
}: ManualTranslationDetailPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [subtitles, setSubtitles] = useState(mockSubtitles)
  const [feedback, setFeedback] = useState("")
  const [reviewerFeedback] = useState("第2句的翻译可以更自然一些，建议改为 'But the most heartwarming is the unexpected encounter'")
  const currentSubtitle = subtitles[currentIndex]
  const [currentTime, setCurrentTime] = useState([30])

  const handleComplete = () => {
    if (episodeIndex < totalEpisodes - 1) {
      onNextEpisode()
    } else {
      onBack()
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Breadcrumb items={breadcrumbs} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevEpisode}
            disabled={episodeIndex === 0}
            className="bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            上一集
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {episodeIndex + 1} / {totalEpisodes}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextEpisode}
            disabled={episodeIndex === totalEpisodes - 1}
            className="bg-transparent"
          >
            下一集
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          {isReviewer ? (
            <>
              <Button variant="outline" size="sm" className="bg-transparent text-destructive border-destructive">
                <XCircle className="w-4 h-4 mr-1" />
                不通过
              </Button>
              <Button size="sm" onClick={handleComplete}>
                <CheckCircle className="w-4 h-4 mr-1" />
                通过
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={handleComplete}>
              <CheckCircle className="w-4 h-4 mr-1" />
              完成
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Video Preview */}
        <div className="w-72 shrink-0 border-r border-border bg-card p-4 flex flex-col">
          <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: "9/16" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Button variant="secondary" size="icon" className="rounded-full">
                <Play className="w-6 h-6" />
              </Button>
            </div>
            <div className="absolute bottom-4 left-2 right-2 text-center">
              <p className="text-white text-sm bg-black/60 px-2 py-1 rounded">{currentSubtitle?.translation}</p>
            </div>
          </div>
          {/* Timeline */}
          <div className="space-y-2">
            <Slider
              value={currentTime}
              onValueChange={setCurrentTime}
              max={180}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0:00</span>
              <span>3:00</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">{currentIndex + 1} / {subtitles.length}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentIndex(Math.min(subtitles.length - 1, currentIndex + 1))}
              disabled={currentIndex === subtitles.length - 1}
              className="bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Subtitle List */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {subtitles.map((sub, index) => (
                <Card
                  key={sub.id}
                  className={`p-3 bg-card border-border cursor-pointer transition-colors ${index === currentIndex ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-muted-foreground w-24 shrink-0">{sub.startTime}</span>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-muted-foreground">{sub.original}</p>
                      <Input
                        value={sub.translation}
                        onChange={(e) => setSubtitles(prev => prev.map(s => s.id === sub.id ? { ...s, translation: e.target.value } : s))}
                        className="h-8"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Reference Panel */}
        <div className="w-72 shrink-0 border-l border-border bg-card p-4 overflow-y-auto space-y-4">
          {/* Reviewer feedback from AI translation phase */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-warning" />
              <h3 className="font-semibold text-foreground">审核意见</h3>
            </div>
            <p className="text-sm text-muted-foreground bg-warning/10 p-2 rounded border border-warning/20">
              {reviewerFeedback}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-2">画面字</h3>
            <p className="text-sm text-muted-foreground">霸道总裁</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">简介</h3>
            <p className="text-sm text-muted-foreground">普通女孩与霸道总裁的爱情故事...</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">术语表</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">霸道总裁</span>
                <span className="text-foreground">Domineering CEO</span>
              </div>
            </div>
          </div>

          {isReviewer && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">修改意见</h3>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="填写需要修改的意见..."
                className="h-32 resize-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Video Preview Dialog for Video Erase, Subtitle Mount, Video Compress
interface VideoPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskType: "视频擦除" | "字幕挂载" | "视频压制"
  onConfirm: () => void
}

export function VideoPreviewDialog({ open, onOpenChange, taskType, onConfirm }: VideoPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{taskType}预览</DialogTitle>
          <DialogDescription>
            预览{taskType}效果
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "9/16", maxHeight: "350px", margin: "0 auto", width: "197px" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Button variant="secondary" size="icon" className="rounded-full">
                <Play className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          {taskType === "视频擦除" && (
            <Button variant="outline" className="bg-transparent">
              重新擦除
            </Button>
          )}
          {taskType === "字幕挂载" && (
            <Button variant="outline" className="bg-transparent">
              修改
            </Button>
          )}
          <Button onClick={onConfirm}>确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
