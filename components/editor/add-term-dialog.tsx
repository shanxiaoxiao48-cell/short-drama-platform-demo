"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AddTermDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTerm: (term: { term: string; category: string; explanation: string; translation?: string }) => void
  isAIExtractionStage?: boolean // AI提取环节不显示翻译字段
}

export function AddTermDialog({ open, onOpenChange, onAddTerm, isAIExtractionStage = false }: AddTermDialogProps) {
  const [term, setTerm] = useState("")
  const [category, setCategory] = useState("")
  const [explanation, setExplanation] = useState("")
  const [translation, setTranslation] = useState("")

  const handleAdd = () => {
    if (!term.trim() || !category.trim()) return

    const termData: { term: string; category: string; explanation: string; translation?: string } = {
      term: term.trim(),
      category: category.trim(),
      explanation: explanation.trim(),
    }

    // 只有非AI提取环节才添加翻译
    if (!isAIExtractionStage) {
      termData.translation = translation.trim()
    }

    onAddTerm(termData)

    // 重置表单
    setTerm("")
    setCategory("")
    setExplanation("")
    setTranslation("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加术语</DialogTitle>
          <DialogDescription>
            输入术语的详细信息
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="term" className="text-right">
              术语名称
            </Label>
            <Input
              id="term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="输入术语..."
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              术语类型
            </Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="如：职位、称谓、法律..."
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="explanation" className="text-right">
              术语解释
            </Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="输入术语解释..."
              className="col-span-3 min-h-[60px]"
            />
          </div>
          {!isAIExtractionStage && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="translation" className="text-right">
                术语翻译
              </Label>
              <Input
                id="translation"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder="输入翻译..."
                className="col-span-3"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" onClick={handleAdd} disabled={!term.trim() || !category.trim()}>
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
