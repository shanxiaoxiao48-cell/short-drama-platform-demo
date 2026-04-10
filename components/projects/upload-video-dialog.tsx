"use client"

import React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Upload, FileVideo, X, CheckCircle } from "lucide-react"

interface UploadVideoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectTitle: string
  onVideosUploaded?: (videos: UploadedVideoInfo[]) => void
}

export interface UploadedVideoInfo {
  id: string
  name: string
  size: number
  thumbnailUrl: string
  duration: number
}

interface UploadedFile {
  name: string
  size: number
  progress: number
  status: "uploading" | "completed" | "error"
  file?: File
  url?: string
  thumbnailUrl?: string
  duration?: number
}

export function UploadVideoDialog({ open, onOpenChange, projectId, projectTitle, onVideosUploaded }: UploadVideoDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === "video/mp4" || file.type === "video/quicktime" || file.type.startsWith("video/")
    )
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    // 过滤无效文件
    const validFiles = files.filter(file => {
      if (!file || !(file instanceof File)) {
        console.error('Invalid file:', file)
        return false
      }
      return true
    })

    if (validFiles.length === 0) {
      console.error('No valid files to process')
      return
    }

    // 简化处理：只添加基本信息，不生成缩略图和获取时长
    const newFiles: UploadedFile[] = validFiles.map((file) => ({
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading" as const,
      file,
      url: '', // 不再创建真实的 Blob URL
      thumbnailUrl: `/drama-posters/badao-zongcai.png`, // 使用默认占位图
      duration: Math.floor(Math.random() * 120 + 60), // 模拟时长：60-180秒
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // 模拟上传进度
    for (let i = 0; i < newFiles.length; i++) {
      const index = uploadedFiles.length + i

      // 模拟进度更新
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadedFiles(prev => {
          const updated = [...prev]
          if (updated[index]) {
            updated[index] = {
              ...updated[index],
              progress,
            }
          }
          return updated
        })
      }

      // 标记为完成
      setUploadedFiles(prev => {
        const updated = [...prev]
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            progress: 100,
            status: "completed" as const,
          }
        }
        return updated
      })
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => {
      const file = prev[index]
      if (file.url) {
        URL.revokeObjectURL(file.url)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartUpload = () => {
    // 准备视频信息数据（演示模式，不存储到 videoStorage）
    const videoInfos: UploadedVideoInfo[] = uploadedFiles
      .filter(f => f.status === "completed" && f.file && f.thumbnailUrl)
      .map((f, index) => {
        const videoId = `${Date.now()}-${index}-${f.file!.name}`
        return {
          id: videoId,
          name: f.name,
          size: f.size,
          thumbnailUrl: f.thumbnailUrl!,
          duration: f.duration || 0,
        }
      })

    // 传递给父组件
    if (onVideosUploaded && videoInfos.length > 0) {
      onVideosUploaded(videoInfos)
    }

    setUploadedFiles([])
    onOpenChange(false)
  }

  const handleCancel = () => {
    // 清理所有 Blob URLs
    uploadedFiles.forEach(f => {
      if (f.url) {
        URL.revokeObjectURL(f.url)
      }
    })
    setUploadedFiles([])
    onOpenChange(false)
  }

  // 对话框关闭时清理资源
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(f => {
        if (f.url) {
          URL.revokeObjectURL(f.url)
        }
      })
    }
  }, [uploadedFiles])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-foreground">上传视频</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            项目：{projectTitle} (ID: {projectId})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">上传视频</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("video-upload")?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">拖拽视频文件到此处，或点击选择文件</p>
                  <p className="text-xs text-muted-foreground mt-1">支持 MP4, MOV 等格式，单文件最大 2GB</p>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                        {file.thumbnailUrl ? (
                          <div className="w-16 h-16 rounded overflow-hidden bg-black shrink-0">
                            <img src={file.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <FileVideo className="w-16 h-16 text-primary shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                              {file.duration && file.duration > 0 && (
                                <span className="text-xs text-muted-foreground">{formatDuration(file.duration)}</span>
                              )}
                            </div>
                          </div>
                          {file.status === "uploading" && (
                            <div className="space-y-1">
                              <Progress value={file.progress} className="h-1" />
                              <p className="text-xs text-muted-foreground">处理中... {file.progress}%</p>
                            </div>
                          )}
                          {file.status === "completed" && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              <span>处理完成</span>
                            </div>
                          )}
                          {file.status === "error" && (
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <span>处理失败，请重试</span>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveFile(index)
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>取消</Button>
          <Button type="button" onClick={handleStartUpload} disabled={uploadedFiles.length === 0}>
            开始上传 {uploadedFiles.length > 0 && `(${uploadedFiles.length}个视频)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
