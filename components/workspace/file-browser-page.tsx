"use client"

import { useState, useMemo, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft, FolderOpen, List, LayoutGrid, Download, Trash2,
  FileVideo, FileText, FileSpreadsheet, ChevronRight, ChevronDown, Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface FileBrowserPageProps {
  projectTitle: string
  totalEpisodes: number
  languages: Array<{ id: string; label: string; isSource?: boolean }>
  onBack: () => void
  type?: "drama" | "novel"
  projectImage?: string
}

interface FileItem {
  id: string; name: string; size: string; format: string
  lastOperator: string; operationType: string; lastModified: string
  category: string; subCategory?: string; language?: string; episode?: number; thumbnail?: string
}

function generateMockFiles(totalEpisodes: number, languages: FileBrowserPageProps["languages"], projectImage?: string): FileItem[] {
  const files: FileItem[] = []
  const ops = ["张三", "李四", "王五", "赵六", "孙七", "陈八", "周九", "吴十"]
  const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)]
  const thumb = projectImage || "/drama-posters/badao-zongcai.png"
  const tgtOps = ["AI翻译", "人工翻译", "上传", "审校修改", "质检修改"]
  const src = languages.find(l => l.isSource)
  const tgt = languages.filter(l => !l.isSource)
  let id = 0
  for (let ep = 1; ep <= Math.min(totalEpisodes, 10); ep++) {
    const d = String(10 + (ep % 20)).padStart(2, "0")
    files.push({ id: `f${id++}`, name: `EP${String(ep).padStart(2,"0")}_源视频.mp4`, size: `${(180+Math.random()*120).toFixed(0)}MB`, format: "MP4", lastOperator: pick(ops), operationType: "上传", lastModified: `2026-03-${d} 14:30`, category: "视频", subCategory: "源视频", language: src?.label, episode: ep, thumbnail: thumb })
    files.push({ id: `f${id++}`, name: `EP${String(ep).padStart(2,"0")}_擦除视频.mp4`, size: `${(170+Math.random()*100).toFixed(0)}MB`, format: "MP4", lastOperator: pick(ops), operationType: pick(["AI擦除","上传"]), lastModified: `2026-03-${d} 09:15`, category: "视频", subCategory: "擦除视频", language: src?.label, episode: ep, thumbnail: thumb })
    for (const lang of tgt) {
      files.push({ id: `f${id++}`, name: `EP${String(ep).padStart(2,"0")}_${lang.label}_画面字压制.mp4`, size: `${(190+Math.random()*110).toFixed(0)}MB`, format: "MP4", lastOperator: pick(ops), operationType: "上传", lastModified: `2026-03-${d} 16:00`, category: "视频", subCategory: "画面字压制视频", language: lang.label, episode: ep, thumbnail: thumb })
      files.push({ id: `f${id++}`, name: `EP${String(ep).padStart(2,"0")}_${lang.label}_成片.mp4`, size: `${(200+Math.random()*130).toFixed(0)}MB`, format: "MP4", lastOperator: pick(ops), operationType: pick(["上传","压制"]), lastModified: `2026-03-${d} 10:30`, category: "视频", subCategory: "成片视频", language: lang.label, episode: ep, thumbnail: thumb })
    }
    for (const lang of languages) {
      files.push({ id: `f${id++}`, name: `EP${String(ep).padStart(2,"0")}_${lang.label}_字幕.srt`, size: `${(5+Math.random()*15).toFixed(0)}KB`, format: "SRT", lastOperator: pick(ops), operationType: lang.isSource ? "上传" : pick(tgtOps), lastModified: `2026-03-${d} 11:20`, category: "字幕", language: lang.label, episode: ep })
    }
    for (const lang of languages) {
      files.push({ id: `f${id++}`, name: `EP${String(ep).padStart(2,"0")}_${lang.label}_画面字.xlsx`, size: `${(20+Math.random()*30).toFixed(0)}KB`, format: "XLSX", lastOperator: pick(ops), operationType: lang.isSource ? "上传" : pick(tgtOps), lastModified: `2026-03-${d} 15:45`, category: "画面字", language: lang.label, episode: ep })
    }
  }
  for (const lang of languages) {
    files.push({ id: `f${id++}`, name: `术语表_${lang.label}.xlsx`, size: `${(30+Math.random()*40).toFixed(0)}KB`, format: "XLSX", lastOperator: pick(ops), operationType: lang.isSource ? "上传" : pick(tgtOps), lastModified: "2026-03-10 08:00", category: "术语", language: lang.label })
  }
  return files
}

function generateNovelMockFiles(total: number, languages: FileBrowserPageProps["languages"]): FileItem[] {
  const files: FileItem[] = []
  const ops = ["张三", "李四", "王五", "赵六", "孙七", "陈八"]
  const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)]
  const tgtOps = ["AI翻译", "人工翻译", "上传", "审校修改", "质检修改"]
  let id = 0
  for (const lang of languages) {
    files.push({ id: `f${id++}`, name: `正文_${lang.label}.txt`, size: `${(80+Math.random()*120).toFixed(0)}KB`, format: "TXT", lastOperator: pick(ops), operationType: lang.isSource ? "上传" : pick(tgtOps), lastModified: "2026-03-15 10:30", category: "正文", language: lang.label })
  }
  for (const lang of languages) {
    files.push({ id: `f${id++}`, name: `术语表_${lang.label}.xlsx`, size: `${(25+Math.random()*35).toFixed(0)}KB`, format: "XLSX", lastOperator: pick(ops), operationType: lang.isSource ? "上传" : pick(tgtOps), lastModified: "2026-03-10 08:00", category: "术语", language: lang.label })
  }
  return files
}

const dramaCats = ["视频", "字幕", "画面字", "术语"]
const novelCats = ["正文", "术语"]
const videoSubs = ["源视频", "擦除视频", "画面字压制视频", "成片视频"]
const getIcon = (f: string) => f === "MP4" ? FileVideo : f === "SRT" ? FileText : FileSpreadsheet
const getColor = (f: string) => f === "MP4" ? "text-blue-500" : f === "SRT" ? "text-orange-500" : "text-green-500"

export function FileBrowserPage({ projectTitle, totalEpisodes, languages, onBack, type = "drama", projectImage }: FileBrowserPageProps) {
  const [viewMode, setViewMode] = useState<"list" | "icon">("list")
  const [languageFilter, setLanguageFilter] = useState<string>("all")
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selStart, setSelStart] = useState({ x: 0, y: 0 })
  const [selEnd, setSelEnd] = useState({ x: 0, y: 0 })

  const cats = type === "drama" ? dramaCats : novelCats
  const allFiles = useMemo(() => type === "drama" ? generateMockFiles(totalEpisodes, languages, projectImage) : generateNovelMockFiles(totalEpisodes, languages), [totalEpisodes, languages, type, projectImage])
  const filtered = useMemo(() => languageFilter === "all" ? allFiles : allFiles.filter(f => !f.language || f.language === languageFilter), [allFiles, languageFilter])

  const grouped = useMemo(() => {
    const g: Record<string, Record<string, FileItem[]>> = {}
    for (const c of cats) { g[c] = {}; if (c === "视频") { for (const s of videoSubs) g[c][s] = [] } else { g[c]["_all"] = [] } }
    for (const f of filtered) { const c = f.category; if (!g[c]) continue; if (c === "视频" && f.subCategory && g[c][f.subCategory]) g[c][f.subCategory].push(f); else if (g[c]["_all"]) g[c]["_all"].push(f) }
    return g
  }, [filtered, cats])

  const toggle = (k: string) => setCollapsedSections(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n })
  const toggleFile = (id: string) => setSelectedFiles(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })
  const selectAll = () => { if (selectedFiles.size === filtered.length) setSelectedFiles(new Set()); else setSelectedFiles(new Set(filtered.map(f => f.id))) }

  const onDown = useCallback((e: React.MouseEvent) => {
    if (viewMode !== "icon" || e.button !== 0) return
    const t = e.target as HTMLElement; if (t.closest("button") || t.closest("[data-file-icon]")) return
    setIsSelecting(true); const r = containerRef.current?.getBoundingClientRect(); const s = containerRef.current?.scrollTop || 0
    const p = { x: e.clientX - (r?.left || 0), y: e.clientY - (r?.top || 0) + s }; setSelStart(p); setSelEnd(p)
    if (!e.ctrlKey && !e.metaKey) setSelectedFiles(new Set())
  }, [viewMode])
  const onMove = useCallback((e: React.MouseEvent) => { if (!isSelecting) return; const r = containerRef.current?.getBoundingClientRect(); const s = containerRef.current?.scrollTop || 0; setSelEnd({ x: e.clientX - (r?.left || 0), y: e.clientY - (r?.top || 0) + s }) }, [isSelecting])
  const onUp = useCallback(() => {
    if (!isSelecting || !containerRef.current) { setIsSelecting(false); return }
    setIsSelecting(false)
    const rect = { left: Math.min(selStart.x, selEnd.x), top: Math.min(selStart.y, selEnd.y), right: Math.max(selStart.x, selEnd.x), bottom: Math.max(selStart.y, selEnd.y) }
    const els = containerRef.current.querySelectorAll("[data-file-icon]"); const cr = containerRef.current.getBoundingClientRect(); const st = containerRef.current.scrollTop
    const ns = new Set(selectedFiles)
    els.forEach(el => { const er = el.getBoundingClientRect(); const ep = { left: er.left-cr.left, top: er.top-cr.top+st, right: er.right-cr.left, bottom: er.bottom-cr.top+st }; if (ep.left<rect.right && ep.right>rect.left && ep.top<rect.bottom && ep.bottom>rect.top) { const fid = el.getAttribute("data-file-id"); if (fid) ns.add(fid) } })
    setSelectedFiles(ns)
  }, [isSelecting, selStart, selEnd, selectedFiles])

  const renderFiles = (files: FileItem[]) => {
    const allSel = files.length > 0 && files.every(f => selectedFiles.has(f.id))
    const toggleSec = () => setSelectedFiles(p => { const n = new Set(p); if (allSel) files.forEach(f => n.delete(f.id)); else files.forEach(f => n.add(f.id)); return n })
    if (viewMode === "list") {
      return (<div className="ml-2 mt-1">
        <div className="grid grid-cols-[28px_1fr_80px_60px_90px_70px_140px] gap-2 px-3 py-1.5 text-[10px] text-muted-foreground/70 uppercase tracking-wider border-b border-border/30 items-center">
          <Checkbox checked={allSel} onCheckedChange={toggleSec} className="w-3.5 h-3.5" />
          <span>名称</span><span>大小</span><span>格式</span><span>操作人</span><span>操作</span><span>时间</span>
        </div>
        {files.map(file => { const Icon = getIcon(file.format); const sel = selectedFiles.has(file.id); return (
          <div key={file.id} className={cn("grid grid-cols-[28px_1fr_80px_60px_90px_70px_140px] gap-2 px-3 py-2 text-xs items-center hover:bg-muted/50 rounded cursor-pointer transition-colors", sel && "bg-primary/10 ring-1 ring-primary/20")} onClick={() => setPreviewFile(file)}>
            <Checkbox checked={sel} onCheckedChange={() => toggleFile(file.id)} onClick={e => e.stopPropagation()} className="w-3.5 h-3.5" />
            <div className="flex items-center gap-2 min-w-0"><Icon className={cn("w-4 h-4 shrink-0", getColor(file.format))} /><span className="truncate">{file.name}</span></div>
            <span className="text-muted-foreground">{file.size}</span><span className="text-muted-foreground">{file.format}</span>
            <span className="text-muted-foreground truncate">{file.lastOperator}</span><span className="text-muted-foreground">{file.operationType}</span><span className="text-muted-foreground">{file.lastModified}</span>
          </div>
        )})}
      </div>)
    }
    return (<div className="ml-2 mt-2 flex flex-wrap gap-3">
      {files.map(file => { const Icon = getIcon(file.format); const sel = selectedFiles.has(file.id); const hasThumb = file.format === "MP4" && file.thumbnail; return (
        <div key={file.id} data-file-icon data-file-id={file.id} className={cn("flex flex-col items-center gap-1.5 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 relative group", hasThumb ? "w-[120px]" : "w-[100px]", sel && "bg-primary/10 ring-1 ring-primary/30")} onClick={() => setPreviewFile(file)}>
          <div className={cn("absolute top-1 left-1 z-10 transition-opacity", sel ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
            <Checkbox checked={sel} onCheckedChange={() => toggleFile(file.id)} onClick={e => e.stopPropagation()} className="w-3.5 h-3.5 bg-background/80" />
          </div>
          {hasThumb ? (<div className="w-full aspect-video rounded overflow-hidden bg-black relative"><img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" loading="lazy" /><div className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[8px] px-1 rounded">MP4</div></div>) : (<Icon className={cn("w-10 h-10", getColor(file.format))} />)}
          <span className="text-[10px] text-center leading-tight line-clamp-2 w-full">{file.name}</span>
        </div>
      )})}
    </div>)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="shrink-0 border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <FolderOpen className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">{projectTitle} - 文件管理</span>
        <div className="flex-1" />
        {selectedFiles.size > 0 && (<div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">已选 {selectedFiles.size} 个</span>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1"><Download className="w-3.5 h-3.5" />下载</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1 text-destructive hover:text-destructive/80"><Trash2 className="w-3.5 h-3.5" />删除</Button>
        </div>)}
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={selectAll}>
          <Checkbox checked={filtered.length > 0 && selectedFiles.size === filtered.length} className="w-3.5 h-3.5 pointer-events-none" />
          {selectedFiles.size === filtered.length && filtered.length > 0 ? "取消全选" : "全选"}
        </Button>
        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="全部语种" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部语种</SelectItem>
            {languages.map(l => <SelectItem key={l.id} value={l.label}>{l.label}{l.isSource ? "（源）" : ""}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center border border-border rounded-md">
          <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="w-8 h-8 rounded-r-none" onClick={() => setViewMode("list")}><List className="w-4 h-4" /></Button>
          <Button variant={viewMode === "icon" ? "default" : "ghost"} size="icon" className="w-8 h-8 rounded-l-none" onClick={() => setViewMode("icon")}><LayoutGrid className="w-4 h-4" /></Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div ref={containerRef} className="p-4 space-y-4 relative select-none" onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp}>
          {isSelecting && viewMode === "icon" && (<div className="absolute border border-primary/50 bg-primary/10 pointer-events-none z-10" style={{ left: Math.min(selStart.x,selEnd.x), top: Math.min(selStart.y,selEnd.y), width: Math.abs(selEnd.x-selStart.x), height: Math.abs(selEnd.y-selStart.y) }} />)}
          {cats.map(cat => {
            const grp = grouped[cat]; if (!grp) return null
            const catFiles = Object.values(grp).flat(); if (catFiles.length === 0) return null
            const ck = `cat-${cat}`; const collapsed = collapsedSections.has(ck)
            const allSel = catFiles.every(f => selectedFiles.has(f.id))
            const toggleCat = (e: React.MouseEvent) => { e.stopPropagation(); setSelectedFiles(p => { const n = new Set(p); if (allSel) catFiles.forEach(f => n.delete(f.id)); else catFiles.forEach(f => n.add(f.id)); return n }) }
            return (<div key={cat}>
              <div className="flex items-center gap-2 w-full py-2 px-1 hover:bg-muted/50 rounded-md transition-colors">
                <Checkbox checked={allSel} onClick={toggleCat} className="w-4 h-4 shrink-0" />
                <button className="flex items-center gap-2 flex-1 text-left" onClick={() => toggle(ck)}>
                  {collapsed ? <ChevronRight className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-sm font-semibold">{cat}</span><span className="text-xs text-muted-foreground">({catFiles.length})</span>
                </button>
              </div>
              {!collapsed && (<div className="ml-2">
                {cat === "视频" ? videoSubs.map(sub => {
                  const sf = grp[sub] || []; if (sf.length === 0) return null
                  const sk = `sub-${cat}-${sub}`; const sc = collapsedSections.has(sk)
                  const sa = sf.every(f => selectedFiles.has(f.id))
                  const ts = (e: React.MouseEvent) => { e.stopPropagation(); setSelectedFiles(p => { const n = new Set(p); if (sa) sf.forEach(f => n.delete(f.id)); else sf.forEach(f => n.add(f.id)); return n }) }
                  return (<div key={sub} className="ml-2 mb-2">
                    <div className="flex items-center gap-2 w-full py-1.5 px-1 hover:bg-muted/30 rounded transition-colors">
                      <Checkbox checked={sa} onClick={ts} className="w-3.5 h-3.5 shrink-0" />
                      <button className="flex items-center gap-2 flex-1 text-left" onClick={() => toggle(sk)}>
                        {sc ? <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                        <span className="text-xs font-medium text-muted-foreground">{sub}</span><span className="text-[10px] text-muted-foreground/70">({sf.length})</span>
                      </button>
                    </div>
                    {!sc && renderFiles(sf)}
                  </div>)
                }) : renderFiles(grp["_all"] || [])}
              </div>)}
            </div>)
          })}
        </div>
      </ScrollArea>

      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-sm"><Eye className="w-4 h-4" />文件预览</DialogTitle></DialogHeader>
          {previewFile && (<div className="space-y-3 py-2">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              {(() => { const I = getIcon(previewFile.format); return <I className={cn("w-10 h-10", getColor(previewFile.format))} /> })()}
              <div><p className="text-sm font-medium">{previewFile.name}</p><p className="text-xs text-muted-foreground">{previewFile.format} · {previewFile.size}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-muted/30 rounded"><span className="text-muted-foreground">操作人：</span>{previewFile.lastOperator}</div>
              <div className="p-2 bg-muted/30 rounded"><span className="text-muted-foreground">操作类型：</span>{previewFile.operationType}</div>
              <div className="p-2 bg-muted/30 rounded"><span className="text-muted-foreground">修改时间：</span>{previewFile.lastModified}</div>
              {previewFile.language && <div className="p-2 bg-muted/30 rounded"><span className="text-muted-foreground">语言：</span>{previewFile.language}</div>}
              {previewFile.episode && <div className="p-2 bg-muted/30 rounded"><span className="text-muted-foreground">集数：</span>第{previewFile.episode}集</div>}
            </div>
            {previewFile.format === "MP4" && (<div className="aspect-video bg-black rounded-lg flex items-center justify-center"><FileVideo className="w-12 h-12 text-white/30" /><span className="text-white/50 text-sm ml-2">视频预览区域</span></div>)}
          </div>)}
        </DialogContent>
      </Dialog>
    </div>
  )
}
