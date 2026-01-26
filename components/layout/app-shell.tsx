"use client"

import { useState } from "react"
import { Sidebar, type PageType } from "./sidebar"
import { Dashboard } from "@/components/dashboard"
import { ProjectsPage } from "@/components/projects/projects-page"
import { WorkspacePage } from "@/components/workspace/workspace-page"
import { EditorPage } from "@/components/editor/editor-page"
import { TasksPage } from "@/components/tasks/tasks-page"
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
  const [currentPage, setCurrentPage] = useState<PageType>(initialPage)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedProjectName, setSelectedProjectName] = useState<string>("霸道总裁爱上我")
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null)
  const [selectedLanguageVariant, setSelectedLanguageVariant] = useState<string>("") // 保存选中的语言变体
  const [detailPage, setDetailPage] = useState<DetailPageType>(null)
  const [currentTaskType, setCurrentTaskType] = useState<string>("")
  const [currentTaskId, setCurrentTaskId] = useState<string>("")
  const [showVideoPreview, setShowVideoPreview] = useState(false)
  const [videoPreviewType, setVideoPreviewType] = useState<"视频擦除" | "字幕挂载" | "视频压制">("视频擦除")
  const [workflowStage, setWorkflowStage] = useState<"ai_extract_pending" | "ai_extract_review" | "ai_extract_completed" | "ai_translate" | "manual_translate" | "quality_check" | "completed">("manual_translate")
  
  // 项目工作流状态管理 - 用于跨页面状态同步
  const [projectWorkflowStates, setProjectWorkflowStates] = useState<Record<string, string>>({})
  
  // Source tracking for navigation
  const [taskSource, setTaskSource] = useState<TaskSource>("tasks")
  
  // Episode navigation state
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0)
  const totalEpisodes = 10 // Mock total episodes

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page)
    setDetailPage(null)
  }

  const handleOpenWorkspace = (projectId: string) => {
    setSelectedProjectId(projectId)
    setCurrentPage("workspace")
    setDetailPage(null)
  }

  const handleOpenEditor = (
    projectId: string, 
    languageVariant: string, 
    episodeId: string,
    workflowStage?: "ai_extract_pending" | "ai_extract_review" | "ai_extract_completed" | "ai_translate" | "manual_translate" | "quality_check" | "completed"
  ) => {
    setSelectedProjectId(projectId)
    setSelectedLanguageVariant(languageVariant) // 保存语言变体
    setSelectedEpisodeId(episodeId)
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
        return <Dashboard onOpenWorkspace={handleOpenWorkspace} onNavigateToProjects={handleNavigateToProjects} />
      case "projects":
        return <ProjectsPage onOpenWorkspace={handleOpenWorkspace} />
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
      case "editor":
        return (
          <EditorPage
            projectId={selectedProjectId}
            languageVariant={selectedLanguageVariant}
            episodeId={selectedEpisodeId}
            workflowStage={workflowStage}
            onBack={() => setCurrentPage("workspace")}
            onConfirmReview={handleConfirmReview}
          />
        )
      case "tasks":
        return <TasksPage onOpenEditor={handleOpenEditor} onOpenTaskDetail={handleOpenTaskDetailFromTasks} />
      default:
        return <Dashboard onOpenWorkspace={handleOpenWorkspace} onNavigateToProjects={handleNavigateToProjects} />
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
