"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, SkipBack, SkipForward, Square, Move } from "lucide-react"

// Completed workflow choice dialog
interface CompletedWorkflowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflowName: string
  onViewDetails: () => void
  onRecreate: () => void
}

export function CompletedWorkflowDialog({
  open,
  onOpenChange,
  workflowName,
  onViewDetails,
  onRecreate,
}: CompletedWorkflowDialogProps) {
  // AI提取流程显示不同的按钮
  const isAIExtract = workflowName === "AI提取"
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{workflowName}已完成</DialogTitle>
          <DialogDescription>
            请选择您要执行的操作
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          {isAIExtract ? (
            <>
              <Button variant="outline" onClick={onViewDetails} className="bg-transparent justify-start">
                查看
              </Button>
              <Button variant="outline" onClick={onRecreate} className="bg-transparent justify-start">
                重新提取
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onViewDetails} className="bg-transparent justify-start">
                查看已完成的任务详情
              </Button>
              <Button variant="outline" onClick={onRecreate} className="bg-transparent justify-start">
                重新创建任务
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Overwrite confirmation dialog
interface OverwriteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (overwrite: boolean) => void
}

export function OverwriteDialog({ open, onOpenChange, onConfirm }: OverwriteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>重新提取确认</DialogTitle>
          <DialogDescription>
            提取会覆盖已有结果，确认重新提取吗？
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => {
            onOpenChange(false)
          }}>
            取消
          </Button>
          <Button onClick={() => onConfirm(true)}>
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// AI Extract dialog - Step 1: Select options
interface AIExtractOptionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNext: (options: { extractTypes: string[]; sourceLanguage: string }) => void
}

const extractTypes = [
  { id: "screen_text", label: "画面字" },
  { id: "subtitle", label: "字幕" },
  { id: "synopsis", label: "简介" },
  { id: "glossary", label: "术语" },
]

const sourceLanguages = [
  "中文", "English", "日本語", "한국어", "Español", "Português", "Français", "Deutsch",
]

export function AIExtractOptionsDialog({ open, onOpenChange, onNext }: AIExtractOptionsDialogProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["subtitle"])
  const [sourceLanguage, setSourceLanguage] = useState("中文")

  const toggleType = (id: string) => {
    if (selectedTypes.includes(id)) {
      setSelectedTypes(selectedTypes.filter(t => t !== id))
    } else {
      setSelectedTypes([...selectedTypes, id])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>AI提取设置</DialogTitle>
          <DialogDescription>
            选择需要提取的内容和原始语言
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>提取内容（可多选）</Label>
            <div className="grid grid-cols-2 gap-3">
              {extractTypes.map(type => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={selectedTypes.includes(type.id)}
                    onCheckedChange={() => toggleType(type.id)}
                  />
                  <label htmlFor={type.id} className="text-sm cursor-pointer">{type.label}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>原语言</Label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sourceLanguages.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">取消</Button>
          <Button onClick={() => onNext({ extractTypes: selectedTypes, sourceLanguage })} disabled={selectedTypes.length === 0}>
            下一步
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// AI Extract dialog - Step 2: Subtitle region selection (框选字幕区域)
interface AIExtractSubtitleRegionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  region: { x: number; y: number; width: number; height: number }
  onRegionChange: (region: { x: number; y: number; width: number; height: number }) => void
  onNext: () => void
  onBack?: () => void // 改为可选
}

export function AIExtractSubtitleRegionDialog({ open, onOpenChange, region, onRegionChange, onNext, onBack }: AIExtractSubtitleRegionDialogProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<string | null>(null) // 'se', 'sw', 'ne', 'nw' for corners
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const videoRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'resize', corner?: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (type === 'move') {
      setIsDragging(true)
    } else if (type === 'resize' && corner) {
      setIsResizing(corner)
    }
    
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!videoRef.current) return
      
      const rect = videoRef.current.getBoundingClientRect()
      const scaleX = 640 / rect.width
      const scaleY = 1138 / rect.height // 9:16 aspect ratio
      
      const deltaX = (e.clientX - dragStart.x) * scaleX
      const deltaY = (e.clientY - dragStart.y) * scaleY
      
      if (isDragging) {
        const newX = Math.max(0, Math.min(640 - region.width, region.x + deltaX))
        const newY = Math.max(0, Math.min(1138 - region.height, region.y + deltaY))
        onRegionChange({ ...region, x: newX, y: newY })
        setDragStart({ x: e.clientX, y: e.clientY })
      } else if (isResizing) {
        let newRegion = { ...region }
        
        switch (isResizing) {
          case 'se': // 右下角
            newRegion.width = Math.max(50, Math.min(640 - region.x, region.width + deltaX))
            newRegion.height = Math.max(30, Math.min(1138 - region.y, region.height + deltaY))
            break
          case 'sw': // 左下角
            const newWidth = Math.max(50, region.width - deltaX)
            const newX = region.x + (region.width - newWidth)
            newRegion.x = Math.max(0, newX)
            newRegion.width = newWidth
            newRegion.height = Math.max(30, Math.min(1138 - region.y, region.height + deltaY))
            break
          case 'ne': // 右上角
            const newHeight = Math.max(30, region.height - deltaY)
            const newY = region.y + (region.height - newHeight)
            newRegion.y = Math.max(0, newY)
            newRegion.height = newHeight
            newRegion.width = Math.max(50, Math.min(640 - region.x, region.width + deltaX))
            break
          case 'nw': // 左上角
            const nwNewWidth = Math.max(50, region.width - deltaX)
            const nwNewX = region.x + (region.width - nwNewWidth)
            const nwNewHeight = Math.max(30, region.height - deltaY)
            const nwNewY = region.y + (region.height - nwNewHeight)
            newRegion.x = Math.max(0, nwNewX)
            newRegion.y = Math.max(0, nwNewY)
            newRegion.width = nwNewWidth
            newRegion.height = nwNewHeight
            break
        }
        
        onRegionChange(newRegion)
        setDragStart({ x: e.clientX, y: e.clientY })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(null)
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, dragStart, region, onRegionChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>框选字幕区域</DialogTitle>
          <DialogDescription>
            在视频上拖动框选字幕所在位置
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Video preview with selection box */}
          <div 
            ref={videoRef}
            className="relative bg-black rounded-lg overflow-hidden select-none" 
            style={{ aspectRatio: "9/16", maxHeight: "500px", margin: "0 auto", width: "280px" }}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-muted-foreground text-sm">视频预览区域</span>
            </div>
            {/* Selection box */}
            <div
              className="absolute border-2 border-primary bg-primary/20 cursor-move group"
              style={{
                left: `${(region.x / 640) * 100}%`,
                top: `${(region.y / 1138) * 100}%`,
                width: `${(region.width / 640) * 100}%`,
                height: `${(region.height / 1138) * 100}%`,
              }}
              onMouseDown={(e) => handleMouseDown(e, 'move')}
            >
              {/* 位置信息 */}
              <div className="absolute -top-6 left-0 text-xs text-primary bg-background px-1 rounded whitespace-nowrap pointer-events-none">
                X:{Math.round(region.x)} Y:{Math.round(region.y)}
              </div>
              <div className="absolute -bottom-6 right-0 text-xs text-primary bg-background px-1 rounded whitespace-nowrap pointer-events-none">
                W:{Math.round(region.width)} H:{Math.round(region.height)}
              </div>
              
              {/* 中心移动图标 */}
              <Move className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
              
              {/* 四个角的调整手柄 */}
              <div 
                className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onMouseDown={(e) => handleMouseDown(e, 'resize', 'nw')}
              />
              <div 
                className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onMouseDown={(e) => handleMouseDown(e, 'resize', 'ne')}
              />
              <div 
                className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onMouseDown={(e) => handleMouseDown(e, 'resize', 'sw')}
              />
              <div 
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onMouseDown={(e) => handleMouseDown(e, 'resize', 'se')}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={100}
              step={1}
              onValueChange={([v]) => setCurrentTime(v)}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0:00</span>
              <span>{Math.floor(currentTime * 1.2)}:{String(Math.floor((currentTime * 1.2 % 1) * 60)).padStart(2, "0")}</span>
              <span>2:00</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" className="bg-transparent">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsPlaying(!isPlaying)} className="bg-transparent">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="icon" className="bg-transparent">
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Region inputs */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={Math.round(region.x)}
                onChange={(e) => onRegionChange({ ...region, x: Number(e.target.value) })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={Math.round(region.y)}
                onChange={(e) => onRegionChange({ ...region, y: Number(e.target.value) })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">宽度</Label>
              <Input
                type="number"
                value={Math.round(region.width)}
                onChange={(e) => onRegionChange({ ...region, width: Number(e.target.value) })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">高度</Label>
              <Input
                type="number"
                value={Math.round(region.height)}
                onChange={(e) => onRegionChange({ ...region, height: Number(e.target.value) })}
                className="h-8"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          {onBack && <Button variant="outline" onClick={onBack} className="bg-transparent">上一步</Button>}
          <Button onClick={onNext}>下一步</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// AI Extract dialog - Step 3: Screen text exclusion region (框选画面字排除区域)
interface AIExtractScreenTextDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subtitleRegion: { x: number; y: number; width: number; height: number }
  onSubmit: () => void
  onBack: () => void
}

export function AIExtractScreenTextDialog({ open, onOpenChange, subtitleRegion, onSubmit, onBack }: AIExtractScreenTextDialogProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  // 初始化第一个排除区域为字幕框的位置
  const [regions, setRegions] = useState([subtitleRegion])
  const [isDragging, setIsDragging] = useState<number | null>(null)
  const [isResizing, setIsResizing] = useState<{ index: number; corner: string } | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const videoRef = useRef<HTMLDivElement>(null)

  // 当对话框打开时，重置第一个区域为字幕框位置
  useEffect(() => {
    if (open) {
      setRegions([subtitleRegion])
    }
  }, [open, subtitleRegion])

  const handleMouseDown = (e: React.MouseEvent, index: number, type: 'move' | 'resize', corner?: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (type === 'move') {
      setIsDragging(index)
    } else if (type === 'resize' && corner) {
      setIsResizing({ index, corner })
    }
    
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!videoRef.current) return
      
      const rect = videoRef.current.getBoundingClientRect()
      const scaleX = 640 / rect.width
      const scaleY = 1138 / rect.height
      
      const deltaX = (e.clientX - dragStart.x) * scaleX
      const deltaY = (e.clientY - dragStart.y) * scaleY
      
      if (isDragging !== null) {
        const region = regions[isDragging]
        const newX = Math.max(0, Math.min(640 - region.width, region.x + deltaX))
        const newY = Math.max(0, Math.min(1138 - region.height, region.y + deltaY))
        
        const newRegions = [...regions]
        newRegions[isDragging] = { ...region, x: newX, y: newY }
        setRegions(newRegions)
        setDragStart({ x: e.clientX, y: e.clientY })
      } else if (isResizing) {
        const region = regions[isResizing.index]
        let newRegion = { ...region }
        
        switch (isResizing.corner) {
          case 'se':
            newRegion.width = Math.max(50, Math.min(640 - region.x, region.width + deltaX))
            newRegion.height = Math.max(30, Math.min(1138 - region.y, region.height + deltaY))
            break
          case 'sw':
            const newWidth = Math.max(50, region.width - deltaX)
            const newX = region.x + (region.width - newWidth)
            newRegion.x = Math.max(0, newX)
            newRegion.width = newWidth
            newRegion.height = Math.max(30, Math.min(1138 - region.y, region.height + deltaY))
            break
          case 'ne':
            const newHeight = Math.max(30, region.height - deltaY)
            const newY = region.y + (region.height - newHeight)
            newRegion.y = Math.max(0, newY)
            newRegion.height = newHeight
            newRegion.width = Math.max(50, Math.min(640 - region.x, region.width + deltaX))
            break
          case 'nw':
            const nwNewWidth = Math.max(50, region.width - deltaX)
            const nwNewX = region.x + (region.width - nwNewWidth)
            const nwNewHeight = Math.max(30, region.height - deltaY)
            const nwNewY = region.y + (region.height - nwNewHeight)
            newRegion.x = Math.max(0, nwNewX)
            newRegion.y = Math.max(0, nwNewY)
            newRegion.width = nwNewWidth
            newRegion.height = nwNewHeight
            break
        }
        
        const newRegions = [...regions]
        newRegions[isResizing.index] = newRegion
        setRegions(newRegions)
        setDragStart({ x: e.clientX, y: e.clientY })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(null)
      setIsResizing(null)
    }

    if (isDragging !== null || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, dragStart, regions])

  const addRegion = () => {
    setRegions([...regions, { x: 100, y: 150, width: 200, height: 60 }])
  }

  const removeRegion = (index: number) => {
    // 至少保留一个区域
    if (regions.length > 1) {
      setRegions(regions.filter((_, i) => i !== index))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>框选画面字排除区域</DialogTitle>
          <DialogDescription>
            在视频上框选需要排除的画面字区域（可添加多个区域）
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Video preview with exclusion boxes */}
          <div 
            ref={videoRef}
            className="relative bg-black rounded-lg overflow-hidden select-none" 
            style={{ aspectRatio: "9/16", maxHeight: "500px", margin: "0 auto", width: "280px" }}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-muted-foreground text-sm">视频预览区域</span>
            </div>
            
            {/* Exclusion boxes */}
            {regions.map((region, index) => (
              <div
                key={index}
                className="absolute border-2 border-orange-500 bg-orange-500/20 cursor-move group"
                style={{
                  left: `${(region.x / 640) * 100}%`,
                  top: `${(region.y / 1138) * 100}%`,
                  width: `${(region.width / 640) * 100}%`,
                  height: `${(region.height / 1138) * 100}%`,
                }}
                onMouseDown={(e) => handleMouseDown(e, index, 'move')}
              >
                {/* 位置信息 */}
                <div className="absolute -top-6 left-0 text-xs text-orange-500 bg-background px-1 rounded whitespace-nowrap pointer-events-none">
                  排除区域 {index + 1} - X:{Math.round(region.x)} Y:{Math.round(region.y)}
                </div>
                <div className="absolute -bottom-6 right-0 text-xs text-orange-500 bg-background px-1 rounded whitespace-nowrap pointer-events-none">
                  W:{Math.round(region.width)} H:{Math.round(region.height)}
                </div>
                
                {/* 中心移动图标 */}
                <Move className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 pointer-events-none" />
                
                {/* 四个角的调整手柄 */}
                <div 
                  className="absolute -top-1 -left-1 w-3 h-3 bg-orange-500 rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onMouseDown={(e) => handleMouseDown(e, index, 'resize', 'nw')}
                />
                <div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onMouseDown={(e) => handleMouseDown(e, index, 'resize', 'ne')}
                />
                <div 
                  className="absolute -bottom-1 -left-1 w-3 h-3 bg-orange-500 rounded-full cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onMouseDown={(e) => handleMouseDown(e, index, 'resize', 'sw')}
                />
                <div 
                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-500 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onMouseDown={(e) => handleMouseDown(e, index, 'resize', 'se')}
                />
                
                {/* 删除按钮 - 只有多于1个区域时才显示 */}
                {regions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeRegion(index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={100}
              step={1}
              onValueChange={([v]) => setCurrentTime(v)}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0:00</span>
              <span>{Math.floor(currentTime * 1.2)}:{String(Math.floor((currentTime * 1.2 % 1) * 60)).padStart(2, "0")}</span>
              <span>2:00</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" className="bg-transparent">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsPlaying(!isPlaying)} className="bg-transparent">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="icon" className="bg-transparent">
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Add region button */}
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={addRegion} className="bg-transparent">
              + 添加排除区域
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onBack} className="bg-transparent">上一步</Button>
          <Button onClick={onSubmit}>提交</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// AI Extract dialog - Step 2: Video preview with region selection (保留旧的，用于向后兼容)
interface AIExtractPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
  onBack: () => void
}

export function AIExtractPreviewDialog({ open, onOpenChange, onSubmit, onBack }: AIExtractPreviewDialogProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [region, setRegion] = useState({ x: 50, y: 400, width: 540, height: 80 })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>框选字幕区域</DialogTitle>
          <DialogDescription>
            在视频上拖动框选字幕所在位置
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Video preview with selection box */}
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "9/16", maxHeight: "400px", margin: "0 auto", width: "225px" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">视频预览区域</span>
            </div>
            {/* Selection box */}
            <div
              className="absolute border-2 border-primary bg-primary/20 cursor-move"
              style={{
                left: `${(region.x / 640) * 100}%`,
                top: `${(region.y / 480) * 100}%`,
                width: `${(region.width / 640) * 100}%`,
                height: `${(region.height / 480) * 100}%`,
              }}
            >
              <div className="absolute -top-6 left-0 text-xs text-primary bg-background px-1 rounded">
                X:{region.x} Y:{region.y}
              </div>
              <div className="absolute -bottom-6 right-0 text-xs text-primary bg-background px-1 rounded">
                W:{region.width} H:{region.height}
              </div>
              <Move className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={100}
              step={1}
              onValueChange={([v]) => setCurrentTime(v)}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0:00</span>
              <span>{Math.floor(currentTime * 1.2)}:{String(Math.floor((currentTime * 1.2 % 1) * 60)).padStart(2, "0")}</span>
              <span>2:00</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" className="bg-transparent">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsPlaying(!isPlaying)} className="bg-transparent">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="icon" className="bg-transparent">
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Region inputs */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={region.x}
                onChange={(e) => setRegion({ ...region, x: Number(e.target.value) })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={region.y}
                onChange={(e) => setRegion({ ...region, y: Number(e.target.value) })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">宽度</Label>
              <Input
                type="number"
                value={region.width}
                onChange={(e) => setRegion({ ...region, width: Number(e.target.value) })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">高度</Label>
              <Input
                type="number"
                value={region.height}
                onChange={(e) => setRegion({ ...region, height: Number(e.target.value) })}
                className="h-8"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onBack} className="bg-transparent">上一步</Button>
          <Button onClick={onSubmit}>提交</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// AI Translate dialog
interface AITranslateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (languages: string[]) => void
}

const targetLanguages = [
  // 亚洲语言
  { code: "en", name: "英语" },
  { code: "ja", name: "日语" },
  { code: "ko", name: "韩语" },
  { code: "th", name: "泰语" },
  { code: "vi", name: "越南语" },
  { code: "id", name: "印尼语" },
  { code: "ms", name: "马来语" },
  { code: "tl", name: "菲律宾语" },
  { code: "my", name: "缅甸语" },
  { code: "km", name: "柬埔寨语" },
  { code: "lo", name: "老挝语" },
  
  // 欧洲语言
  { code: "es", name: "西班牙语" },
  { code: "pt", name: "葡萄牙语" },
  { code: "fr", name: "法语" },
  { code: "de", name: "德语" },
  { code: "it", name: "意大利语" },
  { code: "ru", name: "俄语" },
  { code: "pl", name: "波兰语" },
  { code: "nl", name: "荷兰语" },
  { code: "tr", name: "土耳其语" },
  
  // 中东和非洲语言
  { code: "ar", name: "阿拉伯语" },
  { code: "he", name: "希伯来语" },
  { code: "fa", name: "波斯语" },
  { code: "sw", name: "斯瓦希里语" },
  
  // 其他语言
  { code: "hi", name: "印地语" },
  { code: "bn", name: "孟加拉语" },
  { code: "ur", name: "乌尔都语" },
]

export function AITranslateDialog({ open, onOpenChange, onSubmit }: AITranslateDialogProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== code))
    } else {
      setSelectedLanguages([...selectedLanguages, code])
    }
  }

  const selectAll = () => {
    setSelectedLanguages(targetLanguages.map(l => l.code))
  }

  const clearAll = () => {
    setSelectedLanguages([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI翻译设置</DialogTitle>
          <DialogDescription>
            选择需要翻译的目标语言（可多选）
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">已选择 {selectedLanguages.length} 种语言</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>全选</Button>
              <Button variant="ghost" size="sm" onClick={clearAll}>清空</Button>
            </div>
          </div>
          <ScrollArea className="h-80 border border-border rounded-lg p-4">
            <div className="grid grid-cols-3 gap-3">
              {targetLanguages.map(lang => (
                <div key={lang.code} className="flex items-center space-x-2">
                  <Checkbox
                    id={lang.code}
                    checked={selectedLanguages.includes(lang.code)}
                    onCheckedChange={() => toggleLanguage(lang.code)}
                  />
                  <label htmlFor={lang.code} className="text-sm cursor-pointer flex-1">{lang.name}</label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">取消</Button>
          <Button onClick={() => onSubmit(selectedLanguages)} disabled={selectedLanguages.length === 0}>
            提交
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Task Assignment dialog - 以语言为单位，新选择逻辑
interface TaskAssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (assignments: TaskAssignment[]) => void
  totalEpisodes: number
  taskType: "translation" | "quality_check" | "compress"
  languageVariants: Array<{
    id: string
    targetLanguage: string
    totalEpisodes: number
  }>
  initialAssignments?: TaskAssignment[] // 初始分配状态，用于取消时恢复
}

interface TaskAssignment {
  languageId: string
  episodes: number[]
  assignee: string
}

const personnel = [
  { id: "1", name: "张三" },
  { id: "2", name: "李四" },
  { id: "3", name: "王五" },
  { id: "4", name: "赵六" },
  { id: "5", name: "孙七" },
  { id: "6", name: "陈八" },
  { id: "7", name: "周九" },
  { id: "8", name: "吴十" },
]

const taskTypeNames = {
  translation: "翻译",
  quality_check: "质检",
  compress: "压制",
}

export function TaskAssignDialog({ open, onOpenChange, onSubmit, totalEpisodes, taskType, languageVariants, initialAssignments = [] }: TaskAssignDialogProps) {
  const [assignments, setAssignments] = useState<TaskAssignment[]>([])
  const [selectedAssignee, setSelectedAssignee] = useState("")
  
  // 当对话框打开时，恢复到初始状态（上次确认的状态）
  useEffect(() => {
    if (open && Array.isArray(initialAssignments)) {
      // 使用数组的map方法进行深拷贝，避免循环引用问题
      setAssignments(initialAssignments.map(a => ({
        languageId: a.languageId,
        episodes: [...a.episodes],
        assignee: a.assignee
      })))
    }
  }, [open, initialAssignments])
  
  // 从languageVariants生成languages数组
  // 所有任务类型都过滤掉源语言（翻译、质检、压制都不需要给源语言分配任务）
  const languages = languageVariants
    .filter(variant => !variant.targetLanguage.includes("源语言"))
    .map(variant => ({
      id: variant.id,
      name: variant.targetLanguage,
      episodes: variant.totalEpisodes,
    }))
  
  // 计算实际需要分配的总集数（所有非源语言的集数总和）
  const actualTotalEpisodes = languages.reduce((sum, lang) => sum + lang.episodes, 0)
  
  const [currentLanguage, setCurrentLanguage] = useState(languages[0]?.id || "")
  const [selectionStart, setSelectionStart] = useState<number | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null)
  const [isAllSelected, setIsAllSelected] = useState(true)

  // 当languages数组变化时，更新currentLanguage
  useEffect(() => {
    if (languages.length > 0 && !languages.find(l => l.id === currentLanguage)) {
      setCurrentLanguage(languages[0].id)
    }
  }, [languages, currentLanguage])

  const currentLanguageData = languages.find(l => l.id === currentLanguage)
  
  // 如果没有找到当前语言数据，显示友好提示
  if (!currentLanguageData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>任务分配 - {taskTypeNames[taskType]}</DialogTitle>
            <DialogDescription>
              请先进行AI翻译，创建翻译语言后再分配任务
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // 计算当前语言的已分配集数
  const getAssignedEpisodesForLanguage = (languageId: string) => {
    const assigned = new Set<number>()
    assignments
      .filter(a => a.languageId === languageId)
      .forEach(assignment => {
        assignment.episodes.forEach(ep => assigned.add(ep))
      })
    return assigned
  }

  const assignedEpisodes = getAssignedEpisodesForLanguage(currentLanguage)
  
  // 计算总体已分配和未分配的集数（基于实际需要分配的总集数）
  const totalAssignedCount = assignments.reduce((sum, a) => sum + a.episodes.length, 0)
  const totalUnassignedCount = actualTotalEpisodes - totalAssignedCount

  // 获取当前选中的集数
  const getSelectedEpisodes = () => {
    if (isAllSelected) {
      // 全选状态：返回所有未分配的集数
      const allEpisodes = Array.from({ length: currentLanguageData.episodes }, (_, i) => i + 1)
      return allEpisodes.filter(ep => !assignedEpisodes.has(ep))
    } else if (selectionStart !== null && selectionEnd !== null) {
      // 范围选择
      const start = Math.min(selectionStart, selectionEnd)
      const end = Math.max(selectionStart, selectionEnd)
      const selected: number[] = []
      for (let i = start; i <= end; i++) {
        if (!assignedEpisodes.has(i)) {
          selected.push(i)
        }
      }
      return selected
    } else if (selectionStart !== null) {
      // 只选了起始
      return assignedEpisodes.has(selectionStart) ? [] : [selectionStart]
    }
    return []
  }

  const selectedEpisodes = getSelectedEpisodes()

  // 处理集数点击 - 可以选前面或后面的数字
  const handleEpisodeClick = (episode: number) => {
    if (assignedEpisodes.has(episode)) return

    if (isAllSelected) {
      // 从全选状态切换到单选
      setIsAllSelected(false)
      setSelectionStart(episode)
      setSelectionEnd(null)
    } else if (selectionStart === null) {
      // 设置起始
      setSelectionStart(episode)
      setSelectionEnd(null)
    } else if (selectionEnd === null) {
      // 设置结束（可以选前面或后面的数字）
      if (episode < selectionStart) {
        // 选了前面的数字，当前数字变成起始
        setSelectionStart(episode)
        setSelectionEnd(null)
      } else {
        // 选了后面的数字，设置为结束
        setSelectionEnd(episode)
      }
    } else {
      // 已有起始和结束，重新开始
      setSelectionStart(episode)
      setSelectionEnd(null)
    }
  }

  // 添加分配
  const handleAddAssignment = () => {
    if (!selectedAssignee || selectedEpisodes.length === 0) return
    
    setAssignments([...assignments, {
      languageId: currentLanguage,
      episodes: selectedEpisodes.sort((a, b) => a - b),
      assignee: selectedAssignee,
    }])
    
    // 重置选择
    setIsAllSelected(true)
    setSelectionStart(null)
    setSelectionEnd(null)
    setSelectedAssignee("")
  }

  // 删除分配
  const handleRemoveAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index))
  }

  // 重置当前页
  const handleResetCurrent = () => {
    setAssignments(assignments.filter(a => a.languageId !== currentLanguage))
    setIsAllSelected(true)
    setSelectionStart(null)
    setSelectionEnd(null)
  }

  // 提交所有分配（允许部分分配）
  const handleSubmit = () => {
    onSubmit(assignments)
  }

  // 格式化集数范围显示
  const formatEpisodeRange = (episodes: number[]) => {
    if (episodes.length === 0) return ""
    if (episodes.length === 1) return `第${episodes[0]}集`
    
    const ranges: string[] = []
    let start = episodes[0]
    let end = episodes[0]
    
    for (let i = 1; i < episodes.length; i++) {
      if (episodes[i] === end + 1) {
        end = episodes[i]
      } else {
        ranges.push(start === end ? `第${start}集` : `第${start}-${end}集`)
        start = episodes[i]
        end = episodes[i]
      }
    }
    ranges.push(start === end ? `第${start}集` : `第${start}-${end}集`)
    
    return ranges.join(", ")
  }

  // 切换标签页时重置选择
  const handleTabChange = (value: string) => {
    setCurrentLanguage(value)
    setIsAllSelected(true)
    setSelectionStart(null)
    setSelectionEnd(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{taskTypeNames[taskType]}任务分配</DialogTitle>
          <DialogDescription>
            点击集数选择范围，分配给相应人员。共 {actualTotalEpisodes} 集，已分配 {totalAssignedCount} 集，未分配 {totalUnassignedCount} 集
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 py-4">
          {/* 左侧：语言和集数选择器 */}
          <div className="flex flex-col h-[580px]">
            {/* 选择语言和选择集数 - flex-1让它占据剩余空间 */}
            <div className="flex-1 flex flex-col space-y-2 min-h-0">
              <Label className="text-sm font-semibold">选择语言</Label>
              <Tabs value={currentLanguage} onValueChange={handleTabChange} className="w-full flex-1 flex flex-col min-h-0">
                {/* 语言标签页列表 - 使用ScrollArea确保不超出容器 */}
                <ScrollArea className="w-full max-h-24 shrink-0">
                  <TabsList className="flex flex-wrap gap-1.5 h-auto p-1.5 bg-muted/50 w-full">
                    {languages.map(lang => {
                      const langAssigned = getAssignedEpisodesForLanguage(lang.id)
                      const isFullyAssigned = langAssigned.size === lang.episodes
                      
                      return (
                        <TabsTrigger 
                          key={lang.id} 
                          value={lang.id} 
                          className="text-xs px-3 py-1.5 relative"
                        >
                          {lang.name}
                          {isFullyAssigned && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-background" />
                          )}
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                </ScrollArea>
                
                {/* 选择集数 - TabsContent必须在Tabs内部，使用flex-1填充剩余空间 */}
                <div className="mt-3 flex-1 flex flex-col min-h-0">
                  <Label className="text-sm font-semibold mb-2">选择集数</Label>
                  {languages.map(lang => (
                    <TabsContent key={lang.id} value={lang.id} className="flex-1 flex flex-col min-h-0 mt-0">
                      <ScrollArea className="flex-1 border border-border rounded-lg p-3 bg-muted/30">
                        <div className="grid grid-cols-10 gap-1">
                          {Array.from({ length: lang.episodes }, (_, i) => i + 1).map(episode => {
                            const isAssigned = getAssignedEpisodesForLanguage(lang.id).has(episode)
                            const isSelected = selectedEpisodes.includes(episode)
                            
                            return (
                              <div
                                key={episode}
                                className={`
                                  aspect-square flex items-center justify-center text-xs rounded cursor-pointer
                                  transition-all select-none
                                  ${isAssigned 
                                    ? 'bg-green-500/20 text-green-600 cursor-not-allowed' 
                                    : isSelected
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-background hover:bg-muted border border-border'
                                  }
                                `}
                                onClick={() => handleEpisodeClick(episode)}
                                title={isAssigned ? '已分配' : `第${episode}集`}
                              >
                                {episode}
                              </div>
                            )
                          })}
                        </div>
                      </ScrollArea>
                      
                      {/* 选择状态提示 */}
                      <div className="mt-2 text-xs text-muted-foreground">
                        {isAllSelected ? (
                          <span>当前：全选状态（点击任意集数开始选择范围）</span>
                        ) : selectionStart !== null && selectionEnd === null ? (
                          <span>起始：第{selectionStart}集（点击任意集数设置范围）</span>
                        ) : selectionStart !== null && selectionEnd !== null ? (
                          <span>范围：第{Math.min(selectionStart, selectionEnd)}-{Math.max(selectionStart, selectionEnd)}集（点击任意集数重新开始）</span>
                        ) : null}
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </div>
            
            {/* 人员选择和添加 - 固定在底部 */}
            <div className="space-y-2 pt-4 border-t mt-4">
              <Label className="text-sm font-semibold">分配给</Label>
              <div className="flex gap-2">
                <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="选择人员" />
                  </SelectTrigger>
                  <SelectContent>
                    {personnel.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAddAssignment}
                  disabled={!selectedAssignee || selectedEpisodes.length === 0}
                >
                  添加分配
                </Button>
              </div>
              <div className="flex items-center justify-between">
                {selectedEpisodes.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    已选择 {selectedEpisodes.length} 集
                  </p>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleResetCurrent}
                  disabled={assignedEpisodes.size === 0}
                >
                  重置当前页
                </Button>
              </div>
            </div>
          </div>

          {/* 右侧：分配列表 */}
          <div className="flex flex-col h-[580px]">
            <Label className="text-sm font-semibold mb-2">分配列表</Label>
            <ScrollArea className="flex-1 border border-border rounded-lg p-3 bg-muted/30">
              {assignments.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  暂无分配，请在左侧选择集数并分配人员
                </div>
              ) : (
                <div className="space-y-2">
                  {assignments.map((assignment, index) => {
                    const assigneeName = personnel.find(p => p.id === assignment.assignee)?.name || "未知"
                    const languageName = languages.find(l => l.id === assignment.languageId)?.name || "未知"
                    return (
                      <div 
                        key={index}
                        className="flex items-start justify-between p-3 bg-background rounded-lg border border-border"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{assigneeName}</span>
                            <span className="text-xs text-muted-foreground">
                              · {languageName} ({assignment.episodes.length} 集)
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatEpisodeRange(assignment.episodes)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAssignment(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          删除
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
            取消
          </Button>
          <Button onClick={handleSubmit}>
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Video Erase Region Selection dialog - 视频擦除区域选择（可拖拽可缩放，支持多个区域）
interface VideoEraseRegionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  region: { x: number; y: number; width: number; height: number }
  onRegionChange: (region: { x: number; y: number; width: number; height: number }) => void
  onSubmit: () => void
}

export function VideoEraseRegionDialog({ open, onOpenChange, region, onRegionChange, onSubmit }: VideoEraseRegionDialogProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  // 初始化第一个擦除区域为传入的region
  const [regions, setRegions] = useState([region])
  const [isDragging, setIsDragging] = useState<number | null>(null)
  const [isResizing, setIsResizing] = useState<{ index: number; corner: string } | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const videoRef = useRef<HTMLDivElement>(null)

  // 当对话框打开时，重置第一个区域为传入的region
  useEffect(() => {
    if (open) {
      setRegions([region])
    }
  }, [open, region])

  const handleMouseDown = (e: React.MouseEvent, index: number, type: 'move' | 'resize', corner?: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (type === 'move') {
      setIsDragging(index)
    } else if (type === 'resize' && corner) {
      setIsResizing({ index, corner })
    }
    
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!videoRef.current) return
      
      const rect = videoRef.current.getBoundingClientRect()
      const scaleX = 640 / rect.width
      const scaleY = 1138 / rect.height
      
      const deltaX = (e.clientX - dragStart.x) * scaleX
      const deltaY = (e.clientY - dragStart.y) * scaleY
      
      if (isDragging !== null) {
        const region = regions[isDragging]
        const newX = Math.max(0, Math.min(640 - region.width, region.x + deltaX))
        const newY = Math.max(0, Math.min(1138 - region.height, region.y + deltaY))
        
        const newRegions = [...regions]
        newRegions[isDragging] = { ...region, x: newX, y: newY }
        setRegions(newRegions)
        setDragStart({ x: e.clientX, y: e.clientY })
      } else if (isResizing) {
        const region = regions[isResizing.index]
        let newRegion = { ...region }
        
        switch (isResizing.corner) {
          case 'se':
            newRegion.width = Math.max(50, Math.min(640 - region.x, region.width + deltaX))
            newRegion.height = Math.max(30, Math.min(1138 - region.y, region.height + deltaY))
            break
          case 'sw':
            const newWidth = Math.max(50, region.width - deltaX)
            const newX = region.x + (region.width - newWidth)
            newRegion.x = Math.max(0, newX)
            newRegion.width = newWidth
            newRegion.height = Math.max(30, Math.min(1138 - region.y, region.height + deltaY))
            break
          case 'ne':
            const newHeight = Math.max(30, region.height - deltaY)
            const newY = region.y + (region.height - newHeight)
            newRegion.y = Math.max(0, newY)
            newRegion.height = newHeight
            newRegion.width = Math.max(50, Math.min(640 - region.x, region.width + deltaX))
            break
          case 'nw':
            const nwNewWidth = Math.max(50, region.width - deltaX)
            const nwNewX = region.x + (region.width - nwNewWidth)
            const nwNewHeight = Math.max(30, region.height - deltaY)
            const nwNewY = region.y + (region.height - nwNewHeight)
            newRegion.x = Math.max(0, nwNewX)
            newRegion.y = Math.max(0, nwNewY)
            newRegion.width = nwNewWidth
            newRegion.height = nwNewHeight
            break
        }
        
        const newRegions = [...regions]
        newRegions[isResizing.index] = newRegion
        setRegions(newRegions)
        setDragStart({ x: e.clientX, y: e.clientY })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(null)
      setIsResizing(null)
    }

    if (isDragging !== null || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, dragStart, regions])

  const addRegion = () => {
    setRegions([...regions, { x: 100, y: 150, width: 200, height: 60 }])
  }

  const removeRegion = (index: number) => {
    // 至少保留一个区域
    if (regions.length > 1) {
      setRegions(regions.filter((_, i) => i !== index))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>框选视频擦除区域</DialogTitle>
          <DialogDescription>
            在视频上拖动框选需要擦除的字幕区域
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Video preview with multiple selection boxes */}
          <div 
            ref={videoRef}
            className="relative bg-black rounded-lg overflow-hidden select-none" 
            style={{ aspectRatio: "9/16", maxHeight: "500px", margin: "0 auto", width: "280px" }}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-muted-foreground text-sm">视频预览区域</span>
            </div>
            
            {/* Multiple selection boxes */}
            {regions.map((region, index) => (
              <div
                key={index}
                className="absolute border-2 border-destructive bg-destructive/20 cursor-move group"
                style={{
                  left: `${(region.x / 640) * 100}%`,
                  top: `${(region.y / 1138) * 100}%`,
                  width: `${(region.width / 640) * 100}%`,
                  height: `${(region.height / 1138) * 100}%`,
                }}
                onMouseDown={(e) => handleMouseDown(e, index, 'move')}
              >
                {/* 位置信息 */}
                <div className="absolute -top-6 left-0 text-xs text-destructive bg-background px-1 rounded whitespace-nowrap pointer-events-none">
                  擦除区域 {index + 1} - X:{Math.round(region.x)} Y:{Math.round(region.y)}
                </div>
                <div className="absolute -bottom-6 right-0 text-xs text-destructive bg-background px-1 rounded whitespace-nowrap pointer-events-none">
                  W:{Math.round(region.width)} H:{Math.round(region.height)}
                </div>
                
                {/* 中心移动图标 */}
                <Move className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-destructive pointer-events-none" />
                
                {/* 四个角的调整手柄 */}
                <div 
                  className="absolute -top-1 -left-1 w-3 h-3 bg-destructive rounded-full cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onMouseDown={(e) => handleMouseDown(e, index, 'resize', 'nw')}
                />
                <div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onMouseDown={(e) => handleMouseDown(e, index, 'resize', 'ne')}
                />
                <div 
                  className="absolute -bottom-1 -left-1 w-3 h-3 bg-destructive rounded-full cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onMouseDown={(e) => handleMouseDown(e, index, 'resize', 'sw')}
                />
                <div 
                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-destructive rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onMouseDown={(e) => handleMouseDown(e, index, 'resize', 'se')}
                />
                
                {/* 删除按钮 - 只有多于1个区域时才显示 */}
                {regions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeRegion(index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={100}
              step={1}
              onValueChange={([v]) => setCurrentTime(v)}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0:00</span>
              <span>{Math.floor(currentTime * 1.2)}:{String(Math.floor((currentTime * 1.2 % 1) * 60)).padStart(2, "0")}</span>
              <span>2:00</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" className="bg-transparent">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsPlaying(!isPlaying)} className="bg-transparent">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="icon" className="bg-transparent">
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Add region button */}
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={addRegion} className="bg-transparent">
              + 添加擦除区域
            </Button>
          </div>

          {/* Region inputs - 只显示第一个区域的输入框 */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={Math.round(regions[0].x)}
                onChange={(e) => {
                  const newRegions = [...regions]
                  newRegions[0] = { ...newRegions[0], x: Number(e.target.value) }
                  setRegions(newRegions)
                }}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={Math.round(regions[0].y)}
                onChange={(e) => {
                  const newRegions = [...regions]
                  newRegions[0] = { ...newRegions[0], y: Number(e.target.value) }
                  setRegions(newRegions)
                }}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">宽度</Label>
              <Input
                type="number"
                value={Math.round(regions[0].width)}
                onChange={(e) => {
                  const newRegions = [...regions]
                  newRegions[0] = { ...newRegions[0], width: Number(e.target.value) }
                  setRegions(newRegions)
                }}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">高度</Label>
              <Input
                type="number"
                value={Math.round(regions[0].height)}
                onChange={(e) => {
                  const newRegions = [...regions]
                  newRegions[0] = { ...newRegions[0], height: Number(e.target.value) }
                  setRegions(newRegions)
                }}
                className="h-8"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">取消</Button>
          <Button onClick={onSubmit}>提交</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Video Erase Confirm dialog - 视频擦除待确认状态对话框
interface VideoEraseConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onView: () => void
  onSubmit: () => void
  onRecreate: () => void
}

export function VideoEraseConfirmDialog({ open, onOpenChange, onView, onSubmit, onRecreate }: VideoEraseConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>视频擦除已完成</DialogTitle>
          <DialogDescription>
            请选择您要执行的操作
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <Button variant="outline" onClick={onView} className="bg-transparent justify-start">
            查看
          </Button>
          <Button variant="outline" onClick={onSubmit} className="bg-transparent justify-start">
            提交
          </Button>
          <Button variant="outline" onClick={onRecreate} className="bg-transparent justify-start">
            重新擦除
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Video Erase dialog - Video preview with region selection
interface VideoEraseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}

export function VideoEraseDialog({ open, onOpenChange, onSubmit }: VideoEraseDialogProps) {
  const [regions, setRegions] = useState([{ x: 50, y: 400, width: 540, height: 80 }])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>视频擦除区域</DialogTitle>
          <DialogDescription>
            在视频上框选需要擦除的字幕区域
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "9/16", maxHeight: "400px", margin: "0 auto", width: "225px" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">视频预览区域</span>
            </div>
            {regions.map((region, index) => (
              <div
                key={index}
                className="absolute border-2 border-destructive bg-destructive/20 cursor-move"
                style={{
                  left: `${(region.x / 640) * 100}%`,
                  top: `${(region.y / 480) * 100}%`,
                  width: `${(region.width / 640) * 100}%`,
                  height: `${(region.height / 480) * 100}%`,
                }}
              >
                <Move className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={() => setRegions([...regions, { x: 50, y: 300, width: 540, height: 80 }])} className="bg-transparent">
              + 添加擦除区域
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">取消</Button>
          <Button onClick={onSubmit}>提交</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Subtitle Mount dialog
interface SubtitleMountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}

export function SubtitleMountDialog({ open, onOpenChange, onSubmit }: SubtitleMountDialogProps) {
  const [fontSize, setFontSize] = useState(24)
  const [positionX, setPositionX] = useState(320)
  const [positionY, setPositionY] = useState(420)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>字幕挂载设置</DialogTitle>
          <DialogDescription>
            调整字幕的显示参数
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6">
          {/* Video preview */}
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "9/16" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">视频预览区域</span>
            </div>
            {/* Subtitle preview */}
            <div
              className="absolute text-white text-center whitespace-nowrap"
              style={{
                fontSize: `${fontSize * 0.5}px`,
                left: "50%",
                transform: "translateX(-50%)",
                bottom: `${((480 - positionY) / 480) * 100}%`,
              }}
            >
              示例字幕文本
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>字体大小</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={12}
                  max={72}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-muted-foreground text-sm">px</span>
              </div>
              <Slider
                value={[fontSize]}
                min={12}
                max={72}
                step={1}
                onValueChange={([v]) => setFontSize(v)}
              />
            </div>
            <div className="space-y-2">
              <Label>水平位置 (X)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={640}
                  value={positionX}
                  onChange={(e) => setPositionX(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-muted-foreground text-sm">px</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>垂直位置 (Y)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={480}
                  value={positionY}
                  onChange={(e) => setPositionY(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-muted-foreground text-sm">px</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">取消</Button>
          <Button onClick={onSubmit}>提交</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Video Compress dialog - 简化为确认对话框
interface VideoCompressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}

export function VideoCompressDialog({ open, onOpenChange, onSubmit }: VideoCompressDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>确认视频压制</DialogTitle>
          <DialogDescription>
            确认开始视频压制任务吗？压制完成后将自动下载视频文件。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">取消</Button>
          <Button onClick={onSubmit}>确认压制</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Success dialog
interface SuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message?: string
}

export function SuccessDialog({ open, onOpenChange, message = "任务已成功提交，可在视频任务列表查看进度。" }: SuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>任务提交成功</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
