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

type WorkflowType = "ai_extract" | "ai_translate" | "task_assign" | "manual_translate" | "video_erase" | "quality_check" | "video_compress"
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
  videoEraseStatus?: "not_started" | "in_progress" | "completed"
  translationAssignments?: Array<{ languageId: string; episodes: number[]; assignee: string }>
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

export function WorkflowSteps({ 
  onWorkflowClick, 
  onTaskAssignClick, 
  selectedVariant, 
  videoEraseStatus = "not_started",
  translationAssignments = [],
  qualityCheckAssignments = [],
  compressAssignments = []
}: WorkflowStepsProps) {
  const [showTaskMenu, setShowTaskMenu] = useState(false)
  const { hasWorkflow } = usePermission()
  
  // 判断是否是源语言卡片（包含"源语言"或"原语言"关键字）
  const isSourceLanguage = selectedVariant?.targetLanguage.includes("源语言") || 
                          selectedVariant?.targetLanguage.includes("原语言")
  const isPendingProject = selectedVariant?.currentStage === "待开始"
  const currentStage = selectedVariant?.currentStage || ""
  
  // 根据选中的语言变体动态设置工作流程状态和集数
  // 源语言卡片显示 AI 提取工作流，其他语言卡片显示人工翻译工作流
  let displaySteps = isSourceLanguage ? [...chineseWorkflowSteps] : [...otherLanguageWorkflowSteps]
  
  // 如果是待开始的项目，所有步骤都设置为pending状态
  if (isPendingProject && isSourceLanguage) {
    displaySteps = chineseWorkflowSteps.map(step => ({
      ...step,
      status: "pending" as const,
      completedCount: 0,
      totalCount: selectedVariant.totalEpisodes,
    }))
  } else if (isSourceLanguage && selectedVariant) {
    // 源语言工作流：根据当前阶段更新工作流程状态
    const completedEpisodes = selectedVariant.completedEpisodes
    const totalEpisodes = selectedVariant.totalEpisodes
    
    displaySteps = displaySteps.map(step => {
      // 更新总集数
      const updatedStep = { ...step, totalCount: totalEpisodes }
      
      // 任务分配状态：所有源语言工作流程都已完成（用于演示已进入人工翻译阶段的项目）
      // 这个检查要放在最前面，优先级最高
      if (currentStage === "任务分配") {
        if (step.id === "ai_extract" || step.id === "ai_translate" || step.id === "task_assign" || step.id === "video_erase") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalEpisodes }
        }
      }
      
      // 视频擦除使用独立状态（仅在非"任务分配"状态下生效）
      if (step.id === "video_erase" && currentStage !== "任务分配") {
        if (videoEraseStatus === "completed") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalEpisodes }
        } else if (videoEraseStatus === "in_progress") {
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
          return { ...updatedStep, status: "in_progress" as const, completedCount: completedEpisodes }
        }
        return updatedStep
      }
      // AI翻译-进行中状态
      else if (currentStage === "AI翻译-进行中") {
        if (step.id === "ai_extract") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalEpisodes }
        } else if (step.id === "ai_translate") {
          return { ...updatedStep, status: "in_progress" as const, completedCount: completedEpisodes }
        }
        return updatedStep
      }
      // AI翻译-已完成状态
      else if (currentStage === "AI翻译-已完成") {
        if (step.id === "ai_extract") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalEpisodes }
        } else if (step.id === "ai_translate") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalEpisodes }
        }
        return updatedStep
      }
      
      // 任务分配按钮：在非"任务分配"状态下，根据是否有分配来判断状态
      if (step.id === "task_assign" && currentStage !== "任务分配") {
        const hasAnyAssignment = translationAssignments.length > 0 || qualityCheckAssignments.length > 0 || compressAssignments.length > 0
        return { ...updatedStep, status: hasAnyAssignment ? "in_progress" as const : "pending" as const, completedCount: 0 }
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
      if (currentStage === "人工翻译") {
        if (step.id === "manual_translate") {
          return { ...updatedStep, status: "in_progress" as const, completedCount: completedEpisodes }
        } else if (step.id === "quality_check" || step.id === "video_compress") {
          return { ...updatedStep, status: "pending" as const, completedCount: 0 }
        }
      } else if (currentStage === "翻译待确认") {
        // 翻译待确认状态：人工翻译显示为进行中（但标签显示"待确认"）
        if (step.id === "manual_translate") {
          return { ...updatedStep, status: "in_progress" as const, completedCount: totalEpisodes }
        } else if (step.id === "quality_check" || step.id === "video_compress") {
          return { ...updatedStep, status: "pending" as const, completedCount: 0 }
        }
      } else if (currentStage === "质检审核") {
        if (step.id === "manual_translate") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalEpisodes }
        } else if (step.id === "quality_check") {
          return { ...updatedStep, status: "in_progress" as const, completedCount: completedEpisodes }
        } else if (step.id === "video_compress") {
          return { ...updatedStep, status: "pending" as const, completedCount: 0 }
        }
      } else if (currentStage === "质检待确认") {
        // 质检待确认状态：人工翻译已完成，质检显示为进行中（但标签显示"待确认"）
        if (step.id === "manual_translate") {
          return { ...updatedStep, status: "completed" as const, completedCount: totalEpisodes }
        } else if (step.id === "quality_check") {
          return { ...updatedStep, status: "in_progress" as const, completedCount: totalEpisodes }
        } else if (step.id === "video_compress") {
          return { ...updatedStep, status: "pending" as const, completedCount: 0 }
        }
      } else if (currentStage === "视频压制") {
        if (step.id === "manual_translate" || step.id === "quality_check") {
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
        <span className="text-xs text-muted-foreground">点击图标开始任务</span>
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
              // 待开始状态：只有AI提取可以进行，显示呼吸
              if (isPendingProject && step.status === "pending") {
                return step.id === "ai_extract"
              }
              
              // AI提取已完成状态：AI翻译、视频擦除可以进行，显示呼吸（任务分配不显示）
              if (currentStage === "AI提取-已完成" && step.status === "pending") {
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
                // AI翻译和视频擦除都需要等待AI提取完成
                if (step.id === "ai_translate" || step.id === "video_erase") {
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
                <div 
                  className="relative"
                  onMouseEnter={() => step.id === "task_assign" && !isDisabled && setShowTaskMenu(true)}
                  onMouseLeave={() => step.id === "task_assign" && setShowTaskMenu(false)}
                >
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
                  
                  {/* 任务分配悬浮菜单 - 三个圆形按钮，包含连接区域 */}
                  {step.id === "task_assign" && showTaskMenu && (
                    <div 
                      className="absolute pointer-events-auto" 
                      style={{ 
                        left: '50%',
                        bottom: '0',
                        transform: 'translateX(-50%)',
                        width: '140px',
                        height: '90px',
                        paddingBottom: '40px',
                      }}
                      onMouseEnter={() => setShowTaskMenu(true)}
                      onMouseLeave={() => setShowTaskMenu(false)}
                    >
                      {/* 透明连接区域，保持hover状态 */}
                      <div className="absolute inset-0 pointer-events-auto" />
                      
                      {/* 左侧圆形按钮 - 翻译 */}
                      <button
                        className="absolute bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full transition-all pointer-events-auto animate-in fade-in zoom-in duration-200 flex flex-col items-center justify-center gap-0.5 z-10"
                        style={{
                          left: '0',
                          bottom: '40px',
                          width: '40px',
                          height: '40px',
                        }}
                        title="翻译任务"
                        onClick={(e) => {
                          e.stopPropagation()
                          onTaskAssignClick?.("translation")
                        }}
                      >
                        <Languages className="w-4 h-4 text-primary" />
                        <span className="text-[8px] font-medium text-primary whitespace-nowrap leading-none">翻译</span>
                      </button>
                      
                      {/* 中间圆形按钮 - 质检 */}
                      <button
                        className="absolute bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full transition-all pointer-events-auto animate-in fade-in zoom-in duration-200 flex flex-col items-center justify-center gap-0.5 z-10"
                        style={{
                          left: '50%',
                          top: '0',
                          transform: 'translateX(-50%)',
                          width: '40px',
                          height: '40px',
                        }}
                        title="质检任务"
                        onClick={(e) => {
                          e.stopPropagation()
                          onTaskAssignClick?.("quality_check")
                        }}
                      >
                        <ClipboardCheck className="w-4 h-4 text-primary" />
                        <span className="text-[8px] font-medium text-primary whitespace-nowrap leading-none">质检</span>
                      </button>
                      
                      {/* 右侧圆形按钮 - 压制 */}
                      <button
                        className="absolute bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full transition-all pointer-events-auto animate-in fade-in zoom-in duration-200 flex flex-col items-center justify-center gap-0.5 z-10"
                        style={{
                          right: '0',
                          bottom: '40px',
                          width: '40px',
                          height: '40px',
                        }}
                        title="压制任务"
                        onClick={(e) => {
                          e.stopPropagation()
                          onTaskAssignClick?.("compress")
                        }}
                      >
                        <Film className="w-4 h-4 text-primary" />
                        <span className="text-[8px] font-medium text-primary whitespace-nowrap leading-none">压制</span>
                      </button>
                    </div>
                  )}
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
