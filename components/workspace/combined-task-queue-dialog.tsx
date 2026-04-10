"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, Download, CheckCircle, Loader2, Clock, AlertCircle } from "lucide-react"

export interface CombinedTaskQueueItem {
  id: string
  type: "upload" | "download" | "ai_extract" | "video_erase" | "ai_translate"
  name: string
  progress: number
  status: "pending" | "uploading" | "downloading" | "processing" | "completed" | "error"
  errorMessage?: string
}

interface CombinedTaskQueueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uploadItems: Array<{
    id: string
    projectTitle: string
    languageVariant: string
    episodeNumber: number
    uploadType: string
    fileName: string
    fileSize: number
    progress: number
    status: "pending" | "uploading" | "completed" | "error"
    errorMessage?: string
  }>
  downloadItems: Array<{
    id: string
    name: string
    progress: number
    status: "pending" | "downloading" | "completed" | "error"
  }>
  aiExtractStatus: "not_started" | "in_progress" | "completed"
  videoEraseStatus: "not_started" | "in_progress" | "completed"
  aiTranslateStatus: "not_started" | "in_progress" | "completed"
  translationTasks: Array<{
    id: string
    episode: number
    status: "waiting" | "processing" | "completed" | "failed"
    progress: number
  }>
  onUploadRetry?: (itemId: string) => void
}

export function CombinedTaskQueueDialog({
  open,
  onOpenChange,
  uploadItems,
  downloadItems,
  aiExtractStatus,
  videoEraseStatus,
  aiTranslateStatus,
  translationTasks,
  onUploadRetry,
}: CombinedTaskQueueDialogProps) {
  // 计算总体统计
  const activeUploadCount = uploadItems.filter(i => i.status === "uploading" || i.status === "pending").length
  const activeDownloadCount = downloadItems.filter(i => i.status === "downloading" || i.status === "pending").length
  const completedUploadCount = uploadItems.filter(i => i.status === "completed").length
  const completedDownloadCount = downloadItems.filter(i => i.status === "completed").length

  // AI任务统计
  const aiTaskCount = [
    aiExtractStatus === "in_progress" ? 1 : 0,
    videoEraseStatus === "in_progress" ? 1 : 0,
    aiTranslateStatus === "in_progress" ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  const completedAiTaskCount = [
    aiExtractStatus === "completed" ? 1 : 0,
    videoEraseStatus === "completed" ? 1 : 0,
    aiTranslateStatus === "completed" ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  const totalActiveTasks = activeUploadCount + activeDownloadCount + aiTaskCount
  const totalCompletedTasks = completedUploadCount + completedDownloadCount + completedAiTaskCount

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            任务队列
          </DialogTitle>
          <DialogDescription>
            {totalCompletedTasks} 项已完成 · {totalActiveTasks} 项进行中
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-4 py-4">
            {/* 上传任务 */}
            {uploadItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Upload className="w-4 h-4" />
                  上传任务 ({uploadItems.filter(i => i.status === "completed").length}/{uploadItems.length})
                </div>
                {uploadItems.map(item => (
                  <div key={item.id} className="space-y-1 p-2 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {item.projectTitle} - {item.languageVariant} - 第{item.episodeNumber}集
                        </p>
                      </div>
                      <div className="ml-2 shrink-0 flex items-center gap-2">
                        {item.status === "completed" && (
                          <>
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 text-xs text-blue-500"
                            >
                              立即查看
                            </Button>
                          </>
                        )}
                        {item.status === "uploading" && (
                          <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                        )}
                        {item.status === "error" && onUploadRetry && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUploadRetry(item.id)}
                            className="h-5 text-xs"
                          >
                            重试
                          </Button>
                        )}
                        {item.status === "pending" && (
                          <Clock className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <Progress value={item.progress} className="h-1" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {item.fileName} ({formatFileSize(item.fileSize)})
                      </span>
                      <span>{item.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 下载任务 */}
            {downloadItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Download className="w-4 h-4" />
                  下载任务 ({downloadItems.filter(i => i.status === "completed").length}/{downloadItems.length})
                </div>
                {downloadItems.map(item => (
                  <div key={item.id} className="space-y-1 p-2 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                      <div className="ml-2 shrink-0 flex items-center gap-2">
                        {item.status === "completed" && (
                          <>
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 text-xs text-blue-500"
                            >
                              立即查看
                            </Button>
                          </>
                        )}
                        {item.status === "downloading" && (
                          <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                        )}
                        {item.status === "error" && (
                          <AlertCircle className="w-3 h-3 text-destructive" />
                        )}
                        {item.status === "pending" && (
                          <Clock className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <Progress value={item.progress} className="h-1" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {item.status === "completed" && "已完成"}
                        {item.status === "downloading" && "下载中..."}
                        {item.status === "error" && "下载失败"}
                        {item.status === "pending" && "等待中"}
                      </span>
                      <span>{item.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* AI任务 */}
            {(aiExtractStatus !== "not_started" || videoEraseStatus !== "not_started" || aiTranslateStatus !== "not_started") && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Loader2 className="w-4 h-4" />
                  AI任务 ({completedAiTaskCount}/{aiTaskCount + completedAiTaskCount})
                </div>

                {/* AI提取 */}
                {aiExtractStatus !== "not_started" && (
                  <div className="space-y-1 p-2 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium">AI提取字幕</p>
                      <div className="flex items-center gap-2">
                        {aiExtractStatus === "completed" && (
                          <>
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 text-xs text-blue-500"
                            >
                              立即查看
                            </Button>
                          </>
                        )}
                        {aiExtractStatus === "in_progress" && (
                          <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                        )}
                      </div>
                    </div>
                    <Progress
                      value={aiExtractStatus === "completed" ? 100 : aiExtractStatus === "in_progress" ? 50 : 0}
                      className="h-1"
                    />
                  </div>
                )}

                {/* 视频擦除 */}
                {videoEraseStatus !== "not_started" && (
                  <div className="space-y-1 p-2 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium">视频擦除</p>
                      <div className="flex items-center gap-2">
                        {videoEraseStatus === "completed" && (
                          <>
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 text-xs text-blue-500"
                            >
                              立即查看
                            </Button>
                          </>
                        )}
                        {videoEraseStatus === "in_progress" && (
                          <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                        )}
                      </div>
                    </div>
                    <Progress
                      value={videoEraseStatus === "completed" ? 100 : videoEraseStatus === "in_progress" ? 50 : 0}
                      className="h-1"
                    />
                  </div>
                )}

                {/* AI翻译 */}
                {aiTranslateStatus !== "not_started" && (
                  <div className="space-y-2">
                    <div className="space-y-1 p-2 rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">AI翻译</p>
                        <div className="flex items-center gap-2">
                          {aiTranslateStatus === "completed" && (
                            <>
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 text-xs text-blue-500"
                              >
                                立即查看
                              </Button>
                            </>
                          )}
                          {aiTranslateStatus === "in_progress" && (
                            <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                          )}
                        </div>
                      </div>
                      <Progress
                        value={aiTranslateStatus === "completed" ? 100 : aiTranslateStatus === "in_progress" ? 50 : 0}
                        className="h-1"
                      />
                    </div>

                    {/* AI翻译子任务 */}
                    {translationTasks.length > 0 && (
                      <div className="pl-4 space-y-1">
                        {translationTasks.slice(0, 5).map(task => (
                          <div key={task.id} className="text-xs text-muted-foreground flex items-center gap-2">
                            {task.status === "completed" && <CheckCircle className="w-3 h-3 text-green-500" />}
                            {task.status === "processing" && <Loader2 className="w-3 h-3 animate-spin" />}
                            {task.status === "waiting" && <Clock className="w-3 h-3" />}
                            第{task.episode}集 {task.status === "completed" ? "已完成" : task.status === "processing" ? "处理中" : "等待中"}
                          </div>
                        ))}
                        {translationTasks.length > 5 && (
                          <p className="text-xs text-muted-foreground">
                            还有 {translationTasks.length - 5} 集处理中...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 空状态 */}
            {uploadItems.length === 0 &&
              downloadItems.length === 0 &&
              aiExtractStatus === "not_started" &&
              videoEraseStatus === "not_started" &&
              aiTranslateStatus === "not_started" && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">暂无任务</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
