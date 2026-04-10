"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, FileText, Trash2, Calendar, BookOpen, Pencil, Check, X, Sparkles, Languages, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { usePermission } from "@/contexts/permission-context"
import { CultureWashDialog, WashConfig } from "@/components/novel-wash/culture-wash-dialog"
import { WashProjectDetail } from "@/components/novel-wash/wash-project-detail"
import { WashWorkspace } from "@/components/novel-wash/wash-workspace"

interface NovelProject {
  id: string
  title: string
  chapters: number
  languageCount: number
  remark: string
  createdAt: string
  projectType?: "translation" | "wash"  // 项目类型：翻译项目 or 洗稿项目
  washConfig?: WashConfig               // 洗稿项目的配置
}

interface NovelProjectsPageProps {
  onOpenNovelWorkspace: (projectId: string) => void
  autoOpenCreate?: boolean
  onCreateDialogClosed?: () => void
}

// 默认小说项目数据
const defaultNovelProjects: NovelProject[] = [
  {
    id: "DJ24010101",
    title: "都市传说",
    chapters: 50,
    languageCount: 3,
    remark: "优先处理",
    createdAt: "2024-01-01",
  },
  {
    id: "DJ23120101",
    title: "修仙记",
    chapters: 100,
    languageCount: 2,
    remark: "已完成翻译",
    createdAt: "2023-12-01",
  },
]

export function NovelProjectsPage({ onOpenNovelWorkspace, autoOpenCreate, onCreateDialogClosed }: NovelProjectsPageProps) {
  const { user } = usePermission()
  
  // 从 localStorage 加载小说项目，如果没有则使用默认数据
  const [projects, setProjects] = useState<NovelProject[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('novel-projects')
      if (saved) {
        try {
          const parsedProjects = JSON.parse(saved)
          // 检查并转换旧格式的项目ID为新格式
          const migratedProjects = parsedProjects.map((project: any) => {
            // 检查是否是旧格式的项目ID
            if (project.id && !project.id.startsWith('DJ')) {
              // 生成新格式的项目ID：DJ+年月日+当日序号
              const today = new Date()
              const year = today.getFullYear().toString().substring(2)
              const month = String(today.getMonth() + 1).padStart(2, '0')
              const day = String(today.getDate()).padStart(2, '0')
              const datePrefix = `${year}${month}${day}`
              // 生成随机序号（1-99）
              const randomSeq = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')
              return {
                ...project,
                id: `DJ${datePrefix}${randomSeq}`
              }
            }
            return project
          })
          // 检查是否有项目ID被迁移
          const hasMigrated = parsedProjects.some((p: any) => p.id && !p.id.startsWith('DJ'))
          if (hasMigrated) {
            // 将迁移后的数据保存回localStorage
            localStorage.setItem('novel-projects', JSON.stringify(migratedProjects))
          }
          return migratedProjects
        } catch (e) {
          console.error('Failed to parse saved novel projects:', e)
        }
      }
    }
    return defaultNovelProjects
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Auto-open type select dialog when navigated from quick create
  useEffect(() => {
    if (autoOpenCreate) {
      setShowTypeSelect(true)
      onCreateDialogClosed?.()
    }
  }, [autoOpenCreate])
  const [remarkDialogOpen, setRemarkDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<NovelProject | null>(null)
  const [remarkText, setRemarkText] = useState("")
  const [showWashDialog, setShowWashDialog] = useState(false)
  const [showTypeSelect, setShowTypeSelect] = useState(false)
  const [washConfig, setWashConfig] = useState<WashConfig | null>(null)
  const [showWashWorkspace, setShowWashWorkspace] = useState(false)
  const [showWashFlow, setShowWashFlow] = useState(false) // true = show full flow from analyzing, false = show detail page
  const [newProjectTitle, setNewProjectTitle] = useState("")
  const [newSourceLanguage, setNewSourceLanguage] = useState("中文")
  const [createUploadedFiles, setCreateUploadedFiles] = useState<string[]>([])
  const [createDragOver, setCreateDragOver] = useState(false)
  const createFileInputRef = useRef<HTMLInputElement>(null)
  
  // 重命名状态
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  // 保存小说项目到 localStorage
  const saveProjects = (updatedProjects: NovelProject[]) => {
    setProjects(updatedProjects)
    if (typeof window !== 'undefined') {
      localStorage.setItem('novel-projects', JSON.stringify(updatedProjects))
    }
  }

  // 生成项目ID - 格式：DJ+年月日+当日序号 如：DJ26021001
  const generateProjectId = () => {
    const today = new Date()
    const year = today.getFullYear().toString().substring(2) // 获取年份后两位
    const month = String(today.getMonth() + 1).padStart(2, '0') // 月份补零
    const day = String(today.getDate()).padStart(2, '0') // 日期补零
    const datePrefix = `${year}${month}${day}`
    
    // 从localStorage获取今日已创建的项目数量
    if (typeof window !== 'undefined') {
      const savedProjects = localStorage.getItem('novel-projects')
      if (savedProjects) {
        try {
          const projects = JSON.parse(savedProjects)
          // 过滤出今日创建的项目
          const todayProjects = projects.filter((p: any) => 
            p.id.startsWith(`DJ${datePrefix}`)
          )
          // 计算今日序号
          const todayCount = todayProjects.length + 1
          return `DJ${datePrefix}${String(todayCount).padStart(2, '0')}`
        } catch (e) {
          console.error('Failed to parse saved projects:', e)
        }
      }
    }
    // 默认返回今日第一个项目
    return `DJ${datePrefix}01`
  }

  // 添加新小说项目
  const handleCreateProject = () => {
    if (!newProjectTitle.trim()) return

    const newProject: NovelProject = {
      id: generateProjectId(),
      title: newProjectTitle,
      originalLanguage: newSourceLanguage,
      chapters: 0,
      languageCount: 0,
      remark: "",
      createdAt: new Date().toISOString().split('T')[0],
    }

    const updatedProjects = [newProject, ...projects]
    saveProjects(updatedProjects)
    setCreateDialogOpen(false)
    setNewProjectTitle("")
    setNewSourceLanguage("中文")
  }

  // 处理编辑备注
  const handleEditRemark = (project: NovelProject) => {
    setSelectedProject(project)
    setRemarkText(project.remark)
    setRemarkDialogOpen(true)
  }

  // 处理删除项目
  const handleDeleteProject = (project: NovelProject) => {
    setSelectedProject(project)
    setDeleteDialogOpen(true)
  }

  // 重命名项目
  const handleStartRename = (project: NovelProject) => {
    setRenamingProjectId(project.id)
    setRenameValue(project.title)
  }

  const handleConfirmRename = () => {
    if (renamingProjectId && renameValue.trim()) {
      const updatedProjects = projects.map(p =>
        p.id === renamingProjectId ? { ...p, title: renameValue.trim() } : p
      )
      saveProjects(updatedProjects)
    }
    setRenamingProjectId(null)
    setRenameValue("")
  }

  const handleCancelRename = () => {
    setRenamingProjectId(null)
    setRenameValue("")
  }

  // 处理保存备注
  const handleSaveRemark = () => {
    if (selectedProject) {
      const updatedProjects = projects.map(p =>
        p.id === selectedProject.id ? { ...p, remark: remarkText } : p
      )
      saveProjects(updatedProjects)
    }
    setRemarkDialogOpen(false)
    setSelectedProject(null)
  }

  // 处理确认删除
  const handleConfirmDelete = () => {
    if (selectedProject) {
      const updatedProjects = projects.filter(p => p.id !== selectedProject.id)
      saveProjects(updatedProjects)
    }
    setDeleteDialogOpen(false)
    setSelectedProject(null)
  }

  // 过滤项目
  const filteredProjects = projects.filter((project) => {
    return project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.id.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Show wash flow (from "开始分析" button - full flow)
  if (showWashFlow && washConfig) {
    return (
      <WashWorkspace
        config={washConfig}
        onBack={() => { setShowWashFlow(false); setShowWashWorkspace(true) }}
        onCreateTranslationProject={(title, content) => {
          setShowWashFlow(false)
          const newProject: NovelProject = {
            id: generateProjectId(),
            title: `${title}（翻译）`,
            chapters: 0,
            languageCount: 0,
            remark: `洗稿自：${washConfig.sourceCountry} → ${washConfig.targetCountry}`,
            createdAt: new Date().toISOString().split("T")[0],
            projectType: "translation",
          }
          saveProjects([newProject, ...projects])
        }}
      />
    )
  }

  // Show wash project detail (from clicking a wash project in list)
  if (showWashWorkspace && washConfig) {
    return (
      <WashProjectDetail
        projectName={washConfig.projectName}
        config={washConfig}
        onBack={() => setShowWashWorkspace(false)}
        onCreateTranslationProject={(title, content) => {
          setShowWashWorkspace(false)
          const newProject: NovelProject = {
            id: generateProjectId(),
            title: `${title}（翻译）`,
            chapters: 0,
            languageCount: 0,
            remark: `洗稿自：${washConfig.sourceCountry} → ${washConfig.targetCountry}`,
            createdAt: new Date().toISOString().split("T")[0],
            projectType: "translation",
          }
          saveProjects([newProject, ...projects])
        }}
      />
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">小说管理</h1>
          <p className="text-muted-foreground mt-1">
            管理所有小说翻译项目
            {(user.role === 'translator' || user.role === 'quality_checker' || user.role === 'video_encoder') && 
              <span className="ml-2 text-sm">(已分配给我的)</span>
            }
          </p>
        </div>
        <Button onClick={() => setShowTypeSelect(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新建小说项目
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 bg-card border-border">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目ID或名称..."
            className="pl-9 bg-input border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Projects Table */}
      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground w-24">ID</TableHead>
              <TableHead className="text-muted-foreground">小说名称</TableHead>
              <TableHead className="text-muted-foreground text-center">项目类型</TableHead>
              <TableHead className="text-muted-foreground text-center">章节数量</TableHead>
              <TableHead className="text-muted-foreground text-center">语种数量</TableHead>
              <TableHead className="text-muted-foreground">备注</TableHead>
              <TableHead className="text-muted-foreground">创建时间</TableHead>
              <TableHead className="text-muted-foreground text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow
                key={project.id}
                className="border-border hover:bg-muted/50 cursor-pointer"
                onClick={() => {
                  if (project.projectType === "wash") {
                    // 洗稿项目：进入洗稿工作台
                    setWashConfig(project.washConfig || { projectName: project.title, sourceFile: "", sourceCountry: "美国", targetCountry: "中国" })
                    setShowWashWorkspace(true)
                  } else {
                    // 翻译项目：进入多语种页面
                    onOpenNovelWorkspace(project.id)
                  }
                }}
              >
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {project.id}
                </TableCell>
                <TableCell>
                  {renamingProjectId === project.id ? (
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <Input
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") handleConfirmRename()
                          if (e.key === "Escape") handleCancelRename()
                        }}
                        className="h-7 text-sm w-48"
                        autoFocus
                      />
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleConfirmRename() }}>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleCancelRename() }}>
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  ) : (
                    <p className="font-medium text-foreground">{project.title}</p>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", project.projectType === "wash" ? "bg-purple-500/10 text-purple-600" : "bg-blue-500/10 text-blue-600")}>
                    {project.projectType === "wash" ? "洗稿" : "翻译"}
                  </span>
                </TableCell>
                <TableCell className="text-center text-foreground">
                  {project.chapters}
                </TableCell>
                <TableCell className="text-center text-foreground">
                  {project.languageCount}
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground max-w-48 truncate">
                    {project.remark || "-"}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span className="text-sm">{project.createdAt}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartRename(project)
                      }}
                      className="h-8 px-2"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      重命名
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditRemark(project)
                      }}
                      className="h-8 px-2"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      备注
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteProject(project)
                      }}
                      className="h-8 px-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>新建翻译项目</DialogTitle>
            <DialogDescription>上传小说文件，创建多语言翻译项目</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Upload area */}
            <div>
              <label className="block text-sm font-medium mb-1.5">上传文件 <span className="text-destructive">*</span></label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                  createDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}
                onDragOver={e => { e.preventDefault(); setCreateDragOver(true) }}
                onDragLeave={() => setCreateDragOver(false)}
                onDrop={e => {
                  e.preventDefault(); setCreateDragOver(false)
                  const names = Array.from(e.dataTransfer.files).map(f => f.name)
                  setCreateUploadedFiles(prev => [...prev, ...names])
                  if (!newProjectTitle && names.length > 0) setNewProjectTitle(names[0].replace(/\.[^.]+$/, ""))
                }}
                onClick={() => createFileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">拖拽文件到此处，或点击选择文件</p>
                <p className="text-xs text-muted-foreground/70 mt-1">支持 TXT、DOCX、EPUB 格式</p>
                <input ref={createFileInputRef} type="file" className="hidden" accept=".txt,.docx,.epub" multiple
                  onChange={e => {
                    const names = Array.from(e.target.files || []).map(f => f.name)
                    setCreateUploadedFiles(prev => [...prev, ...names])
                    if (!newProjectTitle && names.length > 0) setNewProjectTitle(names[0].replace(/\.[^.]+$/, ""))
                  }} />
              </div>
              {createUploadedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {createUploadedFiles.map(f => (
                    <div key={f} className="flex items-center gap-2 px-2 py-1 rounded bg-muted/50 text-xs">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="flex-1 truncate">{f}</span>
                      <button onClick={() => setCreateUploadedFiles(prev => prev.filter(x => x !== f))} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">小说名称 <span className="text-destructive">*</span></label>
              <Input placeholder="输入小说名称" value={newProjectTitle} onChange={(e) => setNewProjectTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">源语言</label>
              <Select value={newSourceLanguage} onValueChange={setNewSourceLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["中文", "英语", "日语", "韩语", "西班牙语", "葡萄牙语", "法语", "德语", "俄语", "泰语", "越南语", "印尼语"].map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>取消</Button>
            <Button onClick={() => { handleCreateProject(); setCreateUploadedFiles([]) }} disabled={!newProjectTitle.trim() || createUploadedFiles.length === 0}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Remark Dialog */}
      <Dialog open={remarkDialogOpen} onOpenChange={setRemarkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改备注</DialogTitle>
            <DialogDescription>
              {selectedProject?.title} ({selectedProject?.id})
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="输入备注内容..."
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            className="min-h-24"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemarkDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveRemark}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除小说项目 "{selectedProject?.title}" 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Type Select Dialog */}
      <Dialog open={showTypeSelect} onOpenChange={setShowTypeSelect}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>选择项目类型</DialogTitle>
            <DialogDescription>请选择要创建的小说项目类型</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => { setShowTypeSelect(false); setCreateDialogOpen(true) }}
            >
              <Languages className="w-10 h-10 text-blue-500" />
              <div className="text-center">
                <p className="text-sm font-semibold">小说翻译</p>
                <p className="text-xs text-muted-foreground mt-1">多语言翻译与本地化</p>
              </div>
            </button>
            <button
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => { setShowTypeSelect(false); setShowWashDialog(true) }}
            >
              <Sparkles className="w-10 h-10 text-purple-500" />
              <div className="text-center">
                <p className="text-sm font-semibold">文化洗稿</p>
                <p className="text-xs text-muted-foreground mt-1">跨文化内容改写适配</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Culture Wash Dialog */}
      <CultureWashDialog
        open={showWashDialog}
        onOpenChange={setShowWashDialog}
        onSubmit={(cfg) => {
          setWashConfig(cfg)
          // Create the wash project in the list
          const washProject: NovelProject = {
            id: generateProjectId(),
            title: cfg.projectName,
            chapters: 0,
            languageCount: 0,
            remark: `${cfg.sourceCountry} → ${cfg.targetCountry}`,
            createdAt: new Date().toISOString().split("T")[0],
            projectType: "wash",
            washConfig: cfg,
          }
          saveProjects([washProject, ...projects])
          // Go directly to the wash flow (analyzing → genre_select → ...)
          setShowWashFlow(true)
        }}
      />
    </div>
  )
}
