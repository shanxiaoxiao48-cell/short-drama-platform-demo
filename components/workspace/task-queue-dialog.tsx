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
import { CheckCircle, Clock, Loader2 } from "lucide-react"

interface TaskQueueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalEpisodes: number
  onComplete: () => void
}

interface TaskStatus {
  episode: number
  status: "waiting" | "processing" | "completed"
  progress: number
}

export function TaskQueueDialog({ open, onOpenChange, totalEpisodes, onComplete }: TaskQueueDialogProps) {
  const [tasks, setTasks] = useState<TaskStatus[]>([])
  const [isRunning, setIsRunning] = useState(false)

  // 初始化任务列表
  useEffect(() => {
    if (open && tasks.length === 0) {
      const initialTasks: TaskStatus[] = []
      for (let i = 1; i <= totalEpisodes; i++) {
        initialTasks.push({
          episode: i,
          status: "waiting",
          progress: 0,
        })
      }
      setTasks(initialTasks)
      setIsRunning(true)
    }
  }, [open, totalEpisodes, tasks.length])

  // 模拟任务执行
  useEffect(() => {
    if (!isRunning || !open) return

    const interval = setInterval(() => {
      setTasks((prevTasks) => {
        const newTasks = [...prevTasks]
        
        // 统计当前正在处理的任务数量
        const processingCount = newTasks.filter(t => t.status === "processing").length
        const completedCount = newTasks.filter(t => t.status === "completed").length
        
        // 如果所有任务都完成了
        if (completedCount === totalEpisodes) {
          setIsRunning(false)
          // 延迟1秒后自动关闭并触发完成回调
          setTimeout(() => {
            onComplete()
            onOpenChange(false)
          }, 1000)
          return newTasks
        }
        
        // 如果正在处理的任务少于5个，启动新任务
        if (processingCount < 5) {
          const waitingTask = newTasks.find(t => t.status === "waiting")
          if (waitingTask) {
            waitingTask.status = "processing"
            waitingTask.progress = 0
          }
        }
        
        // 更新正在处理的任务进度
        newTasks.forEach(task => {
          if (task.status === "processing") {
            // 随机增加进度（模拟真实处理）
            const increment = Math.random() * 15 + 5 // 5-20%
            task.progress = Math.min(100, task.progress + increment)
            
            // 如果进度达到100%，标记为完成
            if (task.progress >= 100) {
              task.status = "completed"
              task.progress = 100
            }
          }
        })
        
        return newTasks
      })
    }, 500) // 每500ms更新一次

    return () => clearInterval(interval)
  }, [isRunning, open, totalEpisodes, onComplete, onOpenChange])

  const completedCount = tasks.filter(t => t.status === "completed").length
  const processingCount = tasks.filter(t => t.status === "processing").length
  const waitingCount = tasks.filter(t => t.status === "waiting").length
  const overallProgress = totalEpisodes > 0 ? Math.round((completedCount / totalEpisodes) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>AI提取任务队列</DialogTitle>
          <DialogDescription>
            正在处理 {totalEpisodes} 集，最多同时执行 5 个任务
          </DialogDescription>
        </DialogHeader>

        {/* 总体进度 */}
        <div className="space-y-2 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">总体进度</span>
            <span className="font-medium">
              {completedCount}/{totalEpisodes} ({overallProgress}%)
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>✓ 已完成: {completedCount}</span>
            <span>⚡ 进行中: {processingCount}</span>
            <span>⏳ 等待中: {waitingCount}</span>
          </div>
        </div>

        {/* 任务列表 */}
        <ScrollArea className="h-[400px] border border-border rounded-lg">
          <div className="p-4 space-y-2">
            {tasks.map((task) => (
              <div
                key={task.episode}
                className={`p-3 rounded-lg border transition-colors ${
                  task.status === "completed"
                    ? "bg-green-500/10 border-green-500/30"
                    : task.status === "processing"
                    ? "bg-blue-500/10 border-blue-500/30"
                    : "bg-muted/50 border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {task.status === "completed" && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {task.status === "processing" && (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    )}
                    {task.status === "waiting" && (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">第 {task.episode} 集</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {task.status === "completed" && "已完成"}
                    {task.status === "processing" && "处理中"}
                    {task.status === "waiting" && "等待中"}
                  </span>
                </div>
                {task.status !== "waiting" && (
                  <div className="space-y-1">
                    <Progress value={task.progress} className="h-1.5" />
                    <div className="text-xs text-right text-muted-foreground">
                      {Math.round(task.progress)}%
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsRunning(false)
              onOpenChange(false)
            }}
            disabled={completedCount === totalEpisodes}
          >
            {completedCount === totalEpisodes ? "已完成" : "取消"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
