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
import { MessageSquare, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface ModificationComment {
  id: string
  subtitleId: string
  originalText: string
  translatedText: string
  comment: string
  reviewerId: string
  reviewerName: string
  timestamp: string
  status: "pending" | "resolved"
}

interface ModificationCommentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subtitle: {
    id: string
    originalText: string
    translatedText: string
  }
  existingComment?: ModificationComment
  onSubmit: (comment: Omit<ModificationComment, 'reviewerId' | 'reviewerName' | 'timestamp'>) => void
  readOnly?: boolean
}

export function ModificationCommentDialog({
  open,
  onOpenChange,
  subtitle,
  existingComment,
  onSubmit,
  readOnly = false,
}: ModificationCommentDialogProps) {
  const [comment, setComment] = useState(existingComment?.comment || "")

  // 当对话框打开或existingComment变化时，更新状态
  useEffect(() => {
    if (open) {
      setComment(existingComment?.comment || "")
    }
  }, [open, existingComment])

  const handleSubmit = () => {
    if (!comment.trim()) return

    onSubmit({
      id: existingComment?.id || `comment-${Date.now()}`,
      subtitleId: subtitle.id,
      originalText: subtitle.originalText,
      translatedText: subtitle.translatedText,
      comment: comment.trim(),
      status: existingComment?.status || "pending",
    })
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (existingComment) {
      onSubmit({
        ...existingComment,
        comment: "", // 空评论表示删除
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            {readOnly ? "查看修改意见" : "添加修改意见"}
          </DialogTitle>
          <DialogDescription>
            {readOnly ? "质检人员的修改建议" : "为这条字幕添加修改建议"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* 字幕内容展示 */}
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-xs text-muted-foreground">原文</Label>
              <p className="text-sm mt-1">{subtitle.originalText}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">译文</Label>
              <p className="text-sm mt-1">{subtitle.translatedText}</p>
            </div>
          </div>

          {/* 修改意见输入/显示 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="comment" className="text-sm font-medium">
                修改意见
              </Label>
              {existingComment && (
                <Badge variant={existingComment.status === "resolved" ? "default" : "secondary"} className="text-xs">
                  {existingComment.status === "resolved" ? "已解决" : "待处理"}
                </Badge>
              )}
            </div>
            
            {readOnly ? (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{comment}</p>
                    {existingComment && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {existingComment.reviewerName} · {new Date(existingComment.timestamp).toLocaleString('zh-CN')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Textarea
                id="comment"
                placeholder="请输入具体的修改建议，例如：&#10;- 术语翻译不准确&#10;- 语序需要调整&#10;- 建议改为..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                className="resize-none text-sm"
              />
            )}
          </div>

          {existingComment && !readOnly && (
            <p className="text-xs text-muted-foreground">
              上次修改：{existingComment.reviewerName} · {new Date(existingComment.timestamp).toLocaleString('zh-CN')}
            </p>
          )}
        </div>

        <DialogFooter>
          {readOnly ? (
            <Button onClick={() => onOpenChange(false)}>
              关闭
            </Button>
          ) : (
            <>
              {existingComment && (
                <Button variant="destructive" onClick={handleDelete}>
                  删除意见
                </Button>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={!comment.trim()}>
                {existingComment ? "更新意见" : "提交意见"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
