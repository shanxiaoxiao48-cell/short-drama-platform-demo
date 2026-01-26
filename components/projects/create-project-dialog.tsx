"use client"

import React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Upload, FileVideo, X, CheckCircle } from "lucide-react"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated?: (project: {
    id: string
    title: string
    originalLanguage: string
    episodes: number
    languageCount: number
    remark: string
    createdAt: string
  }) => void
}

interface UploadedFile {
  name: string
  size: number
  progress: number
  status: "uploading" | "completed" | "error"
}

// 常用源语言列表
const SOURCE_LANGUAGES = [
  { value: "中文", label: "中文" },
  { value: "英语", label: "英语" },
  { value: "日语", label: "日语" },
  { value: "韩语", label: "韩语" },
  { value: "西班牙语", label: "西班牙语" },
  { value: "葡萄牙语", label: "葡萄牙语" },
  { value: "法语", label: "法语" },
  { value: "德语", label: "德语" },
  { value: "俄语", label: "俄语" },
  { value: "阿拉伯语", label: "阿拉伯语" },
  { value: "泰语", label: "泰语" },
  { value: "越南语", label: "越南语" },
  { value: "印尼语", label: "印尼语" },
  { value: "马来语", label: "马来语" },
  { value: "印地语", label: "印地语" },
  { value: "土耳其语", label: "土耳其语" },
  { value: "意大利语", label: "意大利语" },
  { value: "荷兰语", label: "荷兰语" },
  { value: "波兰语", label: "波兰语" },
  { value: "瑞典语", label: "瑞典语" },
]

export function CreateProjectDialog({ open, onOpenChange, onProjectCreated }: CreateProjectDialogProps) {
  const [formData, setFormData] = useState({
    projectId: "",
    title: "",
    originalLanguage: "中文",
  })
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [validationError, setValidationError] = useState("")
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
      file => file.type === "video/mp4" || file.type === "video/quicktime"
    )
    
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading" as const,
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])
    
    // 模拟上传进度
    newFiles.forEach((_, index) => {
      const startIndex = uploadedFiles.length + index
      simulateUpload(startIndex)
    })
  }

  const simulateUpload = (index: number) => {
    const interval = setInterval(() => {
      setUploadedFiles(prev => {
        const updated = [...prev]
        if (updated[index]) {
          if (updated[index].progress < 100) {
            updated[index].progress += 10
          } else {
            updated[index].status = "completed"
            clearInterval(interval)
          }
        }
        return updated
      })
    }, 200)
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.projectId.trim()) {
      setValidationError("请输入短剧ID")
      return
    }
    if (!formData.title.trim()) {
      setValidationError("请输入项目名称")
      return
    }

    // Handle form submission
    const newProject = {
      id: formData.projectId,
      title: formData.title,
      originalLanguage: formData.originalLanguage,
      episodes: uploadedFiles.length || 1, // 根据上传的视频数量设置集数
      languageCount: 1, // 默认只有源语言
      remark: "",
      createdAt: new Date().toISOString().split('T')[0],
    }
    
    // Call onProjectCreated callback if provided
    if (onProjectCreated) {
      onProjectCreated(newProject)
    }
    
    // Reset form and close dialog
    setFormData({
      projectId: "",
      title: "",
      originalLanguage: "中文",
    })
    setUploadedFiles([])
    setValidationError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-foreground">新建短剧项目</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            创建一个新的短剧出海本地化项目，支持多语言翻译
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectId" className="text-foreground">
                  短剧ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="projectId"
                  placeholder="请输入短剧ID，例如：DG001"
                  className="bg-input border-border"
                  value={formData.projectId}
                  onChange={(e) => {
                    setFormData({ ...formData, projectId: e.target.value })
                    setValidationError("")
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">
                  项目名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="请输入短剧名称"
                  className="bg-input border-border"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value })
                    setValidationError("")
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">源语言</Label>
                <Select
                  value={formData.originalLanguage}
                  onValueChange={(value) => setFormData({ ...formData, originalLanguage: value })}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">上传视频（可选）</Label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    isDragging 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("video-upload")?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    拖拽视频文件到此处，或点击选择文件
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    支持 MP4, MOV 格式，单文件最大 2GB
                  </p>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/mp4,video/quicktime"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {/* 上传文件列表 */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border"
                      >
                        <FileVideo className="w-5 h-5 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {file.name}
                            </p>
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                          {file.status === "uploading" && (
                            <div className="space-y-1">
                              <Progress value={file.progress} className="h-1" />
                              <p className="text-xs text-muted-foreground">
                                上传中... {file.progress}%
                              </p>
                            </div>
                          )}
                          {file.status === "completed" && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              <span>上传完成</span>
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

          {validationError && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              {validationError}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setFormData({
                  projectId: "",
                  title: "",
                  originalLanguage: "中文",
                })
                setUploadedFiles([])
                setValidationError("")
                onOpenChange(false)
              }}
            >
              取消
            </Button>
            <Button type="submit">
              创建项目 {uploadedFiles.length > 0 && `(${uploadedFiles.length}个视频)`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
