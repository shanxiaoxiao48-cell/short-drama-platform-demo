"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Upload, CheckCircle, Loader2 } from "lucide-react"
import { FileUploadZone } from "./file-upload-zone"
import { FILE_TYPE_ACCEPT, getFileAccept, formatFileSize } from "@/lib/upload-utils"

// 视频下载对话框
interface VideoDownloadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (selectedTypes: string[]) => void
}

const videoTypes = [
  { id: "source", label: "源语言视频" },
  { id: "erased", label: "擦除视频" },
  { id: "onscreen_text", label: "画面字压制视频" },
  { id: "final", label: "成片压制视频" },
]

export function VideoDownloadDialog({ open, onOpenChange, onConfirm }: VideoDownloadDialogProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const toggleType = (id: string) => {
    if (selectedTypes.includes(id)) {
      setSelectedTypes(selectedTypes.filter(t => t !== id))
    } else {
      setSelectedTypes([...selectedTypes, id])
    }
  }

  const handleConfirm = () => {
    if (selectedTypes.length > 0) {
      onConfirm(selectedTypes)
      setSelectedTypes([])
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>视频下载</DialogTitle>
          <DialogDescription>
            选择要下载的视频类型
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {videoTypes.map(type => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={type.id}
                checked={selectedTypes.includes(type.id)}
                onCheckedChange={() => toggleType(type.id)}
              />
              <label htmlFor={type.id} className="text-sm cursor-pointer flex-1">{type.label}</label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">取消</Button>
          <Button onClick={handleConfirm} disabled={selectedTypes.length === 0}>
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 字幕下载对话框
interface SubtitleDownloadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (selectedLanguages: string[]) => void
  availableLanguages?: string[]
}

export function SubtitleDownloadDialog({ 
  open, 
  onOpenChange, 
  onConfirm,
  availableLanguages = ["中文", "英语", "西班牙语", "葡萄牙语", "泰语"]
}: SubtitleDownloadDialogProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang))
    } else {
      setSelectedLanguages([...selectedLanguages, lang])
    }
  }

  const handleConfirm = () => {
    if (selectedLanguages.length > 0) {
      onConfirm(selectedLanguages)
      setSelectedLanguages([])
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>字幕下载</DialogTitle>
          <DialogDescription>
            选择要下载的语种（可多选）
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {availableLanguages.map(lang => (
            <div key={lang} className="flex items-center space-x-2">
              <Checkbox
                id={lang}
                checked={selectedLanguages.includes(lang)}
                onCheckedChange={() => toggleLanguage(lang)}
              />
              <label htmlFor={lang} className="text-sm cursor-pointer flex-1">{lang}</label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">取消</Button>
          <Button onClick={handleConfirm} disabled={selectedLanguages.length === 0}>
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 确认下载对话框（用于画面字和术语表）
interface ConfirmDownloadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
}

export function ConfirmDownloadDialog({ 
  open, 
  onOpenChange, 
  onConfirm,
  title,
  description
}: ConfirmDownloadDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">取消</Button>
          <Button onClick={handleConfirm}>
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 下载队列对话框
interface DownloadQueueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: Array<{
    id: string
    name: string
    progress: number
    status: "pending" | "downloading" | "completed" | "error"
  }>
}

export function DownloadQueueDialog({ open, onOpenChange, items }: DownloadQueueDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            下载队列
          </DialogTitle>
          <DialogDescription>
            {items.filter(i => i.status === "completed").length} / {items.length} 已完成
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          <div className="space-y-3 py-4">
            {items.map(item => (
              <div key={item.id} className="space-y-2 p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.status === "completed" && (
                    <CheckCircle className="w-4 h-4 text-success" />
                  )}
                  {item.status === "downloading" && (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  )}
                  {item.status === "error" && (
                    <span className="text-xs text-destructive">失败</span>
                  )}
                </div>
                <Progress value={item.progress} className="h-1.5" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{item.status === "completed" ? "已完成" : item.status === "downloading" ? "下载中..." : item.status === "error" ? "下载失败" : "等待中"}</span>
                  <span>{item.progress}%</span>
                </div>
              </div>
            ))}
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

// 上传表单对话框
interface UploadFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uploadType: "视频" | "字幕" | "画面字" | "术语表"
  projectTitle: string
  onSubmit: (data: UploadFormData) => void
}

export interface UploadFormData {
  uploadType: string
  videoType?: string // 仅视频上传时使用
  files: File[]
}

export function UploadFormDialog({
  open,
  onOpenChange,
  uploadType,
  projectTitle,
  onSubmit,
}: UploadFormDialogProps) {
  const [videoType, setVideoType] = useState("source") // 视频类型：source, erased, onscreen_text, final
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 重置表单
  useEffect(() => {
    if (open) {
      setVideoType("source")
      setFiles([])
      setErrors({})
    }
  }, [open])

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles])
    if (errors.files) {
      setErrors(prev => ({ ...prev, files: "" }))
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (files.length === 0) {
      newErrors.files = "请选择要上传的文件"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        uploadType,
        videoType: uploadType === "视频" ? videoType : undefined,
        files,
      })
      onOpenChange(false)
    }
  }

  const isFormValid = files.length > 0

  // 获取上传说明
  const getUploadInstructions = () => {
    switch (uploadType) {
      case "视频":
        return (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="font-medium">上传说明：</p>
            <p>1、视频文件命名格式：短剧名称-语言-数字</p>
            <p className="ml-4">例如：犬父定乾坤-简体中文-1.mp4</p>
            <p>2、后续的数字决定为在短剧的第x集，如果重复的话会出现覆盖的情况，上传前请确认</p>
          </div>
        )
      case "字幕":
        return (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="font-medium">上传说明：</p>
            <p>1、字幕文件命名格式：短剧名称-语言-数字</p>
            <p className="ml-4">例如：犬父定乾坤-简体中文-1.srt</p>
            <p>2、后续的数字决定为在短剧的第x集，如果重复的话会出现覆盖的情况，上传前请确认</p>
          </div>
        )
      case "画面字":
        return (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="font-medium">上传说明：</p>
            <p>1、画面字文件命名格式：短剧名称-画面字术语表-语言-数字</p>
            <p className="ml-4">例如：离婚后前夫全家跪求我原谅-画面字术语表-简体中文-1.xlsx</p>
            <p>2、后续的数字决定为在短剧的第x集，如果重复的话会出现覆盖的情况，上传前请确认</p>
          </div>
        )
      case "术语表":
        return (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="font-medium">上传说明：</p>
            <p>1、术语表文件命名格式：短剧名称-字幕术语表-语言-数字</p>
            <p className="ml-4">例如：离婚后前夫全家跪求我原谅-字幕术语表-简体中文-1.xlsx</p>
            <p>2、后续的数字决定为在短剧的第x集，如果重复的话会出现覆盖的情况，上传前请确认</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>上传{uploadType}</DialogTitle>
          <DialogDescription>
            {projectTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 视频类型选择（仅视频上传时显示） */}
          {uploadType === "视频" && (
            <div className="space-y-2">
              <Label>视频类型 *</Label>
              <Select value={videoType} onValueChange={setVideoType}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择视频类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="source">原视频</SelectItem>
                  <SelectItem value="erased">擦除视频</SelectItem>
                  <SelectItem value="onscreen_text">画面字压制视频</SelectItem>
                  <SelectItem value="final">成片视频</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 文件上传区域 */}
          <div className="space-y-2">
            <Label>选择文件 *</Label>
            <FileUploadZone
              onFilesSelected={handleFilesSelected}
              acceptedFileTypes={FILE_TYPE_ACCEPT[uploadType] || []}
              accept={getFileAccept(uploadType)}
              maxFileSize={uploadType === "视频" ? 2 * 1024 * 1024 * 1024 : 100 * 1024 * 1024}
              multiple={true}
              selectedFiles={files}
              onRemoveFile={handleRemoveFile}
            />
            {errors.files && (
              <p className="text-xs text-destructive">{errors.files}</p>
            )}
          </div>

          {/* 上传说明 */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            {getUploadInstructions()}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid}>
            确认上传
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 上传队列对话框（重构为以集为单位）
export interface UploadQueueItem {
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
}

interface UploadQueueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: UploadQueueItem[]
  onRetry?: (itemId: string) => void
}

export function UploadQueueDialog({ open, onOpenChange, items, onRetry }: UploadQueueDialogProps) {
  const completedCount = items.filter(i => i.status === "completed").length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            上传队列
          </DialogTitle>
          <DialogDescription>
            {completedCount} / {items.length} 已完成
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          <div className="space-y-3 py-4">
            {items.map(item => (
              <div key={item.id} className="space-y-2 p-3 rounded-lg border border-border">
                {/* 标题行 */}
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.projectTitle} - {item.languageVariant} - 第{item.episodeNumber}集 - {item.uploadType}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.fileName} ({formatFileSize(item.fileSize)})
                    </p>
                  </div>
                  <div className="ml-3 shrink-0">
                    {item.status === "completed" && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                    {item.status === "uploading" && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    )}
                    {item.status === "error" && onRetry && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRetry(item.id)}
                        className="h-6 text-xs"
                      >
                        重试
                      </Button>
                    )}
                  </div>
                </div>

                {/* 进度条 */}
                <Progress value={item.progress} className="h-1.5" />

                {/* 状态行 */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {item.status === "completed" && "已完成"}
                    {item.status === "uploading" && "上传中..."}
                    {item.status === "error" && (item.errorMessage || "上传失败")}
                    {item.status === "pending" && "等待中"}
                  </span>
                  <span>{item.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            {completedCount === items.length ? "完成" : "最小化"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 覆盖确认对话框
interface OverwriteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  conflictFiles: Array<{
    fileName: string
    language: string
    episode?: number
    type?: string
  }>
}

export function OverwriteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  conflictFiles,
}: OverwriteConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>确认覆盖</DialogTitle>
          <DialogDescription>
            以下文件已存在，确认要覆盖吗？
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-60">
          <div className="space-y-2 py-4">
            {conflictFiles.map((file, index) => (
              <div key={index} className="p-2 rounded bg-muted/50 text-sm">
                <p className="font-medium">{file.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {file.language}
                  {file.episode && ` - 第${file.episode}集`}
                  {file.type && ` - ${file.type}`}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
            取消
          </Button>
          <Button onClick={handleConfirm} variant="destructive">
            确认覆盖
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
