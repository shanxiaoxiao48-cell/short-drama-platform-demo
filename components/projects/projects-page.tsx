"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Search, Plus, Pencil, FileText, Trash2, Calendar } from "lucide-react"
import { CreateProjectDialog } from "./create-project-dialog"
import { usePermission } from "@/contexts/permission-context"

interface ProjectsPageProps {
  onOpenWorkspace: (projectId: string) => void
}

interface Project {
  id: string
  title: string
  episodes: number
  languageCount: number
  remark: string
  createdAt: string
}

// 默认项目数据
const defaultProjects: Project[] = [
  {
    id: "DG001",
    title: "霸道总裁爱上我",
    episodes: 80,
    languageCount: 5,
    remark: "优先处理，客户催促",
    createdAt: "2024-01-01",
  },
  {
    id: "DG002",
    title: "穿越之锦绣良缘",
    episodes: 60,
    languageCount: 2,
    remark: "已完成翻译",
    createdAt: "2023-12-01",
  },
  {
    id: "DG003",
    title: "重生之商业帝国",
    episodes: 100,
    languageCount: 2,
    remark: "",
    createdAt: "2024-01-10",
  },
  {
    id: "DG004",
    title: "豪门逆袭记",
    episodes: 50,
    languageCount: 1,
    remark: "新项目，待启动",
    createdAt: "2024-01-14",
  },
  {
    id: "DG005",
    title: "甜蜜复仇",
    episodes: 70,
    languageCount: 2,
    remark: "翻译进度正常",
    createdAt: "2024-01-05",
  },
  {
    id: "DG006",
    title: "都市修仙传",
    episodes: 120,
    languageCount: 2,
    remark: "全部完成",
    createdAt: "2023-11-01",
  },
]

export function ProjectsPage({ onOpenWorkspace }: ProjectsPageProps) {
  const { canAccessProject, user } = usePermission()
  
  // 从 localStorage 加载项目，如果没有则使用默认数据
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('drama-projects')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse saved projects:', e)
        }
      }
    }
    return defaultProjects
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [remarkDialogOpen, setRemarkDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [remarkText, setRemarkText] = useState("")

  // 保存项目到 localStorage
  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects)
    if (typeof window !== 'undefined') {
      localStorage.setItem('drama-projects', JSON.stringify(updatedProjects))
    }
  }

  // 添加新项目
  const handleProjectCreated = (newProject: Project) => {
    const updatedProjects = [newProject, ...projects]
    saveProjects(updatedProjects)
  }

  // 先根据权限过滤项目，再根据搜索条件过滤
  const filteredProjects = projects
    .filter((project) => canAccessProject(project.id))
    .filter((project) => {
      return project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.id.toLowerCase().includes(searchQuery.toLowerCase())
    })

  const handleEditRemark = (project: Project) => {
    setSelectedProject(project)
    setRemarkText(project.remark)
    setRemarkDialogOpen(true)
  }

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project)
    setDeleteDialogOpen(true)
  }

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

  const handleConfirmDelete = () => {
    if (selectedProject) {
      const updatedProjects = projects.filter(p => p.id !== selectedProject.id)
      saveProjects(updatedProjects)
    }
    setDeleteDialogOpen(false)
    setSelectedProject(null)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">工作台</h1>
          <p className="text-muted-foreground mt-1">
            管理所有短剧出海项目
            {(user.role === 'translator' || user.role === 'quality_checker' || user.role === 'video_encoder') && 
              <span className="ml-2 text-sm">(已分配给我的)</span>
            }
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新建项目
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
              <TableHead className="text-muted-foreground">短剧名称</TableHead>
              <TableHead className="text-muted-foreground text-center">单部集数</TableHead>
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
                onClick={() => onOpenWorkspace(project.id)}
              >
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {project.id}
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">{project.title}</p>
                </TableCell>
                <TableCell className="text-center text-foreground">
                  {project.episodes}
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

      <CreateProjectDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onProjectCreated={handleProjectCreated}
      />

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
            <Button onClick={handleSaveRemark}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除项目 "{selectedProject?.title}" 吗？此操作无法撤销。
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
    </div>
  )
}
