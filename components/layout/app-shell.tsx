"use client"

import { useState } from "react"
import { Sidebar, type PageType } from "./sidebar"
import { usePermission } from "@/contexts/permission-context"
import { Dashboard } from "@/components/dashboard"
import { ProjectsPage } from "@/components/projects/projects-page"
import { NovelProjectsPage } from "@/components/projects/novel-projects-page"
import { WorkspacePage } from "@/components/workspace/workspace-page"
import { NovelsPage } from "@/components/workspace/novels-page"
import { EditorPage } from "@/components/editor/editor-page"
import { NovelEditorPage } from "@/components/editor/novel-editor-page"
import { TasksPage } from "@/components/tasks/tasks-page"
import { AnalyticsOverview } from "@/components/analytics/analytics-overview"
import { AnalyticsDataList } from "@/components/analytics/analytics-data-list"
import { AnalyticsTranslatorPerformanceV2 } from "@/components/analytics/analytics-translator-performance-v2"
import { AnalyticsBusinessEffect } from "@/components/analytics/analytics-business-effect"
import { TranslatorDetailPage } from "@/components/analytics/translator-detail-page"
import { PersonalCenter } from "@/components/personal/personal-center"
import { UserManagementPage } from "@/components/user-management/user-management-page"
import { TaskPoolPage } from "@/components/task-pool/task-pool-page"
import { RecycleBinPage } from "@/components/recycle-bin/recycle-bin-page"
import {
  TaskListPage,
  AIExtractDetailPage,
  AITranslationDetailPage,
  ManualTranslationDetailPage,
  VideoPreviewDialog,
} from "@/components/tasks/task-detail-pages"

interface AppShellProps {
  initialPage?: PageType
}

type DetailPageType =
  | "task_list"
  | "ai_extract_detail"
  | "ai_translate_detail"
  | "manual_translate_detail"
  | "manual_translate_review"
  | "video_preview"
  | null

// Source tracking for back navigation
type TaskSource = "workspace" | "tasks"

export function AppShell({ initialPage = "dashboard" }: AppShellProps) {
  const { user, switchRole } = usePermission()
  const [currentPage, setCurrentPage] = useState<PageType>(initialPage)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedProjectName, setSelectedProjectName] = useState<string>("霸道总裁爱上我")
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null)
  const [selectedLanguageVariant, setSelectedLanguageVariant] = useState<string>("") // 保存选中的语言变体
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | undefined>(undefined) // 保存视频URL
  const [detailPage, setDetailPage] = useState<DetailPageType>(null)
  const [currentTaskType, setCurrentTaskType] = useState<string>("")
  const [currentTaskId, setCurrentTaskId] = useState<string>("")
  const [showVideoPreview, setShowVideoPreview] = useState(false)
  const [videoPreviewType, setVideoPreviewType] = useState<"视频擦除" | "字幕挂载" | "视频压制">("视频擦除")
  const [workflowStage, setWorkflowStage] = useState<"ai_extract_pending" | "ai_extract_review" | "ai_extract_completed" | "ai_translate" | "manual_translate" | "quality_check" | "completed">("manual_translate")
  const [editorSubmitReviewCallback, setEditorSubmitReviewCallback] = useState<((action?: "submit" | "approve" | "reject") => void) | undefined>(undefined)
  
  // 项目工作流状态管理 - 用于跨页面状态同步
  const [projectWorkflowStates, setProjectWorkflowStates] = useState<Record<string, string>>({})
  
  // Source tracking for navigation
  const [taskSource, setTaskSource] = useState<TaskSource>("tasks")
  
  // Episode navigation state
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0)
  const totalEpisodes = 10 // Mock total episodes
  
  // Novel project state
  const [selectedNovelProjectId, setSelectedNovelProjectId] = useState<string | null>(null)
  const [selectedNovelProjectName, setSelectedNovelProjectName] = useState<string>("都市传说")
  
  // Novel editor state
  const [novelEditorLanguageVariant, setNovelEditorLanguageVariant] = useState<string>("")
  const [novelEditorChapterId, setNovelEditorChapterId] = useState<string>("1")
  const [novelEditorWorkflowStage, setNovelEditorWorkflowStage] = useState<string>("")
  const [novelEditorHasTerminology, setNovelEditorHasTerminology] = useState(false)
  const [novelEditorIsPreTranslation, setNovelEditorIsPreTranslation] = useState(false)
  const [novelEditorIsSourceLanguage, setNovelEditorIsSourceLanguage] = useState(false)
  const [novelEditorSubmitCallback, setNovelEditorSubmitCallback] = useState<((action?: "submit" | "approve" | "reject") => void) | undefined>(undefined)

  // 任务进度页面筛选状态
  const [taskProgressFilterDrama, setTaskProgressFilterDrama] = useState<string | undefined>(undefined)
  const [taskProgressFilterLanguage, setTaskProgressFilterLanguage] = useState<string | undefined>(undefined)
  
  // 短剧进度页面筛选状态
  const [dramaProgressFilterStage, setDramaProgressFilterStage] = useState<string | undefined>(undefined)
  const [dramaProgressFilterDateRange, setDramaProgressFilterDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined)
  
  // 译员绩效页面筛选状态
  const [translatorPerformanceFilter, setTranslatorPerformanceFilter] = useState<string | undefined>(undefined)
  
  // 译员绩效页面详细筛选状态
  const [translatorPerformanceFilters, setTranslatorPerformanceFilters] = useState<{
    language: string
    translator: string
    rating: string
    specialty: string
    types: string[]
    status: string
  }>({
    language: "all",
    translator: "all",
    rating: "all",
    specialty: "all",
    types: ["all"],
    status: "all"
  })
  
  // 投放效果页面筛选状态
  const [businessEffectFilterDrama, setBusinessEffectFilterDrama] = useState<string | undefined>(undefined)
  const [businessEffectFilterLanguage, setBusinessEffectFilterLanguage] = useState<string | undefined>(undefined)
  
  // 译员详情页面状态
  const [selectedTranslatorId, setSelectedTranslatorId] = useState<string | null>(null)
  const [translatorDetailSource, setTranslatorDetailSource] = useState<"standalone" | "datalist">("standalone")
  
  // 数据列表页面激活标签页状态
  const [activeDataListTab, setActiveDataListTab] = useState<string>("drama-progress")

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page)
    setDetailPage(null)
    // 清除任务进度页面的筛选
    if (page !== "analytics-data-list") {
      setTaskProgressFilterDrama(undefined)
      setTaskProgressFilterLanguage(undefined)
    }
    // 清除短剧进度页面的筛选
    if (page !== "analytics-data-list") {
      setDramaProgressFilterStage(undefined)
      setDramaProgressFilterDateRange(undefined)
    }
    // 不清除译员绩效页面的筛选，保持筛选状态
    // 清除投放效果页面的筛选
    if (page !== "analytics-business-effect") {
      setBusinessEffectFilterDrama(undefined)
      setBusinessEffectFilterLanguage(undefined)
    }
  }

  // 从概览页面跳转到短剧进度页面（数据列表）
  const handleNavigateToDataList = (stageFilter?: string, dateRange?: { from: Date; to: Date }) => {
    setDramaProgressFilterStage(stageFilter)
    setDramaProgressFilterDateRange(dateRange)
    setCurrentPage("analytics-data-list")
  }

  // 从概览页面跳转到译员绩效页面
  const handleNavigateToTranslatorPerformance = (translatorName?: string) => {
    setTranslatorPerformanceFilter(translatorName)
    setCurrentPage("analytics-translator-performance")
  }
  
  // 从译员绩效页面跳转到译员详情页面
  const handleNavigateToTranslatorDetail = (translatorName: string) => {
    setSelectedTranslatorId(translatorName)
    setTranslatorDetailSource("standalone")
    setActiveDataListTab("translator-performance")
    setCurrentPage("analytics-translator-detail")
  }

  // 从概览页面跳转到投放效果页面
  const handleNavigateToBusinessEffect = (drama?: string, language?: string) => {
    setBusinessEffectFilterDrama(drama)
    setBusinessEffectFilterLanguage(language)
    setCurrentPage("analytics-business-effect")
  }

  // 从短剧进度页面跳转到任务进度页面
  const handleNavigateToTaskProgress = (dramaName: string, language: string) => {
    setTaskProgressFilterDrama(dramaName)
    setTaskProgressFilterLanguage(language)
    // 保持在analytics-data-list页面，不改变currentPage
  }

  // 从短剧进度或任务进度页面跳转到译员详情页面
  const handleNavigateToTranslatorFromList = (translatorName: string) => {
    setSelectedTranslatorId(translatorName)
    setTranslatorDetailSource("datalist")
    setActiveDataListTab("translator-performance")
    setCurrentPage("analytics-translator-detail")
  }

  const handleOpenWorkspace = (projectId: string) => {
    setSelectedProjectId(projectId)
    
    // 从localStorage中获取项目名称
    if (typeof window !== 'undefined') {
      try {
        const savedProjects = localStorage.getItem('drama-projects')
        if (savedProjects) {
          const projects = JSON.parse(savedProjects)
          const project = projects.find((p: any) => p.id === projectId)
          if (project) {
            setSelectedProjectName(project.title)
          }
        }
      } catch (e) {
        console.error('Failed to get project name:', e)
      }
    }
    
    setCurrentPage("workspace")
    setDetailPage(null)
  }

  const handleOpenNovelWorkspace = (projectId: string) => {
    setSelectedNovelProjectId(projectId)
    
    // 从localStorage中获取项目名称
    if (typeof window !== 'undefined') {
      try {
        const savedProjects = localStorage.getItem('novel-projects')
        if (savedProjects) {
          const projects = JSON.parse(savedProjects)
          const project = projects.find((p: any) => p.id === projectId)
          if (project) {
            setSelectedNovelProjectName(project.title)
          }
        }
      } catch (e) {
        console.error('Failed to get novel project name:', e)
      }
    }
    
    setCurrentPage("novels-workspace")
    setDetailPage(null)
  }

  const handleOpenNovelEditor = (
    languageVariant: string,
    chapterId: string,
    workflowStage: string,
    hasTerminology: boolean,
    isPreTranslation: boolean,
    isSourceLanguage: boolean,
    onSubmitReview?: (action?: "submit" | "approve" | "reject") => void
  ) => {
    setNovelEditorLanguageVariant(languageVariant)
    setNovelEditorChapterId(chapterId)
    setNovelEditorWorkflowStage(workflowStage)
    setNovelEditorHasTerminology(hasTerminology)
    setNovelEditorIsPreTranslation(isPreTranslation)
    setNovelEditorIsSourceLanguage(isSourceLanguage)
    setNovelEditorSubmitCallback(() => onSubmitReview)
    setCurrentPage("novel-editor")
    setDetailPage(null)
  }

  const handleOpenEditor = (...args: any[]) => {
    // 处理不同的参数组合
    let languageVariant: string
    let episodeId: string
    let workflowStage: "ai_extract_pending" | "ai_extract_review" | "ai_extract_completed" | "ai_translate" | "manual_translate" | "quality_check" | "completed" | undefined
    let videoUrl: string | undefined
    
    const projectId = args[0] as string
    
    if (args.length <= 2) {
      // TasksPage 调用方式: (projectId, episodeId)
      languageVariant = ""
      episodeId = args[1] as string
      workflowStage = undefined
      videoUrl = undefined
    } else if (args.length === 4 && typeof args[3] === "string") {
      // NovelsPage 调用方式: (projectId, languageVariant, chapterId, workflowStage)
      languageVariant = args[1] as string
      episodeId = args[2] as string
      workflowStage = args[3] as any
      videoUrl = undefined
    } else {
      // WorkspacePage 调用方式: (projectId, languageVariant, episodeId, workflowStage, onSubmitReview?, videoUrl?)
      languageVariant = args[1] as string
      episodeId = args[2] as string
      workflowStage = args[3] as any
      // args[4] 是 onSubmitReview 回调（函数或undefined），args[5] 是 videoUrl
      videoUrl = typeof args[5] === 'string' ? args[5] : undefined
    }
    
    // 存储 onSubmitReview 回调
    const submitReviewCb = typeof args[4] === 'function' ? args[4] : undefined
    setEditorSubmitReviewCallback(() => submitReviewCb)
    
    setSelectedProjectId(projectId)
    setSelectedLanguageVariant(languageVariant) // 保存语言变体
    setSelectedEpisodeId(episodeId)
    setSelectedVideoUrl(videoUrl) // 保存视频URL
    setCurrentPage("editor")
    setDetailPage(null)
    // 存储 workflowStage 以便传递给 EditorPage
    setWorkflowStage(workflowStage || "manual_translate")
  }
  
  // AI提取待确认状态下点击确认的回调
  const handleConfirmReview = () => {
    if (selectedProjectId) {
      // 更新项目状态为"AI提取-已完成"
      setProjectWorkflowStates(prev => ({
        ...prev,
        [selectedProjectId]: "AI提取-已完成"
      }))
    }
  }

  const handleNavigateToProjects = () => {
    setCurrentPage("projects")
    setDetailPage(null)
  }

  // Quick create: navigate to projects page and auto-open create dialog
  const [autoOpenDramaCreate, setAutoOpenDramaCreate] = useState(false)
  const [autoOpenNovelCreate, setAutoOpenNovelCreate] = useState(false)

  const handleCreateDrama = () => {
    setAutoOpenDramaCreate(true)
    setCurrentPage("projects")
    setDetailPage(null)
  }

  const handleCreateNovel = () => {
    setAutoOpenNovelCreate(true)
    setCurrentPage("novels")
    setDetailPage(null)
  }

  const handleOpenManualTranslation = () => {
    setCurrentTaskType("人工翻译")
    setTaskSource("workspace")
    setCurrentPage("tasks")
    setDetailPage("task_list")
  }

  // Handle opening task detail from workspace (video tasks tab)
  const handleOpenTaskDetailFromWorkspace = (taskType: string, taskId: string) => {
    setCurrentTaskType(taskType)
    setCurrentTaskId(taskId)
    setTaskSource("workspace")
    setDetailPage("task_list")
  }

  // Handle opening task detail from task center
  const handleOpenTaskDetailFromTasks = (taskType: string, taskId: string) => {
    setCurrentTaskType(taskType)
    setCurrentTaskId(taskId)
    setTaskSource("tasks")
    setDetailPage("task_list")
  }

  const handleViewTaskDetail = (taskId: string) => {
    setCurrentTaskId(taskId)
    setCurrentEpisodeIndex(parseInt(taskId) - 1)

    switch (currentTaskType) {
      case "AI提取":
        setDetailPage("ai_extract_detail")
        break
      case "AI翻译":
        setDetailPage("ai_translate_detail")
        break
      case "人工翻译":
        setDetailPage("manual_translate_detail")
        break
      case "视频擦除":
        setVideoPreviewType("视频擦除")
        setShowVideoPreview(true)
        break
      case "字幕挂载":
        setVideoPreviewType("字幕挂载")
        setShowVideoPreview(true)
        break
      case "视频压制":
        setVideoPreviewType("视频压制")
        setShowVideoPreview(true)
        break
    }
  }

  const handleBackFromTaskList = () => {
    setDetailPage(null)
    // Return to correct source page
    if (taskSource === "workspace") {
      setCurrentPage("workspace")
    } else {
      setCurrentPage("tasks")
    }
  }

  const handleBackFromDetail = () => {
    setDetailPage("task_list")
  }

  const handlePrevEpisode = () => {
    if (currentEpisodeIndex > 0) {
      setCurrentEpisodeIndex(currentEpisodeIndex - 1)
      setCurrentTaskId(String(currentEpisodeIndex))
    }
  }

  const handleNextEpisode = () => {
    if (currentEpisodeIndex < totalEpisodes - 1) {
      setCurrentEpisodeIndex(currentEpisodeIndex + 1)
      setCurrentTaskId(String(currentEpisodeIndex + 2))
    }
  }

  // Generate breadcrumbs based on current state
  const generateBreadcrumbs = () => {
    const crumbs: { label: string; onClick?: () => void }[] = []

    if (taskSource === "workspace") {
      crumbs.push({ label: "工作台", onClick: () => handleNavigate("projects") })
      crumbs.push({ label: selectedProjectName, onClick: () => setCurrentPage("workspace") })
      crumbs.push({ label: "视频任务", onClick: handleBackFromTaskList })
    } else {
      crumbs.push({ label: "任务中心", onClick: () => handleNavigate("tasks") })
    }

    if (detailPage === "task_list") {
      crumbs.push({ label: `${currentTaskType}任务` })
    } else if (detailPage) {
      crumbs.push({ label: `${currentTaskType}任务`, onClick: handleBackFromDetail })
      crumbs.push({ label: `第${currentEpisodeIndex + 1}集` })
    }

    return crumbs
  }

  const renderPage = () => {
    const breadcrumbs = generateBreadcrumbs()

    // Handle detail pages first
    if (detailPage === "task_list") {
      return (
        <TaskListPage
          taskType={currentTaskType}
          projectName={taskSource === "workspace" ? selectedProjectName : undefined}
          onBack={handleBackFromTaskList}
          onViewDetail={handleViewTaskDetail}
          breadcrumbs={breadcrumbs}
        />
      )
    }

    if (detailPage === "ai_extract_detail") {
      return (
        <AIExtractDetailPage
          taskId={currentTaskId}
          episodeIndex={currentEpisodeIndex}
          totalEpisodes={totalEpisodes}
          onBack={handleBackFromDetail}
          onPrevEpisode={handlePrevEpisode}
          onNextEpisode={handleNextEpisode}
          breadcrumbs={breadcrumbs}
        />
      )
    }

    if (detailPage === "ai_translate_detail") {
      return (
        <AITranslationDetailPage
          taskId={currentTaskId}
          episodeIndex={currentEpisodeIndex}
          totalEpisodes={totalEpisodes}
          onBack={handleBackFromDetail}
          onPrevEpisode={handlePrevEpisode}
          onNextEpisode={handleNextEpisode}
          breadcrumbs={breadcrumbs}
        />
      )
    }

    if (detailPage === "manual_translate_detail") {
      return (
        <ManualTranslationDetailPage
          taskId={currentTaskId}
          episodeIndex={currentEpisodeIndex}
          totalEpisodes={totalEpisodes}
          onBack={handleBackFromDetail}
          onPrevEpisode={handlePrevEpisode}
          onNextEpisode={handleNextEpisode}
          isReviewer={false}
          breadcrumbs={breadcrumbs}
        />
      )
    }

    if (detailPage === "manual_translate_review") {
      return (
        <ManualTranslationDetailPage
          taskId={currentTaskId}
          episodeIndex={currentEpisodeIndex}
          totalEpisodes={totalEpisodes}
          onBack={handleBackFromDetail}
          onPrevEpisode={handlePrevEpisode}
          onNextEpisode={handleNextEpisode}
          isReviewer={true}
          breadcrumbs={breadcrumbs}
        />
      )
    }

    // Main pages
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onOpenWorkspace={handleOpenWorkspace} onNavigateToProjects={handleNavigateToProjects} onCreateDrama={handleCreateDrama} onCreateNovel={handleCreateNovel} />
      case "analytics-overview":
        return <AnalyticsOverview 
          onNavigateToDataList={handleNavigateToDataList}
          onNavigateToTranslatorPerformance={handleNavigateToTranslatorPerformance}
          onNavigateToBusinessEffect={handleNavigateToBusinessEffect}
        />
      case "analytics-data-list":
        return <AnalyticsDataList 
          initialStageFilter={dramaProgressFilterStage}
          initialDateRange={dramaProgressFilterDateRange}
          initialTaskDramaFilter={taskProgressFilterDrama}
          initialTaskLanguageFilter={taskProgressFilterLanguage}
          initialTranslatorFilter={translatorPerformanceFilter}
          initialFilters={translatorPerformanceFilters}
          onFiltersChange={setTranslatorPerformanceFilters}
          activeTab={activeDataListTab}
          onActiveTabChange={setActiveDataListTab}
          onNavigateToDrama={handleNavigateToTaskProgress}
          onNavigateToTranslator={handleNavigateToTranslatorFromList}
        />
      case "analytics-translator-performance":
        return <AnalyticsTranslatorPerformanceV2 
          initialTranslatorFilter={translatorPerformanceFilter}
          initialFilters={translatorPerformanceFilters}
          onFiltersChange={setTranslatorPerformanceFilters}
          onNavigateToTranslator={handleNavigateToTranslatorDetail}
        />
      case "analytics-translator-detail":
        return selectedTranslatorId ? (
          <TranslatorDetailPage 
            translatorId={selectedTranslatorId}
            fromDataList={translatorDetailSource === "datalist"}
            onBack={() => {
              setCurrentPage("analytics-data-list")
            }}
          />
        ) : null
      case "analytics-business-effect":
        return <AnalyticsBusinessEffect 
          initialDramaFilter={businessEffectFilterDrama}
          initialLanguageFilter={businessEffectFilterLanguage}
        />
      case "projects":
        return <ProjectsPage onOpenWorkspace={handleOpenWorkspace} autoOpenCreate={autoOpenDramaCreate} onCreateDialogClosed={() => setAutoOpenDramaCreate(false)} />
      case "workspace":
        return (
          <WorkspacePage
            projectId={selectedProjectId}
            projectTitle={selectedProjectName}
            onOpenEditor={handleOpenEditor}
            onBack={() => setCurrentPage("projects")}
            projectWorkflowState={selectedProjectId ? projectWorkflowStates[selectedProjectId] : undefined}
          />
        )
      case "novels":
        return (
          <NovelProjectsPage onOpenNovelWorkspace={handleOpenNovelWorkspace} autoOpenCreate={autoOpenNovelCreate} onCreateDialogClosed={() => setAutoOpenNovelCreate(false)} />
        )
      case "novels-workspace":
        return (
          <NovelsPage
            projectId={selectedNovelProjectId}
            projectTitle={selectedNovelProjectName}
            onOpenEditor={handleOpenNovelEditor}
            onBack={() => setCurrentPage("novels")}
          />
        )
      case "novel-editor":
        return (
          <NovelEditorPage
            projectId={selectedNovelProjectId}
            languageVariant={novelEditorLanguageVariant}
            chapterId={novelEditorChapterId}
            workflowStage={novelEditorWorkflowStage}
            totalChapters={50}
            onBack={() => setCurrentPage("novels-workspace")}
            onSubmitReview={novelEditorSubmitCallback}
            hasTerminology={novelEditorHasTerminology}
            isPreTranslation={novelEditorIsPreTranslation}
            isSourceLanguage={novelEditorIsSourceLanguage}
          />
        )
      case "editor":
        return (
          <EditorPage
            projectId={selectedProjectId}
            languageVariant={selectedLanguageVariant}
            episodeId={selectedEpisodeId}
            workflowStage={workflowStage}
            onBack={() => setCurrentPage("workspace")}
            onConfirmReview={handleConfirmReview}
            onSubmitReview={editorSubmitReviewCallback}
            videoUrl={selectedVideoUrl}
          />
        )
      case "tasks":
        return <TasksPage onOpenEditor={handleOpenEditor} onOpenTaskDetail={handleOpenTaskDetailFromTasks} />
      case "personal-center":
        return <PersonalCenter />
      case "user-management":
        return <UserManagementPage />
      case "task-pool":
        return <TaskPoolPage />
      case "recycle-bin":
        return <RecycleBinPage />
      default:
        return <Dashboard onOpenWorkspace={handleOpenWorkspace} onNavigateToProjects={handleNavigateToProjects} onCreateDrama={handleCreateDrama} onCreateNovel={handleCreateNovel} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>

      {/* Video Preview Dialog */}
      <VideoPreviewDialog
        open={showVideoPreview}
        onOpenChange={setShowVideoPreview}
        taskType={videoPreviewType}
        onConfirm={() => setShowVideoPreview(false)}
      />
    </div>
  )
}
