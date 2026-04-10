"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface LanguageOption {
  id: string
  label: string
  isSource?: boolean
}

interface BatchOperationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "delete" | "download"
  type: "drama" | "novel"
  languages: LanguageOption[]
  totalEpisodesOrChapters: number
  episodeLabel?: string
  onConfirm: (params: {
    languages: string[]
    range: { start: number; end: number } | "all"
    fileTypes: string[]
  }) => void
}

// Drama file types
const DRAMA_PER_EP_FILES = [
  { id: "source_video", label: "源视频文件" },
  { id: "erased_video", label: "擦除视频" },
] as const

const DRAMA_PER_EP_LANG_FILES = [
  { id: "subtitle", label: "字幕文件" },
  { id: "screen_text", label: "画面字文件" },
] as const

const DRAMA_TARGET_ONLY_FILES = [
  { id: "screen_text_composite", label: "画面字压制视频" },
  { id: "final_video", label: "成片视频" },
] as const

const DRAMA_GLOSSARY = { id: "glossary", label: "术语表" } as const

// Novel file types
const NOVEL_FILE_TYPES = [
  { id: "source_doc", label: "原文文档", sourceOnly: true },
  { id: "translated_doc", label: "译文文档", targetOnly: true },
  { id: "glossary", label: "术语表", allOnly: true },
] as const

export function BatchOperationDialog({
  open,
  onOpenChange,
  mode,
  type,
  languages,
  totalEpisodesOrChapters,
  episodeLabel = type === "drama" ? "集" : "章",
  onConfirm,
}: BatchOperationDialogProps) {
  const [rangeMode, setRangeMode] = useState<"all" | "range">("all")
  const [rangeStart, setRangeStart] = useState(1)
  const [rangeEnd, setRangeEnd] = useState(totalEpisodesOrChapters)
  const [selectedLanguages, setSelectedLanguages] = useState<Set<string>>(new Set())
  const [selectedFileTypes, setSelectedFileTypes] = useState<Set<string>>(new Set())

  const sourceLanguages = useMemo(() => languages.filter(l => l.isSource), [languages])
  const targetLanguages = useMemo(() => languages.filter(l => !l.isSource), [languages])

  const hasSourceSelected = useMemo(
    () => sourceLanguages.some(l => selectedLanguages.has(l.id)),
    [sourceLanguages, selectedLanguages]
  )
  const hasTargetSelected = useMemo(
    () => targetLanguages.some(l => selectedLanguages.has(l.id)),
    [targetLanguages, selectedLanguages]
  )
  const selectedTargetCount = useMemo(
    () => targetLanguages.filter(l => selectedLanguages.has(l.id)).length,
    [targetLanguages, selectedLanguages]
  )

  // Reset state on open
  useEffect(() => {
    if (open) {
      setRangeMode("all")
      setRangeStart(1)
      setRangeEnd(totalEpisodesOrChapters)
      setSelectedLanguages(new Set())
      setSelectedFileTypes(new Set())
    }
  }, [open, totalEpisodesOrChapters])

  // When switching to "range", uncheck glossary
  useEffect(() => {
    if (rangeMode === "range") {
      setSelectedFileTypes(prev => {
        const next = new Set(prev)
        next.delete("glossary")
        return next
      })
    }
  }, [rangeMode])

  // For novel: auto-uncheck source_doc if no source lang selected, translated_doc if no target lang
  useEffect(() => {
    if (type !== "novel") return
    setSelectedFileTypes(prev => {
      const next = new Set(prev)
      if (!hasSourceSelected) next.delete("source_doc")
      if (!hasTargetSelected) next.delete("translated_doc")
      return next
    })
  }, [type, hasSourceSelected, hasTargetSelected])

  // For drama: auto-uncheck target-only files if no target lang selected
  useEffect(() => {
    if (type !== "drama") return
    setSelectedFileTypes(prev => {
      const next = new Set(prev)
      if (!hasTargetSelected) {
        next.delete("screen_text_composite")
        next.delete("final_video")
      }
      return next
    })
  }, [type, hasTargetSelected])

  const toggleLanguage = (id: string) => {
    setSelectedLanguages(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleFileType = (id: string) => {
    setSelectedFileTypes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const episodeCount = rangeMode === "all"
    ? totalEpisodesOrChapters
    : Math.max(0, rangeEnd - rangeStart + 1)

  // File count calculation
  const fileCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const selLangCount = selectedLanguages.size

    if (type === "drama") {
      // Per-episode files (no language multiplier)
      DRAMA_PER_EP_FILES.forEach(f => {
        if (selectedFileTypes.has(f.id)) counts[f.id] = episodeCount
      })
      // Per-episode × selected languages (including source)
      DRAMA_PER_EP_LANG_FILES.forEach(f => {
        if (selectedFileTypes.has(f.id)) counts[f.id] = episodeCount * selLangCount
      })
      // Per-episode × target languages only
      DRAMA_TARGET_ONLY_FILES.forEach(f => {
        if (selectedFileTypes.has(f.id)) counts[f.id] = episodeCount * selectedTargetCount
      })
      // Glossary: always 1
      if (selectedFileTypes.has("glossary")) counts["glossary"] = 1
    } else {
      // Novel
      const srcCount = hasSourceSelected ? 1 : 0
      if (selectedFileTypes.has("source_doc")) counts["source_doc"] = episodeCount * srcCount
      if (selectedFileTypes.has("translated_doc")) counts["translated_doc"] = episodeCount * selectedTargetCount
      if (selectedFileTypes.has("glossary")) counts["glossary"] = 1
    }
    return counts
  }, [type, selectedFileTypes, episodeCount, selectedLanguages.size, selectedTargetCount, hasSourceSelected])

  const totalFiles = Object.values(fileCounts).reduce((a, b) => a + b, 0)

  const handleConfirm = () => {
    onConfirm({
      languages: Array.from(selectedLanguages),
      range: rangeMode === "all" ? "all" : { start: rangeStart, end: rangeEnd },
      fileTypes: Array.from(selectedFileTypes),
    })
    onOpenChange(false)
  }

  const canConfirm = selectedLanguages.size > 0 && selectedFileTypes.size > 0

  // Disabled checkbox helper
  const DisabledCheckItem = ({ label, reason }: { label: string; reason: string }) => (
    <div className="flex items-center gap-2 opacity-50 cursor-not-allowed">
      <Checkbox disabled checked={false} />
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-xs text-muted-foreground/70">({reason})</span>
    </div>
  )

  // Active checkbox helper
  const CheckItem = ({ id, label }: { id: string; label: string }) => (
    <div className="flex items-center gap-2">
      <Checkbox
        id={`ft-${id}`}
        checked={selectedFileTypes.has(id)}
        onCheckedChange={() => toggleFileType(id)}
      />
      <Label htmlFor={`ft-${id}`} className="text-sm cursor-pointer">{label}</Label>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "delete" ? "删除文件" : "下载文件"}
          </DialogTitle>
          <DialogDescription>
            选择要{mode === "delete" ? "删除" : "下载"}的{type === "drama" ? "剧集" : "章节"}范围和文件类型
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* ① Range selection */}
          <div className="space-y-2">
            <div className="text-sm font-medium">
              {type === "drama" ? "集数范围" : "章节范围"}
            </div>
            <RadioGroup
              value={rangeMode}
              onValueChange={(v: string) => setRangeMode(v as "all" | "range")}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="all" id="range-all" />
                <Label htmlFor="range-all" className="text-sm cursor-pointer">全部（共{totalEpisodesOrChapters}{episodeLabel}）</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="range" id="range-custom" />
                <Label htmlFor="range-custom" className="text-sm cursor-pointer">指定范围</Label>
              </div>
            </RadioGroup>
            {rangeMode === "range" && (
              <div className="flex items-center gap-2 ml-1">
                <span className="text-sm text-muted-foreground">第</span>
                <Input
                  type="number"
                  min={1}
                  max={totalEpisodesOrChapters}
                  value={rangeStart}
                  onChange={e => setRangeStart(Math.max(1, Math.min(Number(e.target.value), totalEpisodesOrChapters)))}
                  className="w-16 h-8 text-sm"
                />
                <span className="text-sm text-muted-foreground">~</span>
                <Input
                  type="number"
                  min={1}
                  max={totalEpisodesOrChapters}
                  value={rangeEnd}
                  onChange={e => setRangeEnd(Math.max(1, Math.min(Number(e.target.value), totalEpisodesOrChapters)))}
                  className="w-16 h-8 text-sm"
                />
                <span className="text-sm text-muted-foreground">{episodeLabel}</span>
              </div>
            )}
          </div>

          {type === "drama" && (
            <>
              {/* ② Per-episode files (no language dimension) */}
              <div className="space-y-2">
                <div className="text-sm font-medium">按集文件（不分语言）</div>
                <div className="grid grid-cols-2 gap-2 ml-1">
                  {DRAMA_PER_EP_FILES.map(f => (
                    <CheckItem key={f.id} id={f.id} label={f.label} />
                  ))}
                  {rangeMode === "all" ? (
                    <CheckItem id={DRAMA_GLOSSARY.id} label={DRAMA_GLOSSARY.label} />
                  ) : (
                    <DisabledCheckItem label={DRAMA_GLOSSARY.label} reason={"仅\"全部\"时可选"} />
                  )}
                </div>
              </div>

              {/* ③ Per-episode × language files */}
              <div className="space-y-2">
                <div className="text-sm font-medium">按集×语言文件</div>
                {/* Language selector */}
                <div className="ml-1 space-y-1.5">
                  <div className="text-xs text-muted-foreground">选择语言（含源语言）</div>
                  <div className="flex flex-wrap gap-2">
                    {languages.map(lang => (
                      <button
                        key={lang.id}
                        onClick={() => toggleLanguage(lang.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs border transition-colors",
                          selectedLanguages.has(lang.id)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-muted border-border"
                        )}
                      >
                        {lang.label}{lang.isSource ? "（源）" : ""}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Language-dependent file types */}
                <div className="grid grid-cols-2 gap-2 ml-1 mt-2">
                  {selectedLanguages.size > 0 ? (
                    DRAMA_PER_EP_LANG_FILES.map(f => (
                      <CheckItem key={f.id} id={f.id} label={f.label} />
                    ))
                  ) : (
                    DRAMA_PER_EP_LANG_FILES.map(f => (
                      <DisabledCheckItem key={f.id} label={f.label} reason="请先选择语言" />
                    ))
                  )}
                  {hasTargetSelected ? (
                    DRAMA_TARGET_ONLY_FILES.map(f => (
                      <CheckItem key={f.id} id={f.id} label={f.label} />
                    ))
                  ) : (
                    DRAMA_TARGET_ONLY_FILES.map(f => (
                      <DisabledCheckItem key={f.id} label={f.label} reason="仅目标语言有此文件" />
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {type === "novel" && (
            <div className="space-y-2">
              <div className="text-sm font-medium">语言与文件类型</div>
              {/* Language selector */}
              <div className="ml-1 space-y-1.5">
                <div className="text-xs text-muted-foreground">选择语言（含源语言）</div>
                <div className="flex flex-wrap gap-2">
                  {languages.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => toggleLanguage(lang.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs border transition-colors",
                        selectedLanguages.has(lang.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted border-border"
                      )}
                    >
                      {lang.label}{lang.isSource ? "（源）" : ""}
                    </button>
                  ))}
                </div>
              </div>
              {/* File types in one row with disable rules */}
              <div className="grid grid-cols-2 gap-2 ml-1 mt-2">
                {hasSourceSelected ? (
                  <CheckItem id="source_doc" label="原文文档" />
                ) : (
                  <DisabledCheckItem label="原文文档" reason="请选择源语言" />
                )}
                {hasTargetSelected ? (
                  <CheckItem id="translated_doc" label="译文文档" />
                ) : (
                  <DisabledCheckItem label="译文文档" reason="请选择目标语言" />
                )}
                {rangeMode === "all" ? (
                  <CheckItem id="glossary" label="术语表" />
                ) : (
                  <DisabledCheckItem label="术语表" reason={"仅\"全部\"时可选"} />
                )}
              </div>
            </div>
          )}

          {/* Preview summary */}
          <div className="rounded-md bg-muted/50 p-3 space-y-1">
            <div className="text-sm font-medium">匹配预览</div>
            {totalFiles === 0 ? (
              <div className="text-xs text-muted-foreground">请选择语言和文件类型</div>
            ) : (
              <>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {Object.entries(fileCounts).map(([key, count]) => {
                    const allFileTypes = [
                      ...DRAMA_PER_EP_FILES,
                      ...DRAMA_PER_EP_LANG_FILES,
                      ...DRAMA_TARGET_ONLY_FILES,
                      DRAMA_GLOSSARY,
                      ...NOVEL_FILE_TYPES,
                    ]
                    const ft = allFileTypes.find(f => f.id === key)
                    return (
                      <div key={key}>{ft?.label || key}：{count} 个</div>
                    )
                  })}
                </div>
                <div className="text-sm font-medium pt-1 border-t border-border/50">
                  共计 {totalFiles} 个文件
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button
            variant={mode === "delete" ? "destructive" : "default"}
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {mode === "delete" ? `删除 (${totalFiles})` : `下载 (${totalFiles})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
