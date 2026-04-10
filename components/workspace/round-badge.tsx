"use client"

import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoundBadgeProps {
  round: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function RoundBadge({ round, size = "md", className }: RoundBadgeProps) {
  // 第1轮不显示徽章
  if (round <= 1) {
    return null
  }

  const sizeClasses = {
    sm: "text-[10px] h-4 px-1.5",
    md: "text-xs h-5 px-2",
    lg: "text-sm h-6 px-2.5",
  }

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className={cn(
              "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-950 dark:text-orange-300 border-orange-300 dark:border-orange-700",
              "flex items-center gap-1 font-medium",
              sizeClasses[size],
              className
            )}
          >
            <RotateCcw className={iconSizes[size]} />
            <span>第{round}轮</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            此任务已被驳回 {round - 1} 次，当前为第 {round} 轮翻译
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
