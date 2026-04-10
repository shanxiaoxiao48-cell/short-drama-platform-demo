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
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface QualityCheckReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectTitle: string
  languageVariant: string
  currentRound: number
  onApprove: () => void
  onReject: (reason: string) => void
}

export function QualityCheckReviewDialog({
  open,
  onOpenChange,
  projectTitle,
  languageVariant,
  currentRound,
  onApprove,
  onReject,
}: QualityCheckReviewDialogProps) {
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [error, setError] = useState("")

  // 重置状态当对话框打开时
  useEffect(() => {
    if (open) {
      setDecision(null)
      setRejectionReason("")
      setError("")
    }
  }, [open])

  // 验证驳回理由
  const validateReason = (reason: string) => {
    if (reason.trim().length < 10) {
      setError("驳回理由至少需要10个字符")
      return false
    }
    setError("")
    return true
  }

  // 处理理由输入变化
  const handleReasonChange = (value: string) => {
    setRejectionReason(value)
    if (value.trim().length >= 10) {
      setError("")
    }
  }

  // 处理确认提交
  const handleConfirm = () => {
    if (decision === "approve") {
      onApprove()
      onOpenChange(false)
    } else if (decision === "reject") {
      if (validateReason(rejectionReason)) {
        onReject(rejectionReason.trim())
        onOpenChange(false)
      }
    }
  }

  // 判断是否可以提交
  const canSubmit = () => {
    if (!decision) return false
    if (decision === "reject") {
      return rejectionReason.trim().length >= 10
    }
    return true
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            审核提交确认
          </DialogTitle>
          <DialogDescription>
            请确认对本次翻译任务的审核结果
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* 任务信息 */}
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">项目：</span>
              <span className="font-medium">{projectTitle}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">语言：</span>
              <span className="font-medium">{languageVariant}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">当前轮次：</span>
              <span className="font-medium">第{currentRound}轮</span>
            </div>
          </div>

          {/* 审核决策选择 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">请选择审核结果：</Label>
            <div className="grid grid-cols-2 gap-3">
              {/* 通过按钮 */}
              <Button
                variant={decision === "approve" ? "default" : "outline"}
                className={cn(
                  "h-auto flex flex-col items-center justify-center p-4 gap-2",
                  decision === "approve" && "bg-green-600 hover:bg-green-700"
                )}
                onClick={() => setDecision("approve")}
              >
                <CheckCircle className="w-6 h-6" />
                <span className="font-medium">通过</span>
              </Button>

              {/* 驳回按钮 */}
              <Button
                variant={decision === "reject" ? "default" : "outline"}
                className={cn(
                  "h-auto flex flex-col items-center justify-center p-4 gap-2",
                  decision === "reject" && "bg-orange-600 hover:bg-orange-700"
                )}
                onClick={() => setDecision("reject")}
              >
                <XCircle className="w-6 h-6" />
                <span className="font-medium">驳回</span>
              </Button>
            </div>
          </div>

          {/* 驳回理由输入 - 只在选择驳回时显示 */}
          {decision === "reject" && (
            <div className="space-y-2 animate-in fade-in-50 duration-200">
              <Label htmlFor="rejection-reason" className="text-sm font-medium">
                驳回理由 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="请详细说明驳回原因，例如：&#10;- 术语翻译不准确&#10;- 时间轴与画面不匹配&#10;- 语句不通顺需要调整..."
                value={rejectionReason}
                onChange={(e) => handleReasonChange(e.target.value)}
                rows={5}
                className="resize-none text-sm"
              />
              <div className="flex items-center justify-between text-xs">
                <span className={cn(
                  "flex items-center gap-1",
                  error ? "text-destructive" : "text-muted-foreground"
                )}>
                  {error && <AlertCircle className="w-3 h-3" />}
                  {error || "至少10个字符"}
                </span>
                <span className={cn(
                  rejectionReason.trim().length >= 10 ? "text-green-600" : "text-muted-foreground"
                )}>
                  {rejectionReason.trim().length} / 10
                </span>
              </div>
            </div>
          )}

          {/* 提示信息 */}
          {decision === "approve" && (
            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <p className="text-green-800 dark:text-green-200">
                通过审核后，任务将标记为已完成，进入下一个工作流程阶段。
              </p>
            </div>
          )}

          {decision === "reject" && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800 text-sm">
              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
              <p className="text-orange-800 dark:text-orange-200">
                驳回后，任务将返回人工翻译环节，轮次将变为第{currentRound + 1}轮。译员可以查看驳回理由并进行修改。
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!canSubmit()}
            className={cn(
              decision === "approve" && "bg-green-600 hover:bg-green-700",
              decision === "reject" && "bg-orange-600 hover:bg-orange-700"
            )}
          >
            确认提交
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
