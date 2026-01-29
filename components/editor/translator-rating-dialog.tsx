"use client"

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
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Star } from "lucide-react"

export interface TranslatorRating {
  translatorId: string
  translatorName: string
  rating: number // 1-10
  comment: string
  reviewerId: string
  reviewerName: string
  timestamp: string
}

interface TranslatorRatingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  translatorName: string
  currentRating?: TranslatorRating
  onSubmit: (rating: Omit<TranslatorRating, 'reviewerId' | 'reviewerName' | 'timestamp'>) => void
}

export function TranslatorRatingDialog({
  open,
  onOpenChange,
  translatorName,
  currentRating,
  onSubmit,
}: TranslatorRatingDialogProps) {
  const [rating, setRating] = useState(currentRating?.rating || 8)
  const [comment, setComment] = useState(currentRating?.comment || "")

  // 当对话框打开或currentRating变化时，更新状态
  useEffect(() => {
    if (open) {
      setRating(currentRating?.rating || 8)
      setComment(currentRating?.comment || "")
    }
  }, [open, currentRating])

  const handleSubmit = () => {
    onSubmit({
      translatorId: currentRating?.translatorId || "translator-1", // 实际应从系统获取
      translatorName,
      rating,
      comment,
    })
    onOpenChange(false)
  }

  const getRatingLabel = (value: number) => {
    if (value >= 9) return "优秀"
    if (value >= 7) return "良好"
    if (value >= 5) return "合格"
    return "需改进"
  }

  const getRatingColor = (value: number) => {
    if (value >= 9) return "text-green-600"
    if (value >= 7) return "text-blue-600"
    if (value >= 5) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            译员评分
          </DialogTitle>
          <DialogDescription>
            为译员 <span className="font-semibold text-foreground">{translatorName}</span> 的工作质量进行评分
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* 评分滑块 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="rating" className="text-sm font-medium">
                评分
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">{rating}</span>
                <span className="text-xs text-muted-foreground">/ 10</span>
                <span className={`text-xs font-medium ${getRatingColor(rating)}`}>
                  {getRatingLabel(rating)}
                </span>
              </div>
            </div>
            <Slider
              id="rating"
              value={[rating]}
              min={1}
              max={10}
              step={1}
              onValueChange={([value]) => setRating(value)}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>1分</span>
              <span>5分</span>
              <span>10分</span>
            </div>
          </div>

          {/* 评语输入 */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              评语 <span className="text-xs text-muted-foreground">(选填)</span>
            </Label>
            <Textarea
              id="comment"
              placeholder="请输入对译员工作的评价和建议..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            提交评分
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
