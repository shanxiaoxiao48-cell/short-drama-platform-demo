"use client"

import { AlertCircle, CheckCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ModificationRecord {
  userId: string
  userName: string
  role: "translator" | "reviewer"
  originalText: string
  modifiedText: string
  timestamp: string // 改为字符串以避免 hydration 问题
}

interface SubtitleModificationTooltipProps {
  currentText: string
  modifications: ModificationRecord[]
}

export function SubtitleModificationTooltip({
  currentText,
  modifications,
}: SubtitleModificationTooltipProps) {
  if (modifications.length === 0) return null

  const highlightDifferences = (original: string, modified: string) => {
    // 简单的差异高亮逻辑
    const words1 = original.split(" ")
    const words2 = modified.split(" ")
    
    return words2.map((word, i) => {
      const isDifferent = words1[i] !== word
      return (
        <span
          key={i}
          className={isDifferent ? "bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded" : ""}
        >
          {word}{i < words2.length - 1 ? " " : ""}
        </span>
      )
    })
  }

  const translatorModifications = modifications.filter(m => m.role === "translator")
  const reviewerModifications = modifications.filter(m => m.role === "reviewer")

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {translatorModifications.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-sm">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">翻译人员修改</p>
                {translatorModifications.map((mod, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">
                      {mod.userName} · {new Date(mod.timestamp).toLocaleString()}
                    </p>
                    <div className="text-xs">
                      <p className="text-muted-foreground mb-0.5">修改前:</p>
                      <p className="text-foreground">{mod.originalText}</p>
                    </div>
                    <div className="text-xs">
                      <p className="text-muted-foreground mb-0.5">修改后:</p>
                      <p className="text-foreground">
                        {highlightDifferences(mod.originalText, mod.modifiedText)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {reviewerModifications.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-sm">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">审核人员修改</p>
                {reviewerModifications.map((mod, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">
                      {mod.userName} · {new Date(mod.timestamp).toLocaleString()}
                    </p>
                    <div className="text-xs">
                      <p className="text-muted-foreground mb-0.5">修改前:</p>
                      <p className="text-foreground">{mod.originalText}</p>
                    </div>
                    <div className="text-xs">
                      <p className="text-muted-foreground mb-0.5">修改后:</p>
                      <p className="text-foreground">
                        {highlightDifferences(mod.originalText, mod.modifiedText)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
