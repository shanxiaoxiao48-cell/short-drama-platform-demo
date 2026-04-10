"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search, Trash2, RotateCcw, MoreHorizontal, AlertTriangle, Clock,
  Film, BookOpen, FileText, Filter, X, ArrowUpDown, ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePermission } from "@/contexts/permission-context"

type FileCategory = "短剧物料" | "小说物料" | "其他"
type TimeFilter = "all" | "today" | "week" | "month" | "custom"

interface RecycledFile {
  id: string
  name: string
  deletedBy: string
  deletedByUserId: string
  deletedAt: string
  fileSize: string
  fileSizeBytes: number
  category: FileCategory
  originalPath: string
  expiresAt: string // 30天后自动删除
}

const mockFiles: RecycledFile[] = [
  { id: "F001", name: "霸道总裁爱上我_EP01_raw.mp4", deletedBy: "李物料", deletedByUserId: "mh001", deletedAt: "2026-03-22 14:30", fileSize: "1.2 GB", fileSizeBytes: 1288490188, category: "短剧物料", originalPath: "/短剧/霸道总裁爱上我/原始素材/", expiresAt: "2026-04-21 14:30" },
  { id: "F002", name: "霸道总裁爱上我_EP02_raw.mp4", deletedBy: "李物料", deletedByUserId: "mh001", deletedAt: "2026-03-22 14:31", fileSize: "1.1 GB", fileSizeBytes: 1181116006, category: "短剧物料", originalPath: "/短剧/霸道总裁爱上我/原始素材/", expiresAt: "2026-04-21 14:31" },
  { id: "F003", name: "都市修仙传_第1-10章_初稿.docx", deletedBy: "张经理", deletedByUserId: "pm001", deletedAt: "2026-03-21 10:15", fileSize: "2.4 MB", fileSizeBytes: 2516582, category: "小说物料", originalPath: "/小说/都市修仙传/初稿/", expiresAt: "2026-04-20 10:15" },
  { id: "F004", name: "重生之都市逆袭_字幕_EN.srt", deletedBy: "王译员", deletedByUserId: "tr001", deletedAt: "2026-03-20 16:45", fileSize: "156 KB", fileSizeBytes: 159744, category: "短剧物料", originalPath: "/短剧/重生之都市逆袭/字幕/", expiresAt: "2026-04-19 16:45" },
  { id: "F005", name: "甜蜜暴击_EP05_擦除版.mp4", deletedBy: "刘压制", deletedByUserId: "ve001", deletedAt: "2026-03-19 09:20", fileSize: "890 MB", fileSizeBytes: 933232640, category: "短剧物料", originalPath: "/短剧/甜蜜暴击/擦除版/", expiresAt: "2026-04-18 09:20" },
  { id: "F006", name: "星际争霸之路_术语表_v2.xlsx", deletedBy: "张经理", deletedByUserId: "pm001", deletedAt: "2026-03-18 11:00", fileSize: "48 KB", fileSizeBytes: 49152, category: "小说物料", originalPath: "/小说/星际争霸之路/术语/", expiresAt: "2026-04-17 11:00" },
  { id: "F007", name: "项目排期表_2026Q1.xlsx", deletedBy: "管理员", deletedByUserId: "admin", deletedAt: "2026-03-17 15:30", fileSize: "320 KB", fileSizeBytes: 327680, category: "其他", originalPath: "/文档/", expiresAt: "2026-04-16 15:30" },
  { id: "F008", name: "霸道总裁爱上我_EP03_字幕_ES.srt", deletedBy: "赵质检", deletedByUserId: "qc001", deletedAt: "2026-03-16 13:10", fileSize: "142 KB", fileSizeBytes: 145408, category: "短剧物料", originalPath: "/短剧/霸道总裁爱上我/字幕/", expiresAt: "2026-04-15 13:10" },
  { id: "F009", name: "都市修仙传_第11-20章_翻译稿.docx", deletedBy: "王译员", deletedByUserId: "tr001", deletedAt: "2026-03-15 17:00", fileSize: "3.1 MB", fileSizeBytes: 3250585, category: "小说物料", originalPath: "/小说/都市修仙传/翻译稿/", expiresAt: "2026-04-14 17:00" },
  { id: "F010", name: "甜蜜暴击_海报_v1.psd", deletedBy: "李物料", deletedByUserId: "mh001", deletedAt: "2026-03-14 10:00", fileSize: "45 MB", fileSizeBytes: 47185920, category: "其他", originalPath: "/短剧/甜蜜暴击/宣传/", expiresAt: "2026-04-13 10:00" },
]

const categoryIcons: Record<FileCategory, any> = {
  "短剧物料": Film,
  "小说物料": BookOpen,
  "其他": FileText,
}

export function RecycleBinPage() {
  const { user } = usePermission()
  const isAdmin = user.role === "admin" || user.role === "project_manager"

  const [files, setFiles] = useState<RecycledFile[]>(mockFiles)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterTime, setFilterTime] = useState<TimeFilter>("all")
  const [filterDeletedBy, setFilterDeletedBy] = useState<string>("all")
  const [sortField, setSortField] = useState<"deletedAt" | "fileSize">("deletedAt")
  const [sortAsc, setSortAsc] = useState(false)

  // 对话框
  const [showClearAllDialog, setShowClearAllDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<RecycledFile | null>(null)

  const allDeletedBy = [...new Set(files.map(f => f.deletedBy))]

  // 筛选
  const filteredFiles = files
    .filter(f => {
      if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (filterCategory !== "all" && f.category !== filterCategory) return false
      if (filterDeletedBy !== "all" && f.deletedBy !== filterDeletedBy) return false
      if (filterTime !== "all") {
        const now = new Date("2026-03-22T18:00:00")
        const deleted = new Date(f.deletedAt)
        const diffDays = (now.getTime() - deleted.getTime()) / (1000 * 60 * 60 * 24)
        if (filterTime === "today" && diffDays > 1) return false
        if (filterTime === "week" && diffDays > 7) return false
        if (filterTime === "month" && diffDays > 30) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortField === "deletedAt") {
        return sortAsc ? a.deletedAt.localeCompare(b.deletedAt) : b.deletedAt.localeCompare(a.deletedAt)
      }
      return sortAsc ? a.fileSizeBytes - b.fileSizeBytes : b.fileSizeBytes - a.fileSizeBytes
    })

  // 还原
  const handleRestore = (file: RecycledFile) => {
    setSelectedFile(file)
    setShowRestoreDialog(true)
  }
  const confirmRestore = () => {
    if (selectedFile) {
      setFiles(prev => prev.filter(f => f.id !== selectedFile.id))
    }
    setShowRestoreDialog(false)
    setSelectedFile(null)
  }

  // 彻底删除
  const handlePermanentDelete = (file: RecycledFile) => {
    // 权限检查：管理员可删所有，普通用户只能删自己的
    if (!isAdmin && file.deletedByUserId !== user.id) return
    setSelectedFile(file)
    setShowDeleteDialog(true)
  }
  const confirmDelete = () => {
    if (selectedFile) {
      setFiles(prev => prev.filter(f => f.id !== selectedFile.id))
    }
    setShowDeleteDialog(false)
    setSelectedFile(null)
  }

  // 一键清空
  const handleClearAll = () => {
    setShowClearAllDialog(true)
  }
  const confirmClearAll = () => {
    setFiles([])
    setShowClearAllDialog(false)
  }

  const toggleSort = (field: "deletedAt" | "fileSize") => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  // 计算剩余天数
  const getDaysLeft = (expiresAt: string) => {
    const now = new Date("2026-03-22T18:00:00")
    const exp = new Date(expiresAt)
    return Math.max(0, Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }

  const totalSize = filteredFiles.reduce((sum, f) => sum + f.fileSizeBytes, 0)
  const formatSize = (bytes: number) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + " GB"
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB"
    return (bytes / 1024).toFixed(0) + " KB"
  }

  return (
    <div className="flex flex-col h-full">
      {/* 顶部 */}
      <div className="shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-muted-foreground" />回收站
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              已删除的文件将保留30天，到期后自动永久删除
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{filteredFiles.length} 个文件 · {formatSize(totalSize)}</span>
            {isAdmin && files.length > 0 && (
              <Button variant="destructive" size="sm" className="gap-1" onClick={handleClearAll}>
                <Trash2 className="w-4 h-4" />一键清空
              </Button>
            )}
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="搜索文件名称..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="文件类型" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="短剧物料">短剧物料</SelectItem>
              <SelectItem value="小说物料">小说物料</SelectItem>
              <SelectItem value="其他">其他</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterTime} onValueChange={(v) => setFilterTime(v as TimeFilter)}>
            <SelectTrigger className="w-[120px] h-9"><SelectValue placeholder="时间范围" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部时间</SelectItem>
              <SelectItem value="today">今日</SelectItem>
              <SelectItem value="week">近7天</SelectItem>
              <SelectItem value="month">近30天</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterDeletedBy} onValueChange={setFilterDeletedBy}>
            <SelectTrigger className="w-[120px] h-9"><SelectValue placeholder="删除者" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部人员</SelectItem>
              {allDeletedBy.map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 文件列表 */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {files.length === 0 ? (
            <div className="py-24 text-center">
              <Trash2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">回收站为空，已删除的文件将在这里显示</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              {/* 表头 */}
              <div className="grid grid-cols-[1fr_100px_140px_100px_100px_80px_80px] gap-2 px-4 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground border-b border-border">
                <span>文件名称</span>
                <span>所属类型</span>
                <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => toggleSort("deletedAt")}>
                  删除时间 <ArrowUpDown className="w-3 h-3" />
                </button>
                <span>删除者</span>
                <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => toggleSort("fileSize")}>
                  文件大小 <ArrowUpDown className="w-3 h-3" />
                </button>
                <span>剩余天数</span>
                <span className="text-right">操作</span>
              </div>
              {filteredFiles.map(file => {
                const CatIcon = categoryIcons[file.category]
                const daysLeft = getDaysLeft(file.expiresAt)
                const canDelete = isAdmin || file.deletedByUserId === user.id
                return (
                  <div key={file.id} className="grid grid-cols-[1fr_100px_140px_100px_100px_80px_80px] gap-2 px-4 py-3 border-b border-border/50 items-center hover:bg-muted/20 transition-colors text-sm">
                    <span className="truncate font-medium" title={file.name}>{file.name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CatIcon className="w-3.5 h-3.5" />{file.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{file.deletedAt}</span>
                    <span className="text-xs">{file.deletedBy}</span>
                    <span className="text-xs text-muted-foreground">{file.fileSize}</span>
                    <span className={cn("text-xs", daysLeft <= 3 ? "text-red-500 font-medium" : daysLeft <= 7 ? "text-amber-500" : "text-muted-foreground")}>
                      {daysLeft}天
                    </span>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-7 h-7">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRestore(file)}>
                            <RotateCcw className="w-4 h-4 mr-2" />还原
                          </DropdownMenuItem>
                          {canDelete && (
                            <DropdownMenuItem className="text-destructive" onClick={() => handlePermanentDelete(file)}>
                              <Trash2 className="w-4 h-4 mr-2" />彻底删除
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 还原确认 */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>还原文件</DialogTitle>
            <DialogDescription>文件将恢复至原存储位置</DialogDescription>
          </DialogHeader>
          {selectedFile && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1.5">
              <div className="font-medium">{selectedFile.name}</div>
              <div className="text-xs text-muted-foreground">原路径：{selectedFile.originalPath}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>取消</Button>
            <Button onClick={confirmRestore}><RotateCcw className="w-4 h-4 mr-1" />确认还原</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 彻底删除确认 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />彻底删除
            </DialogTitle>
            <DialogDescription>此操作不可恢复，文件将被永久删除</DialogDescription>
          </DialogHeader>
          {selectedFile && (
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-sm">
              <div className="font-medium">{selectedFile.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{selectedFile.fileSize}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>取消</Button>
            <Button variant="destructive" onClick={confirmDelete}>永久删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 一键清空确认 */}
      <Dialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />清空回收站
            </DialogTitle>
            <DialogDescription>确认要清空回收站吗？此操作不可恢复，所有文件将被永久删除。</DialogDescription>
          </DialogHeader>
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-sm">
            <div className="font-medium">将永久删除 {files.length} 个文件</div>
            <div className="text-xs text-muted-foreground mt-1">总大小：{formatSize(files.reduce((s, f) => s + f.fileSizeBytes, 0))}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearAllDialog(false)}>取消</Button>
            <Button variant="destructive" onClick={confirmClearAll}>确认清空</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
