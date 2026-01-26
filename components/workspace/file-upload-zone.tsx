"use client"

import { useRef, useState } from "react"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { formatFileSize } from "@/lib/upload-utils"

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void
  acceptedFileTypes?: string[] // [".mp4", ".mov"] 等
  accept?: string // 用于input的accept属性
  maxFileSize?: number // 字节
  multiple?: boolean
  disabled?: boolean
  selectedFiles?: File[]
  onRemoveFile?: (index: number) => void
}

export function FileUploadZone({
  onFilesSelected,
  acceptedFileTypes = [],
  accept = "*",
  maxFileSize,
  multiple = true,
  disabled = false,
  selectedFiles = [],
  onRemoveFile,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onFilesSelected(files)
    }
    // 重置input，允许选择相同文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleRemove = (index: number) => {
    onRemoveFile?.(index)
  }

  return (
    <div className="space-y-3">
      {/* 上传区域 */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer",
          isDragging && !disabled
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            isDragging && !disabled ? "bg-primary/20" : "bg-muted"
          )}>
            <Upload className={cn(
              "w-6 h-6",
              isDragging && !disabled ? "text-primary" : "text-muted-foreground"
            )} />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {isDragging ? "释放文件以上传" : "拖拽文件到此处或点击选择"}
            </p>
            <p className="text-xs text-muted-foreground">
              {acceptedFileTypes.length > 0 && (
                <>支持格式: {acceptedFileTypes.join(', ')}</>
              )}
              {maxFileSize && (
                <> · 最大 {formatFileSize(maxFileSize)}</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 已选文件列表 */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">已选文件:</p>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                {onRemoveFile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(index)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
