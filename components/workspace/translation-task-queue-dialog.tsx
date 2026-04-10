"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, Clock, Loader2, XCircle } from "lucide-react"

export interface TranslationTask {
  id: string
  language: string
  languageCode: string
  episode: number
  status: "waiting" | "processing" | "completed" | "failed"
  progress: number
  errorMessage?: string
}

interface TranslationTaskQueueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tasks: TranslationTask[]
  onTasksUpdate: (tasks: TranslationTask[]) => void
  onComplete: () => void
}

export function TranslationTaskQueueDialog({
  open,
  onOpenChange,
  tasks: initialTasks,
  onTasksUpdate,
  onComplete,
}: TranslationTaskQueueDialogProps) {
  const [tasks, setTasks] = useState<TranslationTask[]>(initialTasks)
  const [isRunning, setIsRunning] = useState(false)

  // 同步外部任务状态
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  // 启动任务执行
  useEffect(() => {
    if (open && !isRunning && tasks.some(t => t.status === "waiting" || t.status === "processing")) {
      setIsRunning(true)
    }
  }, [open, isRunning, tasks])

  // 模拟任务执行
  useEffect(() => {
    if (!isRunning || !open) return

    const interval = setInterval(() => {
      setTasks((prevTasks) => {
        const newTasks = [...prevTasks]
        
        const processingCount = newTasks.filter(t => t.status === "processing").length
        const completedCount = newTasks.filter(t => t.status === "completed").length
        const failedCount = newTasks.filter(t => t.status === "failed").length
        
        // 所有任务完成
        if (completedCount + failedCount === newTasks.length) {
          setIsRunning(false)
          
          // 如果没有失败任务，延迟后自动关闭
          if (failedCount === 0) {
            setTimeout(() => {
              onComplete()
              onOpenChange(false)
            }, 1000)
          }
          return newTasks
        }
        
        // 启动新任务（最多5个并发）
        if (processingCount < 5) {
          const waitingTask = newTasks.find(t => t.status === "waiting")
          if (waitingTask) {
            waitingTask.status = "processing"
            waitingTask.progress = 0
          }
        }
        
        // 更新进行中的任务
        newTasks.forEach(task => {
          if (task.status === "processing") {
            const increment = Math.random() * 15 + 5
            task.progress = Math.min(100, task.progress + increment)
            
            if (task.progress >= 100) {
              task.status = "completed"
              task.progress = 100
            }
          }
        })
        
        return newTasks
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isRunning, open, onComplete, onOpenChange])

  // 单独的effect来同步任务状态到父组件
  useEffect(() => {
    onTasksUpdate(tasks)
  }, [tasks, onTasksUpdate])

  const completedCount = tasks.filter(t => t.status === "completed").length
  const processingCount = tasks.filter(t => t.status === "processing").length
  const waitingCount = tasks.filter(t => t.status === "waiting").length
  const failedCount = tasks.filter(t => t.status === "failed").length
  const overallProgress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  // 按语言分组
  const tasksByLanguage = tasks.reduce((acc, task) => {
    if (!acc[task.language]) {
      acc[task.language] = []
    }
    acc[task.language].push(task)
    return acc
  }, {} as Record<string, TranslationTask[]>)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>AI翻译任务队列</DialogTitle>
          <DialogDescription>
            正在翻译 {Object.keys(tasksByLanguage).length} 种语言，最多同时执行 5 个任务
          </DialogDescription>
        </DialogHeader>

        {/* 总体进度 */}
        <div className="space-y-2 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">总体进度</span>
            <span className="font-medium">
              {completedCount}/{tasks.length} ({overallProgress}%)
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>✓ 已完成: {completedCount}</span>
            <span>⚡ 进行中: {processingCount}</span>
            <span>⏳ 等待中: {waitingCount}</span>
            {failedCount > 0 && <span className="text-destructive">✗ 失败: {failedCount}</span>}
          </div>
        </div>

        {/* 任务列表 - 按语言分组 */}
        <ScrollArea className="h-[450px] border border-border rounded-lg">
          <div className="p-4 space-y-4">
            {Object.entries(tasksByLanguage).map(([language, languageTasks]) => {
              const langCompleted = languageTasks.filter(t => t.status === "completed").length
              const langProgress = Math.round((langCompleted / languageTasks.length) * 100)
              
              return (
                <div key={language} className="space-y-2">
                  {/* 语言标题 */}
                  <div className="flex items-center justify-between pb-2 border-b">
                    <h4 className="font-semibold text-sm">{language}</h4>
                    <span className="text-xs text-muted-foreground">
                      {langCompleted}/{languageTasks.length} ({langProgress}%)
                    </span>
                  </div>
                  
                  {/* 该语言的任务 */}
                  <div className="space-y-2">
                    {languageTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-2.5 rounded-lg border transition-colors ${
                          task.status === "completed"
                            ? "bg-green-500/10 border-green-500/30"
                            : task.status === "processing"
                            ? "bg-blue-500/10 border-blue-500/30"
                            : task.status === "failed"
                            ? "bg-red-500/10 border-red-500/30"
                            : "bg-muted/50 border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            {task.status === "completed" && (
                              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            )}
                            {task.status === "processing" && (
                              <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                            )}
                            {task.status === "waiting" && (
                              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                            {task.status === "failed" && (
                              <XCircle className="w-3.5 h-3.5 text-red-500" />
                            )}
                            <span className="text-xs font-medium">第 {task.episode} 集</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {task.status === "completed" && "已完成"}
                            {task.status === "processing" && "翻译中"}
                            {task.status === "waiting" && "等待中"}
                            {task.status === "failed" && "失败"}
                          </span>
                        </div>
                        {task.status !== "waiting" && (
                          <div className="space-y-1">
                            <Progress value={task.progress} className="h-1" />
                            {task.status === "failed" && task.errorMessage && (
                              <p className="text-xs text-destructive">{task.errorMessage}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRunning && failedCount === 0}
          >
            {completedCount === tasks.length ? "完成" : "最小化"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
