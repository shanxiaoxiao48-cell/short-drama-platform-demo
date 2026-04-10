"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, CheckCircle, Undo, Redo, Star, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { VideoPlayerPanel } from "./video-player-panel"
import { TimelinePanel } from "./timeline-panel"
import { SubtitleDualPanel } from "./subtitle-dual-panel"
import { OnScreenTextPanel } from "./onscreen-text-panel"
import { GlossaryPanel } from "./glossary-panel"
import { EpisodeSelectorPanel } from "./episode-selector-panel"
import { TranslatorRatingDialog, TranslatorRating } from "./translator-rating-dialog"
import { ModificationComment } from "./modification-comment-dialog"
import { SubtitleStyle, SubtitleStylePanel } from "./subtitle-style-panel"
import { QualityCheckReviewDialog } from "./quality-check-review-dialog"
import { usePermission } from "@/contexts/permission-context"
import { findAvailableTimeSlot, adjustPositionToAvoidCollision, findAvailableTrackIndex } from "@/lib/subtitle-collision-utils"
import { DraggablePanel, PanelConfig } from "./draggable-panel"
import { cn } from "@/lib/utils"

interface EditorPageProps {
  projectId: string | null
  languageVariant: string // 添加语言变体参数
  episodeId: string | null
  workflowStage?: "ai_extract_pending" | "ai_extract_review" | "ai_extract_completed" | "ai_translate" | "manual_translate" | "quality_check" | "completed"
  onBack: () => void
  onConfirmReview?: () => void // AI提取待确认状态下点击确认的回调
  onSubmitReview?: (action?: "submit" | "approve" | "reject") => void // 人工翻译/质检完成后点击提交审核的回调
  videoUrl?: string // 添加视频URL参数
}

interface ModificationRecord {
  userId: string
  userName: string
  role: "translator" | "reviewer"
  originalText: string
  modifiedText: string
  timestamp: string // 改为字符串以避免 hydration 问题
}

interface SubtitleEntry {
  id: string
  startTime: number
  endTime: number
  originalText: string
  translatedText: string
  modifications?: ModificationRecord[]
  comments?: ModificationComment[] // 新增：修改意见列表
}

// Mock subtitle data with modification history
const mockSubtitles: SubtitleEntry[] = [
  {
    id: "1",
    startTime: 0,
    endTime: 3.5,
    originalText: "我从来没有想过会爱上你",
    translatedText: "I never thought I would fall in love with you",
    modifications: [
      {
        userId: "user1",
        userName: "张译员",
        role: "translator",
        originalText: "I never thought I will fall in love with you",
        modifiedText: "I never thought I would fall in love with you",
        timestamp: "2024-01-20T10:30:00",
      },
    ],
  },
  {
    id: "2",
    startTime: 3.5,
    endTime: 6.2,
    originalText: "你是我生命中最重要的人",
    translatedText: "You are the most important person in my life",
    modifications: [
      {
        userId: "user1",
        userName: "张译员",
        role: "translator",
        originalText: "You are the most important people in my life",
        modifiedText: "You are the most important person in my life",
        timestamp: "2024-01-20T10:31:00",
      },
      {
        userId: "user2",
        userName: "李审核",
        role: "reviewer",
        originalText: "You are the most important person in my life",
        modifiedText: "You are the most important person in my life",
        timestamp: "2024-01-20T14:20:00",
      },
    ],
  },
  {
    id: "3",
    startTime: 6.2,
    endTime: 9.8,
    originalText: "我愿意为你做任何事情",
    translatedText: "I am willing to do anything for you",
  },
  {
    id: "4",
    startTime: 9.8,
    endTime: 13.0,
    originalText: "请相信我，我会永远保护你",
    translatedText: "Please believe me, I will always protect you",
  },
  {
    id: "5",
    startTime: 13.0,
    endTime: 16.5,
    originalText: "不管发生什么，我都会在你身边",
    translatedText: "No matter what happens, I will be by your side",
  },
]

// Mock on-screen text data (initial data for useState)
const initialMockOnScreenText = [
  {
    id: "os-1",
    startTime: 5,
    endTime: 8,
    text: "霸道总裁",
    translatedText: "Domineering CEO",
    type: "标题",
    trackIndex: 0
  },
  {
    id: "os-2",
    startTime: 12,
    endTime: 15,
    text: "第一章",
    translatedText: "Chapter 1",
    type: "章节",
    trackIndex: 0
  },
]

// Mock subtitle data with version history for quality check
const mockSubtitlesWithHistory = mockSubtitles.map((sub, index) => ({
  ...sub,
  currentText: sub.translatedText,
  versions: [
    {
      id: `${sub.id}-v1`,
      version: 1,
      type: "ai" as const,
      text: sub.translatedText.replace(/would/g, "will").replace(/person/g, "people"),
      userId: "ai-system",
      userName: "AI翻译",
      timestamp: "2024-01-20T09:00:00",
    },
    {
      id: `${sub.id}-v2`,
      version: 2,
      type: "manual" as const,
      text: sub.translatedText,
      userId: "user1",
      userName: "张译员",
      timestamp: "2024-01-20T10:30:00",
    },
    ...(sub.modifications && sub.modifications.length > 0
      ? [
          {
            id: `${sub.id}-v3`,
            version: 3,
            type: "review" as const,
            text: sub.translatedText,
            userId: "user2",
            userName: "李审核",
            timestamp: "2024-01-20T14:20:00",
          },
        ]
      : []),
  ],
}))

// 项目数据映射 - 根据projectId获取项目信息
const projectDataMap: Record<string, { title: string; totalEpisodes: number; image: string }> = {
  "1": { title: "霸道总裁爱上我", totalEpisodes: 80, image: "/drama-posters/badao-zongcai.png" },
  "2": { title: "穿越之锦绣良缘", totalEpisodes: 60, image: "/drama-posters/chuanyue-jinxiu.png" },
  "3": { title: "重生之商业帝国", totalEpisodes: 100, image: "/drama-posters/chongsheng-shangye.png" },
  "4": { title: "豪门逆袭记", totalEpisodes: 50, image: "/drama-posters/haomen-nixi.png" },
  "5": { title: "这爱你爱婚祥", totalEpisodes: 70, image: "/drama-posters/zhe-aini-aihunxiang.png" },
  "6": { title: "龙王赘婿", totalEpisodes: 90, image: "/drama-posters/longwang-zhuxu.png" },
  "DG001": { title: "霸道总裁爱上我", totalEpisodes: 80, image: "/drama-posters/badao-zongcai.png" },
  "DG002": { title: "穿越之锦绣良缘", totalEpisodes: 60, image: "/drama-posters/chuanyue-jinxiu.png" },
  "DG003": { title: "重生之商业帝国", totalEpisodes: 100, image: "/drama-posters/chongsheng-shangye.png" },
  "DG004": { title: "豪门逆袭记", totalEpisodes: 50, image: "/drama-posters/haomen-nixi.png" },
  "DG005": { title: "甜蜜复仇", totalEpisodes: 70, image: "/drama-posters/zhe-aini-aihunxiang.png" },
  "DG006": { title: "都市修仙传", totalEpisodes: 120, image: "/drama-posters/longwang-zhuxu.png" },
}

// 获取项目数据的辅助函数
const getProjectData = (projectId: string | null) => {
  // 如果在映射表中找到，直接返回
  if (projectId && projectDataMap[projectId]) {
    return projectDataMap[projectId]
  }
  
  // 对于新创建的项目，从 localStorage 获取
  if (typeof window !== 'undefined' && projectId) {
    const savedProjects = localStorage.getItem('drama-projects')
    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects)
        const project = projects.find((p: any) => p.id === projectId)
        if (project) {
          return {
            title: project.title || "未知项目",
            totalEpisodes: project.episodes || 1, // 使用上传的视频文件数量
            image: "/drama-posters/badao-zongcai.png", // 使用默认图片
          }
        }
      } catch (e) {
        console.error('Failed to parse saved projects:', e)
      }
    }
  }
  
  // 默认值
  return { title: "未知项目", totalEpisodes: 80, image: "/drama-posters/badao-zongcai.png" }
}

export function EditorPage({ projectId, languageVariant, episodeId, workflowStage = "manual_translate", onBack, onConfirmReview, onSubmitReview, videoUrl }: EditorPageProps) {
  const { user, hasButton } = usePermission()
  
  // 根据projectId获取项目数据
  const projectData = getProjectData(projectId)
  
  // 判断是否是源语言（包含"源语言"或"原语言"关键字）
  const isSourceLanguage = languageVariant.includes("源语言") || languageVariant.includes("原语言")
  
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedSubtitleId, setSelectedSubtitleId] = useState<string | null>(null)
  
  // 自动选中当前播放位置的字幕
  useEffect(() => {
    if (isPlaying) {
      const currentSub = subtitles.find(
        (s) => currentTime >= s.startTime && currentTime < s.endTime
      )
      if (currentSub && currentSub.id !== selectedSubtitleId) {
        setSelectedSubtitleId(currentSub.id)
      }
    }
  }, [currentTime, isPlaying])
  
  // 字幕可见性状态 - 控制视频预览中的字幕显示
  const [subtitleVisibility, setSubtitleVisibility] = useState({
    original: false, // 源语言默认隐藏
    translated: true, // 译文默认显示
    onscreen: true, // 画面字默认显示
  })
  
  // 面板收起状态 - 从localStorage读取初始状态
  const [panelCollapsed, setPanelCollapsed] = useState<{
    onscreen: boolean
    glossary: boolean
    episode: boolean
    style: boolean // 字幕样式面板
  }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('editor-panel-collapsed')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse panel collapsed state:', e)
        }
      }
    }
    return {
      onscreen: false,
      glossary: false,
      episode: true, // 默认收起
      style: true, // 默认收起
    }
  })
  
  // 切换字幕可见性
  const handleToggleSubtitleVisibility = (track: "original" | "translated" | "onscreen") => {
    setSubtitleVisibility(prev => ({
      ...prev,
      [track]: !prev[track]
    }))
  }
  
  // 切换面板收起状态
  const handleTogglePanelCollapse = (panel: "onscreen" | "glossary" | "episode" | "style") => {
    setPanelCollapsed(prev => {
      const newState = {
        ...prev,
        [panel]: !prev[panel]
      }
      // 保存到localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('editor-panel-collapsed', JSON.stringify(newState))
      }
      return newState
    })
  }
  
  // AI提取工作流程状态判断
  const isPending = workflowStage === "ai_extract_pending" // 待开始
  const isReview = workflowStage === "ai_extract_review" // 待确认（可编辑）
  const isAIExtractCompleted = workflowStage === "ai_extract_completed" // AI提取已完成（只读）
  const isQualityCheck = workflowStage === "quality_check" // 质检环节
  
  // 权限控制：根据用户角色和工作流程阶段决定是否只读
  const isReadOnlyByPermission = (() => {
    // 管理员和项目管理：永远可编辑
    if (user.role === 'admin' || user.role === 'project_manager') {
      return false
    }
    
    // 物料处理人员：只能在AI提取阶段编辑（待确认状态）
    if (user.role === 'material_handler') {
      return !isReview // 只有待确认状态可编辑
    }
    
    // 译者：只能在人工翻译阶段编辑
    if (user.role === 'translator') {
      return workflowStage !== 'manual_translate'
    }
    
    // 质检：只能在质检阶段编辑
    if (user.role === 'quality_checker') {
      return workflowStage !== 'quality_check'
    }
    
    // 视频压制：不能编辑字幕
    if (user.role === 'video_encoder') {
      return true
    }
    
    return false
  })()
  
  const isReadOnly = isAIExtractCompleted || isReadOnlyByPermission // 只读模式：AI提取已完成 或 权限不足
  
  // 根据工作流程阶段决定显示内容
  const hasData = !isPending // 待开始状态没有数据
  // 源语言永远不显示翻译，只有翻译语言在非AI提取阶段才显示翻译
  const showTranslation = !isSourceLanguage && !isPending && !isReview && !isAIExtractCompleted
  const showDualSubtitles = isReview || isAIExtractCompleted // 待确认和已完成状态显示双字幕
  const showStylePanel = !isPending // 待开始状态不显示字幕样式面板
  
  // 按钮显示控制：根据权限和工作流程阶段
  const showCompleteButton = (() => {
    // 待开始、待确认、已完成状态不显示完成本集按钮
    if (isPending || isReview || isAIExtractCompleted) {
      return false
    }
    
    // 检查是否有完成本集的权限
    return hasButton('complete_episode')
  })()
  
  const showSubmitButton = (() => {
    // 待开始状态不显示提交按钮
    if (isPending) {
      return false
    }
    
    // 待确认状态显示确认按钮（物料处理人员）
    if (isReview) {
      return hasButton('save')
    }
    
    // AI提取已完成状态不显示按钮
    if (isAIExtractCompleted) {
      return false
    }
    
    // 其他状态：译者和质检显示提交审核/确认按钮
    return hasButton('submit_review') || hasButton('confirm_pass')
  })()
  
  const showModifications = isQualityCheck // 只在质检环节显示修改标记
  
  // 如果是待开始状态，使用空数据；否则使用mock数据
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>(hasData ? mockSubtitles : [])
  
  // 为原文和译文分别存储时间信息
  const [originalTiming, setOriginalTiming] = useState<Record<string, { startTime: number; endTime: number; trackIndex?: number }>>(() => {
    const timing: Record<string, { startTime: number; endTime: number; trackIndex?: number }> = {}
    mockSubtitles.forEach(s => {
      timing[s.id] = { startTime: s.startTime, endTime: s.endTime, trackIndex: 0 }
    })
    return timing
  })

  const [translatedTiming, setTranslatedTiming] = useState<Record<string, { startTime: number; endTime: number; trackIndex?: number }>>(() => {
    const timing: Record<string, { startTime: number; endTime: number; trackIndex?: number }> = {}
    mockSubtitles.forEach(s => {
      timing[s.id] = { startTime: s.startTime, endTime: s.endTime, trackIndex: 0 }
    })
    return timing
  })

  // 画面字状态 - 可动态添加
  interface OnScreenTextEntry {
    id: string
    startTime: number
    endTime: number
    text: string
    translatedText?: string
    type?: string
    trackIndex?: number
  }

  const [mockOnScreenText, setMockOnScreenText] = useState<OnScreenTextEntry[]>(() => {
    return hasData ? initialMockOnScreenText.map(item => ({ ...item, trackIndex: item.trackIndex ?? 0 })) : []
  })

  // 画面字时间状态 - 用于支持多轨道
  const [onScreenTiming, setOnScreenTiming] = useState<Record<string, { startTime: number; endTime: number; trackIndex?: number }>>(() => {
    const timing: Record<string, { startTime: number; endTime: number; trackIndex?: number }> = {}
    initialMockOnScreenText.forEach(item => {
      timing[item.id] = { startTime: item.startTime, endTime: item.endTime, trackIndex: 0 }
    })
    return timing
  })
  
  const [currentEpisode, setCurrentEpisode] = useState(() => {
    if (isPending) return 1
    if (isReview) return 1
    if (isAIExtractCompleted) return 1
    // 人工翻译和质检环节：自动跳转到完成集数的下一集
    // 根据项目ID获取已完成的集数
    const getCompletedEpisodesForProject = () => {
      // 霸道总裁项目（ID为"1"或"DG001"）- 英语翻译已完成60集
      if ((projectId === "1" || projectId === "DG001") && languageVariant === "英语") {
        return 60
      }
      // 霸道总裁项目 - 西班牙语翻译已完成36集
      if ((projectId === "1" || projectId === "DG001") && languageVariant === "西班牙语") {
        return 36
      }
      // 霸道总裁项目 - 葡萄牙语翻译已完成24集
      if ((projectId === "1" || projectId === "DG001") && languageVariant === "葡萄牙语") {
        return 24
      }
      // 霸道总裁项目 - 泰语翻译已完成72集
      if ((projectId === "1" || projectId === "DG001") && languageVariant === "泰语") {
        return 72
      }
      // 重生之商业帝国（ID为"3"或"DG003"）- 葡萄牙语翻译已完成12集
      if ((projectId === "3" || projectId === "DG003") && languageVariant === "葡萄牙语") {
        return 12
      }
      // 这爱你爱婚祥/甜蜜复仇（ID为"5"或"DG005"）- 印尼语翻译已完成35集
      if ((projectId === "5" || projectId === "DG005") && languageVariant === "印尼语") {
        return 35
      }
      // 默认返回11集（用于演示）
      return 11
    }
    
    const completedCount = getCompletedEpisodesForProject()
    const nextEpisode = completedCount + 1
    return nextEpisode <= projectData.totalEpisodes ? nextEpisode : completedCount
  })
  
  const [completedEpisodes, setCompletedEpisodes] = useState<number[]>(() => {
    if (isPending) return []
    if (isReview) return []
    if (isAIExtractCompleted) return Array.from({ length: projectData.totalEpisodes }, (_, i) => i + 1) // AI提取已完成：所有集数都打勾
    
    // 人工翻译和质检：根据项目ID和语言获取已完成的集数
    const getCompletedEpisodesForProject = () => {
      // 霸道总裁项目（ID为"1"或"DG001"）- 英语翻译已完成60集
      if ((projectId === "1" || projectId === "DG001") && languageVariant === "英语") {
        return Array.from({ length: 60 }, (_, i) => i + 1)
      }
      // 霸道总裁项目 - 西班牙语翻译已完成36集
      if ((projectId === "1" || projectId === "DG001") && languageVariant === "西班牙语") {
        return Array.from({ length: 36 }, (_, i) => i + 1)
      }
      // 霸道总裁项目 - 葡萄牙语翻译已完成24集
      if ((projectId === "1" || projectId === "DG001") && languageVariant === "葡萄牙语") {
        return Array.from({ length: 24 }, (_, i) => i + 1)
      }
      // 霸道总裁项目 - 泰语翻译已完成72集
      if ((projectId === "1" || projectId === "DG001") && languageVariant === "泰语") {
        return Array.from({ length: 72 }, (_, i) => i + 1)
      }
      // 重生之商业帝国（ID为"3"或"DG003"）- 葡萄牙语翻译已完成12集
      if ((projectId === "3" || projectId === "DG003") && languageVariant === "葡萄牙语") {
        return Array.from({ length: 12 }, (_, i) => i + 1)
      }
      // 这爱你爱婚祥/甜蜜复仇（ID为"5"或"DG005"）- 印尼语翻译已完成35集
      if ((projectId === "5" || projectId === "DG005") && languageVariant === "印尼语") {
        return Array.from({ length: 35 }, (_, i) => i + 1)
      }
      // 默认返回1-11集（用于演示）
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    }
    
    return getCompletedEpisodesForProject()
  })
  
  // 驳回的集数列表（质检环节使用）
  const [rejectedEpisodes, setRejectedEpisodes] = useState<number[]>([])

  // 术语表数据
  interface GlossaryEntry {
    term: string
    category: string
    explanation: string
    translation?: string
  }

  const [translationGlossary, setTranslationGlossary] = useState<GlossaryEntry[]>([
    { term: "总裁", translation: "CEO / President", explanation: "公司的最高管理者", category: "职位" },
    { term: "少爷", translation: "Young Master", explanation: "对富贵人家年轻男子的尊称", category: "称谓" },
    { term: "契约", translation: "Contract", explanation: "具有法律约束力的协议", category: "法律" },
    { term: "豪门", translation: "Wealthy family", explanation: "有钱有势的家族", category: "社会阶层" },
  ])

  const [extractionGlossary, setExtractionGlossary] = useState<GlossaryEntry[]>([
    { term: "总裁", category: "职位", explanation: "公司的最高管理者，负责公司的整体运营和决策" },
    { term: "少爷", category: "称谓", explanation: "对富贵人家年轻男子的尊称" },
    { term: "契约", category: "法律", explanation: "双方或多方之间具有法律约束力的协议" },
    { term: "豪门", category: "社会阶层", explanation: "指有钱有势的家族或家庭" },
  ])

  // 本集修改意见状态（质检环节驳回时使用）
  const [episodeRejectionReason, setEpisodeRejectionReason] = useState("")
  const [showRejectionDialog, setShowRejectionDialog] = useState(false)
  
  const totalEpisodes = projectData.totalEpisodes // 使用项目的实际集数
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>({
    fontSize: 16,
    verticalPosition: 85,
    positionX: 50, // 默认水平居中
    positionY: 20, // 默认垂直位置（译文字幕默认在上方）
    scale: 1, // 默认缩放比例
    applyToAll: true, // 默认应用到全部字幕
    fontWeight: "normal", // 默认不加粗
    fontStyle: "normal", // 默认不倾斜
    strokeWidth: 0, // 默认无描边
    strokeColor: "#000000", // 描边颜色
    strokeEnabled: true, // 描边启用
    shadowBlur: 15, // 默认阴影模糊度
    shadowColor: "#000000", // 阴影颜色
    shadowOffsetX: -45, // 阴影角度
    shadowOffsetY: 5, // 阴影距离
    shadowOpacity: 90, // 阴影不透明度
    shadowEnabled: true, // 阴影启用
    animationEffect: "none", // 默认无动效
    animationDuration: 0.5, // 动效时长
    lineHeight: 1.4, // 默认行距
    letterSpacing: 0, // 默认字间距
    verticalAlign: "middle", // 默认垂直居中
  })
  
  // 译员评分状态
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false)
  const [translatorRating, setTranslatorRating] = useState<TranslatorRating | undefined>(undefined)
  
  // 审核对话框状态
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [currentRound, setCurrentRound] = useState(1) // 当前轮次，默认为1
  
  const duration = 180 // 3 minutes

  // Draggable panel configs
  // Calculate default panel layout based on window size
  const calcDefaultPanels = (): Record<string, PanelConfig> => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1400
    const h = typeof window !== 'undefined' ? window.innerHeight - 56 : 800 // minus header
    // Layout: video(left) | subtitle+onscreen+glossary(center) | style(right, hidden)
    //         timeline(bottom, full width)
    const videoW = Math.round(w * 0.25)
    const timelineH = Math.round(h * 0.32)
    const topH = h - timelineH
    const centerW = Math.round(w * 0.40)
    const sideW = Math.round(w * 0.18)
    const rightX = videoW + centerW
    return {
      video:    { id: "video",    title: "视频预览", x: 0,       y: 0, width: videoW,  height: topH,     minWidth: 280, minHeight: 250, visible: true,  minimized: false, zIndex: 10 },
      subtitle: { id: "subtitle", title: "字幕编辑", x: videoW,  y: 0, width: centerW, height: topH,     minWidth: 280, minHeight: 200, visible: true,  minimized: false, zIndex: 11 },
      onscreen: { id: "onscreen", title: "画面字",   x: rightX,  y: 0, width: sideW,   height: Math.round(topH * 0.5), minWidth: 180, minHeight: 150, visible: true,  minimized: false, zIndex: 13 },
      glossary: { id: "glossary", title: "术语表",   x: rightX,  y: Math.round(topH * 0.5), width: sideW, height: Math.round(topH * 0.5), minWidth: 180, minHeight: 150, visible: true,  minimized: false, zIndex: 14 },
      style:    { id: "style",    title: "字幕样式", x: rightX + sideW, y: 0, width: w - rightX - sideW, height: topH, minWidth: 200, minHeight: 250, visible: false, minimized: false, zIndex: 15 },
      episode:  { id: "episode",  title: "选集",     x: rightX + sideW, y: 0, width: w - rightX - sideW, height: topH, minWidth: 180, minHeight: 150, visible: false, minimized: false, zIndex: 16 },
      timeline: { id: "timeline", title: "时间轴",   x: 0,       y: topH, width: w,    height: timelineH, minWidth: 400, minHeight: 150, visible: true,  minimized: false, zIndex: 12 },
    }
  }

  // Auto-layout: distribute visible panels to fill the screen
  // Layout strategy: video(left col) | middle panels stacked | right side panels stacked
  //                  timeline(bottom row, full width)
  const autoLayout = (currentPanels: Record<string, PanelConfig>, w: number, h: number): Record<string, PanelConfig> => {
    const result = { ...currentPanels }
    const visible = Object.values(result).filter(p => p.visible && !p.minimized)
    if (visible.length === 0) return result

    const hasTimeline = result.timeline?.visible && !result.timeline?.minimized
    const timelineH = hasTimeline ? Math.round(h * 0.30) : 0
    const topH = h - timelineH

    // Separate into: video, timeline, and "top panels" (everything else)
    const topPanels = visible.filter(p => p.id !== "timeline")
    
    // Classify top panels into columns
    const leftIds = ["video"]
    const centerIds = ["subtitle"]
    const rightIds = ["onscreen", "glossary", "style", "episode"]

    const leftVisible = topPanels.filter(p => leftIds.includes(p.id))
    const centerVisible = topPanels.filter(p => centerIds.includes(p.id))
    const rightVisible = topPanels.filter(p => rightIds.includes(p.id))

    // Calculate column widths based on what's visible
    const cols: Array<{ panels: typeof topPanels; minW: number }> = []
    if (leftVisible.length > 0) cols.push({ panels: leftVisible, minW: 280 })
    if (centerVisible.length > 0) cols.push({ panels: centerVisible, minW: 300 })
    if (rightVisible.length > 0) cols.push({ panels: rightVisible, minW: 200 })

    // Distribute width proportionally
    const totalMinW = cols.reduce((s, c) => s + c.minW, 0)
    const weights = cols.length === 1 ? [1] :
      cols.length === 2 ? [0.35, 0.65] :
      cols.length === 3 ? [0.25, 0.45, 0.30] : []

    let colX = 0
    cols.forEach((col, ci) => {
      const colW = Math.max(col.minW, Math.round(w * (weights[ci] || 1 / cols.length)))
      const actualW = ci === cols.length - 1 ? w - colX : colW // last col takes remaining
      // Stack panels vertically within column
      const panelH = Math.round(topH / col.panels.length)
      col.panels.forEach((p, pi) => {
        const pH = pi === col.panels.length - 1 ? topH - pi * panelH : panelH
        result[p.id] = { ...result[p.id], x: colX, y: pi * panelH, width: actualW, height: pH }
      })
      colX += actualW
    })

    // Timeline: full width at bottom
    if (hasTimeline) {
      result.timeline = { ...result.timeline, x: 0, y: topH, width: w, height: timelineH }
    }

    return result
  }

  const [panels, setPanels] = useState<Record<string, PanelConfig>>(() => {
    const defaults = calcDefaultPanels()
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('editor-panel-layout-v2')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const result: Record<string, PanelConfig> = {}
          for (const [key, def] of Object.entries(defaults)) {
            const p = parsed[key]
            if (p && typeof p.x === 'number' && typeof p.width === 'number') {
              result[key] = { ...def, ...p }
            } else {
              result[key] = def
            }
          }
          return result
        } catch { /* fall through */ }
      }
    }
    return defaults
  })

  const [maxZ, setMaxZ] = useState(20)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 1400, height: 800 })

  // Measure container and re-layout on resize
  useEffect(() => {
    const measure = () => {
      if (editorContainerRef.current) {
        const w = editorContainerRef.current.clientWidth
        const h = editorContainerRef.current.clientHeight
        setContainerSize({ width: w, height: h })
      }
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  // Re-layout when container size changes
  useEffect(() => {
    if (containerSize.width > 0 && containerSize.height > 0) {
      setPanels(prev => {
        const laid = autoLayout(prev, containerSize.width, containerSize.height)
        if (typeof window !== 'undefined') localStorage.setItem('editor-panel-layout-v2', JSON.stringify(laid))
        return laid
      })
    }
  }, [containerSize])

  const savePanels = (next: Record<string, PanelConfig>) => {
    if (typeof window !== 'undefined') localStorage.setItem('editor-panel-layout-v2', JSON.stringify(next))
  }

  const updatePanel = (id: string, config: PanelConfig) => {
    setPanels(prev => {
      const next = { ...prev, [id]: config }
      savePanels(next)
      return next
    })
  }

  const bringToFront = (id: string) => {
    setMaxZ(z => {
      const newZ = z + 1
      setPanels(prev => ({ ...prev, [id]: { ...prev[id], zIndex: newZ } }))
      return newZ
    })
  }

  const togglePanel = (id: string) => {
    setPanels(prev => {
      const p = prev[id]
      const toggled = { ...prev, [id]: { ...p, visible: !p.visible, minimized: false } }
      // Auto-relayout after toggle
      const laid = autoLayout(toggled, containerSize.width, containerSize.height)
      savePanels(laid)
      return laid
    })
  }

  // 检查是否所有集数都已完成
  const allEpisodesCompleted = completedEpisodes.length === totalEpisodes

  // Get current subtitle based on time
  // 待确认状态显示原文字幕，其他状态显示翻译字幕
  const currentSubtitle = subtitles.find(
    (s) => currentTime >= s.startTime && currentTime < s.endTime
  )
  
  // 获取当前时间的画面字
  const currentOnScreenTexts = mockOnScreenText.filter(
    (item: OnScreenTextEntry) => currentTime >= item.startTime && currentTime < item.endTime
  )

  // 人工翻译和质检环节：画面字显示英文（翻译文本）
  const isTranslationOrQualityStage = workflowStage === "manual_translate" || workflowStage === "quality_check"
  const transformedOnScreenText = hasData ? mockOnScreenText.map(item => ({
    ...item,
    track: "onscreen" as const,
    trackIndex: onScreenTiming[item.id]?.trackIndex ?? item.trackIndex ?? 0,
    text: isTranslationOrQualityStage ? (item.translatedText || item.text) : item.text
  })) : []

  // 根据状态决定显示哪个字幕
  // 源语言：始终显示原文字幕
  // 翻译语言：待确认状态显示原文，其他状态显示翻译
  const displaySubtitle = isSourceLanguage 
    ? currentSubtitle?.originalText 
    : (isReview ? currentSubtitle?.originalText : (showTranslation ? currentSubtitle?.translatedText : null))

  const handleFrameStep = (direction: "forward" | "backward") => {
    const frameStep = 1 / 30 // 30 fps
    const newTime =
      direction === "forward" ? currentTime + frameStep : Math.max(0, currentTime - frameStep)
    setCurrentTime(newTime)
  }

  const handleUpdateSubtitle = (
    id: string,
    field: "originalText" | "translatedText",
    value: string
  ) => {
    // 只读模式下不允许编辑
    if (isReadOnly) return
    
    setSubtitles((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  const handleUpdateSubtitleTime = (id: string, startTime: number, endTime: number) => {
    // 只读模式下不允许编辑
    if (isReadOnly) return
    
    // 从带前缀的ID中提取基础ID和轨道类型
    const trackPrefix = id.match(/^(orig|trans|os)-/)?.[1]
    const baseId = id.replace(/^(orig|trans|os)-/, "")
    
    // 根据轨道类型更新对应的时间数据
    if (trackPrefix === "orig") {
      setOriginalTiming((prev) => {
        // 获取所有原文字幕的时间，按ID排序
        const allIds = Object.keys(prev).sort((a, b) => parseInt(a) - parseInt(b))
        const currentIndex = allIds.indexOf(baseId)
        
        if (currentIndex === -1) return prev
        
        // 检查与前后字幕的碰撞
        const prevId = allIds[currentIndex - 1]
        const nextId = allIds[currentIndex + 1]
        
        let adjustedStartTime = startTime
        let adjustedEndTime = endTime
        
        // 限制开始时间：不能早于前一句的结束时间
        if (prevId && prev[prevId] && adjustedStartTime < prev[prevId].endTime) {
          adjustedStartTime = prev[prevId].endTime
        }
        
        // 限制结束时间：不能晚于后一句的开始时间
        if (nextId && prev[nextId] && adjustedEndTime > prev[nextId].startTime) {
          adjustedEndTime = prev[nextId].startTime
        }
        
        // 确保结束时间大于开始时间
        if (adjustedEndTime <= adjustedStartTime) {
          return prev
        }
        
        return {
          ...prev,
          [baseId]: { startTime: adjustedStartTime, endTime: adjustedEndTime }
        }
      })
    } else if (trackPrefix === "trans") {
      setTranslatedTiming((prev) => {
        // 获取所有译文字幕的时间，按ID排序
        const allIds = Object.keys(prev).sort((a, b) => parseInt(a) - parseInt(b))
        const currentIndex = allIds.indexOf(baseId)
        
        if (currentIndex === -1) return prev
        
        // 检查与前后字幕的碰撞
        const prevId = allIds[currentIndex - 1]
        const nextId = allIds[currentIndex + 1]
        
        let adjustedStartTime = startTime
        let adjustedEndTime = endTime
        
        // 限制开始时间：不能早于前一句的结束时间
        if (prevId && prev[prevId] && adjustedStartTime < prev[prevId].endTime) {
          adjustedStartTime = prev[prevId].endTime
        }
        
        // 限制结束时间：不能晚于后一句的开始时间
        if (nextId && prev[nextId] && adjustedEndTime > prev[nextId].startTime) {
          adjustedEndTime = prev[nextId].startTime
        }
        
        // 确保结束时间大于开始时间
        if (adjustedEndTime <= adjustedStartTime) {
          return prev
        }
        
        return {
          ...prev,
          [baseId]: { startTime: adjustedStartTime, endTime: adjustedEndTime }
        }
      })
    }
    // 画面字轨道暂时不处理，可以后续添加
  }
  
  // 在光标位置添加字幕（带碰撞检测和多轨道支持）
  const handleAddSubtitle = (track: "original" | "translated" | "onscreen", startTime: number, endTime: number) => {
    // 只读模式下不允许添加
    if (isReadOnly) return

    // 使用固定的2秒时长
    const defaultDuration = 2
    endTime = startTime + defaultDuration

    // 获取对应轨道的现有字幕（包含trackIndex）
    let existingSubtitles: Array<{ id: string; startTime: number; endTime: number; trackIndex?: number }> = []

    if (track === "original") {
      existingSubtitles = originalBlocks.map(block => ({
        id: block.id,
        startTime: block.startTime,
        endTime: block.endTime,
        trackIndex: (block as any).trackIndex ?? 0
      }))
    } else if (track === "translated") {
      existingSubtitles = translatedBlocks.map(block => ({
        id: block.id,
        startTime: block.startTime,
        endTime: block.endTime,
        trackIndex: (block as any).trackIndex ?? 0
      }))
    } else if (track === "onscreen") {
      existingSubtitles = transformedOnScreenText.map((item: any) => ({
        id: item.id,
        startTime: item.startTime,
        endTime: item.endTime,
        trackIndex: item.trackIndex ?? 0
      }))
    }

    // 检查是否有碰撞
    const hasCollision = existingSubtitles.some(sub =>
      startTime < sub.endTime && sub.startTime < endTime
    )

    let trackIndex = 0

    if (hasCollision) {
      // 找到可用的轨道索引（在现有轨道下方）
      trackIndex = findAvailableTrackIndex(startTime, endTime, existingSubtitles)
    }

    // 画面字处理：添加到画面字面板和轨道
    if (track === "onscreen") {
      const newId = `os-${Date.now()}`
      const newOnScreenText: OnScreenTextEntry = {
        id: newId,
        startTime,
        endTime,
        text: "新画面字",
        translatedText: "New on-screen text",
        type: "自定义",
        trackIndex
      }

      // 添加到画面字状态
      setMockOnScreenText((prev) => [...prev, newOnScreenText])

      // 更新画面字时间状态
      setOnScreenTiming((prev) => ({
        ...prev,
        [newId]: { startTime, endTime, trackIndex }
      }))

      // 选中新添加的画面字
      setSelectedSubtitleId(newId)
      return
    }

    // 原文和译文字幕处理
    const newId = `new-${Date.now()}`
    const newSubtitle: SubtitleEntry = {
      id: newId,
      startTime,
      endTime,
      originalText: track === "original" ? "新字幕" : "",
      translatedText: track === "translated" ? "New subtitle" : "",
    }

    // 添加到字幕列表
    setSubtitles((prev) => [...prev, newSubtitle])

    // 更新时间信息
    if (track === "original") {
      setOriginalTiming((prev) => ({
        ...prev,
        [newId]: { startTime, endTime, trackIndex }
      }))
    } else if (track === "translated") {
      setTranslatedTiming((prev) => ({
        ...prev,
        [newId]: { startTime, endTime, trackIndex }
      }))
    }

    // 选中新添加的字幕
    const prefixedId = track === "original" ? `orig-${newId}` : `trans-${newId}`
    setSelectedSubtitleId(prefixedId)
  }

  // 拆轴：将一条字幕从指定时间点拆成两条
  const handleSplitSubtitle = (id: string, splitTime?: number) => {
    if (isReadOnly) return
    // Check if it's an onscreen text
    const osPrefix = id.startsWith("os-")
    const baseId = id.replace(/^(orig|trans|os)-/, "")

    if (osPrefix || mockOnScreenText.some(o => o.id === baseId || o.id === id)) {
      const osId = osPrefix ? baseId : id
      const item = mockOnScreenText.find(o => o.id === osId)
      if (!item) return
      const mid = splitTime ?? (item.startTime + item.endTime) / 2
      const newId = `os-split-${Date.now()}`
      setMockOnScreenText(prev => [
        ...prev.map(o => o.id === osId ? { ...o, endTime: mid } : o),
        { ...item, id: newId, startTime: mid, text: item.text, translatedText: item.translatedText }
      ])
      setOnScreenTiming(prev => ({
        ...prev,
        [osId]: { ...prev[osId], endTime: mid },
        [newId]: { startTime: mid, endTime: item.endTime, trackIndex: item.trackIndex ?? 0 }
      }))
      return
    }

    // Subtitle split
    const sub = subtitles.find(s => s.id === baseId || s.id === id)
    if (!sub) return
    const subId = sub.id
    const mid = splitTime ?? (sub.startTime + sub.endTime) / 2
    const newId = `split-${Date.now()}`
    setSubtitles(prev => [
      ...prev.map(s => s.id === subId ? { ...s, endTime: mid } : s),
      { ...sub, id: newId, startTime: mid }
    ])
    setOriginalTiming(prev => ({
      ...prev,
      [subId]: { ...(prev[subId] || { startTime: sub.startTime, endTime: sub.endTime }), endTime: mid },
      [newId]: { startTime: mid, endTime: sub.endTime, trackIndex: 0 }
    }))
    setTranslatedTiming(prev => ({
      ...prev,
      [subId]: { ...(prev[subId] || { startTime: sub.startTime, endTime: sub.endTime }), endTime: mid },
      [newId]: { startTime: mid, endTime: sub.endTime, trackIndex: 0 }
    }))
  }

  // 合轴：将两条相邻字幕合并为一条
  const handleMergeSubtitles = (id1: string, id2: string) => {
    if (isReadOnly) return
    const base1 = id1.replace(/^(orig|trans|os)-/, "")
    const base2 = id2.replace(/^(orig|trans|os)-/, "")
    const isOs = id1.startsWith("os-") || mockOnScreenText.some(o => o.id === base1)

    if (isOs) {
      const os1 = mockOnScreenText.find(o => o.id === base1 || o.id === id1)
      const os2 = mockOnScreenText.find(o => o.id === base2 || o.id === id2)
      if (!os1 || !os2) return
      const keepId = os1.startTime <= os2.startTime ? (os1.id) : (os2.id)
      const removeId = keepId === os1.id ? os2.id : os1.id
      const mergedStart = Math.min(os1.startTime, os2.startTime)
      const mergedEnd = Math.max(os1.endTime, os2.endTime)
      const mergedText = os1.startTime <= os2.startTime ? `${os1.text} ${os2.text}` : `${os2.text} ${os1.text}`
      const mergedTrans = os1.startTime <= os2.startTime ? `${os1.translatedText || ""} ${os2.translatedText || ""}`.trim() : `${os2.translatedText || ""} ${os1.translatedText || ""}`.trim()
      setMockOnScreenText(prev => prev.filter(o => o.id !== removeId).map(o => o.id === keepId ? { ...o, startTime: mergedStart, endTime: mergedEnd, text: mergedText, translatedText: mergedTrans } : o))
      setOnScreenTiming(prev => { const n = { ...prev }; delete n[removeId]; n[keepId] = { startTime: mergedStart, endTime: mergedEnd, trackIndex: os1.trackIndex ?? 0 }; return n })
      return
    }

    const sub1 = subtitles.find(s => s.id === base1 || s.id === id1)
    const sub2 = subtitles.find(s => s.id === base2 || s.id === id2)
    if (!sub1 || !sub2) return
    const keepId = sub1.startTime <= sub2.startTime ? sub1.id : sub2.id
    const removeId = keepId === sub1.id ? sub2.id : sub1.id
    const mergedStart = Math.min(sub1.startTime, sub2.startTime)
    const mergedEnd = Math.max(sub1.endTime, sub2.endTime)
    setSubtitles(prev => prev.filter(s => s.id !== removeId).map(s => s.id === keepId ? {
      ...s, startTime: mergedStart, endTime: mergedEnd,
      originalText: sub1.startTime <= sub2.startTime ? `${sub1.originalText} ${sub2.originalText}` : `${sub2.originalText} ${sub1.originalText}`,
      translatedText: sub1.startTime <= sub2.startTime ? `${sub1.translatedText} ${sub2.translatedText}` : `${sub2.translatedText} ${sub1.translatedText}`,
    } : s))
    const updateTiming = (prev: Record<string, any>) => { const n = { ...prev }; delete n[removeId]; n[keepId] = { startTime: mergedStart, endTime: mergedEnd, trackIndex: 0 }; return n }
    setOriginalTiming(updateTiming)
    setTranslatedTiming(updateTiming)
  }

  // 添加术语
  const handleAddTerm = (termData: { term: string; category: string; explanation: string; translation?: string }) => {
    // 根据当前阶段决定添加到哪个术语表
    if (isReview || isAIExtractCompleted) {
      // AI提取阶段：添加到extractionGlossary（无翻译字段）
      setExtractionGlossary((prev) => [
        ...prev,
        { term: termData.term, category: termData.category, explanation: termData.explanation }
      ])
    } else {
      // 人工翻译和质检阶段：添加到translationGlossary（有翻译字段）
      setTranslationGlossary((prev) => [
        ...prev,
        {
          term: termData.term,
          category: termData.category,
          explanation: termData.explanation,
          translation: termData.translation
        }
      ])
    }
  }

  // AI重新提取处理（演示用）
  const handleRefresh = async () => {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 演示：重新生成一些随机数据来模拟刷新效果
    // 在实际应用中，这里会调用真实的AI提取API
    console.log("AI重新提取完成")
  }

  // Convert subtitles to timeline blocks with independent timing
  const originalBlocks = subtitles.map((s) => ({
    id: `orig-${s.id}`,
    startTime: originalTiming[s.id]?.startTime ?? s.startTime,
    endTime: originalTiming[s.id]?.endTime ?? s.endTime,
    text: s.originalText,
    track: "original" as const,
    trackIndex: originalTiming[s.id]?.trackIndex ?? 0,
  }))

  const translatedBlocks = subtitles.map((s) => ({
    id: `trans-${s.id}`,
    startTime: translatedTiming[s.id]?.startTime ?? s.startTime,
    endTime: translatedTiming[s.id]?.endTime ?? s.endTime,
    text: s.translatedText,
    track: "translated" as const,
    trackIndex: translatedTiming[s.id]?.trackIndex ?? 0,
  }))

  const handleSelectFromTimeline = (id: string) => {
    // 直接使用完整的ID（包含前缀），这样只有被点击的那个块会被选中
    setSelectedSubtitleId(id)
  }

  const handleCompleteEpisode = () => {
    // 标记当前集为完成
    if (!completedEpisodes.includes(currentEpisode)) {
      setCompletedEpisodes([...completedEpisodes, currentEpisode])
    }
    
    // 自动跳转到下一集
    if (currentEpisode < totalEpisodes) {
      setCurrentEpisode(currentEpisode + 1)
      setCurrentTime(0)
      setSelectedSubtitleId(null)
      // TODO: 加载下一集的字幕数据
    }
  }

  const handleEpisodeChange = (episode: number) => {
    setCurrentEpisode(episode)
    setCurrentTime(0)
    setSelectedSubtitleId(null)
    // TODO: 加载对应集数的字幕数据
  }
  
  // AI提取待确认状态的导航函数
  const handleConfirmEpisode = () => {
    // 标记当前集为完成
    if (!completedEpisodes.includes(currentEpisode)) {
      setCompletedEpisodes([...completedEpisodes, currentEpisode])
    }
    
    // 自动跳转到下一集（如果不是最后一集）
    if (currentEpisode < totalEpisodes) {
      setCurrentEpisode(currentEpisode + 1)
      setCurrentTime(0)
      setSelectedSubtitleId(null)
      // TODO: 加载下一集的字幕数据
    }
  }
  
  const handlePrevEpisode = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode(currentEpisode - 1)
      setCurrentTime(0)
      setSelectedSubtitleId(null)
      // TODO: 加载上一集的字幕数据
    }
  }
  
  const handleNextEpisode = () => {
    if (currentEpisode < totalEpisodes) {
      setCurrentEpisode(currentEpisode + 1)
      setCurrentTime(0)
      setSelectedSubtitleId(null)
      // TODO: 加载下一集的字幕数据
    }
  }
  
  // 审核环节：驳回本集
  const handleRejectEpisode = () => {
    // 打开驳回对话框，让用户填写修改意见
    setShowRejectionDialog(true)
  }
  
  // 确认驳回本集（填写完修改意见后）
  const handleConfirmRejectEpisode = () => {
    if (!episodeRejectionReason.trim()) {
      alert("请填写驳回理由")
      return
    }
    
    // 标记当前集为驳回
    if (!rejectedEpisodes.includes(currentEpisode)) {
      setRejectedEpisodes([...rejectedEpisodes, currentEpisode])
    }
    
    // 从已完成列表中移除（如果存在）
    setCompletedEpisodes(completedEpisodes.filter(ep => ep !== currentEpisode))
    
    // 关闭对话框并清空理由
    setShowRejectionDialog(false)
    setEpisodeRejectionReason("")
    
    // 自动跳转到下一集
    if (currentEpisode < totalEpisodes) {
      setCurrentEpisode(currentEpisode + 1)
      setCurrentTime(0)
      setSelectedSubtitleId(null)
      // TODO: 加载下一集的字幕数据
    }
  }
  
  // 审核环节：通过本集
  const handleApproveEpisode = () => {
    // 标记当前集为完成
    if (!completedEpisodes.includes(currentEpisode)) {
      setCompletedEpisodes([...completedEpisodes, currentEpisode])
    }
    
    // 从驳回列表中移除（如果存在）
    setRejectedEpisodes(rejectedEpisodes.filter(ep => ep !== currentEpisode))
    
    // 自动跳转到下一集
    if (currentEpisode < totalEpisodes) {
      setCurrentEpisode(currentEpisode + 1)
      setCurrentTime(0)
      setSelectedSubtitleId(null)
      // TODO: 加载下一集的字幕数据
    }
  }
  
  // 处理修改意见更新
  const handleUpdateComment = (subtitleId: string, comment: ModificationComment | null) => {
    setSubtitles((prev) =>
      prev.map((s) => {
        if (s.id === subtitleId) {
          if (comment === null || !comment.comment) {
            // 删除意见
            return { ...s, comments: [] }
          } else {
            // 添加或更新意见
            return { ...s, comments: [comment] }
          }
        }
        return s
      })
    )
  }
  
  // 处理版本回退
  const handleRevertVersion = (subtitleId: string, versionId: string) => {
    console.log('回退版本:', subtitleId, versionId)
    // TODO: 实现版本回退逻辑
    // 1. 找到对应的版本
    // 2. 将该版本的文本设置为当前文本
    // 3. 创建新的版本记录
  }
  
  // 处理全部回退
  const handleRevertAll = () => {
    if (confirm('确定要将所有字幕回退到初始版本吗？此操作不可撤销。')) {
      console.log('全部回退到初始版本')
      // TODO: 实现全部回退逻辑
    }
  }
  
  // 处理译员评分提交
  const handleSubmitRating = (rating: Omit<TranslatorRating, 'reviewerId' | 'reviewerName' | 'timestamp'>) => {
    const fullRating: TranslatorRating = {
      ...rating,
      reviewerId: user.id,
      reviewerName: user.name,
      timestamp: new Date().toISOString(),
    }
    setTranslatorRating(fullRating)
    // TODO: 保存到后端
  }
  
  // 处理审核通过
  const handleApproveReview = () => {
    console.log('审核通过')
    // TODO: 保存审核结果到后端
    // 调用回调函数通知工作台更新状态
    if (onSubmitReview) {
      onSubmitReview("approve")
    }
    // 返回工作台
    onBack()
  }
  
  // 处理审核驳回
  const handleRejectReview = (reason: string) => {
    console.log('审核驳回，理由：', reason)
    // TODO: 保存驳回记录到后端
    // 更新轮次
    const newRound = currentRound + 1
    setCurrentRound(newRound)
    
    // 创建驳回记录
    const rejectionRecord = {
      id: `rejection-${Date.now()}`,
      projectId: projectId || '',
      languageVariant,
      round: currentRound,
      reason,
      rejectedBy: user.id,
      rejectedByName: user.name,
      rejectedAt: new Date().toISOString(),
      status: 'pending' as const,
    }
    
    console.log('驳回记录：', rejectionRecord)
    
    // 调用回调函数通知工作台更新状态（回滚到人工翻译环节）
    if (onSubmitReview) {
      onSubmitReview("reject")
    }
    // 返回工作台
    onBack()
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-sm font-semibold text-foreground">{projectData.title} - 第{currentEpisode}集</h1>
            <p className="text-xs text-muted-foreground">
              {isPending && "待开始 - 暂无数据"}
              {isReview && "AI提取 - 待确认"}
              {isAIExtractCompleted && "AI提取 - 已完成（只读）"}
              {!isPending && !isReview && !isAIExtractCompleted && (isSourceLanguage ? languageVariant : `${languageVariant}翻译`)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 待开始状态不显示任何按钮 */}
          {!isPending && (
            <>
              {/* 只读状态不显示编辑按钮 */}
              {!isReadOnly && (
                <>
                  <Button variant="ghost" size="sm" disabled={!hasButton('save')}>
                    <Undo className="w-4 h-4 mr-1" />
                    撤销
                  </Button>
                  <Button variant="ghost" size="sm" disabled={!hasButton('save')}>
                    <Redo className="w-4 h-4 mr-1" />
                    重做
                  </Button>
                  <Button variant="outline" size="sm" disabled={!hasButton('save')}>
                    <Save className="w-4 h-4 mr-1" />
                    保存
                  </Button>
                </>
              )}
              
              {/* 质检环节显示译员评分按钮 */}
              {isQualityCheck && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setRatingDialogOpen(true)}
                >
                  <Star className="w-4 h-4 mr-1" />
                  译员评分
                </Button>
              )}
              
              {/* 根据状态和权限显示不同的确认按钮 */}
              {showSubmitButton && (
                <>
                  {isReview && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        // 调用回调函数通知工作台更新状态
                        if (onConfirmReview) {
                          onConfirmReview()
                        }
                        // 关闭编辑器，返回工作台
                        onBack()
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      确认
                    </Button>
                  )}
                  {/* AI提取已完成状态不显示确认按钮 */}
                  {!isReview && !isAIExtractCompleted && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        // 质检环节：打开审核对话框
                        if (isQualityCheck) {
                          setReviewDialogOpen(true)
                        } else {
                          // 其他环节：直接提交
                          if (onSubmitReview) {
                            onSubmitReview("submit")
                          }
                          onBack()
                        }
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {isQualityCheck ? "审核完成" : "提交审核"}
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </header>

      {/* Main Content - 自由拖拽面板布局 */}
      <div ref={editorContainerRef} className="flex-1 relative overflow-hidden bg-muted/20">
        {/* Panel toggle bar */}
        <div className="absolute top-1 left-1 z-50 flex items-center gap-1 bg-card/90 backdrop-blur-sm border border-border rounded-md px-1.5 py-0.5">
          {Object.values(panels).map(p => (
            <button key={p.id} onClick={() => togglePanel(p.id)}
              className={cn("px-2 py-0.5 text-[10px] rounded transition-colors", p.visible ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground")}>
              {p.title}
            </button>
          ))}
          <button onClick={() => { const d = autoLayout(calcDefaultPanels(), containerSize.width, containerSize.height); setPanels(d); savePanels(d) }}
            className="px-2 py-0.5 text-[10px] rounded text-muted-foreground hover:text-foreground ml-1 border-l border-border pl-2">
            重置布局
          </button>
        </div>

        {/* Panels */}
        {Object.entries(panels).map(([id, cfg]) => {
          const siblings = Object.values(panels)
          const content = (() => {
            switch (id) {
              case "video": return (
                <div className="h-full overflow-hidden">
                  <VideoPlayerPanel videoUrl={videoUrl} posterImage={videoUrl ? undefined : projectData.image}
                    currentTime={currentTime} currentSubtitle={displaySubtitle || null} subtitleStyle={subtitleStyle}
                    onTimeChange={setCurrentTime} onFrameStep={handleFrameStep} isPlaying={isPlaying}
                    onPlayingChange={setIsPlaying} duration={duration} userName={user.name}
                    subtitleVisibility={subtitleVisibility} originalSubtitle={currentSubtitle?.originalText}
                    translatedSubtitle={currentSubtitle?.translatedText}
                    onscreenTexts={currentOnScreenTexts.map(item => ({ text: showTranslation ? (item.translatedText || item.text) : item.text, type: item.type }))} />
                </div>)
              case "subtitle": return (
                <div className="h-full overflow-y-auto">
                  <SubtitleDualPanel subtitles={isQualityCheck ? mockSubtitlesWithHistory : subtitles}
                    currentTime={currentTime} selectedId={selectedSubtitleId}
                    onSelectSubtitle={setSelectedSubtitleId} onUpdateSubtitle={handleUpdateSubtitle}
                    onTimeChange={setCurrentTime} onCompleteEpisode={handleCompleteEpisode}
                    showTranslation={showTranslation} isReadOnly={isReadOnly} isPending={isPending}
                    showCompleteButton={showCompleteButton} showModifications={showModifications}
                    showCommentIcons={isQualityCheck} isQualityCheck={isQualityCheck}
                    onUpdateComment={handleUpdateComment} onRevertVersion={handleRevertVersion} onRevertAll={handleRevertAll}
                    isReview={isReview} currentEpisode={currentEpisode} totalEpisodes={totalEpisodes}
                    onPrevEpisode={handlePrevEpisode} onNextEpisode={handleNextEpisode} onConfirmEpisode={handleConfirmEpisode}
                    onAddSubtitle={handleAddSubtitle} onRejectEpisode={handleRejectEpisode} onApproveEpisode={handleApproveEpisode}
                    onRefresh={handleRefresh} onSplitSubtitle={handleSplitSubtitle} onMergeSubtitles={handleMergeSubtitles} />
                </div>)
              case "timeline": return (
                <div className="h-full">
                  <TimelinePanel originalSubtitles={originalBlocks}
                    translatedSubtitles={showTranslation ? translatedBlocks : []}
                    onScreenText={hasData ? (transformedOnScreenText as any) : []}
                    duration={duration} currentTime={currentTime} selectedId={selectedSubtitleId}
                    onSelectSubtitle={handleSelectFromTimeline} onTimeChange={setCurrentTime}
                    onUpdateSubtitleTime={handleUpdateSubtitleTime} onAddSubtitle={handleAddSubtitle}
                    isReadOnly={isReadOnly} subtitleVisibility={subtitleVisibility}
                    onToggleSubtitleVisibility={handleToggleSubtitleVisibility}
                    onSplitSubtitle={handleSplitSubtitle} onMergeSubtitles={handleMergeSubtitles} />
                </div>)
              case "onscreen": return (
                <div className="h-full overflow-y-auto">
                  <OnScreenTextPanel currentTime={currentTime} onScreenText={transformedOnScreenText}
                    isReadOnly={isReadOnly} showTranslation={showTranslation}
                    onAddSubtitle={handleAddSubtitle} duration={duration}
                    isReview={isReview} onRefresh={handleRefresh}
                    onSplitSubtitle={handleSplitSubtitle} onMergeSubtitles={handleMergeSubtitles} />
                </div>)
              case "glossary": return (
                <div className="h-full overflow-y-auto">
                  <GlossaryPanel isReadOnly={isReadOnly} isPending={isPending} isReview={isReview}
                    isAIExtractCompleted={isAIExtractCompleted} onAddTerm={handleAddTerm}
                    glossary={isReview || isAIExtractCompleted ? extractionGlossary : translationGlossary}
                    onRefresh={handleRefresh} />
                </div>)
              case "style": return (
                <div className="h-full overflow-y-auto">
                  <SubtitleStylePanel subtitleStyle={subtitleStyle}
                    onStyleChange={(style) => setSubtitleStyle({ ...subtitleStyle, ...style })}
                    showStylePanel={showStylePanel} currentSubtitleId={currentSubtitle?.id} subtitleCount={subtitles.length} />
                </div>)
              case "episode": return (
                <div className="h-full overflow-y-auto">
                  <EpisodeSelectorPanel currentEpisode={currentEpisode} totalEpisodes={totalEpisodes}
                    completedEpisodes={completedEpisodes} rejectedEpisodes={rejectedEpisodes}
                    onEpisodeChange={handleEpisodeChange} showCompletedMarks={!isPending} showViewAllButton={!isReview} />
                </div>)
              default: return null
            }
          })()
          const closable = !["video", "subtitle", "timeline"].includes(id)
          return (
            <DraggablePanel key={id} config={cfg} onConfigChange={c => updatePanel(id, c)}
              onBringToFront={() => bringToFront(id)}
              onClose={closable ? () => {
                setPanels(prev => {
                  const next = { ...prev, [id]: { ...prev[id], visible: false } }
                  const laid = autoLayout(next, containerSize.width, containerSize.height)
                  savePanels(laid)
                  return laid
                })
              } : undefined}
              containerBounds={containerSize} siblingPanels={siblings}>
              {content}
            </DraggablePanel>
          )
        })}
      </div>
      
      {/* 译员评分对话框 */}
      <TranslatorRatingDialog
        open={ratingDialogOpen}
        onOpenChange={setRatingDialogOpen}
        translatorName="张译员" // TODO: 从实际数据获取译员姓名
        currentRating={translatorRating}
        onSubmit={handleSubmitRating}
      />
      
      {/* 审核提交对话框 */}
      <QualityCheckReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        projectTitle={projectData.title}
        languageVariant={languageVariant}
        currentRound={currentRound}
        onApprove={handleApproveReview}
        onReject={handleRejectReview}
      />
      
      {/* 驳回本集对话框 */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>驳回第{currentEpisode}集</DialogTitle>
            <DialogDescription>
              请填写本集的修改意见，帮助译员了解需要改进的地方
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">修改意见</Label>
              <Textarea
                id="rejection-reason"
                placeholder="请详细说明需要修改的内容..."
                value={episodeRejectionReason}
                onChange={(e) => setEpisodeRejectionReason(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectionDialog(false)
                setEpisodeRejectionReason("")
              }}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRejectEpisode}
            >
              确认驳回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
