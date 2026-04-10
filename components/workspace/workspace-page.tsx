"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  ArrowLeft,
  Globe,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ListTodo,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  Trash2,
  Languages,
  UserCheck,
  ClipboardCheck,
  Film,
  FolderOpen,
  Search,
  Replace,
  X,
} from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { cn } from "@/lib/utils"
import { parseFileName } from "@/lib/upload-utils"
import { calculateCardProgress, calculateCardProgressEnhanced, calculateOverallProgress, getTotalEpisodes } from "@/lib/progress-utils"
import { getLanguageName, getLanguageCode } from "@/lib/translation-utils"
import { videoStorage } from "@/lib/video-storage"
import { BatchOperationDialog } from "./batch-operation-dialog"
import { FileBrowserPage } from "./file-browser-page"

interface WorkspacePageProps {
  projectId: string | null
  projectTitle: string
  onOpenEditor: (
    projectId: string,
    languageVariant: string,
    episodeId: string,
    workflowStage?: "ai_extract_pending" | "ai_extract_review" | "ai_extract_completed" | "ai_translate" | "manual_translate" | "quality_check" | "completed",
    onSubmitReview?: (action?: "submit" | "approve" | "reject") => void,
    videoUrl?: string // 添加视频URL参数
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
  currentRound?: number // 当前轮次，默认为1
  fontAdjustCompleted?: boolean // 字体调整是否已完成过（用于成片质检驳回后跳过字体调整）
}

// Mock data - in real app, this would come from props or API
// 项目数据映射 - 支持两种ID格式
const projectDataMap: Record<string, {
  title: string
  image: string
  variants: LanguageVariant[]
  videos?: Array<{
    id: string
    name: string
    size: number
    thumbnailUrl: string
    duration: number
    url?: string
  }>
}> = {
  // 首页使用的数字ID（保持兼容）
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
        currentRound: 2, // 第2轮（被驳回过1次）
      },
      {
        id: "3",
        targetLanguage: "葡萄牙语",
        progress: 30,
        totalEpisodes: 80,
        completedEpisodes: 24,
        currentStage: "人工翻译",
        image: "/drama-posters/badao-zongcai.png",
        currentRound: 3, // 第3轮（被驳回过2次）
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
  // 新格式的DJ+年月日+当日序号ID
  "DJ24010101": {
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
  "DJ23120101": {
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
  "DJ24011001": {
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
  "DJ24011401": {
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
  "DJ24010501": {
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
  "DJ23110101": {
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
  | "font_adjust"
  | "video_erase"
  | "quality_check"
  | "video_compress"

const workflowNames: Record<WorkflowType, string> = {
  ai_extract: "AI提取",
  ai_translate: "AI翻译",
  task_assign: "任务分配",
  manual_translate: "人工翻译",
  font_adjust: "字体调整",
  video_erase: "视频擦除",
  quality_check: "成片质检",
  video_compress: "视频压制",
}

// 将 currentStage 映射到 workflowStage
// 需要传入 targetLanguage 来区分源语言和翻译语言
const getWorkflowStage = (currentStage: string, targetLanguage?: string): "ai_extract_pending" | "ai_extract_review" | "ai_extract_completed" | "ai_translate" | "manual_translate" | "quality_check" | "completed" => {
  // 判断是否是源语言
  const isSourceLanguage = targetLanguage?.includes("源语言") || targetLanguage?.includes("原语言")
  
  // AI提取三个状态 — 只有源语言才走AI提取流程
  // 翻译语言的"待开始"应该进入人工翻译阶段
  if (currentStage === "待开始") {
    return isSourceLanguage ? "ai_extract_pending" : "manual_translate"
  }
  if (currentStage === "AI提取-进行中") return "ai_extract_pending"
  if (currentStage === "AI提取-待确认") return "ai_extract_review"
  if (currentStage === "AI提取-已完成") return "ai_extract_completed"
  
  // 视频擦除状态 - 视频擦除是独立流程，不影响主工作流阶段
  if (currentStage === "视频擦除") return "ai_extract_completed"
  if (currentStage === "视频擦除-进行中") return "ai_extract_completed"
  if (currentStage === "视频擦除-已完成") return "ai_extract_completed"
  
  // 翻译相关状态
  if (currentStage === "AI翻译") return "ai_translate"
  if (currentStage === "AI翻译-进行中") return "ai_translate"
  if (currentStage === "AI翻译-待确认") return "ai_translate"
  if (currentStage === "AI翻译-已完成") return "ai_extract_completed"
  
  // 任务分配状态：源语言显示为AI提取已完成，翻译语言显示为翻译阶段
  if (currentStage === "任务分配") {
    return isSourceLanguage ? "ai_extract_completed" : "ai_translate"
  }
  
  // 其他状态
  if (currentStage === "人工翻译") return "manual_translate"
  if (currentStage === "翻译待确认") return "quality_check" // 审校环节，编辑器样式类似成片质检
  if (currentStage === "字体调整") return "manual_translate" // 字体调整环节使用翻译编辑器
  if (currentStage === "字体调整-待确认") return "quality_check"
  if (currentStage === "质检审核" || currentStage === "成片质检") return "quality_check"
  if (currentStage === "质检待确认") return "quality_check"
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
    try {
      // 首先检查是否是默认演示项目，并使用对应的数字ID
      if (projectId) {
        // 映射 DJ 格式的项目ID到数字ID
        const idMap: Record<string, string> = {
          "DJ24010101": "1", // 霸道总裁爱上我
          "DJ23120101": "2", // 穿越之锦绣良缘
          "DJ24011001": "3", // 重生之商业帝国
          "DJ24011401": "4", // 豪门逆袭记
          "DJ24010501": "5", // 甜蜜复仇
          "DJ23110101": "6", // 都市修仙传
        };
        
        const mappedId = idMap[projectId];
        if (mappedId && projectDataMap[mappedId]) {
          // 对于默认演示项目，强制使用 projectDataMap 中的完整数据
          // 这样可以确保所有语言卡片都能正确显示
          return projectDataMap[mappedId];
        }
      }

      // 对于新创建的项目，从 localStorage 获取项目信息
      if (typeof window !== 'undefined' && projectId) {
        const savedProjects = localStorage.getItem('drama-projects')
        if (savedProjects) {
          try {
            const projects = JSON.parse(savedProjects)
            const project = projects.find((p: any) => p.id === projectId)
            if (project) {
              // 获取视频数据 - 使用第一个视频的缩略图作为预览
              const videos = project.videos || []
              const firstVideoThumbnail = videos.length > 0 ? videos[0].thumbnailUrl : "/drama-posters/badao-zongcai.png"
              const actualEpisodeCount = videos.length > 0 ? videos.length : 80 // 如果没有视频，使用默认值80

              // 检查是否已保存过语言变体数据
              const savedVariants = localStorage.getItem(`project-${projectId}-variants`)
              if (savedVariants) {
                try {
                  let variants = JSON.parse(savedVariants)
                  return {
                    title: project.title,
                    image: firstVideoThumbnail,
                    videos: videos,
                    variants: variants,
                  }
                } catch (e) {
                  console.error('Failed to parse saved variants:', e)
                }
              }

              // 为新创建的项目生成初始语言变体数据，只包含源语言（AI翻译开始前不显示其他语言）
              const variants = [
                {
                  id: "0",
                  targetLanguage: `${project.originalLanguage || "中文"}（源语言）`,
                  progress: 0,
                  totalEpisodes: actualEpisodeCount,
                  completedEpisodes: 0,
                  currentStage: "待开始",
                  image: firstVideoThumbnail,
                },
              ]

              // 保存语言变体数据到 localStorage
              localStorage.setItem(`project-${projectId}-variants`, JSON.stringify(variants))

              return {
                title: project.title,
                image: firstVideoThumbnail,
                videos: videos,
                variants: variants,
              }
            }
          } catch (e) {
            console.error('Failed to parse saved projects:', e)
          }
        }
      }

      return projectDataMap["1"]
    } catch (e) {
      console.error('Error in getProjectData:', e)
      return projectDataMap["1"]
    }
  }

  const projectData = getProjectData()
  const actualProjectTitle = projectData?.title || projectTitle
  const projectVideos = projectData?.videos || [] // 获取视频数据
  
  // 初始化语言变体
  // 直接使用 getProjectData 返回的完整数据（包括从 localStorage 恢复的多语种卡片）
  const initialVariants = projectData?.variants || []
  
  const [languageVariants, setLanguageVariants] = useState<LanguageVariant[]>(initialVariants)

  // 当语言变体状态更新时，保存到 localStorage
  useEffect(() => {
    if (projectId && languageVariants.length > 0) {
      localStorage.setItem(`project-${projectId}-variants`, JSON.stringify(languageVariants))
    }
  }, [languageVariants, projectId])
  const { canAccessVariant, hasButton, user } = usePermission()
  
  // 根据权限过滤语言变体
  const visibleVariants = languageVariants.filter(variant => 
    canAccessVariant(projectId || '1', variant.targetLanguage)
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
  const defaultVariantId = projectData?.variants.find((v: LanguageVariant) => v.id === "0")?.id || null
  const [pinnedVariant, setPinnedVariant] = useState<string | null>(defaultVariantId) // 被固定选中的卡片
  const [selectedVariant, setSelectedVariant] = useState<string | null>(defaultVariantId) // 当前显示的卡片（可能是悬停或固定）
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowType | null>(null)
  const [showWorkflowBar, setShowWorkflowBar] = useState(true) // 默认显示工作流程栏
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [showUploadMenu, setShowUploadMenu] = useState(false)
  
  // 批量操作对话框
  const [showBatchDialog, setShowBatchDialog] = useState(false)
  const [batchMode, setBatchMode] = useState<"delete" | "download">("delete")

  // 文件夹视图
  const [showFileBrowser, setShowFileBrowser] = useState(false)

  // SRT 查找替换
  const [showSrtSearch, setShowSrtSearch] = useState(false)
  const [srtSearchText, setSrtSearchText] = useState("")
  const [srtReplaceText, setSrtReplaceText] = useState("")
  const [showSrtReplace, setShowSrtReplace] = useState(false)
  const [srtMatchIndex, setSrtMatchIndex] = useState(0)
  const [srtReplacedSet, setSrtReplacedSet] = useState<Set<number>>(new Set())
  const srtPanelRef = useRef<HTMLDivElement>(null)

  // Mock SRT content for search (all episodes × all languages)
  const mockSrtLines = useMemo(() => {
    const lines: Array<{ episode: number; language: string; lineNum: number; text: string }> = []
    const sampleTexts: Record<string, string[]> = {
      "中文": ["夜幕降临，城市的霓虹灯渐次亮起", "你还在看什么？快来吃饭了", "李明转过身，走进了狭小的客厅", "今天公司又加班了？", "嗯，项目赶进度", "当时他只当是疯言疯语", "吃完饭后，李明回到自己的房间", "一条来自未知号码的短信", "明天下午三点，城西咖啡馆", "李明的手微微颤抖了一下"],
      "英语": ["As night fell, the neon lights flickered", "What are you still looking at?", "Li Ming turned around and walked in", "Did the company make you work overtime?", "Yeah, rushing to meet the deadline", "He dismissed it as ramblings", "After dinner, Li Ming returned to his room", "A text from an unknown number", "Tomorrow at three, the West City Café", "Li Ming's hand trembled slightly"],
    }
    const epCount = languageVariants[0]?.totalEpisodes || 80
    for (let ep = 1; ep <= Math.min(epCount, 5); ep++) {
      for (const variant of languageVariants) {
        const lang = variant.targetLanguage.replace("（源语言）", "").replace("（原语言）", "")
        const texts = sampleTexts[lang] || sampleTexts["英语"] || []
        texts.forEach((text, i) => {
          lines.push({ episode: ep, language: lang, lineNum: i + 1, text })
        })
      }
    }
    return lines
  }, [languageVariants])

  // SRT search results
  const srtSearchResults = useMemo(() => {
    if (!srtSearchText.trim()) return []
    const needle = srtSearchText.toLowerCase()
    return mockSrtLines.filter(line => line.text.toLowerCase().includes(needle))
  }, [srtSearchText, mockSrtLines])

  // Reset match index when results change
  useEffect(() => { setSrtMatchIndex(0); setSrtReplacedSet(new Set()) }, [srtSearchResults])

  const handleSrtPrev = () => { if (srtSearchResults.length > 0) setSrtMatchIndex(i => (i - 1 + srtSearchResults.length) % srtSearchResults.length) }
  const handleSrtNext = () => { if (srtSearchResults.length > 0) setSrtMatchIndex(i => (i + 1) % srtSearchResults.length) }

  const handleSrtReplaceCurrent = () => {
    if (srtSearchResults.length === 0 || !srtSearchText.trim()) return
    setSrtReplacedSet(prev => new Set(prev).add(srtMatchIndex))
    // Move to next
    if (srtMatchIndex < srtSearchResults.length - 1) setSrtMatchIndex(i => i + 1)
  }

  const handleSrtReplaceAll = () => {
    if (!srtSearchText.trim() || srtSearchResults.length === 0) return
    const all = new Set<number>()
    srtSearchResults.forEach((_, i) => all.add(i))
    setSrtReplacedSet(all)
  }

  // Close panel on outside click
  useEffect(() => {
    if (!showSrtSearch) return
    const handler = (e: MouseEvent) => {
      if (srtPanelRef.current && !srtPanelRef.current.contains(e.target as Node)) {
        // Check if click is on the search toggle button
        const target = e.target as HTMLElement
        if (target.closest("[data-srt-search-btn]")) return
        setShowSrtSearch(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showSrtSearch])

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
    review: Array<{ languageId: string; episodes: number[]; assignee: string }>
    quality_check: Array<{ languageId: string; episodes: number[]; assignee: string }>
    compress: Array<{ languageId: string; episodes: number[]; assignee: string }>
  }>(() => {
    if (typeof window !== 'undefined' && projectId) {
      const saved = localStorage.getItem(`project-${projectId}-assignments`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // 兼容旧数据：如果没有 review 字段，补上空数组
          return { translation: [], review: [], quality_check: [], compress: [], ...parsed }
        } catch (e) { /* ignore */ }
      }
    }
    return { translation: [], review: [], quality_check: [], compress: [] }
  })
  const [showVideoErase, setShowVideoErase] = useState(false)
  const [showVideoEraseRegion, setShowVideoEraseRegion] = useState(false) // 视频擦除区域选择对话框
  const [showSubtitleMount, setShowSubtitleMount] = useState(false)
  const [showVideoCompress, setShowVideoCompress] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [pendingWorkflow, setPendingWorkflow] = useState<WorkflowType | null>(null)
  const [showTaskQueue, setShowTaskQueue] = useState(false)

  // AI翻译相关状态 — 从 localStorage 恢复
  const [aiTranslateStatus, setAITranslateStatus] = useState<"not_started" | "in_progress" | "completed">(() => {
    if (typeof window !== 'undefined' && projectId) {
      const saved = localStorage.getItem(`project-${projectId}-aiTranslateStatus`)
      if (saved === "not_started" || saved === "in_progress" || saved === "completed") return saved
    }
    return "not_started"
  })
  const [translationTasks, setTranslationTasks] = useState<TranslationTask[]>([])
  const [showTranslationQueue, setShowTranslationQueue] = useState(false)

  // AI提取状态追踪 — 从 localStorage 恢复
  const [aiExtractStatus, setAiExtractStatus] = useState<"not_started" | "in_progress" | "completed">(() => {
    if (typeof window !== 'undefined' && projectId) {
      const saved = localStorage.getItem(`project-${projectId}-aiExtractStatus`)
      if (saved === "not_started" || saved === "in_progress" || saved === "completed") return saved
    }
    return "not_started"
  })

  // 视频擦除状态追踪（独立于主工作流）— 从 localStorage 恢复
  const [videoEraseStatus, setVideoEraseStatus] = useState<"not_started" | "in_progress" | "completed">(() => {
    if (typeof window !== 'undefined' && projectId) {
      const saved = localStorage.getItem(`project-${projectId}-videoEraseStatus`)
      if (saved === "not_started" || saved === "in_progress" || saved === "completed") return saved
    }
    return "not_started"
  })

  // 持久化工作流状态到 localStorage
  useEffect(() => {
    if (projectId) {
      localStorage.setItem(`project-${projectId}-aiTranslateStatus`, aiTranslateStatus)
    }
  }, [aiTranslateStatus, projectId])
  
  useEffect(() => {
    if (projectId) {
      localStorage.setItem(`project-${projectId}-aiExtractStatus`, aiExtractStatus)
    }
  }, [aiExtractStatus, projectId])
  
  useEffect(() => {
    if (projectId) {
      localStorage.setItem(`project-${projectId}-videoEraseStatus`, videoEraseStatus)
    }
  }, [videoEraseStatus, projectId])

  // 持久化任务分配数据到 localStorage
  useEffect(() => {
    if (projectId) {
      localStorage.setItem(`project-${projectId}-assignments`, JSON.stringify(confirmedAssignments))
    }
  }, [confirmedAssignments, projectId])

  // 任务分配状态追踪 - 用于更新工作流状态
  const [taskAssignmentStatus, setTaskAssignmentStatus] = useState<{
    hasAssignedAny: boolean
    allAssignedComplete: boolean
  }>({ hasAssignedAny: false, allAssignedComplete: false })
  
  // 任务分配对话框状态
  const [showTaskAssignDialog, setShowTaskAssignDialog] = useState(false)
  
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

  // 组合任务队列状态（上传/下载/AI任务）
  const [showCombinedTaskQueue, setShowCombinedTaskQueue] = useState(false)

  // 计算是否有活动的任务
  const hasActiveTasks = useMemo(() => {
    try {
      return uploadQueueItems.some(item => item.status === "uploading" || item.status === "pending") ||
        downloadQueueItems.some(item => item.status === "downloading" || item.status === "pending") ||
        aiExtractStatus === "in_progress" ||
        videoEraseStatus === "in_progress" ||
        aiTranslateStatus === "in_progress"
    } catch (e) {
      console.error('Error calculating hasActiveTasks:', e)
      return false
    }
  }, [uploadQueueItems, downloadQueueItems, aiExtractStatus, videoEraseStatus, aiTranslateStatus])

  // AI提取框选区域状态
  const [subtitleRegion, setSubtitleRegion] = useState({ x: 50, y: 400, width: 540, height: 80 })
  
  // 视频擦除框选区域状态（默认使用AI提取的字幕区域）
  const [videoEraseRegion, setVideoEraseRegion] = useState({ x: 50, y: 400, width: 540, height: 80 })

  // 选集面板状态
  const [showEpisodeSelection, setShowEpisodeSelection] = useState(false)
  const [selectedEpisodes, setSelectedEpisodes] = useState<number[]>([])
  const [totalEpisodesForSelection, setTotalEpisodesForSelection] = useState(0)
  const [selectionWorkflow, setSelectionWorkflow] = useState<WorkflowType | null>(null)

  // Calculate overall progress
  const totalEpisodes = getTotalEpisodes(languageVariants)
  const overallProgress = calculateOverallProgress(languageVariants)

  const handleOpenVariant = (variantId: string) => {
    // 点击卡片固定选中状态
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
    if (variant && projectId) {
      // 打开编辑器，传递对应的工作流程阶段
      const stage = getWorkflowStage(variant.currentStage, variant.targetLanguage)
      const isSourceLang = variant.targetLanguage.includes("源语言") || variant.targetLanguage.includes("原语言")
      
      // 如果是翻译语言卡片且状态为"待开始"，进入编辑器时变为"人工翻译"（进行中）
      if (!isSourceLang && variant.currentStage === "待开始") {
        const updatedVariants = languageVariants.map(v => 
          v.id === variantId ? { ...v, currentStage: "人工翻译" } : v
        )
        setLanguageVariants(updatedVariants)
        // 同时写入 localStorage，因为组件即将卸载（切换到编辑器页面）
        if (projectId) {
          localStorage.setItem(`project-${projectId}-variants`, JSON.stringify(updatedVariants))
        }
      }
      
      // 创建提交审核的回调函数
      // 注意：这个回调在编辑器页面调用，此时 WorkspacePage 已经卸载
      // 所以必须直接操作 localStorage，而不是 React state
      const handleSubmitReview = (action?: "submit" | "approve" | "reject") => {
        if (!projectId) return
        
        // 从 localStorage 读取最新的 variants
        const savedVariants = localStorage.getItem(`project-${projectId}-variants`)
        if (!savedVariants) return
        
        try {
          const variants = JSON.parse(savedVariants) as LanguageVariant[]
          const updatedVariants = variants.map(v => {
            if (v.id === variantId) {
              let newStage = v.currentStage
              
              if (action === "reject") {
                // 驳回：回滚到人工翻译进行中（标注新轮次）
                return { ...v, currentStage: "人工翻译", currentRound: (v.currentRound || 1) + 1 }
              }
              
              if (action === "approve") {
                // 审核通过：根据当前阶段前进
                if (v.currentStage === "翻译待确认") {
                  // 只有字体调整已经完成过，才跳过字体调整直接进入成片质检
                  // （成片质检驳回 → 人工翻译 → 审校通过 → 跳过字体调整 → 成片质检）
                  newStage = v.fontAdjustCompleted ? "质检审核" : "字体调整"
                } else if (v.currentStage === "质检待确认") {
                  newStage = "视频压制"
                }
                return { ...v, currentStage: newStage }
              }
              
              // 默认 "submit"：提交审核
              if (v.currentStage === "人工翻译") {
                newStage = "翻译待确认"
              } else if (v.currentStage === "字体调整") {
                // 字体调整完成，标记为已完成过
                newStage = "质检审核"
                return { ...v, currentStage: newStage, fontAdjustCompleted: true }
              } else if (v.currentStage === "质检审核") {
                newStage = "质检待确认"
              }
              return { ...v, currentStage: newStage }
            }
            return v
          })
          
          // 直接写入 localStorage，WorkspacePage 重新挂载时会从 localStorage 读取
          localStorage.setItem(`project-${projectId}-variants`, JSON.stringify(updatedVariants))
        } catch (e) {
          console.error('Failed to update variants in localStorage:', e)
        }
      }
      
      // 传递回调给编辑器
      const firstVideoUrl = projectId ? videoStorage.getFirstVideoUrl(projectId) : undefined
      onOpenEditor(projectId, variant.targetLanguage, "1", stage, handleSubmitReview, firstVideoUrl)
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

    // 打开上传表单对话框（只针对上传选项）
    if (["视频", "字幕", "画面字", "术语表"].includes(option)) {
      setUploadType(option as "视频" | "字幕" | "画面字" | "术语表")
      setShowUploadForm(true)
    }
  }

  // 生成视频缩略图
  const generateVideoThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file || !(file instanceof File)) {
        reject(new Error('Invalid file object'))
        return
      }

      const video = document.createElement('video')
      video.preload = 'metadata'

      let objectUrl: string | null = null
      try {
        objectUrl = URL.createObjectURL(file)
        video.src = objectUrl
      } catch (e) {
        reject(new Error('Failed to create object URL'))
        return
      }

      const cleanup = () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl)
          objectUrl = null
        }
      }

      video.addEventListener('loadeddata', () => { video.currentTime = 0 })

      video.addEventListener('seeked', () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          try {
            const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7)
            cleanup()
            resolve(thumbnailUrl)
          } catch (e) {
            cleanup()
            reject(e)
          }
        } else {
          cleanup()
          reject(new Error('Could not get canvas context'))
        }
      })

      video.addEventListener('error', () => {
        cleanup()
        reject(new Error('Failed to load video'))
      })
    })
  }

  // 获取视频时长
  const getVideoDuration = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (!file || !(file instanceof File)) {
        reject(new Error('Invalid file object'))
        return
      }

      const video = document.createElement('video')
      video.preload = 'metadata'

      let objectUrl: string | null = null
      try {
        objectUrl = URL.createObjectURL(file)
        video.src = objectUrl
      } catch (e) {
        reject(new Error('Failed to create object URL'))
        return
      }

      const cleanup = () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl)
          objectUrl = null
        }
      }

      video.addEventListener('loadedmetadata', () => {
        const duration = video.duration
        cleanup()
        resolve(duration)
      })

      video.addEventListener('error', () => {
        cleanup()
        reject(new Error('Failed to load video'))
      })
    })
  }

  // 处理上传表单提交
  const handleUploadFormSubmit = async (data: UploadFormData) => {
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
      // 处理视频文件 - 生成缩略图并存储到 videoStorage
      const isVideoUpload = data.uploadType === "视频"
      if (isVideoUpload && projectId) {
        const videoType = data.videoType === "source" ? "source" as const
                      : data.videoType === "erased" ? "erased" as const
                      : data.videoType === "onscreen_text" ? "onscreen_text" as const
                      : "final" as const

        // 处理视频文件：生成缩略图并存储
        for (const { file, parsed } of parsedFiles) {
          if (!parsed.isValid || !parsed.episode) continue

          try {
            const thumbnailUrl = await generateVideoThumbnail(file)
            const duration = await getVideoDuration(file)
            videoStorage.addVideo(projectId!, parsed.episode, videoType, file, thumbnailUrl, duration)
          } catch (error) {
            console.error('Failed to process video:', file.name, error)
          }
        }
      }
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
  const handleVideoDownloadConfirm = (selectedTypes: string[], selectedEpisodes: number[]) => {
    const items = selectedTypes.flatMap(type =>
      selectedEpisodes.map(ep => ({
        id: `video-${type}-${ep}-${Date.now()}`,
        name: `${getVideoTypeName(type)} - 第${ep}集`,
        progress: 0,
        status: "pending" as const,
      }))
    )

    setDownloadQueueItems(items)
    setShowDownloadQueue(true)

    // 模拟下载进度
    items.forEach(item => simulateDownloadProgress(item.id))
  }
  
  // 处理字幕下载确认
  const handleSubtitleDownloadConfirm = (selectedLanguages: string[], selectedEpisodes: number[]) => {
    const items = selectedLanguages.flatMap(lang =>
      selectedEpisodes.map(ep => ({
        id: `subtitle-${lang}-${ep}-${Date.now()}`,
        name: `${lang}字幕 - 第${ep}集`,
        progress: 0,
        status: "pending" as const,
      }))
    )
    
    setDownloadQueueItems(items)
    setShowDownloadQueue(true)
    
    // 模拟下载进度
    items.forEach(item => simulateDownloadProgress(item.id))
  }
  
  // 处理确认下载（画面字和术语表）
  const handleConfirmDownloadSubmit = (selectedEpisodes: number[]) => {
    const items = selectedEpisodes.map(ep => ({
      id: `${confirmDownloadType}-${ep}-${Date.now()}`,
      name: `${confirmDownloadType} - 第${ep}集`,
      progress: 0,
      status: "pending" as const,
    }))

    setDownloadQueueItems(items)
    setShowDownloadQueue(true)

    // 模拟下载进度
    items.forEach(item => simulateDownloadProgress(item.id))
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
    const item = uploadQueueItems.find(i => i.id === itemId)
    if (!item) return

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15

      if (progress >= 100) {
        progress = 100
        clearInterval(interval)

        // 视频上传完成后的处理
        const isVideoUpload = item.uploadType.includes("视频")
        const isSourceVideo = item.uploadType.includes("原视频")

        if (isVideoUpload && projectId) {
          // 更新源语言卡片的集数
          if (isSourceVideo) {
            setLanguageVariants(prev => {
              const updated = prev.map(v => {
                if (v.id === "0") {
                  const newEpisodeCount = videoStorage.getSourceEpisodeCount(projectId!)
                  return { ...v, totalEpisodes: Math.max(newEpisodeCount, v.totalEpisodes) }
                }
                return v
              })
              return updated
            })
          }

          // 更新 localStorage 中的项目数据
          if (typeof window !== 'undefined') {
            const savedProjects = localStorage.getItem('drama-projects')
            if (savedProjects) {
              try {
                const projects = JSON.parse(savedProjects)
                const project = projects.find((p: any) => p.id === projectId)
                if (project && isSourceVideo) {
                  const newEpisodeCount = videoStorage.getSourceEpisodeCount(projectId!)
                  if (newEpisodeCount > (project.episodes || 0)) {
                    project.episodes = newEpisodeCount
                    localStorage.setItem('drama-projects', JSON.stringify(projects))
                  }
                }
              } catch (e) {
                console.error('Failed to update project:', e)
              }
            }
          }
        }

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
              // 上传完成，无需额外操作
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
    // 任务分配：打开任务分配对话框（使用 workflow-dialogs 中的 TaskAssignDialog）
    if (workflowId === "task_assign") {
      setTaskAssignType("translation")
      setShowTaskAssign(true)
      return
    }

    // AI翻译特殊处理：根据状态显示不同对话框
    if (workflowId === "ai_translate") {
      if (aiTranslateStatus === "not_started") {
        setShowAITranslate(true)
      } else if (aiTranslateStatus === "in_progress") {
        // 进行中：不做任何操作，任务正在右上角任务队列中运行
        return
      } else if (aiTranslateStatus === "completed") {
        // 已完成状态：直接打开AI翻译设置（已翻译的语种会置灰，可以选择新语种）
        setShowAITranslate(true)
      }
      return
    }

    // 视频擦除特殊处理：根据独立的视频擦除状态显示不同对话框
    if (workflowId === "video_erase") {
      // 获取选中的语言变体
      const selectedVariantObj = languageVariants.find(v => v.id === selectedVariant)
      const currentStage = selectedVariantObj?.currentStage || ""
      
      if (videoEraseStatus === "in_progress") {
        // 进行中：不做任何操作，任务正在右上角任务队列中运行
        return
      }
      if (videoEraseStatus === "completed" || currentStage === "任务分配") {
        // 已完成状态或任务分配状态：显示已完成对话框
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
      // 获取源语言卡片
      const sourceVariant = languageVariants.find(v => v.id === "0") || languageVariants[0]
      const stage = getWorkflowStage(sourceVariant.currentStage, sourceVariant.targetLanguage)
      
      if (pendingWorkflow === "ai_extract" || pendingWorkflow === "video_erase") {
        const firstVideoUrl = projectId ? videoStorage.getFirstVideoUrl(projectId) : undefined
        onOpenEditor(projectId, sourceVariant.targetLanguage, "1", stage, undefined, firstVideoUrl)
      }
    }
  }

  const handleRecreate = () => {
    setShowCompletedDialog(false)
    setShowOverwriteDialog(true)
  }

  const handleEpisodeSelectionConfirm = () => {
    setShowEpisodeSelection(false)
    // 显示覆盖确认对话框
    setShowOverwriteDialog(true)
  }

  const handleEpisodeSelectionCancel = () => {
    setShowEpisodeSelection(false)
    setSelectedEpisodes([])
    setSelectionWorkflow(null)
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

    // 获取已存在的语言代码（排除源语言）
    const existingCodes = languageVariants
      .filter(v => v.id !== "0")
      .map(v => getLanguageCode(v.targetLanguage))

    // 只保留新增的语言（过滤掉已存在的语言）
    const newLanguageCodes = languageCodes.filter(code => !existingCodes.includes(code))

    // 如果没有新增语言，不做任何处理
    if (newLanguageCodes.length === 0) {
      setShowAITranslate(false)
      return
    }

    // 创建新的语言卡片（只为新增的语言）— 初始状态为"待开始"
    const newVariants: LanguageVariant[] = newLanguageCodes.map((code, index) => ({
      id: `${languageVariants.length + index}`,
      targetLanguage: getLanguageName(code),
      progress: 0,
      totalEpisodes: sourceVariant.totalEpisodes,
      completedEpisodes: 0,
      currentStage: "待开始",
      image: sourceVariant.image,
    }))

    // 更新语言卡片列表
    setLanguageVariants(prev => [...prev, ...newVariants])

    // 设置AI翻译为进行中（任务进入右上角任务队列icon）
    setAITranslateStatus("in_progress")
    setShowAITranslate(false)

    // 更新源语言卡片状态为AI翻译进行中
    setLanguageVariants(prev =>
      prev.map(v =>
        v.id === "0"
          ? { ...v, currentStage: "AI翻译-进行中" }
          : v
      )
    )

    // 模拟任务完成（3秒后自动完成）
    setTimeout(() => {
      setAITranslateStatus("completed")
      // 更新源语言卡片状态
      setLanguageVariants(prev =>
        prev.map(v =>
          v.id === "0"
            ? { ...v, currentStage: "AI翻译-已完成" }
            : v
        )
      )
    }, 3000)
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
        // 直接显示字幕框选对话框
        setShowAIExtractSubtitleRegion(true)
        break
      case "ai_translate":
        setShowAITranslate(true)
        break
      case "manual_translate":
        // Open editor directly for manual translation or font adjustment
        if (projectId && selectedVariant) {
          const variant = languageVariants.find(v => v.id === selectedVariant)
          if (variant) {
            const stage = getWorkflowStage(variant.currentStage, variant.targetLanguage)
            const firstVideoUrl = projectId ? videoStorage.getFirstVideoUrl(projectId) : undefined
            onOpenEditor(projectId, variant.targetLanguage, "1", stage, undefined, firstVideoUrl)
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
            const firstVideoUrl = projectId ? videoStorage.getFirstVideoUrl(projectId) : undefined
            onOpenEditor(projectId, variant.targetLanguage, "1", stage, undefined, firstVideoUrl)
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
  }> | Record<string, Array<{ languageId: string; episodes: number[]; assignee: string }>>, step?: string, extractOptions?: { extractTypes: string[]; sourceLanguage: string }) => {
    // 如果是任务分配（传递了assignments参数且当前工作流不是ai_extract或video_erase）
    if (assignments !== undefined && activeWorkflow !== "ai_extract" && activeWorkflow !== "video_erase") {
      // 判断是否是新的 per-task-type 格式（Record<string, TaskAssignment[]>）
      if (assignments && !Array.isArray(assignments) && typeof assignments === 'object') {
        // 新格式：每个任务类型独立的分配数据
        const allAssignments = assignments as Record<string, Array<{ languageId: string; episodes: number[]; assignee: string }>>
        setConfirmedAssignments({
          translation: allAssignments.translation || [],
          review: allAssignments.review || [],
          quality_check: allAssignments.quality_check || [],
          compress: allAssignments.compress || [],
        })
      }
      setShowTaskAssign(false)
      setActiveWorkflow(null)
      return
    }
    
    // 如果是AI提取任务，设置为进行中并进入右上角任务队列
    if (activeWorkflow === "ai_extract") {
      setShowAIExtractSubtitleRegion(false)
      setShowAIExtractScreenText(false)
      setShowAIExtractOptions(false)

      // 更新状态为"AI提取-进行中"
      setLanguageVariants(prevVariants =>
        prevVariants.map(variant => {
          if (variant.id === "0" && (variant.currentStage === "待开始" || variant.currentStage === "AI提取-进行中")) {
            return {
              ...variant,
              currentStage: "AI提取-进行中",
            }
          }
          return variant
        })
      )

      // 更新AI提取状态为进行中（任务进入右上角任务队列icon）
      setAiExtractStatus("in_progress")

      // 模拟任务完成（3秒后自动完成）
      setTimeout(() => {
        setAiExtractStatus("completed")
        setLanguageVariants(prevVariants =>
          prevVariants.map(variant => {
            if (variant.id === "0" && (variant.currentStage === "AI提取-进行中" || variant.currentStage === "待开始")) {
              return {
                ...variant,
                currentStage: "AI提取-待确认",
              }
            }
            return variant
          })
        )
      }, 3000)

      setActiveWorkflow(null)
      return
    }

    // 如果是视频擦除任务，设置为进行中并进入右上角任务队列
    if (activeWorkflow === "video_erase") {
      setShowVideoEraseRegion(false)

      // 更新视频擦除状态为进行中（任务进入右上角任务队列icon）
      setVideoEraseStatus("in_progress")

      // 模拟任务完成（3秒后自动完成）
      setTimeout(() => {
        setVideoEraseStatus("completed")
      }, 3000)

      setActiveWorkflow(null)
      return
    }
    
    // 如果是视频压制任务，显示下载队列对话框
    if (activeWorkflow === "video_compress") {
      setShowVideoCompress(false)

      // 创建下载队列项目（模拟80集视频）
      const selectedVariantObj = languageVariants.find(v => v.id === selectedVariant)
      const totalEpisodes = selectedVariantObj?.totalEpisodes || 80
      const downloadItems = Array.from({ length: totalEpisodes }, (_, i) => ({
        id: `compress-${i + 1}`,
        name: `第${i + 1}集 - 压制视频`,
        progress: 0,
        status: "pending" as const,
      }))
      
      setDownloadQueueItems(downloadItems)
      setShowDownloadQueue(true)
      
      // 开始模拟下载进度
      simulateVideoCompressDownload(downloadItems)
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
  
  // 模拟视频压制下载进度
  const simulateVideoCompressDownload = (items: typeof downloadQueueItems) => {
    let currentIndex = 0
    
    const downloadNext = () => {
      if (currentIndex >= items.length) {
        // 所有下载完成，更新语言变体状态为已完成
        setLanguageVariants(prevVariants =>
          prevVariants.map(variant => {
            if (variant.id === selectedVariant && variant.currentStage === "视频压制") {
              return {
                ...variant,
                currentStage: "已完成",
                completedEpisodes: variant.totalEpisodes,
              }
            }
            return variant
          })
        )
        setActiveWorkflow(null)
        return
      }
      
      const item = items[currentIndex]
      
      // 更新为下载中
      setDownloadQueueItems(prev => 
        prev.map(i => i.id === item.id ? { ...i, status: "downloading" as const } : i)
      )
      
      // 模拟下载进度
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += 10
        setDownloadQueueItems(prev => 
          prev.map(i => i.id === item.id ? { ...i, progress } : i)
        )
        
        if (progress >= 100) {
          clearInterval(progressInterval)
          // 标记为完成
          setDownloadQueueItems(prev => 
            prev.map(i => i.id === item.id ? { ...i, status: "completed" as const, progress: 100 } : i)
          )
          
          // 下载下一个
          currentIndex++
          setTimeout(downloadNext, 100)
        }
      }, 100)
    }
    
    downloadNext()
  }
  
  const handleTaskQueueComplete = () => {
    // 任务队列完成后，更新项目状态
    const currentWorkflow = activeWorkflow
    setActiveWorkflow(null)

    // 如果是视频擦除任务完成，只更新独立的视频擦除状态
    // 不改变currentStage，视频擦除是独立流程，不影响主工作流
    if (currentWorkflow === "video_erase") {
      setVideoEraseStatus("completed")
      return
    }

    // 如果是AI提取任务完成，更新状态为"AI提取-待确认"
    // 用户需要在编辑器中确认提取结果
    if (currentWorkflow === "ai_extract") {
      setAiExtractStatus("completed")
      // 更新源语言卡片状态为待确认
      setLanguageVariants(prevVariants =>
        prevVariants.map(variant => {
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
      return
    }

    // 如果是AI翻译任务完成，更新状态为"completed"
    if (currentWorkflow === "ai_translate") {
      setAITranslateStatus("completed")
      // 更新源语言卡片状态
      setLanguageVariants(prevVariants =>
        prevVariants.map(variant => {
          if (variant.id === "0") {
            return {
              ...variant,
              currentStage: "AI翻译-已完成",
            }
          }
          return variant
        })
      )
      return
    }
  }

  // File browser view
  if (showFileBrowser) {
    return (
      <FileBrowserPage
        projectTitle={projectTitle}
        totalEpisodes={totalEpisodes}
        languages={languageVariants.map(v => ({
          id: v.id,
          label: v.targetLanguage.replace("（源语言）", "").replace("（原语言）", ""),
          isSource: v.targetLanguage.includes("源语言") || v.targetLanguage.includes("原语言"),
        }))}
        onBack={() => setShowFileBrowser(false)}
        projectImage={projectData?.image}
      />
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
              {languageVariants.filter(v => !v.targetLanguage.includes('源语言')).length} 个语言变体 · {totalEpisodes} 集
            </p>
          </div>

          {/* 任务队列指示器 - 悬浮显示 */}
          <DropdownMenu open={showCombinedTaskQueue} onOpenChange={setShowCombinedTaskQueue}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <ListTodo className="w-4 h-4" />
                {hasActiveTasks && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold animate-pulse">
                    {
                      uploadQueueItems.filter(i => i.status === "uploading" || i.status === "pending").length +
                      downloadQueueItems.filter(i => i.status === "downloading" || i.status === "pending").length +
                      (aiExtractStatus === "in_progress" ? 1 : 0) +
                      (videoEraseStatus === "in_progress" ? 1 : 0) +
                      (aiTranslateStatus === "in_progress" ? 1 : 0)
                    }
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[500px]">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="upload">上传</TabsTrigger>
                  <TabsTrigger value="compress">压制</TabsTrigger>
                  <TabsTrigger value="extract">提取</TabsTrigger>
                  <TabsTrigger value="erase">擦除</TabsTrigger>
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
                      {uploadQueueItems.map(item => {
                        // 判断选项类型，显示对应的标签
                        const getUploadOptionLabel = (option: string) => {
                          switch (option) {
                            case "视频": return "上传"
                            case "字幕": return "上传"
                            case "画面字": return "上传"
                            case "术语表": return "上传"
                            default: return option
                          }
                        }
                        const optionLabel = getUploadOptionLabel(item.uploadType || "")
                        return (
                          <div key={item.id} className="space-y-1 p-2 rounded-lg border border-border group">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {item.projectTitle} - {item.languageVariant} - 第{item.episodeNumber}集
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {item.fileName}
                                </p>
                              </div>
                              <div className="ml-2 shrink-0 flex items-center gap-2">
                                {item.status === "completed" && (
                                  <div className="relative w-3 h-3">
                                    <CheckCircle className="w-3 h-3 text-green-500 transition-opacity group-hover:opacity-0" />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // 这里可以添加立即查看逻辑
                                      }}
                                      className="h-5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 left-4 whitespace-nowrap"
                                      title="立即查看"
                                    >
                                      立即查看
                                    </Button>
                                  </div>
                                )}
                                {item.status === "uploading" && (
                                  <div className="relative w-3 h-3">
                                    <Loader2 className="w-3 h-3 animate-spin text-blue-500 transition-opacity group-hover:opacity-0" />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setUploadQueueItems(prev =>
                                          prev.map(i =>
                                            i.id === item.id
                                              ? { ...i, status: "paused" }
                                              : i
                                          )
                                        );
                                      }}
                                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 left-0"
                                      title="暂停"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause"><rect width="6" height="16" x="4" y="4" rx="1"/><rect width="6" height="16" x="14" y="4" rx="1"/></svg>
                                    </Button>
                                  </div>
                                )}
                                {item.status === "paused" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setUploadQueueItems(prev =>
                                        prev.map(i =>
                                          i.id === item.id
                                            ? { ...i, status: "uploading" }
                                            : i
                                        )
                                      );
                                    }}
                                    className="h-5 w-5 p-0"
                                    title="继续"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                  </Button>
                                )}
                                {item.status === "error" && (
                                  <div className="relative w-3 h-3">
                                    <AlertCircle className="w-3 h-3 text-destructive transition-opacity group-hover:opacity-0" />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRetryUpload(item.id);
                                      }}
                                      className="h-5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 left-4 whitespace-nowrap"
                                      title="重试"
                                    >
                                      重试
                                    </Button>
                                  </div>
                                )}
                                {item.status === "pending" && (
                                  <>
                                  </>
                                )}
                              </div>
                            </div>
                            <Progress value={item.progress} className="h-1" />
                            <p className="text-xs text-right text-muted-foreground">{item.progress}%</p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>

                {/* 压制任务 */}
                <TabsContent value="compress" className="max-h-[400px] overflow-auto">
                  {downloadQueueItems.filter(item => item.id.startsWith("compress-")).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-sm text-muted-foreground">暂无压制任务</p>
                    </div>
                  ) : (
                    <div className="space-y-2 p-2">
                      {downloadQueueItems.filter(item => item.id.startsWith("compress-")).map(item => (
                        <div key={item.id} className="space-y-1 p-2 rounded-lg border border-border group">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">
                                {actualProjectTitle} - {item.name}
                              </p>
                            </div>
                            <div className="ml-2 shrink-0 flex items-center gap-2">
                              {item.status === "completed" && (
                                <div className="relative w-3 h-3">
                                  <CheckCircle className="w-3 h-3 text-green-500 transition-opacity group-hover:opacity-0" />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // 这里可以添加立即查看逻辑
                                    }}
                                    className="h-5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 left-4 whitespace-nowrap"
                                    title="立即查看"
                                  >
                                    立即查看
                                  </Button>
                                </div>
                              )}
                              {item.status === "downloading" && (
                                  <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                                )}
                              {item.status === "error" && (
                                <div className="relative w-3 h-3">
                                  <AlertCircle className="w-3 h-3 text-destructive transition-opacity group-hover:opacity-0" />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDownloadQueueItems(prev =>
                                        prev.map(i =>
                                          i.id === item.id
                                            ? { ...i, status: "downloading", progress: 0 }
                                            : i
                                        )
                                      );
                                    }}
                                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 left-0"
                                    title="重试"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 1 1 12 3"/><path d="M21 12v6h-6"/></svg>
                                  </Button>
                                </div>
                              )}
                              {item.status === "pending" && (
                                <>
                                </>
                              )}
                            </div>
                          </div>
                          <Progress value={item.progress} className="h-1" />
                          <p className="text-xs text-right text-muted-foreground">{item.progress}%</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* 提取任务 */}
                <TabsContent value="extract" className="max-h-[400px] overflow-auto">
                  <div className="space-y-2 p-2">
                    {[1, 2, 3, 4, 5].map(episode => (
                      <div key={`extract-${episode}`} className="space-y-1 p-2 rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {actualProjectTitle} - 中文（源语言）- 第{episode}集
                            </p>
                          </div>
                          <div className="ml-2 shrink-0 flex items-center gap-2">
                            {episode <= 3 ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : episode === 4 ? (
                              <div className="relative w-3 h-3">
                                <Loader2 className="w-3 h-3 animate-spin text-blue-500 transition-opacity hover:opacity-0" />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  className="h-5 w-5 p-0 opacity-0 hover:opacity-100 transition-opacity absolute top-0 left-4"
                                  title="暂停"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause"><rect width="6" height="16" x="4" y="4" rx="1"/><rect width="6" height="16" x="14" y="4" rx="1"/></svg>
                                </Button>
                              </div>
                            ) : (
                              <>
                              </>
                            )}
                          </div>
                        </div>
                        <Progress 
                          value={episode <= 3 ? 100 : episode === 4 ? 60 : 0} 
                          className="h-1" 
                        />
                        <p className="text-xs text-right text-muted-foreground">
                          {episode <= 3 ? 100 : episode === 4 ? 60 : 0}%
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* 擦除任务 */}
                <TabsContent value="erase" className="max-h-[400px] overflow-auto">
                  <div className="space-y-2 p-2">
                    {[1, 2, 3, 4, 5].map(episode => (
                      <div key={`erase-${episode}`} className="space-y-1 p-2 rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {actualProjectTitle} - 中文（源语言）- 第{episode}集
                            </p>
                          </div>
                          <div className="ml-2 shrink-0 flex items-center gap-2">
                            {episode <= 2 ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : episode === 3 ? (
                              <div className="relative">
                                <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  className="h-5 w-5 p-0 opacity-0 hover:opacity-100 transition-opacity absolute -right-4"
                                  title="暂停"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause"><rect width="6" height="16" x="4" y="4" rx="1"/><rect width="6" height="16" x="14" y="4" rx="1"/></svg>
                                </Button>
                              </div>
                            ) : episode === 4 ? (
                              <div className="relative w-3 h-3">
                                <AlertCircle className="w-3 h-3 text-destructive transition-opacity hover:opacity-0" />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  className="h-5 text-[10px] opacity-0 hover:opacity-100 transition-opacity absolute -top-1 left-4 whitespace-nowrap"
                                  title="重试"
                                >
                                  重试
                                </Button>
                              </div>
                            ) : (
                              <>
                              </>
                            )}
                          </div>
                        </div>
                        <Progress 
                          value={episode <= 2 ? 100 : episode === 3 ? 45 : episode === 4 ? 0 : 0} 
                          className="h-1" 
                        />
                        <p className="text-xs text-right text-muted-foreground">
                          {episode <= 2 ? 100 : episode === 3 ? 45 : episode === 4 ? 0 : 0}%
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* 翻译任务 */}
                <TabsContent value="translate" className="max-h-[400px] overflow-auto">
                  <div className="space-y-2 p-2">
                    {["英文", "西班牙语", "葡萄牙语"].map((language, langIndex) => (
                      <div key={`translate-${language}`} className="space-y-1">
                        <div className="text-xs font-medium text-foreground mb-1">{language}</div>
                        {[1, 2, 3].map(episode => (
                          <div key={`translate-${language}-${episode}`} className="space-y-1 p-2 rounded-lg border border-border">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {actualProjectTitle} - {language} - 第{episode}集
                                </p>
                              </div>
                              <div className="ml-2 shrink-0 flex items-center gap-2">
                                {langIndex === 0 && episode <= 2 ? (
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                ) : langIndex === 0 && episode === 3 ? (
                                  <div className="relative w-3 h-3">
                                    <Loader2 className="w-3 h-3 animate-spin text-blue-500 transition-opacity hover:opacity-0" />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      className="h-5 w-5 p-0 opacity-0 hover:opacity-100 transition-opacity absolute top-0 left-4"
                                      title="暂停"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause"><rect width="6" height="16" x="4" y="4" rx="1"/><rect width="6" height="16" x="14" y="4" rx="1"/></svg>
                                    </Button>
                                  </div>
                                ) : langIndex === 1 && episode === 1 ? (
                                  <div className="relative w-3 h-3">
                                    <Loader2 className="w-3 h-3 animate-spin text-blue-500 transition-opacity hover:opacity-0" />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      className="h-5 w-5 p-0 opacity-0 hover:opacity-100 transition-opacity absolute top-0 left-4"
                                      title="暂停"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause"><rect width="6" height="16" x="4" y="4" rx="1"/><rect width="6" height="16" x="14" y="4" rx="1"/></svg>
                                    </Button>
                                  </div>
                                ) : langIndex === 1 && episode > 1 ? (
                                  <>
                                  </>
                                ) : langIndex === 2 && episode === 1 ? (
                                  <div className="relative w-3 h-3">
                                    <AlertCircle className="w-3 h-3 text-destructive transition-opacity hover:opacity-0" />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      className="h-5 text-[10px] opacity-0 hover:opacity-100 transition-opacity absolute -top-1 left-4 whitespace-nowrap"
                                      title="重试"
                                    >
                                      重试
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                  </>
                                )}
                              </div>
                            </div>
                            <Progress 
                              value={langIndex === 0 && episode <= 2 ? 100 : 
                                     langIndex === 0 && episode === 3 ? 70 : 
                                     langIndex === 1 && episode === 1 ? 40 : 0} 
                              className="h-1" 
                            />
                            <p className="text-xs text-right text-muted-foreground">
                              {langIndex === 0 && episode <= 2 ? 100 : 
                               langIndex === 0 && episode === 3 ? 70 : 
                               langIndex === 1 && episode === 1 ? 40 : 0}%
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 查找替换、文件夹、上传、下载、删除按钮 */}
          <TooltipProvider>
            <div className="flex items-center gap-2">
              {/* 查找替换 */}
              <Button
                variant={showSrtSearch ? "default" : "outline"}
                size="sm"
                className="gap-2"
                data-srt-search-btn
                onClick={() => { setShowSrtSearch(!showSrtSearch); setShowSrtReplace(false) }}
              >
                <Search className="w-4 h-4" />
                查找
              </Button>

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
              {hasButton('upload') && (
                <DropdownMenu open={showUploadMenu} onOpenChange={setShowUploadMenu}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ChevronsUpDown className="w-4 h-4" />
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

              {/* 下载按钮 */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => { setBatchMode("download"); setShowBatchDialog(true) }}
              >
                <Download className="w-4 h-4" />
                下载
              </Button>

              {/* 删除按钮 */}
              {hasButton('batch_select') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive/80"
                  onClick={() => { setBatchMode("delete"); setShowBatchDialog(true) }}
                >
                  <Trash2 className="w-4 h-4" />
                  删除
                </Button>
              )}
            </div>
          </TooltipProvider>
        </div>

        {/* SRT 查找替换面板 - 浮动覆盖 */}
        {showSrtSearch && (
          <div className="relative z-20" ref={srtPanelRef}>
          <div className="absolute left-0 right-0 border border-border rounded-lg bg-card p-3 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 flex-wrap">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="在所有 SRT 字幕文件中查找..."
                value={srtSearchText}
                onChange={e => setSrtSearchText(e.target.value)}
                className="w-64 h-8 text-sm"
                autoFocus
              />
              <span className="text-xs text-muted-foreground min-w-[80px]">
                {srtSearchText && srtSearchResults.length > 0 ? `${srtMatchIndex + 1} / ${srtSearchResults.length}` : srtSearchText ? "无匹配" : ""}
              </span>
              {/* 上下切换 */}
              <Button variant="ghost" size="icon" className="w-7 h-7" onClick={handleSrtPrev} disabled={srtSearchResults.length === 0}>
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-7 h-7" onClick={handleSrtNext} disabled={srtSearchResults.length === 0}>
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => setShowSrtReplace(!showSrtReplace)}>
                <Replace className="w-3.5 h-3.5" />替换
              </Button>
              {showSrtReplace && (
                <>
                  <Input placeholder="替换为..." value={srtReplaceText} onChange={e => setSrtReplaceText(e.target.value)} className="w-48 h-8 text-sm" />
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleSrtReplaceCurrent} disabled={srtSearchResults.length === 0}>
                    替换当前
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleSrtReplaceAll} disabled={srtSearchResults.length === 0}>
                    全部替换
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" className="w-7 h-7 ml-auto" onClick={() => { setShowSrtSearch(false); setSrtSearchText(""); setSrtReplaceText(""); setSrtReplacedSet(new Set()) }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            {/* Search results */}
            {srtSearchText && srtSearchResults.length > 0 && (
              <div className="max-h-[240px] overflow-auto border border-border/50 rounded-md">
                {srtSearchResults.slice(0, 80).map((result, i) => {
                  const isReplaced = srtReplacedSet.has(i)
                  const isCurrent = i === srtMatchIndex
                  const idx = result.text.toLowerCase().indexOf(srtSearchText.toLowerCase())
                  const before = result.text.substring(0, idx)
                  const match = result.text.substring(idx, idx + srtSearchText.length)
                  const after = result.text.substring(idx + srtSearchText.length)
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-3 px-3 py-1.5 text-xs border-b border-border/20 last:border-0 cursor-pointer transition-colors",
                        isCurrent ? "bg-primary/10" : "hover:bg-muted/50",
                        isReplaced && "opacity-60"
                      )}
                      onClick={() => setSrtMatchIndex(i)}
                    >
                      <span className="text-muted-foreground shrink-0 w-[60px]">第{result.episode}集</span>
                      <span className="text-muted-foreground shrink-0 w-[50px]">{result.language}</span>
                      <span className="text-muted-foreground shrink-0 w-[30px]">#{result.lineNum}</span>
                      <span className="truncate">
                        {isReplaced ? (
                          <>{before}<span className="bg-green-500/20 text-green-700 dark:text-green-300 font-medium">{srtReplaceText}</span>{after}</>
                        ) : (
                          <>{before}<span className={cn("font-medium", isCurrent ? "bg-orange-400/50 text-orange-900 dark:text-orange-100" : "bg-yellow-300/40 text-yellow-900 dark:text-yellow-200")}>{match}</span>{after}</>
                        )}
                      </span>
                      {isReplaced && <span className="text-[10px] text-green-600 shrink-0">已替换</span>}
                    </div>
                  )
                })}
                {srtSearchResults.length > 80 && (
                  <div className="px-3 py-1.5 text-xs text-muted-foreground text-center">还有 {srtSearchResults.length - 80} 条结果未显示</div>
                )}
              </div>
            )}
            {srtSearchText && srtSearchResults.length === 0 && (
              <div className="text-xs text-muted-foreground py-2 text-center">未找到匹配内容</div>
            )}
          </div>
          </div>
        )}

        {/* Language Variant Grid - 一行6个 */}
        <div 
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3"
        >
          {visibleVariants.map((variant) => (
            <div 
              key={variant.id} 
              className="relative"
            >
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
                isSelected={selectedVariant === variant.id}
                isPinned={pinnedVariant === variant.id}
                className="language-variant-card"
                currentRound={variant.currentRound || 1}
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
            allLanguageVariants={languageVariants}
            videoEraseStatus={videoEraseStatus}
            translationAssignments={confirmedAssignments.translation}
            reviewAssignments={confirmedAssignments.review}
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

      {/* 选集面板弹窗 */}
      <Dialog open={showEpisodeSelection} onOpenChange={setShowEpisodeSelection}>
        <DialogContent className="sm:max-w-lg">
          <DialogTitle>选择集数</DialogTitle>
          <DialogDescription>
            请选择要处理的集数，默认全选
          </DialogDescription>
          <div className="space-y-4">
            {/* 全选/取消全选 */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEpisodes(Array.from({ length: totalEpisodesForSelection }, (_, i) => i + 1))}
              >
                全选
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEpisodes([])}
              >
                取消全选
              </Button>
            </div>
            
            {/* 集数选择区域 */}
            <div className="grid grid-cols-8 gap-1 max-h-60 overflow-y-auto p-3 border rounded-lg">
              {Array.from({ length: totalEpisodesForSelection }, (_, i) => i + 1).map(episode => (
                <div
                  key={episode}
                  className={cn(
                    "flex items-center justify-center aspect-square rounded text-xs font-medium transition-colors border border-border cursor-pointer",
                    selectedEpisodes.includes(episode)
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  )}
                  onClick={() => {
                    setSelectedEpisodes(prev => {
                      if (prev.includes(episode)) {
                        return prev.filter(e => e !== episode)
                      } else {
                        return [...prev, episode].sort((a, b) => a - b)
                      }
                    })
                  }}
                >
                  {episode}
                </div>
              ))}
            </div>
            
            {/* 已选信息 */}
            <p className="text-sm text-muted-foreground">
              已选 {selectedEpisodes.length} / {totalEpisodesForSelection} 集
            </p>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={handleEpisodeSelectionCancel}>
              取消
            </Button>
            <Button onClick={handleEpisodeSelectionConfirm} disabled={selectedEpisodes.length === 0}>
              确认
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Overwrite Dialog */}
      <OverwriteDialog
        open={showOverwriteDialog}
        onOpenChange={setShowOverwriteDialog}
        onConfirm={handleOverwriteChoice}
        workflowId={pendingWorkflow || undefined}
      />

      {/* AI Extract Options */}
      <AIExtractOptionsDialog
        open={showAIExtractOptions}
        onOpenChange={setShowAIExtractOptions}
        onNext={(options) => handleTaskSubmit(undefined, "options", options)}
      />

      {/* AI Extract Subtitle Region - 第一步，不需要上一步按钮 */}
      <AIExtractSubtitleRegionDialog
        open={showAIExtractSubtitleRegion}
        onOpenChange={setShowAIExtractSubtitleRegion}
        region={subtitleRegion}
        onRegionChange={setSubtitleRegion}
        onNext={() => handleTaskSubmit(undefined, "subtitleRegion")}
        onBack={() => {
          setShowAIExtractSubtitleRegion(false)
          setShowAIExtractOptions(true)
        }}
      />

      {/* AI Extract Screen Text */}
      <AIExtractScreenTextDialog
        open={showAIExtractScreenText}
        onOpenChange={setShowAIExtractScreenText}
        subtitleRegion={subtitleRegion}
        onSubmit={() => handleTaskSubmit(undefined, "screenText")}
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
        existingLanguageVariants={languageVariants}
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
        initialAssignments={confirmedAssignments}
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

      {/* Task Assignment Dialog */}
      <Dialog open={showTaskAssignDialog} onOpenChange={setShowTaskAssignDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle>任务分配</DialogTitle>
          <DialogDescription>
            请为各语言变体分配翻译、审校、质检和压制任务
          </DialogDescription>
          <Tabs defaultValue="translation" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="translation" className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                翻译
              </TabsTrigger>
              <TabsTrigger value="review" className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                审校
              </TabsTrigger>
              <TabsTrigger value="quality" className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" />
                质检
              </TabsTrigger>
              <TabsTrigger value="compress" className="flex items-center gap-2">
                <Film className="w-4 h-4" />
                压制
              </TabsTrigger>
            </TabsList>
            <TabsContent value="translation">
              <div className="py-4">
                {/* 翻译任务分配内容 */}
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    为以下语言分配翻译任务
                  </div>
                  <div className="space-y-3">
                    {languageVariants
                      .filter(v => !v.targetLanguage.includes("源语言"))
                      .map(language => (
                        <div key={language.id} className="p-3 border rounded-lg">
                          <div className="font-medium mb-2">{language.targetLanguage}</div>
                          <div className="flex items-center gap-2">
                            <Select defaultValue="">
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="选择译员" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tr001">张三 (译员)</SelectItem>
                                <SelectItem value="tr002">李四 (译员)</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm">
                              分配
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="review">
              <div className="py-4">
                {/* 审校任务分配内容 */}
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    为以下语言分配审校任务
                  </div>
                  <div className="space-y-3">
                    {languageVariants
                      .filter(v => !v.targetLanguage.includes("源语言"))
                      .map(language => (
                        <div key={language.id} className="p-3 border rounded-lg">
                          <div className="font-medium mb-2">{language.targetLanguage}</div>
                          <div className="flex items-center gap-2">
                            <Select defaultValue="">
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="选择审校" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="qc001">王五 (审校)</SelectItem>
                                <SelectItem value="qc002">赵六 (审校)</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm">
                              分配
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="quality">
              <div className="py-4">
                {/* 质检任务分配内容 */}
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    为以下语言分配质检任务
                  </div>
                  <div className="space-y-3">
                    {languageVariants
                      .filter(v => !v.targetLanguage.includes("源语言"))
                      .map(language => (
                        <div key={language.id} className="p-3 border rounded-lg">
                          <div className="font-medium mb-2">{language.targetLanguage}</div>
                          <div className="flex items-center gap-2">
                            <Select defaultValue="">
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="选择质检" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="qc001">王五 (质检)</SelectItem>
                                <SelectItem value="qc002">赵六 (质检)</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm">
                              分配
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="compress">
              <div className="py-4">
                {/* 压制任务分配内容 */}
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    为以下语言分配压制任务
                  </div>
                  <div className="space-y-3">
                    {languageVariants
                      .filter(v => !v.targetLanguage.includes("源语言"))
                      .map(language => (
                        <div key={language.id} className="p-3 border rounded-lg">
                          <div className="font-medium mb-2">{language.targetLanguage}</div>
                          <div className="flex items-center gap-2">
                            <Select defaultValue="">
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="选择压制" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ve001">孙七 (压制)</SelectItem>
                                <SelectItem value="ve002">周八 (压制)</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm">
                              分配
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowTaskAssignDialog(false)}>
              取消
            </Button>
            <Button onClick={() => setShowTaskAssignDialog(false)}>
              完成
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
        totalEpisodes={languageVariants.find(v => v.id === selectedVariant)?.totalEpisodes || 80}
      />
      
      <SubtitleDownloadDialog
        open={showSubtitleDownload}
        onOpenChange={setShowSubtitleDownload}
        onConfirm={handleSubtitleDownloadConfirm}
        availableLanguages={languageVariants.map(v => v.targetLanguage)}
        totalEpisodes={languageVariants.find(v => v.id === selectedVariant)?.totalEpisodes || 80}
      />
      
      <ConfirmDownloadDialog
        open={showConfirmDownload}
        onOpenChange={setShowConfirmDownload}
        onConfirm={handleConfirmDownloadSubmit}
        title={`${confirmDownloadType}下载`}
        description={`确认下载选中项目的${confirmDownloadType}吗？`}
        totalEpisodes={languageVariants.find(v => v.id === selectedVariant)?.totalEpisodes || 80}
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

      {/* 批量操作对话框（删除/下载） */}
      <BatchOperationDialog
        open={showBatchDialog}
        onOpenChange={setShowBatchDialog}
        mode={batchMode}
        type="drama"
        languages={languageVariants
          .map(v => ({
            id: v.id,
            label: v.targetLanguage.replace("（源语言）", "").replace("（原语言）", ""),
            isSource: v.targetLanguage.includes("源语言") || v.targetLanguage.includes("原语言"),
          }))}
        totalEpisodesOrChapters={totalEpisodes}
        onConfirm={(params) => {
          if (batchMode === "delete") {
            // 模拟删除：如果选了全部集数和全部文件类型（7种），则删除整个语言变体
            const allFileTypes = params.fileTypes.length === 7
            const allEpisodes = params.range === "all"
            if (allFileTypes && allEpisodes) {
              setLanguageVariants(prev => prev.filter(v => !params.languages.includes(v.id)))
            }
            // 否则只是模拟删除部分文件（demo 中不实际删除文件）
          } else {
            // 下载：创建下载队列
            const epRange = params.range === "all"
              ? Array.from({ length: totalEpisodes }, (_, i) => i + 1)
              : (() => { const r = params.range as {start:number;end:number}; return Array.from({ length: r.end - r.start + 1 }, (_, i) => r.start + i) })()
            const items = params.languages.flatMap(langId => {
              const lang = languageVariants.find(v => v.id === langId)?.targetLanguage || langId
              return epRange.flatMap(ep =>
                params.fileTypes.map(ft => ({
                  id: `dl-${langId}-${ep}-${ft}-${Date.now()}`,
                  name: `${lang} 第${ep}集 ${ft}`,
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
    </div>
  )
}
