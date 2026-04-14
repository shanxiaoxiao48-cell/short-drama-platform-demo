"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  targetCountry: string
  washMode: "ancient_to_werewolf" | "period_to_mafia"
}

const washModes = [
  { id: "ancient_to_werewolf" as const, label: "古言转狼人", emoji: "🐺", desc: "Ancient Romance → Werewolf", from: "古言", to: "狼人" },
  { id: "period_to_mafia" as const, label: "年代文转黑手党", emoji: "🔫", desc: "Period Drama → Mafia", from: "年代文", to: "黑手党" },
]

export function CultureWashDialog({ open, onOpenChange, onSubmit }: CultureWashDialogProps) {
  const [config, setConfig] = useState<WashConfig>({ projectName: "", sourceFile: "", sourceCountry: "", targetCountry: "", washMode: "ancient_to_werewolf" })
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

  const selectedMode = washModes.find(m => m.id === config.washMode)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>文化洗稿</DialogTitle>
          <DialogDescription>上传原文，选择洗稿模式，AI 自动分析并改写</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Upload */}
          <div>
            <Label className="mb-1.5 block">上传原文 <span className="text-destructive">*</span></Label>
            <div className={cn("border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors", isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true) }} onDragLeave={() => setIsDragOver(false)}
              onDrop={e => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files) }}
              onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-7 h-7 text-muted-foreground mx-auto mb-1.5" />
              <p className="text-sm text-muted-foreground">拖拽文件到此处，或点击选择</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">支持 TXT、DOCX</p>
              <input ref={fileInputRef} type="file" className="hidden" accept=".txt,.docx" onChange={e => handleFiles(e.target.files)} />
            </div>
            {uploadedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {uploadedFiles.map(f => (
                  <div key={f} className="flex items-center gap-2 px-2 py-1 rounded bg-muted/50 text-xs">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{f}</span>
                    <button onClick={e => { e.stopPropagation(); removeFile(f) }} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project name */}
          <div className="space-y-1.5">
            <Label>项目名称 <span className="text-destructive">*</span></Label>
            <Input placeholder="自动填充文件名" value={config.projectName} onChange={e => setConfig({ ...config, projectName: e.target.value })} />
          </div>

          {/* Wash mode selection */}
          <div className="space-y-1.5">
            <Label>洗稿模式 <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-2 gap-3">
              {washModes.map(mode => (
                <button key={mode.id} onClick={() => setConfig({ ...config, washMode: mode.id })}
                  className={cn("p-4 rounded-lg border-2 text-left transition-all",
                    config.washMode === mode.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}>
                  <span className="text-2xl">{mode.emoji}</span>
                  <p className="text-sm font-semibold mt-2">{mode.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{mode.from} → {mode.to}</p>
                </button>
              ))}
            </div>
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
