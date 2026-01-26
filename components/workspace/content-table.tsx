"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import { MoreHorizontal, Pencil, Trash2, Eye, CheckCircle, XCircle, Download } from "lucide-react"

interface ContentTableProps {
  type: "videos" | "subtitles" | "tasks"
  projectId: string
  onOpenEditor: (projectId: string, episodeId: string) => void
  pageSize: number
  currentPage: number
  selectionMode: boolean
  selectedItems: string[]
  onSelectionChange: (items: string[]) => void
  onOpenTaskDetail?: (taskType: string, taskId: string) => void
}

const generateVideos = (pageSize: number, currentPage: number) => {
  const start = (currentPage - 1) * pageSize
  return Array.from({ length: pageSize }, (_, i) => ({
    id: `item-${start + i + 1}`,
    title: `第${start + i + 1}集 - 霸道总裁爱上我`,
    duration: `${Math.floor(Math.random() * 3) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
    hasSubtitleExtract: i < 7,
    hasErase: i < 5,
    hasDubbing: i < 3,
    hasCompress: i < 2,
    createdAt: `2024-01-${String(14 - (i % 7)).padStart(2, "0")}`,
  }))
}

const generateSubtitles = (pageSize: number, currentPage: number) => {
  const start = (currentPage - 1) * pageSize
  const sources = ["提取", "上传"] as const
  const languages = ["中文", "English", "Spanish", "Portuguese"] as const
  return Array.from({ length: pageSize }, (_, i) => ({
    id: `item-${start + i + 1}`,
    videoTitle: `第${start + i + 1}集`,
    subtitleTitle: `第${start + i + 1}集_字幕`,
    source: sources[i % 2],
    language: languages[i % 4],
    isTranslated: i < 6,
    isProofread: i < 4,
    createdAt: `2024-01-${String(14 - (i % 7)).padStart(2, "0")}`,
  }))
}

const generateTasks = (pageSize: number, currentPage: number) => {
  const start = (currentPage - 1) * pageSize
  // Updated task types - removed 任务分配, added AI提取
  const taskTypes = ["AI提取", "AI翻译", "人工翻译", "视频擦除", "字幕挂载", "视频压制"] as const
  const statuses = ["completed", "in_progress", "pending_review", "reviewing", "failed"] as const
  const languages = ["English", "Spanish", "Portuguese", "Thai"] as const
  return Array.from({ length: pageSize }, (_, i) => ({
    id: `item-${start + i + 1}`,
    name: `任务${start + i + 1}`,
    taskType: taskTypes[i % 6],
    episodeCount: Math.floor(Math.random() * 10) + 1,
    status: statuses[i % 5],
    language: languages[i % 4],
    createdAt: `2024-01-${String(14 - (i % 7)).padStart(2, "0")}`,
  }))
}

const statusMap: Record<string, { label: string; className: string }> = {
  completed: { label: "已完成", className: "bg-success/20 text-success" },
  in_progress: { label: "进行中", className: "bg-primary/20 text-primary" },
  pending_review: { label: "待审核", className: "bg-warning/20 text-warning" },
  reviewing: { label: "审核中", className: "bg-chart-4/20 text-chart-4" },
  failed: { label: "失败", className: "bg-destructive/20 text-destructive" },
}

function BooleanBadge({ value }: { value: boolean }) {
  return value ? (
    <CheckCircle className="w-4 h-4 text-success" />
  ) : (
    <XCircle className="w-4 h-4 text-muted-foreground" />
  )
}

export function ContentTable({
  type,
  projectId,
  onOpenEditor,
  pageSize,
  currentPage,
  selectionMode,
  selectedItems,
  onSelectionChange,
  onOpenTaskDetail,
}: ContentTableProps) {
  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      onSelectionChange(selectedItems.filter((item) => item !== id))
    } else {
      onSelectionChange([...selectedItems, id])
    }
  }

  if (type === "videos") {
    const videos = generateVideos(pageSize, currentPage)
    return (
      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {selectionMode && <TableHead className="w-12"></TableHead>}
              <TableHead className="text-muted-foreground">标题</TableHead>
              <TableHead className="text-muted-foreground">时长</TableHead>
              <TableHead className="text-muted-foreground text-center">字幕提取</TableHead>
              <TableHead className="text-muted-foreground text-center">擦除</TableHead>
              <TableHead className="text-muted-foreground text-center">配音</TableHead>
              <TableHead className="text-muted-foreground text-center">压制</TableHead>
              <TableHead className="text-muted-foreground">创建时间</TableHead>
              <TableHead className="text-muted-foreground w-20">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id} className="border-border hover:bg-muted/50">
                {selectionMode && (
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(video.id)}
                      onCheckedChange={() => toggleItem(video.id)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium text-foreground">{video.title}</TableCell>
                <TableCell className="text-muted-foreground">{video.duration}</TableCell>
                <TableCell className="text-center"><BooleanBadge value={video.hasSubtitleExtract} /></TableCell>
                <TableCell className="text-center"><BooleanBadge value={video.hasErase} /></TableCell>
                <TableCell className="text-center"><BooleanBadge value={video.hasDubbing} /></TableCell>
                <TableCell className="text-center"><BooleanBadge value={video.hasCompress} /></TableCell>
                <TableCell className="text-muted-foreground">{video.createdAt}</TableCell>
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
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    )
  }

  if (type === "subtitles") {
    const subtitles = generateSubtitles(pageSize, currentPage)
    return (
      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {selectionMode && <TableHead className="w-12"></TableHead>}
              <TableHead className="text-muted-foreground">视频标题</TableHead>
              <TableHead className="text-muted-foreground">字幕标题</TableHead>
              <TableHead className="text-muted-foreground">来源</TableHead>
              <TableHead className="text-muted-foreground">语言</TableHead>
              <TableHead className="text-muted-foreground text-center">已翻译</TableHead>
              <TableHead className="text-muted-foreground text-center">已校对</TableHead>
              <TableHead className="text-muted-foreground w-20">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subtitles.map((sub) => (
              <TableRow key={sub.id} className="border-border hover:bg-muted/50">
                {selectionMode && (
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(sub.id)}
                      onCheckedChange={() => toggleItem(sub.id)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium text-foreground">{sub.videoTitle}</TableCell>
                <TableCell className="text-muted-foreground">{sub.subtitleTitle}</TableCell>
                <TableCell>
                  <Badge variant={sub.source === "提取" ? "default" : "secondary"}>
                    {sub.source}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{sub.language}</TableCell>
                <TableCell className="text-center"><BooleanBadge value={sub.isTranslated} /></TableCell>
                <TableCell className="text-center"><BooleanBadge value={sub.isProofread} /></TableCell>
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
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    )
  }

  // Tasks - with row click support
  const tasks = generateTasks(pageSize, currentPage)
  return (
    <Card className="bg-card border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {selectionMode && <TableHead className="w-12"></TableHead>}
            <TableHead className="text-muted-foreground w-20">ID</TableHead>
            <TableHead className="text-muted-foreground">名称</TableHead>
            <TableHead className="text-muted-foreground">任务类型</TableHead>
            <TableHead className="text-muted-foreground">集数</TableHead>
            <TableHead className="text-muted-foreground">状态</TableHead>
            <TableHead className="text-muted-foreground">语言</TableHead>
            <TableHead className="text-muted-foreground">创建时间</TableHead>
            <TableHead className="text-muted-foreground w-20">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task, index) => {
            const status = statusMap[task.status]
            return (
              <TableRow
                key={task.id}
                className="border-border hover:bg-muted/50 cursor-pointer"
                onClick={() => onOpenTaskDetail?.(task.taskType, task.id)}
              >
                {selectionMode && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedItems.includes(task.id)}
                      onCheckedChange={() => toggleItem(task.id)}
                    />
                  </TableCell>
                )}
                <TableCell className="text-muted-foreground">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                <TableCell className="font-medium text-foreground">{task.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-secondary text-secondary-foreground">
                    {task.taskType}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{task.episodeCount} 集</TableCell>
                <TableCell>
                  <Badge className={status.className}>{status.label}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{task.language}</TableCell>
                <TableCell className="text-muted-foreground">{task.createdAt}</TableCell>
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
                      <DropdownMenuItem onClick={() => onOpenTaskDetail?.(task.taskType, task.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        查看详情
                      </DropdownMenuItem>
                      {(task.taskType === "视频擦除" || task.taskType === "字幕挂载" || task.taskType === "视频压制") && (
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          下载视频
                        </DropdownMenuItem>
                      )}
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
  )
}
