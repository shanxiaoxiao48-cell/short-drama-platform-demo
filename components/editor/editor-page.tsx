"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, CheckCircle, Undo, Redo, Star } from "lucide-react"
import { VideoPlayerPanel } from "./video-player-panel"
import { TimelinePanel } from "./timeline-panel"
import { SubtitleDualPanel } from "./subtitle-dual-panel"
import { OnScreenTextPanel } from "./onscreen-text-panel"
import { GlossaryPanel } from "./glossary-panel"
import { EpisodeSelectorPanel } from "./episode-selector-panel"
import { TranslatorRatingDialog, TranslatorRating } from "./translator-rating-dialog"
import { ModificationComment } from "./modification-comment-dialog"
import { SubtitleStyle } from "./subtitle-style-panel"
import { QualityCheckReviewDialog } from "./quality-check-review-dialog"
import { usePermission } from "@/contexts/permission-context"

interface EditorPageProps {
  projectId: string | null
  languageVariant: string // 添加语言变体参数
  episodeId: string | null
  workflowStage?: "ai_extract_pending" | "ai_extract_review" | "ai_extract_completed" | "ai_translate" | "manual_translate" | "quality_check" | "completed"
  onBack: () => void
  onConfirmReview?: () => void // AI提取待确认状态下点击确认的回调
  onSubmitReview?: () => void // 人工翻译/质检完成后点击提交审核的回调
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

// Mock on-screen text data
const mockOnScreenText = [
  { 
    id: "os-1", 
    startTime: 5, 
    endTime: 8, 
    text: "霸道总裁", 
    translatedText: "Domineering CEO",
    type: "标题", 
    track: "onscreen" as const 
  },
  { 
    id: "os-2", 
    startTime: 12, 
    endTime: 15, 
    text: "第一章", 
    translatedText: "Chapter 1",
    type: "章节", 
    track: "onscreen" as const 
  },
]

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

export function EditorPage({ projectId, languageVariant, episodeId, workflowStage = "manual_translate", onBack, onConfirmReview, onSubmitReview }: EditorPageProps) {
  const { user, hasButton } = usePermission()
  
  // 根据projectId获取项目数据
  const projectData = getProjectData(projectId)
  
  // 判断是否是源语言（包含"源语言"或"原语言"关键字）
  const isSourceLanguage = languageVariant.includes("源语言") || languageVariant.includes("原语言")
  
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedSubtitleId, setSelectedSubtitleId] = useState<string | null>(null)
  
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
  const [originalTiming, setOriginalTiming] = useState<Record<string, { startTime: number; endTime: number }>>(() => {
    const timing: Record<string, { startTime: number; endTime: number }> = {}
    mockSubtitles.forEach(s => {
      timing[s.id] = { startTime: s.startTime, endTime: s.endTime }
    })
    return timing
  })
  
  const [translatedTiming, setTranslatedTiming] = useState<Record<string, { startTime: number; endTime: number }>>(() => {
    const timing: Record<string, { startTime: number; endTime: number }> = {}
    mockSubtitles.forEach(s => {
      timing[s.id] = { startTime: s.startTime, endTime: s.endTime }
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
  const totalEpisodes = projectData.totalEpisodes // 使用项目的实际集数
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>({
    fontSize: 16,
    verticalPosition: 85,
  })
  
  // 译员评分状态
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false)
  const [translatorRating, setTranslatorRating] = useState<TranslatorRating | undefined>(undefined)
  
  // 审核对话框状态
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [currentRound, setCurrentRound] = useState(1) // 当前轮次，默认为1
  
  const duration = 180 // 3 minutes

  // 检查是否所有集数都已完成
  const allEpisodesCompleted = completedEpisodes.length === totalEpisodes

  // Get current subtitle based on time
  // 待确认状态显示原文字幕，其他状态显示翻译字幕
  const currentSubtitle = subtitles.find(
    (s) => currentTime >= s.startTime && currentTime < s.endTime
  )
  
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

  // Convert subtitles to timeline blocks with independent timing
  const originalBlocks = subtitles.map((s) => ({
    id: `orig-${s.id}`,
    startTime: originalTiming[s.id]?.startTime ?? s.startTime,
    endTime: originalTiming[s.id]?.endTime ?? s.endTime,
    text: s.originalText,
    track: "original" as const,
  }))

  const translatedBlocks = subtitles.map((s) => ({
    id: `trans-${s.id}`,
    startTime: translatedTiming[s.id]?.startTime ?? s.startTime,
    endTime: translatedTiming[s.id]?.endTime ?? s.endTime,
    text: s.translatedText,
    track: "translated" as const,
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
      onSubmitReview()
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
      onSubmitReview()
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
                      disabled={!allEpisodesCompleted}
                      className={!allEpisodesCompleted ? "opacity-50 cursor-not-allowed" : ""}
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
                      disabled={!allEpisodesCompleted}
                      className={!allEpisodesCompleted ? "opacity-50 cursor-not-allowed" : ""}
                      onClick={() => {
                        // 质检环节：打开审核对话框
                        if (isQualityCheck) {
                          setReviewDialogOpen(true)
                        } else {
                          // 其他环节：直接提交
                          if (onSubmitReview) {
                            onSubmitReview()
                          }
                          onBack()
                        }
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {isQualityCheck ? "确认" : "提交审核"}
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </header>

      {/* Main Content - 所有面板按比例缩放 */}
      <div className="flex" style={{ height: "calc(70vh - 56px)" }}>
        {/* Left - Video Player - 20% 宽度 */}
        <div className="shrink-0 border-r border-border overflow-hidden" style={{ width: "20%", minWidth: "240px" }}>
          <VideoPlayerPanel
            posterImage={projectData.image}
            currentTime={currentTime}
            currentSubtitle={displaySubtitle || null}
            subtitleStyle={subtitleStyle}
            onTimeChange={setCurrentTime}
            onFrameStep={handleFrameStep}
            isPlaying={isPlaying}
            onPlayingChange={setIsPlaying}
            duration={duration}
          />
        </div>

        {/* Center - Subtitle Dual Panel - 25% 宽度，自动填充 */}
        <div className="flex-1 overflow-y-auto min-w-0 border-r border-border" style={{ minWidth: "300px" }}>
          <SubtitleDualPanel
            subtitles={subtitles}
            currentTime={currentTime}
            selectedId={selectedSubtitleId}
            onSelectSubtitle={setSelectedSubtitleId}
            onUpdateSubtitle={handleUpdateSubtitle}
            onTimeChange={setCurrentTime}
            onCompleteEpisode={handleCompleteEpisode}
            showTranslation={showTranslation}
            isReadOnly={isReadOnly}
            isPending={isPending}
            showCompleteButton={showCompleteButton}
            showModifications={showModifications}
            showCommentIcons={isQualityCheck} // 质检环节显示修改意见图标
            isQualityCheck={isQualityCheck} // 传递质检环节标识
            onUpdateComment={handleUpdateComment} // 传递更新意见的回调
            isReview={isReview}
            currentEpisode={currentEpisode}
            totalEpisodes={totalEpisodes}
            onPrevEpisode={handlePrevEpisode}
            onNextEpisode={handleNextEpisode}
            onConfirmEpisode={handleConfirmEpisode}
          />
        </div>

        {/* Center Right - 画面字 - 15% 宽度 */}
        <div className="shrink-0 overflow-y-auto border-r border-border" style={{ width: "15%", minWidth: "180px" }}>
          <OnScreenTextPanel
            currentTime={currentTime}
            onScreenText={hasData ? mockOnScreenText : []}
            isReadOnly={isReadOnly}
            showTranslation={showTranslation}
          />
        </div>

        {/* Right Center - 术语表 - 15% 宽度 */}
        <div className="shrink-0 overflow-y-auto border-r border-border" style={{ width: "15%", minWidth: "180px" }}>
          <GlossaryPanel 
            isReadOnly={isReadOnly} 
            isPending={isPending} 
            isReview={isReview} 
            isAIExtractCompleted={isAIExtractCompleted}
          />
        </div>

        {/* Right - Episode Selector & Style Panel - 15% 宽度 */}
        <div className="shrink-0 overflow-y-auto" style={{ width: "15%", minWidth: "180px" }}>
          <EpisodeSelectorPanel
            currentEpisode={currentEpisode}
            totalEpisodes={totalEpisodes}
            completedEpisodes={completedEpisodes}
            subtitleStyle={subtitleStyle}
            onStyleChange={(style) =>
              setSubtitleStyle({ ...subtitleStyle, ...style })
            }
            onEpisodeChange={handleEpisodeChange}
            showStylePanel={showStylePanel}
            showCompletedMarks={!isPending}
            showViewAllButton={!isReview}
          />
        </div>
      </div>

      {/* Timeline Panel */}
      <div className="border-t border-border" style={{ height: "30vh" }}>
        <TimelinePanel
          originalSubtitles={originalBlocks}
          translatedSubtitles={showTranslation ? translatedBlocks : []}
          onScreenText={hasData ? (mockOnScreenText as any) : []}
          duration={duration}
          currentTime={currentTime}
          selectedId={selectedSubtitleId}
          onSelectSubtitle={handleSelectFromTimeline}
          onTimeChange={setCurrentTime}
          onUpdateSubtitleTime={handleUpdateSubtitleTime}
          isReadOnly={isReadOnly}
        />
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
    </div>
  )
}
