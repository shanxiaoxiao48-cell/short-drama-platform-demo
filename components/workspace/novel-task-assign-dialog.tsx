"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X } from "lucide-react"

interface NovelTaskAssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (assignments: Record<string, Record<string, string>>) => void
  taskType: "translation" | "quality_check" | "compress"
  languageVariants: Array<{ id: string; targetLanguage: string }>
  initialAssignments?: Record<string, Record<string, string>>
}

const personnel = [
  { id: "1", name: "张三" }, { id: "2", name: "李四" }, { id: "3", name: "王五" },
  { id: "4", name: "赵六" }, { id: "5", name: "孙七" }, { id: "6", name: "陈八" },
]

const taskLabels: Record<string, string> = {
  translation: "翻译", quality_check: "审校", compress: "质检",
}

export function NovelTaskAssignDialog({ open, onOpenChange, onSubmit, taskType, languageVariants, initialAssignments }: NovelTaskAssignDialogProps) {
  const [currentTab, setCurrentTab] = useState(taskType)
  const [assignments, setAssignments] = useState<Record<string, Record<string, string>>>({
    translation: {}, quality_check: {}, compress: {},
  })

  useEffect(() => {
    if (open) {
      setCurrentTab(taskType)
      if (initialAssignments) setAssignments({ translation: {}, quality_check: {}, compress: {}, ...initialAssignments })
    }
  }, [open, taskType, initialAssignments])

  const assign = (tab: string, langId: string, personId: string) => {
    setAssignments(prev => ({
      ...prev,
      [tab]: { ...prev[tab], [langId]: personId },
    }))
  }

  const unassign = (tab: string, langId: string) => {
    setAssignments(prev => {
      const next = { ...prev, [tab]: { ...prev[tab] } }
      delete next[tab][langId]
      return next
    })
  }

  const getAssignedCount = (tab: string) => Object.keys(assignments[tab] || {}).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>任务分配</DialogTitle>
          <DialogDescription>为各语言版本分配翻译、审校、质检人员</DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={v => setCurrentTab(v as typeof currentTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="translation">翻译 {getAssignedCount("translation") > 0 && `(${getAssignedCount("translation")})`}</TabsTrigger>
            <TabsTrigger value="quality_check">审校 {getAssignedCount("quality_check") > 0 && `(${getAssignedCount("quality_check")})`}</TabsTrigger>
            <TabsTrigger value="compress">质检 {getAssignedCount("compress") > 0 && `(${getAssignedCount("compress")})`}</TabsTrigger>
          </TabsList>

          {["translation", "quality_check", "compress"].map(tab => (
            <TabsContent key={tab} value={tab} className="space-y-3 mt-3">
              {languageVariants.map(lang => {
                const assignedId = assignments[tab]?.[lang.id]
                const assignedPerson = personnel.find(p => p.id === assignedId)
                return (
                  <div key={lang.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <span className="text-sm font-medium">{lang.targetLanguage}</span>
                    {assignedPerson ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{assignedPerson.name}</Badge>
                        <button onClick={() => unassign(tab, lang.id)} className="text-muted-foreground hover:text-destructive">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <Select onValueChange={v => assign(tab, lang.id, v)}>
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue placeholder="选择人员" />
                        </SelectTrigger>
                        <SelectContent>
                          {personnel.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )
              })}
              {languageVariants.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">暂无目标语言</p>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={() => { onSubmit(assignments); onOpenChange(false) }}>确认分配</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
