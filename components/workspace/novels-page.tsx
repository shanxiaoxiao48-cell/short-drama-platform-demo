"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Upload, FileText, Globe, Download, ChevronDown, CheckCircle, Loader2, AlertCircle, ListTodo, Clock, Trash2, CheckCircle2, ChevronRight, ChevronsUpDown, PenTool, ClipboardCheck, Users, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePermission } from "@/contexts/permission-context"
import { RoundBadge } from "./round-badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkflowSteps } from "./workflow-steps"
import { TaskQueueDialog } from "./task-queue-dialog"
import { TranslationTaskQueueDialog, TranslationTask } from "./translation-task-queue-dialog"
import { VideoDownloadDialog, SubtitleDownloadDialog, ConfirmDownloadDialog, DownloadQueueDialog, UploadFormDialog, UploadQueueDialog, OverwriteConfirmDialog, UploadFormData, UploadQueueItem, } from "./download-upload-dialogs"
import { CompletedWorkflowDialog, OverwriteDialog, AITranslateDialog, VideoEraseDialog, VideoEraseRegionDialog, SubtitleMountDialog, VideoCompressDialog, SuccessDialog, TaskAssignDialog, } from "./workflow-dialogs"
import { BatchOperationDialog } from "./batch-operation-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { FileBrowserPage } from "./file-browser-page"

interface NovelLanguageVariantCardProps {
  variant: NovelVariant
  onClick: () => void
  onDoubleClick?: () => void
  onEnterEditor?: () => void
  isSelected?: boolean
  isPinned?: boolean
}

export function NovelLanguageVariantCard({
  variant,
  onClick,
  onDoubleClick,
  onEnterEditor,
  isSelected = false,
  isPinned = false,
}: NovelLanguageVariantCardProps) {
  const StageIcon = stageIcons[variant.currentStage] || Clock
  const stageColorClass = stageColors[variant.currentStage] || "bg-muted text-muted-foreground"
  const progress = Math.round((variant.completedChapters / variant.totalChapters) * 100)

  return (
    <Card
      className={`overflow-hidden bg-card border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer group ${
        isPinned ? 'border-primary border-2 shadow-md' : isSelected ? 'border-primary/70 border-2' : ''
      } language-variant-card`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className="p-4 flex flex-col h-full justify-between">
        {/* 顶部：语言 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground">{variant.targetLanguage}</h3>
          </div>
        </div>

        {/* 底部：进度信息 */}
        <div className="flex flex-col gap-2">
          {/* 进度条 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">完成进度</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>

          {/* 进入编辑器按钮 */}
          {onEnterEditor && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-1 h-7 text-xs gap-1"
              onClick={(e) => {
                e.stopPropagation()
                onEnterEditor()
              }}
            >
              <BookOpen className="w-3 h-3" />
              进入编辑器
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

interface NovelsPageProps {
  projectId: string | null
  projectTitle: string
  onOpenEditor: (
    languageVariant: string,
    chapterId: string,
    workflowStage: string,
    hasTerminology: boolean,
    isPreTranslation: boolean,
    isSourceLanguage: boolean,
    onSubmitReview?: (action?: "submit" | "approve" | "reject") => void
  ) => void
  onBack: () => void
}

interface NovelVariant {
  id: string
  targetLanguage: string
  progress: number
  totalChapters: number
  completedChapters: number
  currentStage: string
  currentRound?: number
  // 目标语言工作流状态
  translationStage?: "待开始" | "人工翻译" | "翻译待确认" | "终稿质检" | "质检待确认" | "已完成"
}

interface NovelDocument {
  id: string
  name: string
  type: "word" | "excel"
  uploadStatus: "completed" | "uploading" | "error"
  progress: number
  updatedAt: string
}

const novelWorkflowSteps = [
  { id: "terminology_extract", label: "术语提取", icon: FileText, status: "pending" },
  { id: "ai_translate", label: "AI翻译", icon: Globe, status: "pending" },
]

const statusLabels: Record<string, string> = {
  completed: "已完成",
  in_progress: "进行中",
  pending: "待开始",
}

const stageColors: Record<string, string> = {
  "待开始": "bg-muted text-muted-foreground border-border",
  "术语提取": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "术语提取-进行中": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "术语提取-已完成": "bg-green-500/10 text-green-500 border-green-500/20",
  "AI翻译": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "AI翻译-进行中": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "AI翻译-已完成": "bg-green-500/10 text-green-500 border-green-500/20",
  "人工翻译": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "翻译待确认": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "终稿质检": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "质检待确认": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "已完成": "bg-green-500/10 text-green-500 border-green-500/20",
}

const stageIcons: Record<string, any> = {
  "待开始": Clock,
  "术语提取": Clock,
  "术语提取-进行中": Clock,
  "术语提取-已完成": CheckCircle2,
  "AI翻译": Clock,
  "AI翻译-进行中": Clock,
  "AI翻译-已完成": CheckCircle2,
  "人工翻译": Clock,
  "翻译待确认": AlertCircle,
  "终稿质检": Clock,
  "质检待确认": AlertCircle,
  "已完成": CheckCircle2,
}

export function NovelsPage({ projectId, projectTitle, onOpenEditor, onBack }: NovelsPageProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [pinnedVariant, setPinnedVariant] = useState<string | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showTranslateDialog, setShowTranslateDialog] = useState(false)
  const [showTerminologyDialog, setShowTerminologyDialog] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [showUploadMenu, setShowUploadMenu] = useState(false)
  
  // 批量操作对话框
  const [showBatchDialog, setShowBatchDialog] = useState(false)
  const [batchMode, setBatchMode] = useState<"delete" | "download">("delete")
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false)
  const [downloadType, setDownloadType] = useState<"正文" | "术语表">("正文")
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showFileBrowser, setShowFileBrowser] = useState(false)
  const [showWorkflowBar, setShowWorkflowBar] = useState(false)
  
  // Dialog states
  const [showCompletedDialog, setShowCompletedDialog] = useState(false)
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false)
  const [showAITranslate, setShowAITranslate] = useState(false)
  const [showTaskAssign, setShowTaskAssign] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showTaskQueue, setShowTaskQueue] = useState(false)
  const [showTranslationQueue, setShowTranslationQueue] = useState(false)
  
  // Combined task queue dropdown
  const [showCombinedTaskQueue, setShowCombinedTaskQueue] = useState(false)
  
  // Terminology extract task items for task queue display
  const [terminologyTasks, setTerminologyTasks] = useState<Array<{
    id: string
    chapter: number
    status: "waiting" | "processing" | "completed"
    progress: number
  }>>([])
  const [terminologyTasksRunning, setTerminologyTasksRunning] = useState(false)
  
  // Download and upload dialog states
  const [showVideoDownload, setShowVideoDownload] = useState(false)
  const [showSubtitleDownload, setShowSubtitleDownload] = useState(false)
  const [showConfirmDownload, setShowConfirmDownload] = useState(false)
  const [confirmDownloadType, setConfirmDownloadType] = useState<"画面字" | "术语表">("画面字")
  const [showDownloadQueue, setShowDownloadQueue] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadType, setUploadType] = useState<"文档" | "字幕" | "画面字" | "术语表">("文档")
  const [showUploadQueue, setShowUploadQueue] = useState(false)
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false)
  const [pendingUploadData, setPendingUploadData] = useState<any>(null)
  const [conflictFiles, setConflictFiles] = useState<any[]>([])
  const [downloadQueueItems, setDownloadQueueItems] = useState<any[]>([])
  const [uploadQueueItems, setUploadQueueItems] = useState<UploadQueueItem[]>([])
  
  // 术语确认状态 - 从localStorage恢复
  const [terminologyConfirmed, setTerminologyConfirmed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`novel-terminology-confirmed-${projectId}`) === "true"
    }
    return false
  })
  
  // AI translation related states - 从localStorage恢复
  const [aiTranslateStatus, setAITranslateStatus] = useState<"not_started" | "in_progress" | "completed">(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`novel-ai-translate-status-${projectId}`)
      if (saved === "completed") return "completed"
    }
    return "not_started"
  })
  const [translationTasks, setTranslationTasks] = useState<TranslationTask[]>([])
  
  // 术语提取状态 - 从localStorage恢复（in_progress恢复为not_started，因为模拟任务不会恢复）
  const [terminologyExtractStatus, setTerminologyExtractStatus] = useState<"not_started" | "in_progress" | "completed">(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`novel-terminology-status-${projectId}`)
      if (saved === "completed") return "completed"
    }
    return "not_started"
  })
  
  const { hasWorkflow, canAccessVariant, hasButton, user } = usePermission()

  // 任务分配状态
  const [taskAssignType, setTaskAssignType] = useState<"translation" | "quality_check" | "compress">("translation")
  const [confirmedAssignments, setConfirmedAssignments] = useState<{
    translation: Array<{ languageId: string; episodes: number[]; assignee: string }>
    review: Array<{ languageId: string; episodes: number[]; assignee: string }>
    quality_check: Array<{ languageId: string; episodes: number[]; assignee: string }>
    compress: Array<{ languageId: string; episodes: number[]; assignee: string }>
  }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`novel-task-assignments-${projectId}`)
      if (saved) try { return JSON.parse(saved) } catch {}
    }
    return { translation: [], review: [], quality_check: [], compress: [] }
  })
  const [taskAssignHover, setTaskAssignHover] = useState(false)
  
  // 持久化术语提取状态
  const updateTerminologyStatus = (status: "not_started" | "in_progress" | "completed") => {
    setTerminologyExtractStatus(status)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`novel-terminology-status-${projectId}`, status)
    }
  }
  
  // 持久化术语确认状态
  const updateTerminologyConfirmed = (confirmed: boolean) => {
    setTerminologyConfirmed(confirmed)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`novel-terminology-confirmed-${projectId}`, confirmed ? "true" : "false")
    }
  }
  
  // 持久化AI翻译状态
  const updateAITranslateStatus = (status: "not_started" | "in_progress" | "completed") => {
    setAITranslateStatus(status)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`novel-ai-translate-status-${projectId}`, status)
    }
  }

  // 持久化任务分配数据
  const hasAnyAssignment = confirmedAssignments.translation.length > 0 ||
    confirmedAssignments.review.length > 0 ||
    confirmedAssignments.quality_check.length > 0 ||
    confirmedAssignments.compress.length > 0
  
  // 计算是否有活动的任务
  const hasActiveTasks = useMemo(() => {
    return uploadQueueItems.some(item => item.status === "uploading" || item.status === "pending") ||
      downloadQueueItems.some(item => item.status === "downloading" || item.status === "pending") ||
      terminologyTasksRunning ||
      aiTranslateStatus === "in_progress"
  }, [uploadQueueItems, downloadQueueItems, terminologyTasksRunning, aiTranslateStatus])

  // 模拟小说语言变体数据 - 从localStorage加载
  const [novelVariants, setNovelVariants] = useState<NovelVariant[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`novel-variants-${projectId}`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // 向后兼容：为旧数据添加 translationStage
          return parsed.map((v: NovelVariant) => ({
            ...v,
            translationStage: v.translationStage || "待开始",
          }))
        } catch (e) { /* ignore */ }
      }
    }
    return [
      {
        id: "0",
        targetLanguage: "中文（原语言）",
        progress: 100,
        totalChapters: 50,
        completedChapters: 50,
        currentStage: "术语提取-已完成",
        currentRound: 1,
        translationStage: "待开始" as const,
      },
      {
        id: "1",
        targetLanguage: "英语",
        progress: 60,
        totalChapters: 50,
        completedChapters: 30,
        currentStage: "AI翻译-进行中",
        currentRound: 1,
        translationStage: "人工翻译" as const,
      },
      {
        id: "2",
        targetLanguage: "西班牙语",
        progress: 30,
        totalChapters: 50,
        completedChapters: 15,
        currentStage: "术语提取",
        currentRound: 2,
        translationStage: "待开始" as const,
      },
      {
        id: "3",
        targetLanguage: "泰语",
        progress: 0,
        totalChapters: 50,
        completedChapters: 0,
        currentStage: "待开始",
        currentRound: 1,
        translationStage: "待开始" as const,
      },
      {
        id: "4",
        targetLanguage: "法语",
        progress: 80,
        totalChapters: 50,
        completedChapters: 40,
        currentStage: "AI翻译-已完成",
        currentRound: 1,
        translationStage: "翻译待确认" as const,
      },
      {
        id: "5",
        targetLanguage: "德语",
        progress: 45,
        totalChapters: 50,
        completedChapters: 22,
        currentStage: "术语提取-进行中",
        currentRound: 1,
        translationStage: "待开始" as const,
      },
      {
        id: "6",
        targetLanguage: "日语",
        progress: 20,
        totalChapters: 50,
        completedChapters: 10,
        currentStage: "术语提取",
        currentRound: 1,
        translationStage: "终稿质检" as const,
      },
      {
        id: "7",
        targetLanguage: "韩语",
        progress: 10,
        totalChapters: 50,
        completedChapters: 5,
        currentStage: "待开始",
        currentRound: 1,
        translationStage: "待开始" as const,
      },
    ]
  })

  // 保存变体到localStorage
  const saveVariants = (variants: NovelVariant[]) => {
    setNovelVariants(variants)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`novel-variants-${projectId}`, JSON.stringify(variants))
    }
  }

  // 模拟文档数据
  const [documents, setDocuments] = useState<NovelDocument[]>([
    {
      id: "1",
      name: "第一章.docx",
      type: "word",
      uploadStatus: "completed",
      progress: 100,
      updatedAt: "2小时前",
    },
    {
      id: "2",
      name: "术语表.xlsx",
      type: "excel",
      uploadStatus: "completed",
      progress: 100,
      updatedAt: "1天前",
    },
    {
      id: "3",
      name: "第二章.docx",
      type: "word",
      uploadStatus: "uploading",
      progress: 65,
      updatedAt: "进行中",
    },
  ])

  const toggleCardSelection = (id: string) => {
    // kept for potential future use
  }

  const handleUploadClick = () => {
    setShowUploadDialog(true)
  }

  const handleTranslateClick = () => {
    setShowTranslateDialog(true)
  }

  const handleTerminologyClick = () => {
    setShowTerminologyDialog(true)
  }

  const handleOpenVariant = (variantId: string) => {
    const variant = novelVariants.find(v => v.id === variantId)
    if (!variant) return

    if (pinnedVariant === variantId) {
      setPinnedVariant(null)
      setSelectedVariant(null)
      setShowWorkflowBar(false)
    } else {
      setPinnedVariant(variantId)
      setSelectedVariant(variantId)
      // 所有卡片都显示流程栏（源语言显示术语提取+AI翻译，目标语言显示人工翻译+终稿质检）
      setShowWorkflowBar(true)
    }
  }

  const handleDownloadOption = (option: string) => {
    setShowDownloadMenu(false)
    
    switch (option) {
      case "文档":
        setShowVideoDownload(true)
        break
      case "字幕":
        setShowSubtitleDownload(true)
        break
      case "画面字":
        setConfirmDownloadType("画面字")
        setShowConfirmDownload(true)
        break
      case "术语表":
        setConfirmDownloadType("术语表")
        setShowConfirmDownload(true)
        break
    }
  }

  const handleUploadOption = (option: string) => {
    setShowUploadMenu(false)

    // 打开上传表单对话框（只针对上传选项）
    if (["文档", "字幕", "画面字", "术语表"].includes(option)) {
      setUploadType(option as "文档" | "字幕" | "画面字" | "术语表")
      setShowUploadForm(true)
    }
  }

  const handleCardDoubleClick = (variantId: string) => {
    const variant = novelVariants.find((v) => v.id === variantId)
    if (!variant) return
    handleEnterEditor(variantId)
  }

  const handleEnterEditor = (variantId: string) => {
    const variant = novelVariants.find((v) => v.id === variantId)
    if (!variant) return
    
    const isSource = variant.targetLanguage.includes("原语言") || variant.targetLanguage.includes("源语言")
    
    if (isSource) {
      // 源语言进入编辑器
      const hasTerminology = terminologyExtractStatus === "completed"
      // 术语提取完成但未确认 → 术语提取待确认阶段
      const stage = terminologyExtractStatus === "completed" && !terminologyConfirmed ? "术语提取待确认" : "原文查看"
      
      // 术语确认回调 → 写入localStorage
      const onSubmitReview = (action?: "submit" | "approve" | "reject") => {
        if (action === "approve" && typeof window !== 'undefined') {
          localStorage.setItem(`novel-terminology-confirmed-${projectId}`, "true")
          // 同步更新本地状态（虽然NovelsPage会unmount，但以防万一）
          setTerminologyConfirmed(true)
        }
      }
      
      onOpenEditor(
        variant.targetLanguage,
        "1",
        stage,
        terminologyExtractStatus === "completed",
        true,
        true, // isSourceLanguage
        onSubmitReview
      )
      return
    }
    
    // 目标语言
    const aiDone = variant.currentStage === "AI翻译-已完成" || variant.currentStage === "AI翻译-进行中"
    const hasStartedTranslation = variant.translationStage !== "待开始"
    const isPreTranslation = !aiDone && !hasStartedTranslation
    const hasTerminology = terminologyExtractStatus === "completed"
    const stage = variant.translationStage || "待开始"
    
    // 如果是待开始状态且进入编辑器，自动变为人工翻译进行中
    if (stage === "待开始" && !isPreTranslation) {
      const updated = novelVariants.map(v => 
        v.id === variantId ? { ...v, translationStage: "人工翻译" as const } : v
      )
      saveVariants(updated)
    }
    
    const onSubmitReview = (action?: "submit" | "approve" | "reject") => {
      if (typeof window === 'undefined') return
      const saved = localStorage.getItem(`novel-variants-${projectId}`)
      if (!saved) return
      try {
        const variants: NovelVariant[] = JSON.parse(saved)
        const idx = variants.findIndex(v => v.id === variantId)
        if (idx === -1) return
        const v = variants[idx]
        
        if (action === "submit") {
          if (v.translationStage === "人工翻译") {
            variants[idx] = { ...v, translationStage: "翻译待确认" }
          }
        } else if (action === "approve") {
          if (v.translationStage === "翻译待确认") {
            variants[idx] = { ...v, translationStage: "终稿质检" }
          } else if (v.translationStage === "终稿质检" || v.translationStage === "质检待确认") {
            variants[idx] = { ...v, translationStage: "已完成" }
          }
        } else if (action === "reject") {
          if (v.translationStage === "翻译待确认") {
            variants[idx] = { ...v, translationStage: "人工翻译" }
          } else if (v.translationStage === "终稿质检" || v.translationStage === "质检待确认") {
            variants[idx] = { ...v, translationStage: "人工翻译" }
          }
        }
        
        localStorage.setItem(`novel-variants-${projectId}`, JSON.stringify(variants))
      } catch (e) { /* ignore */ }
    }
    
    // 进入编辑器时，如果是待开始且非预翻译，使用人工翻译阶段
    const actualStage = (stage === "待开始" && !isPreTranslation) ? "人工翻译" : stage
    
    onOpenEditor(
      variant.targetLanguage,
      "1",
      actualStage,
      hasTerminology,
      isPreTranslation,
      false, // isSourceLanguage
      onSubmitReview
    )
  }

  const handleWorkflowClick = (workflowId: string, isCompleted: boolean) => {
    // AI翻译特殊处理
    if (workflowId === "ai_translate") {
      if (aiTranslateStatus === "not_started") {
        setShowAITranslate(true)
      } else if (aiTranslateStatus === "in_progress") {
        setShowCombinedTaskQueue(true)
      } else if (aiTranslateStatus === "completed") {
        setShowAITranslate(true)
      }
      return
    }

    if (isCompleted) {
      setShowCompletedDialog(true)
      return
    }

    // 术语提取处理 - 弹出确认对话框
    if (workflowId === "terminology_extract") {
      if (terminologyExtractStatus === "not_started") {
        setShowTerminologyDialog(true)
      } else if (terminologyExtractStatus === "in_progress") {
        // 进行中时点击打开任务队列查看进度
        setShowCombinedTaskQueue(true)
      } else if (terminologyExtractStatus === "completed" && !terminologyConfirmed) {
        // 已完成但未确认 → 进入源语言编辑器确认
        const sourceVariant = novelVariants.find(v => 
          v.targetLanguage.includes("原语言") || v.targetLanguage.includes("源语言")
        )
        if (sourceVariant) {
          handleEnterEditor(sourceVariant.id)
        }
      }
      return
    }

    // 任务分配处理
    if (workflowId === "task_assign") {
      setTaskAssignType("translation")
      setShowTaskAssign(true)
      return
    }
  }

  // 任务分配提交
  const handleTaskAssignSubmit = (allAssignments: Record<string, Array<{ languageId: string; episodes: number[]; assignee: string }>>) => {
    setConfirmedAssignments(prev => ({ ...prev, ...allAssignments }))
    if (typeof window !== 'undefined') {
      const merged = { ...confirmedAssignments, ...allAssignments }
      localStorage.setItem(`novel-task-assignments-${projectId}`, JSON.stringify(merged))
    }
    setShowTaskAssign(false)
  }

  const handleTaskAssignClick = (taskType: "translation" | "quality_check" | "compress") => {
    setTaskAssignType(taskType)
    setShowTaskAssign(true)
  }

  // 确认开始术语提取 → 启动任务队列
  const handleStartTerminologyExtract = () => {
    setShowTerminologyDialog(false)
    updateTerminologyStatus("in_progress")
    
    // 初始化术语提取任务列表（按章节）
    const totalChapters = novelVariants[0]?.totalChapters || 50
    const tasks = Array.from({ length: totalChapters }, (_, i) => ({
      id: `term-${i + 1}`,
      chapter: i + 1,
      status: "waiting" as const,
      progress: 0,
    }))
    setTerminologyTasks(tasks)
    setTerminologyTasksRunning(true)
    
    // 模拟任务执行
    simulateTerminologyTasks(tasks)
  }

  // 模拟术语提取任务进度
  const simulateTerminologyTasks = (initialTasks: typeof terminologyTasks) => {
    let tasks = [...initialTasks]
    
    const interval = setInterval(() => {
      const processingCount = tasks.filter(t => t.status === "processing").length
      const completedCount = tasks.filter(t => t.status === "completed").length
      
      if (completedCount === tasks.length) {
        clearInterval(interval)
        setTerminologyTasksRunning(false)
        updateTerminologyStatus("completed")
        return
      }
      
      // 最多同时处理5个
      if (processingCount < 5) {
        const waiting = tasks.find(t => t.status === "waiting")
        if (waiting) {
          waiting.status = "processing"
          waiting.progress = 0
        }
      }
      
      tasks.forEach(task => {
        if (task.status === "processing") {
          task.progress = Math.min(100, task.progress + Math.random() * 20 + 5)
          if (task.progress >= 100) {
            task.status = "completed"
            task.progress = 100
          }
        }
      })
      
      setTerminologyTasks([...tasks])
    }, 400)
  }

  const handleAITranslateSubmit = (languageCodes: string[]) => {
    setShowAITranslate(false)
    
    // 语种映射
    const languageMap: Record<string, string> = {
      "en": "英语", "es": "西班牙语", "fr": "法语", "de": "德语",
      "ja": "日语", "ko": "韩语", "th": "泰语", "vi": "越南语",
      "id": "印尼语", "pt": "葡萄牙语", "zh-Hans": "简体中文", "zh-Hant": "繁体中文",
      "tl": "菲律宾语", "ms": "马来语", "it": "意大利语", "ru": "俄语",
      "tr": "土耳其语", "ar": "阿拉伯语", "hi": "印地语",
    }
    
    // 创建新的语言变体卡片
    const existingLanguages = new Set(novelVariants.map(v => v.targetLanguage))
    const newVariants = [...novelVariants]
    let nextId = Math.max(...novelVariants.map(v => parseInt(v.id))) + 1
    
    languageCodes.forEach(code => {
      const langName = languageMap[code] || code
      if (!existingLanguages.has(langName)) {
        newVariants.push({
          id: String(nextId++),
          targetLanguage: langName,
          progress: 0,
          totalChapters: novelVariants[0]?.totalChapters || 50,
          completedChapters: 0,
          currentStage: "AI翻译-进行中",
          currentRound: 1,
          translationStage: "待开始",
        })
      }
    })
    
    saveVariants(newVariants)
    updateAITranslateStatus("in_progress")
    
    // 模拟AI翻译完成
    setTimeout(() => {
      updateAITranslateStatus("completed")
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`novel-variants-${projectId}`)
        if (saved) {
          try {
            const variants: NovelVariant[] = JSON.parse(saved)
            const updated = variants.map(v => 
              v.currentStage === "AI翻译-进行中" ? { ...v, currentStage: "AI翻译-已完成" } : v
            )
            localStorage.setItem(`novel-variants-${projectId}`, JSON.stringify(updated))
            setNovelVariants(updated)
          } catch (e) { /* ignore */ }
        }
      }
    }, 3000)
  }

  const handleTaskSubmit = () => {
    // 简化处理：关闭所有对话框并显示成功
    setShowTerminologyDialog(false)
    setShowTranslateDialog(false)
    setShowAITranslate(false)
    setShowSuccess(true)
  }

  // 模拟下载进度
  const simulateDownloadProgress = (itemId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setDownloadQueueItems(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { ...item, progress: 100, status: "completed" }
              : item
          )
        )
      } else {
        setDownloadQueueItems(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { ...item, progress: Math.floor(progress), status: "downloading" }
              : item
          )
        )
      }
    }, 500)
  }

  // 模拟上传进度
  const simulateUploadProgress = (itemId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15

      if (progress >= 100) {
        progress = 100
        clearInterval(interval)

        setUploadQueueItems(prev => {
          const updated = prev.map(item =>
            item.id === itemId
              ? { ...item, progress: 100, status: "completed" as const }
              : item
          )

          // 查找下一个待上传的任务
          const nextPending = updated.find(item => item.status === "pending")
          if (nextPending) {
            // 开始下一个任务
            setTimeout(() => simulateUploadProgress(nextPending.id), 100)
          } else {
            // 所有任务完成
            const allCompleted = updated.every(item => item.status === "completed")
            if (allCompleted) {
              // 上传完成
            }
          }

          return updated
        })
      } else {
        setUploadQueueItems(prev =>
          prev.map(item =>
            item.id === itemId
              ? { ...item, progress: Math.floor(progress), status: "uploading" }
              : item
          )
        )
      }
    }, 500)
  }

  const handleVideoDownloadConfirm = (selectedTypes: string[], selectedChapters: number[]) => {
    const items = selectedTypes.flatMap(type =>
      selectedChapters.map(chapter => ({
        id: `video-${type}-${chapter}-${Date.now()}`,
        name: `${type} - 第${chapter}章`,
        progress: 0,
        status: "pending",
      }))
    )

    setDownloadQueueItems(items)
    setShowDownloadQueue(true)

    // 模拟下载进度
    items.forEach(item => simulateDownloadProgress(item.id))
  }

  const handleSubtitleDownloadConfirm = (selectedLanguages: string[], selectedChapters: number[]) => {
    const items = selectedLanguages.flatMap(lang =>
      selectedChapters.map(chapter => ({
        id: `subtitle-${lang}-${chapter}-${Date.now()}`,
        name: `${lang}字幕 - 第${chapter}章`,
        progress: 0,
        status: "pending",
      }))
    )
    
    setDownloadQueueItems(items)
    setShowDownloadQueue(true)
    
    // 模拟下载进度
    items.forEach(item => simulateDownloadProgress(item.id))
  }

  const handleConfirmDownloadSubmit = (selectedChapters: number[]) => {
    const items = selectedChapters.map(chapter => ({
      id: `${confirmDownloadType}-${chapter}-${Date.now()}`,
      name: `${confirmDownloadType} - 第${chapter}章`,
      progress: 0,
      status: "pending",
    }))

    setDownloadQueueItems(items)
    setShowDownloadQueue(true)

    // 模拟下载进度
    items.forEach(item => simulateDownloadProgress(item.id))
  }

  const handleUploadFormSubmit = async (data: any) => {
    // 简化处理：直接开始上传
    const newItems: UploadQueueItem[] = []
    
    data.files.forEach((file: any) => {
      newItems.push({
        id: `upload-${Date.now()}-${Math.random()}`,
        projectTitle: projectTitle,
        languageVariant: data.language || "中文",
        episodeNumber: 1,
        uploadType: data.uploadType,
        fileName: file.name,
        fileSize: file.size,
        progress: 0,
        status: "pending"
      })
    })
    
    setUploadQueueItems(newItems)
    setShowUploadQueue(true)
    
    // 开始上传第一个任务
    if (newItems.length > 0) {
      simulateUploadProgress(newItems[0].id)
    }
  }

  const handleOverwriteConfirm = () => {
    if (pendingUploadData) {
      handleUploadFormSubmit(pendingUploadData)
      setPendingUploadData(null)
      setConflictFiles([])
    }
  }

  // File browser view
  if (showFileBrowser) {
    return (
      <FileBrowserPage
        projectTitle={projectTitle}
        totalEpisodes={novelVariants[0]?.totalChapters || 50}
        languages={novelVariants.map(v => ({
          id: v.id,
          label: v.targetLanguage.replace("（源语言）", "").replace("（原语言）", ""),
          isSource: v.targetLanguage.includes("源语言") || v.targetLanguage.includes("原语言"),
        }))}
        onBack={() => setShowFileBrowser(false)}
        type="novel"
      />
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Scrollable Content Area */}
      <div 
        className="flex-1 overflow-auto p-6 pb-4 scrollbar-hide"
        style={{ height: "70%" }}
        onClick={(e) => {
          // 点击空白区域（不是卡片、按钮等元素）时，恢复到固定选中的卡片
          const target = e.target as HTMLElement
          const isClickOnCard = target.closest('.language-variant-card')
          const isClickOnButton = target.closest('button')
          const isClickOnInput = target.tagName === 'INPUT'
          
          if (!isClickOnCard && !isClickOnButton && !isClickOnInput) {
            // 恢复到固定选中的卡片，而不是完全取消
            if (pinnedVariant) {
              setSelectedVariant(pinnedVariant)
              setShowWorkflowBar(true)
            } else {
              setSelectedVariant(null)
              setShowWorkflowBar(false)
            }
          }
        }}
      >
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <button
            onClick={onBack}
            className="hover:text-foreground transition-colors"
          >
            工作台
          </button>
          <span>/</span>
          <span className="text-foreground font-medium">{projectTitle} - 小说</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{projectTitle} - 小说</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {novelVariants.filter(v => !v.targetLanguage.includes("原语言") && !v.targetLanguage.includes("源语言")).length} 个语言变体
            </p>
          </div>

          {/* 任务队列指示器 */}
          <DropdownMenu open={showCombinedTaskQueue} onOpenChange={setShowCombinedTaskQueue}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <ListTodo className="w-4 h-4" />
                {hasActiveTasks && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold animate-pulse">
                    {
                      uploadQueueItems.filter(i => i.status === "uploading" || i.status === "pending").length +
                      downloadQueueItems.filter(i => i.status === "downloading" || i.status === "pending").length +
                      (terminologyExtractStatus === "in_progress" ? 1 : 0) +
                      (aiTranslateStatus === "in_progress" ? 1 : 0)
                    }
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[500px]">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload">上传</TabsTrigger>
                  <TabsTrigger value="extract">提取</TabsTrigger>
                  <TabsTrigger value="translate">翻译</TabsTrigger>
                </TabsList>

                {/* 上传任务 */}
                <TabsContent value="upload" className="max-h-[400px] overflow-auto">
                  {uploadQueueItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm text-muted-foreground">暂无上传任务</p>
                    </div>
                  ) : (
                    <div className="space-y-2 p-2">
                      {uploadQueueItems.map(item => (
                        <div key={item.id} className="space-y-1 p-2 rounded-lg border border-border group">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">
                                {item.projectTitle} - {item.languageVariant} - {item.fileName}
                              </p>
                            </div>
                            <div className="ml-2 shrink-0">
                              {item.status === "completed" && <CheckCircle className="w-3 h-3 text-green-500" />}
                              {item.status === "uploading" && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                              {item.status === "error" && <AlertCircle className="w-3 h-3 text-destructive" />}
                            </div>
                          </div>
                          <Progress value={item.progress} className="h-1" />
                          <p className="text-xs text-right text-muted-foreground">{item.progress}%</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* 提取任务（术语提取） */}
                <TabsContent value="extract" className="max-h-[400px] overflow-auto">
                  {terminologyTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm text-muted-foreground">暂无提取任务</p>
                    </div>
                  ) : (
                    <div className="space-y-2 p-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>✓ 已完成: {terminologyTasks.filter(t => t.status === "completed").length}</span>
                        <span>⚡ 进行中: {terminologyTasks.filter(t => t.status === "processing").length}</span>
                        <span>⏳ 等待中: {terminologyTasks.filter(t => t.status === "waiting").length}</span>
                      </div>
                      {terminologyTasks.map(task => (
                        <div key={task.id} className={`space-y-1 p-2 rounded-lg border ${
                          task.status === "completed" ? "border-green-500/30 bg-green-500/5" :
                          task.status === "processing" ? "border-blue-500/30 bg-blue-500/5" :
                          "border-border"
                        }`}>
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-foreground">
                              {projectTitle} - 第{task.chapter}章 术语提取
                            </p>
                            <div className="ml-2 shrink-0">
                              {task.status === "completed" && <CheckCircle className="w-3 h-3 text-green-500" />}
                              {task.status === "processing" && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                            </div>
                          </div>
                          {task.status !== "waiting" && (
                            <>
                              <Progress value={task.progress} className="h-1" />
                              <p className="text-xs text-right text-muted-foreground">{Math.round(task.progress)}%</p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* 翻译任务（AI翻译） */}
                <TabsContent value="translate" className="max-h-[400px] overflow-auto">
                  {translationTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm text-muted-foreground">暂无翻译任务</p>
                    </div>
                  ) : (
                    <div className="space-y-2 p-2">
                      {translationTasks.map(task => (
                        <div key={task.id} className={`space-y-1 p-2 rounded-lg border ${
                          task.status === "completed" ? "border-green-500/30 bg-green-500/5" :
                          task.status === "processing" ? "border-blue-500/30 bg-blue-500/5" :
                          "border-border"
                        }`}>
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-foreground truncate">
                              {projectTitle} - {task.language} - 第{task.episode}集
                            </p>
                            <div className="ml-2 shrink-0">
                              {task.status === "completed" && <CheckCircle className="w-3 h-3 text-green-500" />}
                              {task.status === "processing" && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                            </div>
                          </div>
                          <Progress value={task.progress} className="h-1" />
                          <p className="text-xs text-right text-muted-foreground">{Math.round(task.progress)}%</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 文件夹、上传、下载、删除按钮 */}
          <TooltipProvider>
            <div className="flex items-center gap-2">
              {/* 文件夹入口 */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowFileBrowser(true)}
              >
                <FolderOpen className="w-4 h-4" />
                文件夹
              </Button>

              {/* 上传菜单 */}
              <DropdownMenu open={showUploadMenu} onOpenChange={setShowUploadMenu}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    上传
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleUploadOption("文档")}>
                    上传小说
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUploadOption("字幕")}>
                    上传术语表
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 下载下拉菜单 - 需要选中卡片 */}
              {selectedCards.size > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      下载（{selectedCards.size}）
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setDownloadType("正文"); setShowDownloadConfirm(true) }}>
                      正文
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setDownloadType("术语表"); setShowDownloadConfirm(true) }}>
                      术语表
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* 删除按钮 - 需要选中卡片 */}
              {selectedCards.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive/80"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  删除（{selectedCards.size}）
                </Button>
              )}

              {/* 全选按钮 */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  if (selectedCards.size === novelVariants.length) setSelectedCards(new Set())
                  else setSelectedCards(new Set(novelVariants.map(v => v.id)))
                }}
              >
                <Checkbox
                  checked={novelVariants.length > 0 && selectedCards.size === novelVariants.length}
                  className="w-3.5 h-3.5 pointer-events-none"
                />
                {selectedCards.size === novelVariants.length && novelVariants.length > 0 ? "取消全选" : "全选"}
              </Button>
            </div>
          </TooltipProvider>
        </div>

      {/* Language Variant Grid - 一行8个 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">语言版本</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {novelVariants.map((variant) => (
            <div key={variant.id} className="relative group">
              {/* Selection checkbox */}
              <div className={cn(
                "absolute top-2 left-2 z-10 transition-opacity",
                selectedCards.has(variant.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                <Checkbox
                  checked={selectedCards.has(variant.id)}
                  onCheckedChange={() => {
                    setSelectedCards(prev => {
                      const next = new Set(prev)
                      if (next.has(variant.id)) next.delete(variant.id); else next.add(variant.id)
                      return next
                    })
                  }}
                  onClick={e => e.stopPropagation()}
                  className="w-4 h-4 bg-background/80"
                />
              </div>
              <NovelLanguageVariantCard
                variant={variant}
                onClick={() => handleOpenVariant(variant.id)}
                onDoubleClick={() => handleCardDoubleClick(variant.id)}
                onEnterEditor={() => handleEnterEditor(variant.id)}
                isSelected={selectedVariant === variant.id}
                isPinned={pinnedVariant === variant.id}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {novelVariants.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">暂无语言版本</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            请在项目设置中添加目标语言，或创建新项目时选择多个目标语言
          </p>
        </div>
      )}
    </div>

    {/* Collapsible Workflow Bar */}
    <div
      className={`shrink-0 border-t border-border bg-card transition-all duration-300 ease-in-out ${
        showWorkflowBar && selectedVariant !== null
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground text-sm">
            工作流程 - {novelVariants.find(v => v.id === selectedVariant)?.targetLanguage}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPinnedVariant(null)
              setSelectedVariant(null)
              setShowWorkflowBar(false)
            }}
          >
            收起
          </Button>
        </div>

        {(() => {
          const currentVariant = novelVariants.find(v => v.id === selectedVariant)
          const isSource = currentVariant?.targetLanguage.includes("原语言") || currentVariant?.targetLanguage.includes("源语言")
          
          if (isSource) {
            // 源语言工作流：术语提取 + AI翻译 + 任务分配
            const taskAssignDisabled = aiTranslateStatus !== "completed"
            const taskAssignStatus = hasAnyAssignment ? "completed" : taskAssignDisabled ? "pending" : "pending"
            return (
              <div className="relative">
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />
                <div className="grid gap-1 relative" style={{ gridTemplateColumns: `repeat(3, minmax(0, 1fr))` }}>
                  {/* 术语提取 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <button
                        onClick={() => handleWorkflowClick("terminology_extract", terminologyExtractStatus === "completed" && terminologyConfirmed)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                          terminologyExtractStatus === "in_progress"
                            ? "bg-blue-500/10 border-blue-500/30 ring-2 ring-blue-500/30 animate-pulse"
                            : terminologyExtractStatus === "completed" && terminologyConfirmed
                              ? "bg-green-500/10 border-green-500/30"
                              : terminologyExtractStatus === "completed" && !terminologyConfirmed
                                ? "bg-yellow-500/10 border-yellow-500/30 ring-2 ring-yellow-500/30 animate-pulse"
                                : "bg-muted border-border"
                        }`}
                        title={terminologyExtractStatus === "completed" && !terminologyConfirmed ? "术语提取待确认，请进入编辑器确认" : "点击开始术语提取"}
                      >
                        {terminologyExtractStatus === "completed" && terminologyConfirmed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : terminologyExtractStatus === "completed" && !terminologyConfirmed ? (
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        ) : terminologyExtractStatus === "in_progress" ? (
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        ) : (
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <div className="mt-1.5 space-y-0.5">
                      <p className={`text-xs font-medium ${
                        terminologyExtractStatus === "in_progress"
                          ? "text-blue-500"
                          : terminologyExtractStatus === "completed"
                            ? terminologyConfirmed ? "text-green-500" : "text-yellow-600"
                            : "text-muted-foreground"
                      }`}>术语提取</p>
                      <div className={`text-xs px-1.5 py-0.5 rounded-full inline-block ${
                        terminologyExtractStatus === "in_progress"
                          ? "bg-blue-500/20 text-blue-500"
                          : terminologyExtractStatus === "completed"
                            ? terminologyConfirmed
                              ? "bg-green-500/20 text-green-500"
                              : "bg-yellow-500/20 text-yellow-600"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {terminologyExtractStatus === "not_started" ? "待开始" :
                         terminologyExtractStatus === "in_progress" ? "进行中" : 
                         terminologyConfirmed ? "已完成" : "待确认"}
                      </div>
                    </div>
                  </div>
                  {/* AI翻译 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <button
                        onClick={() => handleWorkflowClick("ai_translate", aiTranslateStatus === "completed")}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                          aiTranslateStatus === "in_progress"
                            ? "bg-blue-500/10 border-blue-500/30 ring-2 ring-blue-500/30 animate-pulse"
                            : aiTranslateStatus === "completed"
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-muted border-border"
                        }`}
                        title="点击开始AI翻译"
                      >
                        {aiTranslateStatus === "completed" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : aiTranslateStatus === "in_progress" ? (
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        ) : (
                          <Globe className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <div className="mt-1.5 space-y-0.5">
                      <p className={`text-xs font-medium ${
                        aiTranslateStatus === "in_progress"
                          ? "text-blue-500"
                          : aiTranslateStatus === "completed"
                            ? "text-green-500"
                            : "text-muted-foreground"
                      }`}>AI翻译</p>
                      <div className={`text-xs px-1.5 py-0.5 rounded-full inline-block ${
                        aiTranslateStatus === "in_progress"
                          ? "bg-blue-500/20 text-blue-500"
                          : aiTranslateStatus === "completed"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {aiTranslateStatus === "not_started" ? "待开始" :
                         aiTranslateStatus === "in_progress" ? "进行中" : "已完成"}
                      </div>
                    </div>
                  </div>
                  {/* 任务分配 */}
                  <div className="flex flex-col items-center text-center">
                    <div
                      className="relative"
                      onMouseEnter={() => !taskAssignDisabled && setTaskAssignHover(true)}
                      onMouseLeave={() => setTaskAssignHover(false)}
                    >
                      <button
                        onClick={() => !taskAssignDisabled && handleWorkflowClick("task_assign", false)}
                        disabled={taskAssignDisabled}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                          taskAssignDisabled
                            ? "bg-muted border-border opacity-50 cursor-not-allowed"
                            : hasAnyAssignment
                              ? "bg-green-500/10 border-green-500/30"
                              : aiTranslateStatus === "completed"
                                ? "bg-muted border-border ring-2 ring-primary/30 animate-pulse"
                                : "bg-muted border-border"
                        }`}
                        title={taskAssignDisabled ? "需要先完成AI翻译" : "点击分配任务"}
                      >
                        {hasAnyAssignment ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Users className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      {/* 任务分配悬浮菜单 */}
                      {taskAssignHover && !taskAssignDisabled && (
                        <div
                          className="absolute pointer-events-auto"
                          style={{ top: "-8px", left: "50%", transform: "translateX(-50%)", paddingBottom: "16px" }}
                        >
                          <div className="flex gap-1.5 bg-card border border-border rounded-full px-2 py-1 shadow-lg" style={{ marginTop: "-32px" }}>
                            {[
                              { type: "translation" as const, label: "翻译", icon: PenTool },
                              { type: "quality_check" as const, label: "质检", icon: ClipboardCheck },
                            ].map(item => (
                              <button
                                key={item.type}
                                onClick={(e) => { e.stopPropagation(); handleTaskAssignClick(item.type) }}
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-muted hover:bg-primary/10 hover:text-primary transition-colors border border-border/50"
                                title={`分配${item.label}任务`}
                              >
                                <item.icon className="w-3.5 h-3.5" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-1.5 space-y-0.5">
                      <p className={`text-xs font-medium ${
                        hasAnyAssignment ? "text-green-500" : taskAssignDisabled ? "text-muted-foreground/50" : "text-muted-foreground"
                      }`}>任务分配</p>
                      <div className={`text-xs px-1.5 py-0.5 rounded-full inline-block ${
                        hasAnyAssignment
                          ? "bg-green-500/20 text-green-500"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {hasAnyAssignment ? "已分配" : "待分配"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          } else {
            // 目标语言工作流：人工翻译（进行中/待确认） + 终稿质检
            const tStage = currentVariant?.translationStage || "待开始"
            
            // 人工翻译步骤状态
            const manualTranslateStatus = (() => {
              if (tStage === "待开始") return "pending"
              if (tStage === "人工翻译") return "in_progress"
              if (tStage === "翻译待确认") return "in_progress" // 显示为进行中，标签显示"待确认"
              return "completed" // 终稿质检、质检待确认、已完成 → 人工翻译已完成
            })()
            
            const manualTranslateLabel = tStage === "翻译待确认" ? "待确认" : 
              manualTranslateStatus === "completed" ? "已完成" : 
              manualTranslateStatus === "in_progress" ? "进行中" : "待开始"
            
            // 终稿质检步骤状态
            const qualityCheckStatus = (() => {
              if (tStage === "终稿质检") return "in_progress"
              if (tStage === "质检待确认") return "in_progress"
              if (tStage === "已完成") return "completed"
              return "pending"
            })()
            
            const qualityCheckLabel = tStage === "质检待确认" ? "待确认" :
              qualityCheckStatus === "completed" ? "已完成" :
              qualityCheckStatus === "in_progress" ? "进行中" : "待开始"
            
            // 处理目标语言工作流点击
            const handleTargetWorkflowClick = (stepId: "manual_translate" | "quality_check") => {
              if (!currentVariant) return
              
              if (stepId === "manual_translate") {
                if (tStage === "待开始") {
                  // 开始人工翻译
                  const updated = novelVariants.map(v => 
                    v.id === currentVariant.id ? { ...v, translationStage: "人工翻译" as const } : v
                  )
                  saveVariants(updated)
                } else if (tStage === "人工翻译") {
                  // 进入编辑器
                  handleEnterEditor(currentVariant.id)
                } else if (tStage === "翻译待确认") {
                  // 进入编辑器（审校模式）
                  handleEnterEditor(currentVariant.id)
                }
              } else if (stepId === "quality_check") {
                if (tStage === "终稿质检" || tStage === "质检待确认") {
                  // 进入编辑器（质检模式）
                  handleEnterEditor(currentVariant.id)
                }
              }
            }
            
            return (
              <div className="relative">
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />
                <div className="grid gap-1 relative" style={{ gridTemplateColumns: `repeat(2, minmax(0, 1fr))` }}>
                  {/* 人工翻译 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <button
                        onClick={() => handleTargetWorkflowClick("manual_translate")}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                          manualTranslateStatus === "in_progress"
                            ? "bg-primary/10 border-primary/30 ring-2 ring-primary/30"
                            : manualTranslateStatus === "completed"
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-muted border-border"
                        }`}
                        title={tStage === "待开始" ? "点击开始人工翻译" : "点击进入编辑器"}
                      >
                        {manualTranslateStatus === "completed" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : manualTranslateStatus === "in_progress" ? (
                          <PenTool className="w-5 h-5 text-primary" />
                        ) : (
                          <PenTool className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <div className="mt-1.5 space-y-0.5">
                      <p className={`text-xs font-medium ${
                        manualTranslateStatus === "in_progress"
                          ? tStage === "翻译待确认" ? "text-yellow-600" : "text-primary"
                          : manualTranslateStatus === "completed"
                            ? "text-green-500"
                            : "text-muted-foreground"
                      }`}>人工翻译</p>
                      <div className={`text-xs px-1.5 py-0.5 rounded-full inline-block ${
                        manualTranslateStatus === "in_progress"
                          ? tStage === "翻译待确认" ? "bg-yellow-500/20 text-yellow-600" : "bg-primary/20 text-primary"
                          : manualTranslateStatus === "completed"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {manualTranslateLabel}
                      </div>
                    </div>
                  </div>
                  {/* 终稿质检 */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <button
                        onClick={() => handleTargetWorkflowClick("quality_check")}
                        disabled={qualityCheckStatus === "pending"}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                          qualityCheckStatus === "in_progress"
                            ? "bg-purple-500/10 border-purple-500/30 ring-2 ring-purple-500/30"
                            : qualityCheckStatus === "completed"
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-muted border-border cursor-not-allowed opacity-50"
                        }`}
                        title={qualityCheckStatus === "pending" ? "请先完成人工翻译" : "点击进入质检"}
                      >
                        {qualityCheckStatus === "completed" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : qualityCheckStatus === "in_progress" ? (
                          <ClipboardCheck className="w-5 h-5 text-purple-500" />
                        ) : (
                          <ClipboardCheck className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <div className="mt-1.5 space-y-0.5">
                      <p className={`text-xs font-medium ${
                        qualityCheckStatus === "in_progress"
                          ? tStage === "质检待确认" ? "text-yellow-600" : "text-purple-500"
                          : qualityCheckStatus === "completed"
                            ? "text-green-500"
                            : "text-muted-foreground"
                      }`}>终稿质检</p>
                      <div className={`text-xs px-1.5 py-0.5 rounded-full inline-block ${
                        qualityCheckStatus === "in_progress"
                          ? tStage === "质检待确认" ? "bg-yellow-500/20 text-yellow-600" : "bg-purple-500/20 text-purple-500"
                          : qualityCheckStatus === "completed"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {qualityCheckLabel}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        })()}
      </div>
    </div>

      {/* 文档上传对话框 */}
      {showUploadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">上传文档</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowUploadDialog(false)}>
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">点击或拖拽文件到此处</p>
                <p className="text-xs text-muted-foreground">支持 Word (.doc, .docx) 和 Excel (.xls, .xlsx)</p>
                <Button className="mt-4">
                  选择文件
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border bg-card/50">
                  <FileText className="w-6 h-6 text-blue-500 mb-2" />
                  <p className="text-sm font-medium">Word 文档</p>
                  <p className="text-xs text-muted-foreground">.doc, .docx</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card/50">
                  <Upload className="w-6 h-6 text-green-500 mb-2" />
                  <p className="text-sm font-medium">Excel 文档</p>
                  <p className="text-xs text-muted-foreground">.xls, .xlsx</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                取消
              </Button>
              <Button>
                开始上传
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 术语提取确认对话框 */}
      {showTerminologyDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">术语提取</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowTerminologyDialog(false)}>
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>将自动从所有章节中提取术语并生成术语表，共 {novelVariants[0]?.totalChapters || 50} 章</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">提取完成后，术语表将在文字编辑器的右侧面板中显示。</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowTerminologyDialog(false)}>
                取消
              </Button>
              <Button onClick={handleStartTerminologyExtract}>
                确认提取
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* AI翻译对话框 - 使用短剧模块的AITranslateDialog组件 */}
      <AITranslateDialog
        open={showTranslateDialog || showAITranslate}
        onOpenChange={(open) => { setShowTranslateDialog(open); setShowAITranslate(open) }}
        onSubmit={handleAITranslateSubmit}
        existingLanguageVariants={novelVariants.filter(v => !v.targetLanguage.includes("原语言") && !v.targetLanguage.includes("源语言")).map(v => ({ id: v.id, targetLanguage: v.targetLanguage }))}
      />

      {/* 任务分配对话框 */}
      <TaskAssignDialog
        open={showTaskAssign}
        onOpenChange={setShowTaskAssign}
        onSubmit={handleTaskAssignSubmit}
        totalEpisodes={novelVariants[0]?.totalChapters || 50}
        taskType={taskAssignType}
        languageVariants={novelVariants
          .filter(v => !v.targetLanguage.includes("原语言") && !v.targetLanguage.includes("源语言"))
          .map(v => ({ id: v.id, targetLanguage: v.targetLanguage, totalEpisodes: v.totalChapters }))}
        initialAssignments={confirmedAssignments}
      />

      {/* 批量操作对话框（删除/下载） */}
      <BatchOperationDialog
        open={showBatchDialog}
        onOpenChange={setShowBatchDialog}
        mode={batchMode}
        type="novel"
        languages={novelVariants
          .map(v => ({
            id: v.id,
            label: v.targetLanguage.replace("（原语言）", "").replace("（源语言）", ""),
            isSource: v.targetLanguage.includes("原语言") || v.targetLanguage.includes("源语言"),
          }))}
        totalEpisodesOrChapters={novelVariants[0]?.totalChapters || 50}
        onConfirm={(params) => {
          if (batchMode === "delete") {
            const allFileTypes = params.fileTypes.length === 3
            const allChapters = params.range === "all"
            if (allFileTypes && allChapters) {
              saveVariants(novelVariants.filter(v => !params.languages.includes(v.id)))
            }
          } else {
            // 下载：创建下载队列
            const totalChapters = novelVariants[0]?.totalChapters || 50
            const chRange = params.range === "all"
              ? Array.from({ length: totalChapters }, (_, i) => i + 1)
              : (() => { const r = params.range as {start:number;end:number}; return Array.from({ length: r.end - r.start + 1 }, (_, i) => r.start + i) })()
            const items = params.languages.flatMap(langId => {
              const lang = novelVariants.find(v => v.id === langId)?.targetLanguage || langId
              return chRange.flatMap(ch =>
                params.fileTypes.map(ft => ({
                  id: `dl-${langId}-${ch}-${ft}-${Date.now()}`,
                  name: `${lang} 第${ch}章 ${ft}`,
                  progress: 0,
                  status: "pending" as const,
                }))
              )
            })
            setDownloadQueueItems(items)
            setShowDownloadQueue(true)
            items.forEach(item => simulateDownloadProgress(item.id))
          }
        }}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除选中的 {selectedCards.size} 个语言版本吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            {Array.from(selectedCards).map(id => novelVariants.find(v => v.id === id)?.targetLanguage).filter(Boolean).join("、")}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>取消</Button>
            <Button variant="destructive" onClick={() => {
              saveVariants(novelVariants.filter(v => !selectedCards.has(v.id)))
              setSelectedCards(new Set())
              setShowDeleteConfirm(false)
            }}>确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Download Confirm Dialog */}
      <Dialog open={showDownloadConfirm} onOpenChange={setShowDownloadConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>下载{downloadType}</DialogTitle>
            <DialogDescription>
              确认下载选中语言的{downloadType}文件
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2 text-sm">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">选中语言</span>
              <span className="font-medium">{Array.from(selectedCards).map(id => novelVariants.find(v => v.id === id)?.targetLanguage).filter(Boolean).join("、") || "无"}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">文件类型</span>
              <span className="font-medium">{downloadType}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">文件数量</span>
              <span className="font-medium">{selectedCards.size} 个</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDownloadConfirm(false)}>取消</Button>
            <Button onClick={() => {
              setShowDownloadConfirm(false)
              const items = Array.from(selectedCards).map(id => {
                const lang = novelVariants.find(v => v.id === id)?.targetLanguage || "未知"
                return {
                  id: `dl-${id}-${Date.now()}`,
                  name: `${lang}_${downloadType}.${downloadType === "正文" ? "txt" : "xlsx"}`,
                  progress: 0,
                  status: "pending" as const,
                }
              })
              setDownloadQueueItems(items)
              setShowDownloadQueue(true)
              items.forEach(item => simulateDownloadProgress(item.id))
            }}>确认下载（{selectedCards.size}）</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
