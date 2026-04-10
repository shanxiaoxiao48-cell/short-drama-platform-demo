"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  Sparkles,
  Languages,
  UserCheck,
  PenTool,
  Eraser,
  Film,
  CheckCircle,
  ClipboardCheck,
} from "lucide-react"
import { usePermission } from "@/contexts/permission-context"

type WorkflowType = "ai_extract" | "ai_translate" | "task_assign" | "manual_translate" | "font_adjust" | "video_erase" | "quality_check" | "video_compress"
type TaskType = "translation" | "quality_check" | "compress"

interface WorkflowStepsProps {
  onWorkflowClick: (workflowId: WorkflowType, isCompleted: boolean) => void
  onTaskAssignClick?: (taskType: TaskType) => void
  selectedVariant?: {
    id: string
    targetLanguage: string
    progress: number
    totalEpisodes: number
    completedEpisodes: number
    currentStage: string
    image: string
  }
  allLanguageVariants?: Array<{ id: string; targetLanguage: string; totalEpisodes: number; completedEpisodes: number }>
  videoEraseStatus?: "not_started" | "in_progress" | "completed"
  translationAssignments?: Array<{ languageId: string; episodes: number[]; assignee: string }>
  reviewAssignments?: Array<{ languageId: string; episodes: number[]; assignee: string }>
  qualityCheckAssignments?: Array<{ languageId: string; episodes: number[]; assignee: string }>
  compressAssignments?: Array<{ languageId: string; episodes: number[]; assignee: string }>
}

// 源语言的工作流程（AI提取流程）
const chineseWorkflowSteps: {
  id: WorkflowType
  name: string
  description: string
  icon: typeof Sparkles
  status: "completed" | "in_progress" | "pending"
  completedCount: number
  totalCount: number
}[] = [
  {
    id: "ai_extract",
    name: "AI提取",
    description: "自动提取视频字幕",
    icon: Sparkles,
    status: "pending",
    completedCount: 0,
    totalCount: 80,
  },
  {
    id: "video_erase",
    name: "视频擦除",
    description: "擦除原视频字幕",
    icon: Eraser,
    status: "pending",
    completedCount: 0,
    totalCount: 80,
  },
  {
    id: "ai_translate",
    name: "AI翻译",
    description: "智能翻译字幕内容",
    icon: Languages,
    status: "pending",
    completedCount: 0,
    totalCount: 400,
  },
  {
    id: "task_assign",
    name: "任务分配",
    description: "分配翻译校对任务",
    icon: UserCheck,
    status: "pending",
    completedCount: 0,
    totalCount: 400,
  },
]

// 其他语言的工作流程（人工翻译流程）
const otherLanguageWorkflowSteps: {
  id: WorkflowType
  name: string
  description: string
  icon: typeof Sparkles
  status: "completed" | "in_progress" | "pending"
  completedCount: number
  totalCount: number
}[] = [
  {
    id: "manual_translate",
    name: "人工翻译",
    description: "专业译员精校翻译",
    icon: PenTool,
    status: "in_progress",
    completedCount: 45,
    totalCount: 80,
  },
  {
    id: "font_adjust",
    name: "字体调整",
    description: "调整字幕字体样式",
    icon: Film,
    status: "pending",
    completedCount: 0,
    totalCount: 80,
  },
  {
    id: "quality_check",
    name: "成片质检",
    description: "质量检查与审核",
    icon: ClipboardCheck,
    status: "pending",
    completedCount: 0,
    totalCount: 80,
  },
  {
    id: "video_compress",
    name: "视频压制",
    description: "最终视频输出",
    icon: Film,
    status: "pending",
    completedCount: 0,
    totalCount: 80,
  },
]

const statusStyles: Record<string, { bg: string; text: string; icon: string; badge: string; border: string }> = {
  completed: {
    bg: "bg-success/10 hover:bg-success/20",
    text: "text-success",
    icon: "text-success",
    badge: "bg-success/20 text-success",
    border: "border-success/30",
  },
  in_progress: {
    bg: "bg-primary/10 hover:bg-primary/20",
    text: "text-primary",
    icon: "text-primary",
    badge: "bg-primary/20 text-primary",
    border: "border-primary/30",
  },
  pending: {
    bg: "bg-muted hover:bg-muted/80",
    text: "text-muted-foreground",
    icon: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
    border: "border-border",
  },
}

const statusLabels: Record<string, string> = {
  completed: "已完成",
  in_progress: "进行中",
  pending: "待开始",
}

// 计算翻译任务的总集数（所有目标语言的集数之和，不包括源语言）
const calculateTranslationTotalEpisodes = (
  allVariants: Array<{ id: string; totalEpisodes: number }>,
  translationAssignments: Array<{ languageId: string; episodes: number[]; assignee: string }>
): number => {
  // 如果有翻译分配，根据分配的语种计算
  if (translationAssignments.length > 0) {
    return translationAssignments.reduce((sum, assignment) => {
      return sum + assignment.episodes.length
    }, 0)
  }

  // 如果没有分配但已经有目标语言变体，计算所有目标语言的集数之和
  const targetLanguageVariants = allVariants.filter(v => v.id !== "0")
  if (targetLanguageVariants.length > 0) {
    return targetLanguageVariants.reduce((sum, variant) => sum + variant.totalEpisodes, 0)
  }

  return 0
}

// 计算任务分配的总集数（根据已分配的任务）
const calculateTaskAssignTotalEpisodes = (
  translationAssignments: Array<{ languageId: string; episodes: number[]; assignee: string }>,
  qualityCheckAssignments: Array<{ languageId: string; episodes: number[]; assignee: string }>,
  compressAssignments: Array<{ languageId: string; episodes: number[]; assignee: string }>,
  taskType: "translation" | "quality_check" | "compress"
): number => {
  if (taskType === "translation") {
    return translationAssignments.reduce((sum, assignment) => sum + assignment.episodes.length, 0)
  } else if (taskType === "quality_check") {
    return qualityCheckAssignments.reduce((sum, assignment) => sum + assignment.episodes.length, 0)
  } else {
    return compressAssignments.reduce((sum, assignment) => sum + assignment.episodes.length, 0)
  }
}

export function WorkflowSteps({
  onWorkflowClick,
  onTaskAssignClick,
  selectedVariant,
  allLanguageVariants = [],
  videoEraseStatus = "not_started",
  translationAssignments = [],
  reviewAssignments = [],
  qualityCheckAssignments = [],
  compressAssignments = []
}: WorkflowStepsProps) {
  const { hasWorkflow } = usePermission()
  
  // 判断是否是源语言卡片（包含"源语言"或"原语言"关键字）
  const isSourceLanguage = selectedVariant?.targetLanguage.includes("源语言") || 
                          selectedVariant?.targetLanguage.includes("原语言")
  const isPendingProject = selectedVariant?.currentStage === "待开始"
  const currentStage = selectedVariant?.currentStage || ""
  
  // 根据选中的语言变体动态设置工作流程状态和集数
  // 源语言卡片显示 AI 提取工作流，其他语言卡片显示人工翻译工作流
  let displaySteps = isSourceLanguage ? [...chineseWorkflowSteps] : [...otherLanguageWorkflowSteps]
  
  // 计算AI翻译和任务分配的总集数
  const translationTotalEpisodes = calculateTranslationTotalEpisodes(allLanguageVariants, translationAssignments)

  // 计算AI翻译当前完成的集数（所有目标语言的已完成集数之和）
  const calculateTranslationCompletedEpisodes = (
    allVariants: Array<{ id: string; completedEpisodes: number }>
  ): number => {
    return allVariants
      .filter(v => v.id !== "0") // 排除源语言
      .reduce((sum, variant) => sum + variant.completedEpisodes, 0)
  }

  const translationCompletedEpisodes = calculateTranslationCompletedEpisodes(allLanguageVariants)

  // 如果是待开始的项目，所有步骤都设置为pending状态
  if (isPendingProject && isSourceLanguage) {
    displaySteps = chineseWorkflowSteps.map(step => {
      // AI翻译和任务分配在待开始状态下总集数为0
      const totalCount = (step.id === "ai_translate" || step.id === "task_assign")
        ? 0
        : selectedVariant.totalEpisodes
      return {
        ...step,
        status: "pending" as const,
        completedCount: 0,
        totalCount,
      }
    })
  } else if (isSourceLanguage && selectedVariant) {
    // 源语言工作流：根据当前阶段更新工作流程状态
    const completedEpisodes = selectedVariant.completedEpisodes
    const totalEpisodes = selectedVariant.totalEpisodes
    
    displaySteps = displaySteps.map(step => {
      // 更新总集数
      let totalCount = totalEpisodes
      if (step.id === "ai_translate") {
        totalCount = translationTotalEpisodes
      } else if (step.id === "task_assign") {
        // 任务分配总数 = 4个任务类型 × 目标语言数
        const targetLanguages = allLanguageVariants.filter(v => 
          !v.targetLanguage?.includes("源语言") && !v.targetLanguage?.includes("原语言")
        )
        totalCount = 4 * targetLanguages.length
      }
      const updatedStep = { ...step, totalCount }

      // 任务分配状态：所有源语言工作流程都已完成（用于演示已进入人工翻译阶段的项目）
      // 这个检查要放在最前面，优先级最高
      if (currentStage === "任务分配") {
        if (step.id === "ai_extract" || step.id === "ai_translate" || step.id === "task_assign" || step.id === "video_erase") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalCount }
        }
      }
      
      // 视频擦除使用独立状态（仅在非"任务分配"状态下生效）
      if (step.id === "video_erase" && currentStage !== "任务分配") {
        if (currentStage === "视频擦除-已完成" || videoEraseStatus === "completed") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalEpisodes }
        } else if (currentStage === "视频擦除" || videoEraseStatus === "in_progress") {
          return { ...updatedStep, status: "in_progress" as const, completedCount: 0 }
        } else {
          return { ...updatedStep, status: "pending" as const, completedCount: 0 }
        }
      }
      
      // AI提取-进行中状态：AI提取显示为进行中，其他保持pending
      if (currentStage === "AI提取-进行中") {
        if (step.id === "ai_extract") {
          return { ...updatedStep, status: "in_progress" as const, completedCount: 0 }
        }
        return updatedStep
      }
      // AI提取-待确认状态：AI提取显示为进行中（但标签显示"待确认"），其他保持pending
      else if (currentStage === "AI提取-待确认") {
        if (step.id === "ai_extract") {
          return { ...updatedStep, status: "in_progress" as const, completedCount: totalEpisodes }
        }
        return updatedStep
      }
      // AI提取-已完成状态：只更新AI提取为完成，其他保持pending
      else if (currentStage === "AI提取-已完成") {
        if (step.id === "ai_extract") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalEpisodes }
        }
        return updatedStep
      }
      // 视频擦除状态（旧的，保留用于向后兼容）
      else if (currentStage === "视频擦除") {
        if (step.id === "ai_extract") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalEpisodes }
        }
        return updatedStep
      }
      // AI翻译状态
      else if (currentStage === "AI翻译") {
        if (step.id === "ai_extract") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalEpisodes }
        } else if (step.id === "ai_translate") {
          return { ...updatedStep, status: "in_progress" as const, completedCount: translationCompletedEpisodes }
        }
        return updatedStep
      }
      // AI翻译-进行中状态
      else if (currentStage === "AI翻译-进行中") {
        if (step.id === "ai_extract") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalEpisodes }
        } else if (step.id === "ai_translate") {
          return { ...updatedStep, status: "in_progress" as const, completedCount: translationCompletedEpisodes }
        }
        return updatedStep
      }
      // AI翻译-已完成状态
      else if (currentStage === "AI翻译-已完成") {
        if (step.id === "ai_extract") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalEpisodes }
        } else if (step.id === "ai_translate") {
          // 已完成状态下，completedCount 应该等于 totalCount
          return { ...updatedStep, status: "completed" as const, completedCount: totalCount }
        }
        return updatedStep
      }
      
      // 任务分配按钮：在非"任务分配"状态下，根据是否有分配来判断状态
      if (step.id === "task_assign" && currentStage !== "任务分配") {
        // 计算已完成的任务数：每个(任务类型, 语言)对中所有集数都已分配算一个完成任务
        const targetLanguages = allLanguageVariants.filter(v => 
          !v.targetLanguage?.includes("源语言") && !v.targetLanguage?.includes("原语言")
        )
        
        const countCompletedForType = (typeAssignments: typeof translationAssignments) => {
          return targetLanguages.filter(lang => {
            const assigned = new Set<number>()
            typeAssignments.filter(a => a.languageId === lang.id).forEach(a => a.episodes.forEach(ep => assigned.add(ep)))
            return assigned.size >= lang.totalEpisodes && lang.totalEpisodes > 0
          }).length
        }
        
        const completedCount = countCompletedForType(translationAssignments) +
          countCompletedForType(reviewAssignments) +
          countCompletedForType(qualityCheckAssignments) +
          countCompletedForType(compressAssignments)
        
        const hasAnyAssignment = translationAssignments.length > 0 || reviewAssignments.length > 0 || qualityCheckAssignments.length > 0 || compressAssignments.length > 0
        const isAllAssigned = completedCount >= totalCount && totalCount > 0
        
        return {
          ...updatedStep,
          status: isAllAssigned ? "completed" as const : hasAnyAssignment ? "in_progress" as const : "pending" as const,
          completedCount
        }
      }
      
      return updatedStep
    })
  } else if (!isSourceLanguage && selectedVariant) {
    // 其他语言工作流：根据当前阶段更新工作流程状态
    const currentStage = selectedVariant.currentStage
    const completedEpisodes = selectedVariant.completedEpisodes
    const totalEpisodes = selectedVariant.totalEpisodes
    
    displaySteps = displaySteps.map(step => {
      // 更新总集数
      const updatedStep = { ...step, totalCount: totalEpisodes }
      
      // 根据当前阶段判断每个步骤的状态
      if (currentStage === "待开始") {
        // 待开始状态：所有步骤都是pending
        return { ...updatedStep, status: "pending" as const, completedCount: 0 }
      } else if (currentStage === "人工翻译") {
        if (step.id === "manual_translate") {
          return { ...updatedStep, status: "in_progress" as const, completedCount: completedEpisodes }
        } else if (step.id === "font_adjust" || step.id === "quality_check" || step.id === "video_compress") {
          return { ...updatedStep, status: "pending" as const, completedCount: 0 }
        }
      } else if (currentStage === "翻译待确认") {
        // 翻译待确认状态：人工翻译显示为进行中（但标签显示"待确认"）
        if (step.id === "manual_translate") {
          return { ...updatedStep, status: "in_progress" as const, completedCount: totalEpisodes }
        } else if (step.id === "font_adjust" || step.id === "quality_check" || step.id === "video_compress") {
          return { ...updatedStep, status: "pending" as const, completedCount: 0 }
        }
      } else if (currentStage === "字体调整") {
        if (step.id === "manual_translate") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalEpisodes }
        } else if (step.id === "font_adjust") {
          return { ...updatedStep, status: "in_progress" as const, completedCount: completedEpisodes }
        } else if (step.id === "quality_check" || step.id === "video_compress") {
          return { ...updatedStep, status: "pending" as const, completedCount: 0 }
        }
      } else if (step.id === "font_adjust" && currentStage === "字体调整-待确认") {
        // 字体调整待确认状态：字体调整显示为进行中（但标签显示"待确认"）
        return { ...updatedStep, status: "in_progress" as const, completedCount: totalEpisodes }
      } else if (currentStage === "质检审核") {
        if (step.id === "manual_translate" || step.id === "font_adjust") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalEpisodes }
        } else if (step.id === "quality_check") {
          return { ...updatedStep, status: "in_progress" as const, completedCount: completedEpisodes }
        } else if (step.id === "video_compress") {
          return { ...updatedStep, status: "pending" as const, completedCount: 0 }
        }
      } else if (currentStage === "质检待确认") {
        // 质检待确认状态：人工翻译和字体调整已完成，质检显示为进行中（但标签显示"待确认"）
        if (step.id === "manual_translate" || step.id === "font_adjust") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalEpisodes }
        } else if (step.id === "quality_check") {
          return { ...updatedStep, status: "in_progress" as const, completedCount: totalEpisodes }
        } else if (step.id === "video_compress") {
          return { ...updatedStep, status: "pending" as const, completedCount: 0 }
        }
      } else if (currentStage === "视频压制") {
        if (step.id === "manual_translate" || step.id === "font_adjust" || step.id === "quality_check") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalEpisodes }
        } else if (step.id === "video_compress") {
          return { ...updatedStep, status: "in_progress" as const, completedCount: completedEpisodes }
        }
      }
      return updatedStep
    })
  }
  
  return (
    <div className="flex-1 overflow-visible">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground text-sm">
          工作流程 {selectedVariant && `- ${selectedVariant.targetLanguage}`}
        </h3>
      </div>

      <div className="relative">
        {/* Connection line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />

        {/* Steps */}
        <div className={`grid gap-1 relative`} style={{ gridTemplateColumns: `repeat(${displaySteps.length}, minmax(0, 1fr))` }}>
          {displaySteps.map((step) => {
            const Icon = step.icon
            const styles = statusStyles[step.status]
            const isCompleted = step.status === "completed"
            
            // 判断是否需要高亮引导（呼吸动画）
            const isHighlightedStep = (() => {
              // 待开始状态：AI提取和视频擦除都可以进行，显示呼吸
              if (isPendingProject && step.status === "pending") {
                return step.id === "ai_extract" || step.id === "video_erase"
              }

              // AI提取-待确认/已完成状态：AI翻译和视频擦除可以进行，显示呼吸（视频擦除已完成的除外）
              if ((currentStage === "AI提取-待确认" || currentStage === "AI提取-已完成") && step.status === "pending") {
                // 视频擦除已完成则不显示呼吸
                if (step.id === "video_erase" && videoEraseStatus === "completed") {
                  return false
                }
                return step.id === "ai_translate" || step.id === "video_erase"
              }

              // AI翻译-已完成状态：任务分配可以进行，显示呼吸
              if (currentStage === "AI翻译-已完成" && step.status === "pending") {
                return step.id === "task_assign"
              }

              return false
            })()
            
            // 判断步骤是否可用（依赖关系 + 权限）
            let disabledReason = ""
            const isDisabled = (() => {
              // 先检查权限
              if (!hasWorkflow(step.id)) {
                disabledReason = "您没有权限执行此操作"
                return true
              }
              
              // 源语言工作流的依赖
              if (isSourceLanguage) {
                // AI翻译需要等待AI提取完成（视频擦除可独立进行）
                if (step.id === "ai_translate") {
                  const aiExtractStep = displaySteps.find(s => s.id === "ai_extract")
                  if (aiExtractStep?.status !== "completed") {
                    disabledReason = "请先完成AI提取工作"
                    return true
                  }
                }
                // 任务分配需要等待AI翻译完成
                if (step.id === "task_assign") {
                  const aiTranslateStep = displaySteps.find(s => s.id === "ai_translate")
                  if (aiTranslateStep?.status !== "completed") {
                    disabledReason = "请先完成AI翻译工作"
                    return true
                  }
                }
              } else {
                // 其他语言工作流的依赖
                // 成片质检需要等待人工翻译完成
                if (step.id === "quality_check") {
                  const manualTranslateStep = displaySteps.find(s => s.id === "manual_translate")
                  if (manualTranslateStep?.status !== "completed") {
                    disabledReason = "请先完成人工翻译工作"
                    return true
                  }
                }
                // 视频压制需要等待成片质检完成
                if (step.id === "video_compress") {
                  const qualityCheckStep = displaySteps.find(s => s.id === "quality_check")
                  if (qualityCheckStep?.status !== "completed") {
                    disabledReason = "请先完成成片质检工作"
                    return true
                  }
                }
              }
              return false
            })()

            return (
              <div key={step.id} className="flex flex-col items-center text-center relative">
                {/* Clickable Icon with Arc Menu */}
                <div className="relative">
                  <button
                    onClick={() => !isDisabled && onWorkflowClick(step.id, isCompleted)}
                    disabled={isDisabled}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all border relative",
                      isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                      isHighlightedStep && "ring-2 ring-primary ring-offset-2 animate-pulse",
                      styles.bg,
                      styles.border,
                      !isDisabled && "hover:scale-110"
                    )}
                    title={isDisabled ? disabledReason : `点击开始${step.name}`}
                  >
                    {isCompleted ? (
                      <CheckCircle className={cn("w-5 h-5", styles.icon)} />
                    ) : (
                      <Icon className={cn("w-5 h-5", styles.icon)} />
                    )}
                  </button>
                </div>

                {/* Label and status */}
                <div className="mt-1.5 space-y-0.5">
                  <p className={cn("text-xs font-medium", styles.text)}>{step.name}</p>
                  
                  {/* Status badge */}
                  <div className={cn("text-xs px-1.5 py-0.5 rounded-full inline-block", styles.badge)}>
                    {/* AI提取-待确认状态下，AI提取步骤显示"待确认"而不是"进行中" */}
                    {step.id === "ai_extract" && selectedVariant?.currentStage === "AI提取-待确认" && step.status === "in_progress" 
                      ? "待确认" 
                      : /* 翻译待确认状态下，人工翻译步骤显示"待确认"而不是"进行中" */
                        step.id === "manual_translate" && selectedVariant?.currentStage === "翻译待确认" && step.status === "in_progress"
                      ? "待确认"
                      : /* 字体调整待确认状态下，字体调整步骤显示"待确认"而不是"进行中" */
                        step.id === "font_adjust" && selectedVariant?.currentStage === "字体调整-待确认" && step.status === "in_progress"
                      ? "待确认"
                      : /* 质检待确认状态下，质检步骤显示"待确认"而不是"进行中" */
                        step.id === "quality_check" && selectedVariant?.currentStage === "质检待确认" && step.status === "in_progress"
                      ? "待确认"
                      : statusLabels[step.status]}
                  </div>

                  {/* Progress */}
                  <p className="text-xs text-muted-foreground">
                    {step.completedCount}/{step.totalCount}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
