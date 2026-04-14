"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CultureWashDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (config: WashConfig) => void
}

export interface WashConfig {
  projectName: string
  sourceFile: string
  sourceCountry: string
  targetCountry: string // set later in the flow
}

const countries = ["美国", "英国", "韩国", "日本", "中国", "泰国", "印度", "印尼", "越南", "菲律宾", "中东", "巴西", "墨西哥", "法国", "德国", "俄罗斯", "西班牙"]

export function CultureWashDialog({ open, onOpenChange, onSubmit }: CultureWashDialogProps) {
  const [config, setConfig] = useState<WashConfig>({ projectName: "", sourceFile: "", sourceCountry: "美国", targetCountry: "" })
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const names = Array.from(files).map(f => f.name)
    setUploadedFiles(prev => [...prev, ...names])
    if (!config.projectName && names.length > 0) {
      setConfig(c => ({ ...c, projectName: names[0].replace(/\.[^.]+$/, ""), sourceFile: names[0] }))
    } else if (names.length > 0) {
      setConfig(c => ({ ...c, sourceFile: names[0] }))
    }
  }

  const removeFile = (name: string) => {
    setUploadedFiles(prev => prev.filter(f => f !== name))
    if (config.sourceFile === name) setConfig(c => ({ ...c, sourceFile: uploadedFiles.find(f => f !== name) || "" }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>文化洗稿</DialogTitle>
          <DialogDescription>上传小说文件，AI 自动分析原文并推荐改写方向</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Upload area */}
          <div>
            <Label className="mb-1.5 block">上传文件 <span className="text-destructive">*</span></Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={e => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files) }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">拖拽文件到此处，或点击选择文件</p>
              <p className="text-xs text-muted-foreground/70 mt-1">支持 TXT、DOCX、EPUB 格式</p>
              <input ref={fileInputRef} type="file" className="hidden" accept=".txt,.docx,.epub" multiple onChange={e => handleFiles(e.target.files)} />
            </div>
            {uploadedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {uploadedFiles.map(f => (
                  <div key={f} className="flex items-center gap-2 px-2 py-1 rounded bg-muted/50 text-xs">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{f}</span>
                    <button onClick={(e) => { e.stopPropagation(); removeFile(f) }} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>项目名称 <span className="text-destructive">*</span></Label>
            <Input placeholder="例如：狼人文洗稿" value={config.projectName} onChange={e => setConfig({ ...config, projectName: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={() => { onSubmit(config); onOpenChange(false) }} disabled={!config.projectName.trim() || uploadedFiles.length === 0}>创建项目</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
