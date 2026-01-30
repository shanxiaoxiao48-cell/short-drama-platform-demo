"use client"

import { useRef, useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SubtitleModificationTooltip } from "./subtitle-modification-tooltip"
import { ModificationCommentDialog, ModificationComment } from "./modification-comment-dialog"
import { CheckCircle, ChevronLeft, ChevronRight, MessageSquare, Plus, History, RotateCcw, Clock, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ModificationRecord {
  userId: string
  userName: string
  role: "translator" | "reviewer"
  originalText: string
  modifiedText: string
  timestamp: string // 改为字符串以避免 hydration 问题
}

interface VersionRecord {
  id: string
  version: number
  type: "ai" | "manual" | "review"
  text: string
  userId: string
  userName: string
  timestamp: string
}

interface SubtitleEntry {
  id: string
  startTime: number
  endTime: number
  originalText: string
  translatedText: string
  modifications?: ModificationRecord[]
  comments?: ModificationComment[] // 新增：修改意见列表
  versions?: VersionRecord[] // 新增：版本历史
  currentText?: string // 当前文本（用于历史版本模式）
}

interface SubtitleDualPanelProps {
  subtitles: SubtitleEntry[]
  currentTime: number
  selectedId: string | null
  onSelectSubtitle: (id: string) => void
  onUpdateSubtitle: (id: string, field: "originalText" | "translatedText", value: string) => void
  onTimeChange: (time: number) => void
  onCompleteEpisode?: () => void
  showTranslation?: boolean // 是否显示翻译字幕
  isReadOnly?: boolean // 只读模式
  isPending?: boolean // 待开始状态
  showCompleteButton?: boolean // 是否显示完成本集按钮
  showModifications?: boolean // 是否显示修改标记（质检环节显示）
  showCommentIcons?: boolean // 是否显示修改意见图标（质检环节显示）
  isQualityCheck?: boolean // 是否是质检环节（用于判断是否可以编辑意见）
  onUpdateComment?: (subtitleId: string, comment: ModificationComment | null) => void // 更新修改意见的回调
  onRevertVersion?: (subtitleId: string, versionId: string) => void // 回退版本的回调
  onRevertAll?: () => void // 全部回退的回调
  // AI提取待确认状态的导航参数
  isReview?: boolean // 是否是AI提取待确认状态
  currentEpisode?: number // 当前集数
  totalEpisodes?: number // 总集数
  onPrevEpisode?: () => void // 上一集
  onNextEpisode?: () => void // 下一集
  onConfirmEpisode?: () => void // 确认本集
  // 添加字幕功能
  onAddSubtitle?: (track: "original" | "translated" | "onscreen", startTime: number, endTime: number) => void
  // 审核环节的驳回和通过按钮
  onRejectEpisode?: () => void // 驳回本集
  onApproveEpisode?: () => void // 通过本集
}

export function SubtitleDualPanel({
  subtitles,
  currentTime,
  selectedId,
  onSelectSubtitle,
  onUpdateSubtitle,
  onTimeChange,
  onCompleteEpisode,
  showTranslation = true, // 默认显示翻译
  isReadOnly = false, // 默认可编辑
  isPending = false, // 默认不是待开始状态
  showCompleteButton = true, // 默认显示完成本集按钮
  showModifications = false, // 默认不显示修改标记（只在质检环节显示）
  showCommentIcons = false, // 默认不显示修改意见图标
  isQualityCheck = false, // 默认不是质检环节
  onUpdateComment, // 更新修改意见的回调
  onRevertVersion, // 回退版本的回调
  onRevertAll, // 全部回退的回调
  isReview = false, // 默认不是AI提取待确认状态
  currentEpisode = 1,
  totalEpisodes = 1,
  onPrevEpisode,
  onNextEpisode,
  onConfirmEpisode,
  onAddSubtitle,
  onRejectEpisode,
  onApproveEpisode,
}: SubtitleDualPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLDivElement>(null)
  
  // 修改意见对话框状态
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleEntry | null>(null)
  
  // 历史版本模式状态
  const [showHistoryMode, setShowHistoryMode] = useState(false)
  // 获取当前选中的历史版本
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)

  const isCurrentSubtitle = (sub: SubtitleEntry) => {
    return currentTime >= sub.startTime && currentTime < sub.endTime
  }

  // Auto-scroll to selected subtitle
  useEffect(() => {
    if (selectedRef.current && scrollAreaRef.current) {
      selectedRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [selectedId])
  
  // 打开修改意见对话框
  const handleOpenCommentDialog = (subtitle: SubtitleEntry, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentSubtitle(subtitle)
    setCommentDialogOpen(true)
  }
  
  // 提交修改意见
  const handleSubmitComment = (comment: Omit<ModificationComment, 'reviewerId' | 'reviewerName' | 'timestamp'>) => {
    if (currentSubtitle && onUpdateComment) {
      const fullComment: ModificationComment = {
        ...comment,
        reviewerId: "reviewer-1", // 实际应从用户上下文获取
        reviewerName: "质检员", // 实际应从用户上下文获取
        timestamp: new Date().toISOString(),
      }
      
      // 如果评论为空，表示删除
      onUpdateComment(currentSubtitle.id, comment.comment ? fullComment : null)
    }
  }
  
  // 检查字幕是否有修改
  const hasModifications = (subtitle: SubtitleEntry) => {
    return subtitle.versions && subtitle.versions.length > 1
  }
  
  // 获取选中版本的所有字幕数据
  const getVersionSubtitles = (versionId: string | null) => {
    if (!versionId) return subtitles
    
    // 返回该版本下的所有字幕
    return subtitles.map(subtitle => {
      const version = subtitle.versions?.find(v => v.id === versionId)
      return {
        ...subtitle,
        versionText: version?.text || subtitle.translatedText,
        versionInfo: version ? {
          type: version.type,
          userName: version.userName,
          timestamp: version.timestamp,
        } : null
      }
    })
  }
  
  // 文本差异高亮函数 - 将修改的部分标记为红色
  const renderTextWithDiff = (currentText: string, historyText: string) => {
    // 如果文本相同，直接返回
    if (currentText === historyText) {
      return <span>{historyText}</span>
    }
    
    // 简单的单词级差异比较
    const currentWords = currentText.split(/(\s+)/)
    const historyWords = historyText.split(/(\s+)/)
    
    const result: React.ReactNode[] = []
    const maxLength = Math.max(currentWords.length, historyWords.length)
    
    for (let i = 0; i < maxLength; i++) {
      const historyWord = historyWords[i] || ''
      const currentWord = currentWords[i] || ''
      
      if (historyWord !== currentWord) {
        // 不同的部分标记为红色
        result.push(
          <span key={i} className="text-red-600">
            {historyWord}
          </span>
        )
      } else {
        // 相同的部分保持原样
        result.push(<span key={i}>{historyWord}</span>)
      }
    }
    
    return <>{result}</>
  }

  return (
    <div className="flex h-full bg-card">
      {/* 历史版本模式：当前版本 + 历史版本面板 */}
      {showHistoryMode ? (
        <>
          {/* 当前版本面板 */}
          <div className="flex-1 flex flex-col">
            {/* Header - 固定高度 h-[52px] */}
            <div className="px-3 py-2 border-b border-border shrink-0 h-[52px] flex items-center">
              <div className="flex items-center justify-between w-full">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">当前版本</h3>
                  <p className="text-xs text-muted-foreground">
                    {subtitles.length > 0 ? `${subtitles.length} 条字幕` : "暂无字幕数据"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={() => setShowHistoryMode(false)}
                  >
                    关闭历史版本
                  </Button>
                </div>
              </div>
            </div>

            {/* Subtitle list */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar" ref={scrollAreaRef}>
              {subtitles.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  <p>请先完成AI提取任务</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {subtitles.map((subtitle) => {
                    const isCurrent = isCurrentSubtitle(subtitle)
                    const baseSelectedId = selectedId?.replace(/^(orig|trans|os)-/, "")
                    const isSelected = baseSelectedId === subtitle.id
                    const currentText = subtitle.currentText || subtitle.translatedText

                    return (
                      <div
                        key={subtitle.id}
                        ref={isSelected ? selectedRef : null}
                        className={cn(
                          "p-1.5 border rounded cursor-pointer transition-all space-y-1 min-h-[76px]", // 固定最小高度
                          isCurrent && "border-primary/50 bg-primary/5",
                          isSelected && "border-primary bg-primary/10 shadow-sm",
                          !isCurrent && !isSelected && "border-border hover:border-primary/30"
                        )}
                        onClick={() => {
                          onSelectSubtitle(subtitle.id)
                          onTimeChange(subtitle.startTime)
                        }}
                      >
                        {/* 原文 - 不可编辑，上方 */}
                        <div className="text-xs bg-muted/30 rounded px-2 py-1.5 text-muted-foreground min-h-[28px] flex items-center">
                          {subtitle.originalText}
                        </div>

                        {/* 译文 - 下方 */}
                        <div className="text-xs bg-background rounded px-2 py-1.5 min-h-[28px] flex items-center">
                          {currentText}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer - 导航按钮（历史版本模式下也显示在左侧当前版本中） */}
            {(isReview || (!isPending && !isReadOnly && showCompleteButton)) && (
              <div className="px-3 py-2 border-t border-border shrink-0">
                <div className="flex items-center gap-2">
                  {/* 上一集按钮 - 第一集时禁用 */}
                  {onPrevEpisode && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={onPrevEpisode}
                      disabled={currentEpisode === 1}
                      className="flex-1"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      上一集
                    </Button>
                  )}
                  
                  {/* 中间按钮区域 */}
                  {isReview && onConfirmEpisode ? (
                    // AI提取待确认状态：显示"确认本集"
                    <Button 
                      size="sm"
                      onClick={onConfirmEpisode}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      确认本集
                    </Button>
                  ) : isQualityCheck && onRejectEpisode && onApproveEpisode ? (
                    // 审核质检环节：显示"驳回"和"通过"两个按钮
                    <>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={onRejectEpisode}
                        className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        驳回
                      </Button>
                      <Button 
                        size="sm"
                        onClick={onApproveEpisode}
                        className="flex-1"
                      >
                        通过
                      </Button>
                    </>
                  ) : (
                    // 其他环节：显示"完成本集"
                    <Button 
                      size="sm"
                      onClick={onCompleteEpisode}
                      disabled={subtitles.length === 0 || isReadOnly}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      完成本集
                    </Button>
                  )}
                  
                  {/* 下一集按钮 - 最后一集时禁用 */}
                  {onNextEpisode && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={onNextEpisode}
                      disabled={currentEpisode === totalEpisodes}
                      className="flex-1"
                    >
                      下一集
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 历史版本面板 - 等宽 */}
          <div className="flex-1 flex flex-col border-l border-border">
            {/* Header - 固定高度 h-[52px] */}
            <div className="px-3 py-2 border-b border-border shrink-0 h-[52px] flex items-center">
              <div className="flex items-center justify-between w-full">
                <h3 className="text-sm font-semibold text-foreground">历史版本</h3>
                <div className="flex items-center gap-2">
                  {/* 当前版本的翻译人员和时间 - 始终显示 */}
                  {subtitles.length > 0 && subtitles[0]?.versions && subtitles[0].versions.length > 0 && (() => {
                    // 过滤版本
                    const filteredVersions = isQualityCheck 
                      ? subtitles[0].versions.filter(v => v.type !== "review")
                      : subtitles[0].versions
                    
                    if (filteredVersions.length === 0) return null
                    
                    // 使用 selectedVersionId 或默认最新版本
                    const versionId = selectedVersionId || filteredVersions[filteredVersions.length - 1]?.id
                    const version = subtitles[0].versions.find(v => v.id === versionId)
                    
                    if (version) {
                      return (
                        <span className="text-xs text-muted-foreground">
                          {new Date(version.timestamp).toLocaleString('zh-CN', { 
                            month: '2-digit', 
                            day: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                          {' - '}
                          {version.userName}
                        </span>
                      )
                    }
                    return null
                  })()}
                  
                  {/* 版本选择下拉菜单 - 使用时钟图标 */}
                  {subtitles.length > 0 && subtitles[0].versions && subtitles[0].versions.length > 0 && (() => {
                    // 过滤版本：如果是质检环节，不显示审核质检的版本
                    const filteredVersions = isQualityCheck 
                      ? subtitles[0].versions.filter(v => v.type !== "review")
                      : subtitles[0].versions
                    
                    if (filteredVersions.length === 0) return null
                    
                    const currentVersionId = selectedVersionId || filteredVersions[filteredVersions.length - 1]?.id
                    
                    return (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {filteredVersions.slice().reverse().map((version) => {
                            const roundInfo = version.type === "manual" ? `人工翻译` : version.type === "review" ? `审核质检` : "AI翻译"
                            return (
                              <DropdownMenuItem
                                key={version.id}
                                onClick={() => setSelectedVersionId(version.id)}
                                className={cn(
                                  "text-xs",
                                  currentVersionId === version.id && "bg-accent"
                                )}
                              >
                                {roundInfo} - v{version.version}
                              </DropdownMenuItem>
                            )
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  })()}
                  
                  {/* 关闭历史版本按钮 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={() => setShowHistoryMode(false)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    关闭
                  </Button>
                  
                  {/* 全部回退按钮 - 当有历史版本时显示 - 放在最右边 */}
                  {!isReadOnly && onRevertAll && subtitles.length > 0 && subtitles[0]?.versions && subtitles[0].versions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7"
                      onClick={onRevertAll}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      全部回退
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* History content - 显示该版本的所有字幕 */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
              {subtitles.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  <p>请先完成AI提取任务</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {subtitles.map((subtitle) => {
                    const isCurrent = isCurrentSubtitle(subtitle)
                    const baseSelectedId = selectedId?.replace(/^(orig|trans|os)-/, "")
                    const isSelected = baseSelectedId === subtitle.id
                    
                    // 获取该版本的信息和文本
                    const versionId = selectedVersionId || (subtitle.versions && subtitle.versions.length > 0 ? subtitle.versions[subtitle.versions.length - 1]?.id : null)
                    const version = versionId ? subtitle.versions?.find(v => v.id === versionId) : null
                    const historyText = version?.text || subtitle.translatedText
                    const currentText = subtitle.translatedText
                    
                    // 临时测试：为了演示差异高亮，给历史文本添加一些变化
                    // TODO: 删除这个测试代码，使用真实的版本数据
                    const testHistoryText = historyText.replace(/the/gi, 'THE').replace(/is/gi, 'IS')

                    return (
                      <div
                        key={subtitle.id}
                        className={cn(
                          "p-1.5 border rounded cursor-pointer transition-all space-y-1 min-h-[76px]", // 两行结构，保持高度
                          isCurrent && "border-primary/50 bg-primary/5",
                          isSelected && "border-primary bg-primary/10 shadow-sm",
                          !isCurrent && !isSelected && "border-border hover:border-primary/30"
                        )}
                        onClick={() => {
                          onSelectSubtitle(subtitle.id)
                          onTimeChange(subtitle.startTime)
                        }}
                      >
                        {/* 第一行：时间和回退按钮（只在有修改时显示），保持和当前版本原文位置对齐 */}
                        <div className="text-xs bg-muted/30 rounded px-2 py-1.5 min-h-[28px] flex items-center justify-between">
                          {/* 只在文本有差异时显示时间和回退按钮 */}
                          {currentText !== testHistoryText && (
                            <>
                              {version && (
                                <span className="text-muted-foreground text-[10px]">
                                  {new Date(version.timestamp).toLocaleString('zh-CN', { 
                                    month: '2-digit', 
                                    day: '2-digit', 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              )}
                              {!isReadOnly && onRevertVersion && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 text-xs shrink-0 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const versionId = selectedVersionId || (subtitle.versions && subtitle.versions.length > 0 ? subtitle.versions[subtitle.versions.length - 1].id : null)
                                    if (versionId) {
                                      onRevertVersion(subtitle.id, versionId)
                                    }
                                  }}
                                >
                                  <RotateCcw className="w-3 h-3 mr-1" />
                                  回退
                                </Button>
                              )}
                            </>
                          )}
                        </div>

                        {/* 第二行：英文译文（带差异高亮），和当前版本译文位置对齐 */}
                        <div className="text-xs bg-background rounded px-2 py-1.5 min-h-[28px] flex items-center">
                          <span className="text-foreground">
                            {/* 显示历史版本文本，并标记与当前版本不同的部分为红色 */}
                            {/* 使用testHistoryText进行测试，实际应使用historyText */}
                            {currentText === testHistoryText ? (
                              // 如果文本相同，直接显示
                              testHistoryText
                            ) : (
                              // 如果文本不同，应用差异高亮
                              renderTextWithDiff(currentText, testHistoryText)
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* 正常模式：单栏显示 */
        <div className="flex flex-col h-full w-full">
          {/* Header - 固定高度 h-[52px] */}
          <div className="px-3 py-2 border-b border-border shrink-0 h-[52px]">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">字幕编辑</h3>
                <span className="text-xs text-muted-foreground">
                  {subtitles.length > 0 ? `${subtitles.length} 条字幕` : "暂无字幕数据"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* 历史版本按钮 - 只在质检环节显示 */}
                {isQualityCheck && subtitles.some(s => s.versions && s.versions.length > 0) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7"
                    onClick={() => setShowHistoryMode(true)}
                  >
                    <History className="w-3 h-3 mr-1" />
                    历史版本
                  </Button>
                )}
                {/* 清空译文按钮 - 只在人工翻译环节显示（非质检环节） */}
                {!isReadOnly && !isQualityCheck && showTranslation && subtitles.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm('确定要清空所有译文吗？此操作不可撤销。')) {
                        subtitles.forEach(subtitle => {
                          onUpdateSubtitle(subtitle.id, "translatedText", "")
                        })
                      }
                    }}
                  >
                    清空译文
                  </Button>
                )}
                {/* 添加字幕按钮 - 只读模式下不显示，所有环节都显示为图标 */}
                {!isReadOnly && onAddSubtitle && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      // 在当前时间添加字幕（默认2秒）
                      const duration = 180 // 从父组件获取，这里暂时硬编码
                      const startTime = currentTime
                      const endTime = Math.min(currentTime + 2, duration)
                      onAddSubtitle("translated", startTime, endTime)
                    }}
                    title="添加字幕"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Subtitle list - scrollable */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar" ref={scrollAreaRef}>
            {subtitles.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                <p>请先完成AI提取任务</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {subtitles.map((subtitle) => {
                  const isCurrent = isCurrentSubtitle(subtitle)
                  // selectedId 可能是带前缀的（orig-1, trans-1），需要提取基础ID进行匹配
                  const baseSelectedId = selectedId?.replace(/^(orig|trans|os)-/, "")
                  const isSelected = baseSelectedId === subtitle.id

                return (
                  <div
                    key={subtitle.id}
                    ref={isSelected ? selectedRef : null}
                    className={cn(
                      "p-1.5 border rounded cursor-pointer transition-all space-y-1",
                      isCurrent && "border-primary/50 bg-primary/5",
                      isSelected && "border-primary bg-primary/10 shadow-sm",
                      !isCurrent && !isSelected && "border-border hover:border-primary/30"
                    )}
                    onClick={() => {
                      onSelectSubtitle(subtitle.id)
                      onTimeChange(subtitle.startTime)
                    }}
                  >
                    {/* 原文 - 不可编辑，上方 */}
                    <div className="text-xs bg-muted/30 rounded px-2 py-1.5 text-muted-foreground">
                      {subtitle.originalText}
                    </div>

                    {/* 译文 - 可编辑，下方 - 只在showTranslation为true时显示 */}
                    {showTranslation && (
                      <div className="relative">
                        <Textarea
                          value={subtitle.translatedText}
                          onChange={(e) => {
                            e.stopPropagation()
                            onUpdateSubtitle(subtitle.id, "translatedText", e.target.value)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="min-h-[40px] max-h-[120px] text-xs resize-none py-1.5 px-2 border-0"
                          rows={2}
                          placeholder="译文"
                          disabled={isReadOnly}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
              </div>
            )}
          </div>

          {/* Footer - 导航按钮 */}
          {/* AI提取待确认状态、人工翻译和质检状态的导航按钮 */}
          {(isReview || (!isPending && !isReadOnly && showCompleteButton)) && (
            <div className="px-3 py-2 border-t border-border shrink-0">
              <div className="flex items-center gap-2">
                {/* 上一集按钮 - 第一集时禁用 */}
                {onPrevEpisode && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={onPrevEpisode}
                    disabled={currentEpisode === 1}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    上一集
                  </Button>
                )}
                
                {/* 中间按钮区域 */}
                {isReview && onConfirmEpisode ? (
                  // AI提取待确认状态：显示"确认本集"
                  <Button 
                    size="sm"
                    onClick={onConfirmEpisode}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    确认本集
                  </Button>
                ) : isQualityCheck && onRejectEpisode && onApproveEpisode ? (
                  // 审核质检环节：显示"驳回"和"通过"两个按钮
                  <>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={onRejectEpisode}
                      className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      驳回
                    </Button>
                    <Button 
                      size="sm"
                      onClick={onApproveEpisode}
                      className="flex-1"
                    >
                      通过
                    </Button>
                  </>
                ) : (
                  // 其他环节：显示"完成本集"
                  <Button 
                    size="sm"
                    onClick={onCompleteEpisode}
                    disabled={subtitles.length === 0 || isReadOnly}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    完成本集
                  </Button>
                )}
                
                {/* 下一集按钮 - 最后一集时禁用 */}
                {onNextEpisode && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={onNextEpisode}
                    disabled={currentEpisode === totalEpisodes}
                    className="flex-1"
                  >
                    下一集
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 修改意见对话框 */}
      {currentSubtitle && (
        <ModificationCommentDialog
          open={commentDialogOpen}
          onOpenChange={setCommentDialogOpen}
          subtitle={{
            id: currentSubtitle.id,
            originalText: currentSubtitle.originalText,
            translatedText: currentSubtitle.translatedText,
          }}
          existingComment={currentSubtitle.comments?.[0]} // 暂时只支持一条意见
          onSubmit={handleSubmitComment}
          readOnly={!isQualityCheck} // 非质检环节为只读
        />
      )}
    </div>
  )
}
