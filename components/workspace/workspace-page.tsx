"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Globe, CheckSquare, Square, Download, Upload, ChevronDown } from "lucide-react"
import { WorkflowSteps } from "./workflow-steps"
import { LanguageVariantCard } from "./language-variant-card"
import { usePermission } from "@/contexts/permission-context"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CompletedWorkflowDialog,
  OverwriteDialog,
  AIExtractOptionsDialog,
  AIExtractSubtitleRegionDialog,
  AIExtractScreenTextDialog,
  AIExtractPreviewDialog,
  AITranslateDialog,
  TaskAssignDialog,
  VideoEraseDialog,
  VideoEraseRegionDialog,
  SubtitleMountDialog,
  VideoCompressDialog,
  SuccessDialog,
} from "./workflow-dialogs"
import { TaskQueueDialog } from "./task-queue-dialog"
import { TranslationTaskQueueDialog, TranslationTask } from "./translation-task-queue-dialog"
import {
  VideoDownloadDialog,
  SubtitleDownloadDialog,
  ConfirmDownloadDialog,
  DownloadQueueDialog,
  UploadFormDialog,
  UploadQueueDialog,
  OverwriteConfirmDialog,
  UploadFormData,
  UploadQueueItem,
} from "./download-upload-dialogs"
import { parseFileName } from "@/lib/upload-utils"
import { calculateCardProgress, calculateCardProgressEnhanced, calculateOverallProgress, getTotalEpisodes } from "@/lib/progress-utils"
import { getLanguageName } from "@/lib/translation-utils"

interface WorkspacePageProps {
  projectId: string | null
  projectTitle: string
  onOpenEditor: (
    projectId: string, 
    languageVariant: string, 
    episodeId: string,
    workflowStage?: "ai_extract_pending" | "ai_extract_review" | "ai_extract_completed" | "ai_translate" | "manual_translate" | "quality_check" | "completed",
    onSubmitReview?: () => void
  ) => void
  onBack: () => void
  projectWorkflowState?: string // 从AppShell传递的项目状态
}

interface LanguageVariant {
  id: string
  targetLanguage: string
  progress: number
  totalEpisodes: number
  completedEpisodes: number
  currentStage: string
  image: string
}

// Mock data - in real app, this would come from props or API
// 项目数据映射 - 支持两种ID格式
const projectDataMap: Record<string, {
  title: string
  image: string
  variants: LanguageVariant[]
}> = {
  // 首页使用的数字ID
  "1": {
    title: "霸道总裁爱上我",
    image: "/drama-posters/badao-zongcai.png",
    variants: [
      {
        id: "0",
        targetLanguage: "中文（源语言）",
        progress: 100,
        totalEpisodes: 80,
        completedEpisodes: 80,
        currentStage: "任务分配",
        image: "/drama-posters/badao-zongcai.png",
      },
      {
        id: "1",
        targetLanguage: "英语",
        progress: 75,
        totalEpisodes: 80,
        completedEpisodes: 60,
        currentStage: "人工翻译",
        image: "/drama-posters/badao-zongcai.png",
      },
      {
        id: "2",
        targetLanguage: "西班牙语",
        progress: 45,
        totalEpisodes: 80,
        completedEpisodes: 36,
        currentStage: "质检审核",
        image: "/drama-posters/badao-zongcai.png",
      },
      {
        id: "3",
        targetLanguage: "葡萄牙语",
        progress: 30,
        totalEpisodes: 80,
        completedEpisodes: 24,
        currentStage: "人工翻译",
        image: "/drama-posters/badao-zongcai.png",
      },
      {
        id: "4",
        targetLanguage: "泰语",
        progress: 90,
        totalEpisodes: 80,
        completedEpisodes: 72,
        currentStage: "视频压制",
        image: "/drama-posters/badao-zongcai.png",
      },
    ],
  },
  "2": {
    title: "穿越之锦绣良缘",
    image: "/drama-posters/chuanyue-jinxiu.png",
    variants: [
      {
        id: "0",
        targetLanguage: "中文（源语言）",
        progress: 100,
        totalEpisodes: 60,
        completedEpisodes: 60,
        currentStage: "任务分配",
        image: "/drama-posters/chuanyue-jinxiu.png",
      },
      {
        id: "1",
        targetLanguage: "西班牙语",
        progress: 100,
        totalEpisodes: 60,
        completedEpisodes: 60,
        currentStage: "视频压制",
        image: "/drama-posters/chuanyue-jinxiu.png",
      },
    ],
  },
  "3": {
    title: "重生之商业帝国",
    image: "/drama-posters/chongsheng-shangye.png",
    variants: [
      {
        id: "0",
        targetLanguage: "中文（源语言）",
        progress: 100,
        totalEpisodes: 100,
        completedEpisodes: 100,
        currentStage: "任务分配",
        image: "/drama-posters/chongsheng-shangye.png",
      },
      {
        id: "1",
        targetLanguage: "葡萄牙语",
        progress: 12,
        totalEpisodes: 100,
        completedEpisodes: 12,
        currentStage: "人工翻译",
        image: "/drama-posters/chongsheng-shangye.png",
      },
    ],
  },
  "4": {
    title: "豪门逆袭记",
    image: "/drama-posters/haomen-nixi.png",
    variants: [
      {
        id: "0",
        targetLanguage: "中文（源语言）",
        progress: 0,
        totalEpisodes: 50,
        completedEpisodes: 0,
        currentStage: "待开始",
        image: "/drama-posters/haomen-nixi.png",
      },
    ],
  },
  "5": {
    title: "这爱你爱婚祥",
    image: "/drama-posters/zhe-aini-aihunxiang.png",
    variants: [
      {
        id: "0",
        targetLanguage: "中文（源语言）",
        progress: 100,
        totalEpisodes: 70,
        completedEpisodes: 70,
        currentStage: "任务分配",
        image: "/drama-posters/zhe-aini-aihunxiang.png",
      },
      {
        id: "1",
        targetLanguage: "印尼语",
        progress: 50,
        totalEpisodes: 70,
        completedEpisodes: 35,
        currentStage: "人工翻译",
        image: "/drama-posters/zhe-aini-aihunxiang.png",
      },
    ],
  },
  "6": {
    title: "龙王赘婿",
    image: "/drama-posters/longwang-zhuxu.png",
    variants: [
      {
        id: "0",
        targetLanguage: "中文（源语言）",
        progress: 100,
        totalEpisodes: 90,
        completedEpisodes: 90,
        currentStage: "任务分配",
        image: "/drama-posters/longwang-zhuxu.png",
      },
      {
        id: "1",
        targetLanguage: "越南语",
        progress: 100,
        totalEpisodes: 90,
        completedEpisodes: 90,
        currentStage: "视频压制",
        image: "/drama-posters/longwang-zhuxu.png",
      },
    ],
  },
  // 短剧管理页面使用的DG格式ID
  "DG001": {
    title: "霸道总裁爱上我",
    image: "/drama-posters/badao-zongcai.png",
    variants: [
      {
        id: "0",
        targetLanguage: "中文（源语言）",
        progress: 100,
        totalEpisodes: 80,
        completedEpisodes: 80,
        currentStage: "任务分配",
        image: "/drama-posters/badao-zongcai.png",
      },
      {
        id: "1",
        targetLanguage: "英语",
        progress: 75,
        totalEpisodes: 80,
        completedEpisodes: 60,
        currentStage: "人工翻译",
        image: "/drama-posters/badao-zongcai.png",
      },
      {
        id: "2",
        targetLanguage: "西班牙语",
        progress: 45,
        totalEpisodes: 80,
        completedEpisodes: 36,
        currentStage: "质检审核",
        image: "/drama-posters/badao-zongcai.png",
      },
      {
        id: "3",
        targetLanguage: "葡萄牙语",
        progress: 30,
        totalEpisodes: 80,
        completedEpisodes: 24,
        currentStage: "人工翻译",
        image: "/drama-posters/badao-zongcai.png",
      },
      {
        id: "4",
        targetLanguage: "泰语",
        progress: 90,
        totalEpisodes: 80,
        completedEpisodes: 72,
        currentStage: "视频压制",
        image: "/drama-posters/badao-zongcai.png",
      },
    ],
  },
  "DG002": {
    title: "穿越之锦绣良缘",
    image: "/drama-posters/chuanyue-jinxiu.png",
    variants: [
      {
        id: "0",
        targetLanguage: "中文（源语言）",
        progress: 100,
        totalEpisodes: 60,
        completedEpisodes: 60,
        currentStage: "任务分配",
        image: "/drama-posters/chuanyue-jinxiu.png",
      },
      {
        id: "1",
        targetLanguage: "西班牙语",
        progress: 100,
        totalEpisodes: 60,
        completedEpisodes: 60,
        currentStage: "视频压制",
        image: "/drama-posters/chuanyue-jinxiu.png",
      },
    ],
  },
  "DG003": {
    title: "重生之商业帝国",
    image: "/drama-posters/chongsheng-shangye.png",
    variants: [
      {
        id: "0",
        targetLanguage: "中文（源语言）",
        progress: 100,
        totalEpisodes: 100,
        completedEpisodes: 100,
        currentStage: "任务分配",
        image: "/drama-posters/chongsheng-shangye.png",
      },
      {
        id: "1",
        targetLanguage: "葡萄牙语",
        progress: 12,
        totalEpisodes: 100,
        completedEpisodes: 12,
        currentStage: "人工翻译",
        image: "/drama-posters/chongsheng-shangye.png",
      },
    ],
  },
  "DG004": {
    title: "豪门逆袭记",
    image: "/drama-posters/haomen-nixi.png",
    variants: [
      {
        id: "0",
        targetLanguage: "中文（源语言）",
        progress: 0,
        totalEpisodes: 50,
        completedEpisodes: 0,
        currentStage: "待开始",
        image: "/drama-posters/haomen-nixi.png",
      },
    ],
  },
  "DG005": {
    title: "甜蜜复仇",
    image: "/drama-posters/zhe-aini-aihunxiang.png",
    variants: [
      {
        id: "0",
        targetLanguage: "中文（源语言）",
        progress: 100,
        totalEpisodes: 70,
        completedEpisodes: 70,
        currentStage: "任务分配",
        image: "/drama-posters/zhe-aini-aihunxiang.png",
      },
      {
        id: "1",
        targetLanguage: "印尼语",
        progress: 50,
        totalEpisodes: 70,
        completedEpisodes: 35,
        currentStage: "人工翻译",
        image: "/drama-posters/zhe-aini-aihunxiang.png",
      },
    ],
  },
  "DG006": {
    title: "都市修仙传",
    image: "/drama-posters/longwang-zhuxu.png",
    variants: [
      {
        id: "0",
        targetLanguage: "中文（源语言）",
        progress: 100,
        totalEpisodes: 120,
        completedEpisodes: 120,
        currentStage: "任务分配",
        image: "/drama-posters/longwang-zhuxu.png",
      },
      {
        id: "1",
        targetLanguage: "越南语",
        progress: 100,
        totalEpisodes: 120,
        completedEpisodes: 120,
        currentStage: "视频压制",
        image: "/drama-posters/longwang-zhuxu.png",
      },
    ],
  },
}

type WorkflowType =
  | "ai_extract"
  | "ai_translate"
  | "task_assign"
  | "manual_translate"
  | "video_erase"
  | "quality_check"
  | "video_compress"

const workflowNames: Record<WorkflowType, string> = {
  ai_extract: "AI提取",
  ai_translate: "AI翻译",
  task_assign: "任务分配",
  manual_translate: "人工翻译",
  video_erase: "视频擦除",
  quality_check: "成片质检",
  video_compress: "视频压制",
}

// 将 currentStage 映射到 workflowStage
// 需要传入 targetLanguage 来区分源语言和翻译语言
const getWorkflowStage = (currentStage: string, targetLanguage?: string): "ai_extract_pending" | "ai_extract_review" | "ai_extract_completed" | "ai_translate" | "manual_translate" | "quality_check" | "completed" => {
  // 判断是否是源语言
  const isSourceLanguage = targetLanguage?.includes("源语言") || targetLanguage?.includes("原语言")
  
  // AI提取三个状态
  if (currentStage === "待开始") return "ai_extract_pending"
  if (currentStage === "AI提取-待确认") return "ai_extract_review"
  if (currentStage === "AI提取-已完成") return "ai_extract_completed"
  
  // 其他状态
  if (currentStage === "视频擦除") return "ai_extract_review" // 视频擦除完成后进入待确认状态
  if (currentStage === "AI翻译") return "ai_translate"
  
  // 任务分配状态：源语言显示为AI提取已完成，翻译语言显示为翻译阶段
  if (currentStage === "任务分配") {
    return isSourceLanguage ? "ai_extract_completed" : "ai_translate"
  }
  
  if (currentStage === "人工翻译") return "manual_translate"
  if (currentStage === "质检审核" || currentStage === "成片质检") return "quality_check"
  if (currentStage === "视频压制") return "completed"
  return "manual_translate" // 默认值
}

export function WorkspacePage({
  projectId,
  projectTitle,
  onOpenEditor,
  onBack,
  projectWorkflowState,
}: WorkspacePageProps) {
  // 根据projectId获取项目数据，如果没有则使用默认数据（项目1）
  // 对于新创建的项目，生成默认的语言变体
  const getProjectData = () => {
    if (projectId && projectDataMap[projectId]) {
      return projectDataMap[projectId]
    }
    
    // 对于新创建的项目，从 localStorage 获取项目信息
    if (typeof window !== 'undefined' && projectId) {
      const savedProjects = localStorage.getItem('drama-projects')
      if (savedProjects) {
        try {
          const projects = JSON.parse(savedProjects)
          const project = projects.find((p: any) => p.id === projectId)
          if (project) {
            // 为新项目生成默认的语言变体（只有源语言）
            return {
              title: project.title,
              image: "/drama-posters/badao-zongcai.png", // 使用默认图片
              variants: [
                {
                  id: "0",
                  targetLanguage: `${project.originalLanguage || "中文"}（源语言）`,
                  progress: 0,
                  totalEpisodes: project.episodes || 1,
                  completedEpisodes: 0,
                  currentStage: "待开始",
                  image: "/drama-posters/badao-zongcai.png",
                },
              ],
            }
          }
        } catch (e) {
          console.error('Failed to parse saved projects:', e)
        }
      }
    }
    
    return projectDataMap["1"]
  }
  
  const projectData = getProjectData()
  const actualProjectTitle = projectData?.title || projectTitle
  const [languageVariants, setLanguageVariants] = useState<LanguageVariant[]>(projectData?.variants || [])
  const { canAccessVariant, hasButton, user } = usePermission()
  
  // 根据权限过滤语言变体
  const visibleVariants = languageVariants.filter(variant => 
    canAccessVariant(projectId || '', variant.targetLanguage)
  )
  
  // 监听从AppShell传递的状态更新
  useEffect(() => {
    if (projectWorkflowState && projectId) {
      setLanguageVariants(prevVariants => 
        prevVariants.map(variant => {
          // 只更新源语言卡片（id为"0"）的状态
          if (variant.id === "0") {
            return {
              ...variant,
              currentStage: projectWorkflowState,
            }
          }
          return variant
        })
      )
    }
  }, [projectWorkflowState, projectId])
  
  // 默认选中源语言卡片（id为"0"的卡片）
  const defaultVariantId = projectData?.variants.find(v => v.id === "0")?.id || null
  const [pinnedVariant, setPinnedVariant] = useState<string | null>(defaultVariantId) // 被固定选中的卡片
  const [selectedVariant, setSelectedVariant] = useState<string | null>(defaultVariantId) // 当前显示的卡片（可能是悬停或固定）
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowType | null>(null)
  const [showWorkflowBar, setShowWorkflowBar] = useState(true) // 默认显示工作流程栏
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [showUploadMenu, setShowUploadMenu] = useState(false)

  // Dialog states
  const [showCompletedDialog, setShowCompletedDialog] = useState(false)
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false)
  const [showAIExtractOptions, setShowAIExtractOptions] = useState(false)
  const [showAIExtractSubtitleRegion, setShowAIExtractSubtitleRegion] = useState(false)
  const [showAIExtractScreenText, setShowAIExtractScreenText] = useState(false)
  const [showAIExtractPreview, setShowAIExtractPreview] = useState(false)
  const [showAITranslate, setShowAITranslate] = useState(false)
  const [showTaskAssign, setShowTaskAssign] = useState(false)
  const [taskAssignType, setTaskAssignType] = useState<"translation" | "quality_check" | "compress">("translation")
  const [confirmedAssignments, setConfirmedAssignments] = useState<{
    translation: Array<{ languageId: string; episodes: number[]; assignee: string }>
    quality_check: Array<{ languageId: string; episodes: number[]; assignee: string }>
    compress: Array<{ languageId: string; episodes: number[]; assignee: string }>
  }>({
    translation: [],
    quality_check: [],
    compress: [],
  })
  const [showVideoErase, setShowVideoErase] = useState(false)
  const [showVideoEraseRegion, setShowVideoEraseRegion] = useState(false) // 视频擦除区域选择对话框
  const [showSubtitleMount, setShowSubtitleMount] = useState(false)
  const [showVideoCompress, setShowVideoCompress] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [pendingWorkflow, setPendingWorkflow] = useState<WorkflowType | null>(null)
  const [showTaskQueue, setShowTaskQueue] = useState(false)
  
  // AI翻译相关状态
  const [aiTranslateStatus, setAITranslateStatus] = useState<"not_started" | "in_progress" | "completed">("not_started")
  const [translationTasks, setTranslationTasks] = useState<TranslationTask[]>([])
  const [showTranslationQueue, setShowTranslationQueue] = useState(false)
  
  // 下载和上传对话框状态
  const [showVideoDownload, setShowVideoDownload] = useState(false)
  const [showSubtitleDownload, setShowSubtitleDownload] = useState(false)
  const [showConfirmDownload, setShowConfirmDownload] = useState(false)
  const [confirmDownloadType, setConfirmDownloadType] = useState<"画面字" | "术语表">("画面字")
  const [showDownloadQueue, setShowDownloadQueue] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadType, setUploadType] = useState<"视频" | "字幕" | "画面字" | "术语表">("视频")
  const [showUploadQueue, setShowUploadQueue] = useState(false)
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false)
  const [pendingUploadData, setPendingUploadData] = useState<UploadFormData | null>(null)
  const [conflictFiles, setConflictFiles] = useState<Array<{
    fileName: string
    language: string
    episode?: number
    type?: string
  }>>([])
  const [downloadQueueItems, setDownloadQueueItems] = useState<Array<{
    id: string
    name: string
    progress: number
    status: "pending" | "downloading" | "completed" | "error"
  }>>([])
  const [uploadQueueItems, setUploadQueueItems] = useState<UploadQueueItem[]>([])
  
  // AI提取框选区域状态
  const [subtitleRegion, setSubtitleRegion] = useState({ x: 50, y: 400, width: 540, height: 80 })
  
  // 视频擦除框选区域状态（默认使用AI提取的字幕区域）
  const [videoEraseRegion, setVideoEraseRegion] = useState({ x: 50, y: 400, width: 540, height: 80 })
  
  // 独立的视频擦除状态追踪（不影响currentStage）
  const [videoEraseStatus, setVideoEraseStatus] = useState<"not_started" | "in_progress" | "completed">("not_started")

  // Calculate overall progress
  const totalEpisodes = getTotalEpisodes(languageVariants)
  const overallProgress = calculateOverallProgress(languageVariants)

  const handleOpenVariant = (variantId: string) => {
    if (selectionMode) {
      // 在选择模式下，切换选中状态
      const newSelected = new Set(selectedCards)
      if (newSelected.has(variantId)) {
        newSelected.delete(variantId)
      } else {
        newSelected.add(variantId)
      }
      setSelectedCards(newSelected)
      return
    }

    // 正常模式：点击卡片固定选中状态
    if (pinnedVariant === variantId) {
      // 如果点击已固定选中的卡片，则取消固定
      setPinnedVariant(null)
      setSelectedVariant(null)
      setShowWorkflowBar(false)
    } else {
      // 固定选中新卡片
      setPinnedVariant(variantId)
      setSelectedVariant(variantId)
      setShowWorkflowBar(true)
    }
  }

  const handleCardHover = (variantId: string) => {
    // 已禁用：鼠标悬浮不再切换工作流栏，只有点击才会切换
    // if (!selectionMode) {
    //   setSelectedVariant(variantId)
    //   setShowWorkflowBar(true)
    // }
  }

  const handleGridLeave = () => {
    // 已禁用：鼠标离开不再恢复工作流栏，只有点击才会切换
    // if (!selectionMode) {
    //   if (pinnedVariant) {
    //     setSelectedVariant(pinnedVariant)
    //     setShowWorkflowBar(true)
    //   } else {
    //     setSelectedVariant(null)
    //     setShowWorkflowBar(false)
    //   }
    // }
  }

  const handleCardClick = (variantId: string) => {
    const variant = languageVariants.find((v) => v.id === variantId)
    if (variant && projectId && !selectionMode) {
      // 打开编辑器，传递对应的工作流程阶段
      const stage = getWorkflowStage(variant.currentStage, variant.targetLanguage)
      
      // 创建提交审核的回调函数
      const handleSubmitReview = () => {
        // 更新该语言变体的状态为"待确认"
        setLanguageVariants(prevVariants =>
          prevVariants.map(v => {
            if (v.id === variantId) {
              // 人工翻译完成后变为"翻译待确认"状态
              // 质检完成后变为"质检待确认"状态
              let newStage = v.currentStage
              if (v.currentStage === "人工翻译") {
                newStage = "翻译待确认"
              } else if (v.currentStage === "质检审核") {
                newStage = "质检待确认"
              }
              return {
                ...v,
                currentStage: newStage,
              }
            }
            return v
          })
        )
      }
      
      // 传递回调给编辑器
      onOpenEditor(projectId, variant.targetLanguage, "1", stage, handleSubmitReview)
    }
  }

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    if (selectionMode) {
      setSelectedCards(new Set())
    }
  }

  const toggleSelectAll = () => {
    if (selectedCards.size === languageVariants.length) {
      setSelectedCards(new Set())
    } else {
      setSelectedCards(new Set(languageVariants.map(v => v.id)))
    }
  }

  const handleDownloadOption = (option: string) => {
    setShowDownloadMenu(false)
    
    switch (option) {
      case "视频":
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
    
    // 打开上传表单对话框
    setUploadType(option as "视频" | "字幕" | "画面字" | "术语表")
    setShowUploadForm(true)
  }
  
  // 处理上传表单提交
  const handleUploadFormSubmit = (data: UploadFormData) => {
    try {
      // 解析所有文件名
      const parsedFiles = data.files.map(file => ({
        file,
        parsed: parseFileName(file.name, data.uploadType)
      }))
      
      // 检查是否有解析失败的文件
      const invalidFiles = parsedFiles.filter(pf => !pf.parsed.isValid)
      if (invalidFiles.length > 0) {
        console.error("文件名格式错误:", invalidFiles.map(f => ({
          name: f.file.name,
          error: f.parsed.error
        })))
        // TODO: 显示错误提示给用户
        return
      }
      
      // 检查是否有冲突（已存在的文件）
      const conflicts: Array<{
        fileName: string
        language: string
        episode?: number
        type?: string
      }> = []
      
      parsedFiles.forEach(({ file, parsed }) => {
        // 检查是否已存在该语言的卡片
        const existingVariant = languageVariants.find(v => 
          v.targetLanguage === parsed.language || 
          v.targetLanguage === `${parsed.language}（源语言）`
        )
        
        if (existingVariant && parsed.episode) {
          // 所有类型都检查集数是否已存在
          if (parsed.episode <= existingVariant.totalEpisodes) {
            conflicts.push({
              fileName: file.name,
              language: parsed.language,
              episode: parsed.episode,
              type: parsed.type,
            })
          }
        }
      })
      
      // 如果有冲突，显示确认对话框
      if (conflicts.length > 0) {
        setConflictFiles(conflicts)
        setPendingUploadData(data)
        setShowOverwriteConfirm(true)
        return
      }
      
      // 没有冲突，直接开始上传
      startUpload(data)
    } catch (error) {
      console.error("处理上传失败:", error)
    }
  }
  
  // 确认覆盖后开始上传
  const handleOverwriteConfirm = () => {
    if (pendingUploadData) {
      startUpload(pendingUploadData)
      setPendingUploadData(null)
      setConflictFiles([])
    }
  }
  
  // 开始上传
  const startUpload = (data: UploadFormData) => {
    const newItems: UploadQueueItem[] = []
    
    data.files.forEach(file => {
      const parsed = parseFileName(file.name, data.uploadType)
      
      if (!parsed.isValid) return
      
      // 所有类型都有集数
      if (parsed.episode) {
        newItems.push({
          id: `upload-${Date.now()}-${Math.random()}`,
          projectTitle: actualProjectTitle,
          languageVariant: parsed.language,
          episodeNumber: parsed.episode,
          uploadType: data.uploadType + (data.videoType ? `(${getVideoTypeName(data.videoType)})` : ""),
          fileName: file.name,
          fileSize: file.size,
          progress: 0,
          status: "pending"
        })
      }
    })
    
    setUploadQueueItems(newItems)
    setShowUploadQueue(true)
    
    // 开始上传第一个任务
    if (newItems.length > 0) {
      simulateUploadProgress(newItems[0].id)
    }
  }
  
  // 获取视频类型名称
  const getVideoTypeName = (type: string) => {
    const names: Record<string, string> = {
      source: "原视频",
      erased: "擦除视频",
      onscreen_text: "画面字压制视频",
      final: "成片视频",
    }
    return names[type] || type
  }
  
  // 处理上传重试
  const handleRetryUpload = (itemId: string) => {
    setUploadQueueItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, progress: 0, status: "pending" as const, errorMessage: undefined }
          : item
      )
    )
    simulateUploadProgress(itemId)
  }
  
  // 处理视频下载确认
  const handleVideoDownloadConfirm = (selectedTypes: string[]) => {
    const items = selectedTypes.map(type => ({
      id: `video-${type}-${Date.now()}`,
      name: `${getVideoTypeName(type)} - ${Array.from(selectedCards).length}个项目`,
      progress: 0,
      status: "pending" as const,
    }))
    
    setDownloadQueueItems(items)
    setShowDownloadQueue(true)
    
    // 模拟下载进度
    items.forEach(item => simulateDownloadProgress(item.id))
    
    // 下载完成后取消选择
    setTimeout(() => {
      setSelectionMode(false)
      setSelectedCards(new Set())
    }, 3000)
  }
  
  // 处理字幕下载确认
  const handleSubtitleDownloadConfirm = (selectedLanguages: string[]) => {
    const items = selectedLanguages.map(lang => ({
      id: `subtitle-${lang}-${Date.now()}`,
      name: `${lang}字幕 - ${Array.from(selectedCards).length}个项目`,
      progress: 0,
      status: "pending" as const,
    }))
    
    setDownloadQueueItems(items)
    setShowDownloadQueue(true)
    
    // 模拟下载进度
    items.forEach(item => simulateDownloadProgress(item.id))
    
    // 下载完成后取消选择
    setTimeout(() => {
      setSelectionMode(false)
      setSelectedCards(new Set())
    }, 3000)
  }
  
  // 处理确认下载（画面字和术语表）
  const handleConfirmDownloadSubmit = () => {
    const item = {
      id: `${confirmDownloadType}-${Date.now()}`,
      name: `${confirmDownloadType} - ${Array.from(selectedCards).length}个项目`,
      progress: 0,
      status: "pending" as const,
    }
    
    setDownloadQueueItems([item])
    setShowDownloadQueue(true)
    
    // 模拟下载进度
    simulateDownloadProgress(item.id)
    
    // 下载完成后取消选择
    setTimeout(() => {
      setSelectionMode(false)
      setSelectedCards(new Set())
    }, 3000)
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
              ? { ...item, progress: 100, status: "completed" as const }
              : item
          )
        )
      } else {
        setDownloadQueueItems(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { ...item, progress: Math.floor(progress), status: "downloading" as const }
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
            // 所有任务完成，退出选择模式
            const allCompleted = updated.every(item => item.status === "completed")
            if (allCompleted) {
              setTimeout(() => {
                setSelectionMode(false)
                setSelectedCards(new Set())
              }, 1000)
            }
          }
          
          return updated
        })
      } else {
        setUploadQueueItems(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { ...item, progress: Math.floor(progress), status: "uploading" as const }
              : item
          )
        )
      }
    }, 500)
  }

  const handleWorkflowClick = (workflowId: WorkflowType, isCompleted: boolean) => {
    // 任务分配不再直接打开对话框，而是通过悬浮菜单选择任务类型
    if (workflowId === "task_assign") {
      return
    }

    // AI翻译特殊处理：根据状态显示不同对话框
    if (workflowId === "ai_translate") {
      if (aiTranslateStatus === "not_started") {
        setShowAITranslate(true)
      } else if (aiTranslateStatus === "in_progress") {
        setShowTranslationQueue(true)
      } else if (aiTranslateStatus === "completed") {
        setPendingWorkflow(workflowId)
        setShowCompletedDialog(true)
      }
      return
    }

    // 视频擦除特殊处理：根据独立的视频擦除状态显示不同对话框
    if (workflowId === "video_erase") {
      if (videoEraseStatus === "completed") {
        // 已完成状态：显示已完成对话框
        setPendingWorkflow(workflowId)
        setShowCompletedDialog(true)
        return
      }
      // 未开始或进行中状态：显示区域选择对话框
      activateWorkflow(workflowId)
      return
    }

    if (isCompleted) {
      setPendingWorkflow(workflowId)
      setShowCompletedDialog(true)
      return
    }

    activateWorkflow(workflowId)
  }

  const handleTaskAssignClick = (taskType: "translation" | "quality_check" | "compress") => {
    setTaskAssignType(taskType)
    setShowTaskAssign(true)
  }

  const handleViewDetails = () => {
    setShowCompletedDialog(false)
    
    // 如果是AI提取或视频擦除，跳转到编辑器
    if (projectId && languageVariants.length > 0) {
      const variant = languageVariants[0]
      const stage = getWorkflowStage(variant.currentStage, variant.targetLanguage)
      
      if (pendingWorkflow === "ai_extract" || pendingWorkflow === "video_erase") {
        onOpenEditor(projectId, variant.targetLanguage, "1", stage)
      }
    }
  }

  const handleRecreate = () => {
    setShowCompletedDialog(false)
    setShowOverwriteDialog(true)
  }

  const handleOverwriteChoice = (overwrite: boolean) => {
    setShowOverwriteDialog(false)
    if (pendingWorkflow) {
      activateWorkflow(pendingWorkflow)
    }
  }

  // AI翻译处理函数
  const handleAITranslateSubmit = (languageCodes: string[]) => {
    // 获取源语言卡片
    const sourceVariant = languageVariants.find(v => v.id === "0")
    if (!sourceVariant) return
    
    // 创建新的语言卡片
    const newVariants: LanguageVariant[] = languageCodes.map((code, index) => ({
      id: `${languageVariants.length + index}`,
      targetLanguage: getLanguageName(code),
      progress: 0,
      totalEpisodes: sourceVariant.totalEpisodes,
      completedEpisodes: 0,
      currentStage: "人工翻译",
      image: sourceVariant.image,
    }))
    
    // 更新语言卡片列表
    setLanguageVariants(prev => [...prev, ...newVariants])
    
    // 生成翻译任务
    const tasks: TranslationTask[] = []
    languageCodes.forEach(code => {
      for (let ep = 1; ep <= sourceVariant.totalEpisodes; ep++) {
        tasks.push({
          id: `${code}-${ep}`,
          language: getLanguageName(code),
          languageCode: code,
          episode: ep,
          status: "waiting",
          progress: 0,
        })
      }
    })
    
    setTranslationTasks(tasks)
    setAITranslateStatus("in_progress")
    setShowAITranslate(false)  // 关闭AI翻译设置对话框
    setShowTranslationQueue(true)  // 打开任务队列对话框
    
    // 更新源语言卡片状态
    setLanguageVariants(prev =>
      prev.map(v =>
        v.id === "0"
          ? { ...v, currentStage: "AI翻译-进行中" }
          : v
      )
    )
  }

  const handleTranslationComplete = () => {
    setAITranslateStatus("completed")
    
    // 更新源语言卡片状态为已完成
    setLanguageVariants(prev =>
      prev.map(v =>
        v.id === "0"
          ? { ...v, currentStage: "AI翻译-已完成" }
          : v
      )
    )
  }

  const activateWorkflow = (workflowId: WorkflowType) => {
    setActiveWorkflow(workflowId)
    
    // Show workflow-specific dialog
    switch (workflowId) {
      case "ai_extract":
        // 直接显示字幕框选对话框，跳过设置步骤
        setShowAIExtractSubtitleRegion(true)
        break
      case "ai_translate":
        setShowAITranslate(true)
        break
      case "manual_translate":
        // Open editor directly for manual translation
        if (projectId && selectedVariant) {
          const variant = languageVariants.find(v => v.id === selectedVariant)
          if (variant) {
            const stage = getWorkflowStage(variant.currentStage, variant.targetLanguage)
            onOpenEditor(projectId, variant.targetLanguage, "1", stage)
          }
        }
        break
      case "video_erase":
        // 显示视频擦除区域选择对话框（默认使用AI提取的字幕区域）
        setVideoEraseRegion(subtitleRegion)
        setShowVideoEraseRegion(true)
        break
      case "quality_check":
        // Open editor directly for quality check
        if (projectId && selectedVariant) {
          const variant = languageVariants.find(v => v.id === selectedVariant)
          if (variant) {
            const stage = getWorkflowStage(variant.currentStage, variant.targetLanguage)
            onOpenEditor(projectId, variant.targetLanguage, "1", stage)
          }
        }
        break
      case "video_compress":
        setShowVideoCompress(true)
        break
    }
  }

  const handleTaskSubmit = (assignments?: Array<{
    languageId: string
    episodes: number[]
    assignee: string
  }>) => {
    // 如果是任务分配（传递了assignments参数且当前工作流不是ai_extract或video_erase）
    if (assignments !== undefined && activeWorkflow !== "ai_extract" && activeWorkflow !== "video_erase") {
      // 根据任务类型保存分配
      setConfirmedAssignments(prev => ({
        ...prev,
        [taskAssignType]: assignments
      }))
      setShowTaskAssign(false)
      
      // 任务分配完成，但不改变语言卡片的currentStage
      // 只需要关闭对话框和保存分配数据即可
      
      setActiveWorkflow(null)
      return
    }
    
    // 如果是AI提取任务，显示任务队列对话框
    if (activeWorkflow === "ai_extract") {
      setShowAIExtractSubtitleRegion(false)
      setShowAIExtractScreenText(false)
      
      // 更新状态为"AI提取-进行中"
      setLanguageVariants(prevVariants => 
        prevVariants.map(variant => {
          if (variant.id === "0" && variant.currentStage === "待开始") {
            return {
              ...variant,
              currentStage: "AI提取-进行中",
            }
          }
          return variant
        })
      )
      
      setShowTaskQueue(true)
      return
    }
    
    // 如果是视频擦除任务，显示任务队列对话框
    if (activeWorkflow === "video_erase") {
      setShowVideoEraseRegion(false)
      
      // 更新独立的视频擦除状态为"进行中"
      // 不改变currentStage，保持AI提取等其他任务的状态
      setVideoEraseStatus("in_progress")
      
      setShowTaskQueue(true)
      return
    }
    
    // 其他任务直接显示成功对话框
    setShowAIExtractOptions(false)
    setShowAIExtractSubtitleRegion(false)
    setShowAIExtractScreenText(false)
    setShowAIExtractPreview(false)
    setShowAITranslate(false)
    setShowTaskAssign(false)
    setShowVideoErase(false)
    setShowVideoEraseRegion(false)
    setShowSubtitleMount(false)
    setShowVideoCompress(false)
    setShowSuccess(true)
    setActiveWorkflow(null)
  }
  
  const handleTaskQueueComplete = () => {
    // 任务队列完成后，更新项目状态
    const currentWorkflow = activeWorkflow
    setActiveWorkflow(null)
    
    // 如果是视频擦除任务完成，直接更新为"已完成"状态
    if (currentWorkflow === "video_erase") {
      setVideoEraseStatus("completed")
      return
    }
    
    // 更新语言变体的状态（仅用于AI提取等主流程任务）
    setLanguageVariants(prevVariants => 
      prevVariants.map(variant => {
        // 只更新源语言卡片（id为"0"）的状态
        if (variant.id === "0") {
          // AI提取：从"进行中"变为"待确认"
          if (variant.currentStage === "AI提取-进行中") {
            return {
              ...variant,
              currentStage: "AI提取-待确认",
            }
          }
        }
        return variant
      })
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Scrollable Content Area - 70% */}
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
          <span className="text-foreground font-medium">{actualProjectTitle}</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{actualProjectTitle}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {languageVariants.length} 个语言变体 · {totalEpisodes} 集
            </p>
          </div>
          
          {/* 总体进度条 */}
          <div className="flex items-center gap-3 mr-4">
            <span className="text-sm text-muted-foreground whitespace-nowrap">总体进度</span>
            <Progress value={overallProgress} className="h-2 w-48" />
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              共 {totalEpisodes} 集 ({overallProgress}%)
            </span>
          </div>
          
          {/* 选择、上传、下载按钮 */}
          <TooltipProvider>
            <div className="flex items-center gap-2">
              {selectionMode && hasButton('batch_select') && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                      className="gap-2"
                    >
                      {selectedCards.size === languageVariants.length ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      全选
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>默认除原语言以外其他全选</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {hasButton('batch_select') && (
                <Button
                  variant={selectionMode ? "default" : "outline"}
                  size="sm"
                  onClick={toggleSelectionMode}
                >
                  {selectionMode ? "取消选择" : "选择"}
                </Button>
              )}

              {/* 上传菜单 */}
              {hasButton('upload') && (
                <DropdownMenu open={showUploadMenu} onOpenChange={setShowUploadMenu}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="w-4 h-4" />
                      上传
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleUploadOption("视频")}>
                      视频
                    </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUploadOption("字幕")}>
                    字幕
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUploadOption("画面字")}>
                    画面字
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUploadOption("术语表")}>
                    术语表
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              )}

              {/* 下载菜单 */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DropdownMenu open={showDownloadMenu} onOpenChange={setShowDownloadMenu}>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          disabled={selectedCards.size === 0}
                        >
                          <Download className={`w-4 h-4 ${selectedCards.size === 0 ? 'text-muted-foreground' : ''}`} />
                          下载
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownloadOption("视频")}>
                          视频
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadOption("字幕")}>
                          字幕
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadOption("画面字")}>
                          画面字
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadOption("术语表")}>
                          术语表
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TooltipTrigger>
                {selectedCards.size === 0 && (
                  <TooltipContent>
                    <p>请选择短剧</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {/* Language Variant Grid - 一行6个 */}
        <div 
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3"
        >
          {visibleVariants.map((variant) => (
            <div 
              key={variant.id} 
              className="relative"
            >
              {selectionMode && (
                <div className="absolute top-2 left-2 z-10">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="w-6 h-6 rounded"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenVariant(variant.id)
                    }}
                  >
                    {selectedCards.has(variant.id) ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
              <LanguageVariantCard
                targetLanguage={variant.targetLanguage}
                progress={calculateCardProgressEnhanced(
                  variant.targetLanguage, 
                  variant.currentStage,
                  variant.completedEpisodes,
                  variant.totalEpisodes
                )}
                totalEpisodes={variant.totalEpisodes}
                completedEpisodes={variant.completedEpisodes}
                currentStage={variant.currentStage}
                image={variant.image}
                onClick={() => handleOpenVariant(variant.id)}
                onDoubleClick={() => handleCardClick(variant.id)}
                onEnterEditor={() => handleCardClick(variant.id)}
                isSelected={selectedVariant === variant.id && !selectionMode}
                isPinned={pinnedVariant === variant.id && !selectionMode}
                className="language-variant-card"
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {languageVariants.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">暂无语言变体</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              请在项目设置中添加目标语言，或创建新项目时选择多个目标语言
            </p>
          </div>
        )}
      </div>

      {/* Collapsible Workflow Bar - 平滑滑入滑出 */}
      <div 
        className={`shrink-0 border-t border-border bg-card transition-all duration-300 ease-in-out ${
          showWorkflowBar && selectedVariant !== null 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-end mb-3">
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

          <WorkflowSteps 
            onWorkflowClick={handleWorkflowClick}
            onTaskAssignClick={handleTaskAssignClick}
            selectedVariant={languageVariants.find(v => v.id === selectedVariant)}
            videoEraseStatus={videoEraseStatus}
            translationAssignments={confirmedAssignments.translation}
            qualityCheckAssignments={confirmedAssignments.quality_check}
            compressAssignments={confirmedAssignments.compress}
          />
        </div>
      </div>

      {/* Completed Workflow Dialog */}
      <CompletedWorkflowDialog
        open={showCompletedDialog}
        onOpenChange={setShowCompletedDialog}
        workflowName={pendingWorkflow ? workflowNames[pendingWorkflow] : ""}
        onViewDetails={handleViewDetails}
        onRecreate={handleRecreate}
      />

      {/* Overwrite Dialog */}
      <OverwriteDialog
        open={showOverwriteDialog}
        onOpenChange={setShowOverwriteDialog}
        onConfirm={handleOverwriteChoice}
      />

      {/* AI Extract Options */}
      <AIExtractOptionsDialog
        open={showAIExtractOptions}
        onOpenChange={setShowAIExtractOptions}
        onNext={() => {
          setShowAIExtractOptions(false)
          setShowAIExtractSubtitleRegion(true)
        }}
      />

      {/* AI Extract Subtitle Region - 第一步，不需要上一步按钮 */}
      <AIExtractSubtitleRegionDialog
        open={showAIExtractSubtitleRegion}
        onOpenChange={setShowAIExtractSubtitleRegion}
        region={subtitleRegion}
        onRegionChange={setSubtitleRegion}
        onNext={() => {
          setShowAIExtractSubtitleRegion(false)
          setShowAIExtractScreenText(true)
        }}
      />

      {/* AI Extract Screen Text */}
      <AIExtractScreenTextDialog
        open={showAIExtractScreenText}
        onOpenChange={setShowAIExtractScreenText}
        subtitleRegion={subtitleRegion}
        onSubmit={handleTaskSubmit}
        onBack={() => {
          setShowAIExtractScreenText(false)
          setShowAIExtractSubtitleRegion(true)
        }}
      />

      {/* AI Extract Preview (保留用于向后兼容) */}
      <AIExtractPreviewDialog
        open={showAIExtractPreview}
        onOpenChange={setShowAIExtractPreview}
        onSubmit={handleTaskSubmit}
        onBack={() => {
          setShowAIExtractPreview(false)
          setShowAIExtractOptions(true)
        }}
      />

      {/* AI Translate */}
      <AITranslateDialog
        open={showAITranslate}
        onOpenChange={setShowAITranslate}
        onSubmit={handleAITranslateSubmit}
      />

      {/* Translation Task Queue */}
      <TranslationTaskQueueDialog
        open={showTranslationQueue}
        onOpenChange={setShowTranslationQueue}
        tasks={translationTasks}
        onTasksUpdate={setTranslationTasks}
        onComplete={handleTranslationComplete}
      />

      {/* Task Assign */}
      <TaskAssignDialog
        open={showTaskAssign}
        onOpenChange={setShowTaskAssign}
        onSubmit={handleTaskSubmit}
        totalEpisodes={totalEpisodes}
        taskType={taskAssignType}
        languageVariants={languageVariants}
        initialAssignments={confirmedAssignments[taskAssignType]}
      />

      {/* Video Erase Region Selection */}
      <VideoEraseRegionDialog
        open={showVideoEraseRegion}
        onOpenChange={setShowVideoEraseRegion}
        region={videoEraseRegion}
        onRegionChange={setVideoEraseRegion}
        onSubmit={handleTaskSubmit}
      />
      
      {/* Video Erase (旧的，保留用于向后兼容) */}
      <VideoEraseDialog
        open={showVideoErase}
        onOpenChange={setShowVideoErase}
        onSubmit={handleTaskSubmit}
      />

      {/* Subtitle Mount */}
      <SubtitleMountDialog
        open={showSubtitleMount}
        onOpenChange={setShowSubtitleMount}
        onSubmit={handleTaskSubmit}
      />

      {/* Video Compress */}
      <VideoCompressDialog
        open={showVideoCompress}
        onOpenChange={setShowVideoCompress}
        onSubmit={handleTaskSubmit}
      />

      {/* Success Dialog */}
      <SuccessDialog open={showSuccess} onOpenChange={setShowSuccess} />
      
      {/* Task Queue Dialog */}
      <TaskQueueDialog
        open={showTaskQueue}
        onOpenChange={setShowTaskQueue}
        totalEpisodes={languageVariants.find(v => v.id === selectedVariant)?.totalEpisodes || 80}
        onComplete={handleTaskQueueComplete}
      />
      
      {/* Download Dialogs */}
      <VideoDownloadDialog
        open={showVideoDownload}
        onOpenChange={setShowVideoDownload}
        onConfirm={handleVideoDownloadConfirm}
      />
      
      <SubtitleDownloadDialog
        open={showSubtitleDownload}
        onOpenChange={setShowSubtitleDownload}
        onConfirm={handleSubtitleDownloadConfirm}
        availableLanguages={languageVariants.map(v => v.targetLanguage)}
      />
      
      <ConfirmDownloadDialog
        open={showConfirmDownload}
        onOpenChange={setShowConfirmDownload}
        onConfirm={handleConfirmDownloadSubmit}
        title={`${confirmDownloadType}下载`}
        description={`确认下载选中项目的${confirmDownloadType}吗？`}
      />
      
      <DownloadQueueDialog
        open={showDownloadQueue}
        onOpenChange={setShowDownloadQueue}
        items={downloadQueueItems}
      />
      
      {/* Upload Form Dialog */}
      <UploadFormDialog
        open={showUploadForm}
        onOpenChange={setShowUploadForm}
        uploadType={uploadType}
        projectTitle={actualProjectTitle}
        onSubmit={handleUploadFormSubmit}
      />
      
      {/* Overwrite Confirm Dialog */}
      <OverwriteConfirmDialog
        open={showOverwriteConfirm}
        onOpenChange={setShowOverwriteConfirm}
        onConfirm={handleOverwriteConfirm}
        conflictFiles={conflictFiles}
      />
      
      <UploadQueueDialog
        open={showUploadQueue}
        onOpenChange={setShowUploadQueue}
        items={uploadQueueItems}
        onRetry={handleRetryUpload}
      />
    </div>
  )
}
