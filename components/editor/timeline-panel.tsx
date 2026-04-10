"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, Scissors, Merge } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SubtitleBlock {
  id: string
  startTime: number
  endTime: number
  text: string
  track: "original" | "translated" | "onscreen"
  trackIndex?: number // 轨道索引，支持同类型多轨道
}

interface TimelinePanelProps {
  originalSubtitles: SubtitleBlock[]
  translatedSubtitles: SubtitleBlock[]
  onScreenText: SubtitleBlock[]
  duration: number
  currentTime: number
  selectedId: string | null
  onSelectSubtitle: (id: string) => void
  onTimeChange: (time: number) => void
  onUpdateSubtitleTime?: (id: string, startTime: number, endTime: number) => void
  onAddSubtitle?: (track: "original" | "translated" | "onscreen", startTime: number, endTime: number) => void
  isReadOnly?: boolean // 只读模式
  // 字幕可见性控制（控制视频预览中的字幕显示）
  subtitleVisibility?: {
    original: boolean
    translated: boolean
    onscreen: boolean
  }
  onToggleSubtitleVisibility?: (track: "original" | "translated" | "onscreen") => void
  onSplitSubtitle?: (id: string, splitTime?: number) => void
  onMergeSubtitles?: (id1: string, id2: string) => void
}

export function TimelinePanel({
  originalSubtitles,
  translatedSubtitles,
  onScreenText,
  duration,
  currentTime,
  selectedId,
  onSelectSubtitle,
  onTimeChange,
  onUpdateSubtitleTime,
  onAddSubtitle,
  isReadOnly = false, // 默认可编辑
  subtitleVisibility = { original: false, translated: true, onscreen: true },
  onToggleSubtitleVisibility,
  onSplitSubtitle,
  onMergeSubtitles,
}: TimelinePanelProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const tracksRef = useRef<HTMLDivElement>(null)
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1) // 0.5x to 3x
  const [resizing, setResizing] = useState<{ id: string; edge: "left" | "right" } | null>(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartTime, setResizeStartTime] = useState(0)
  
  // 字幕拖动状态
  const [draggingSubtitle, setDraggingSubtitle] = useState<{
    id: string
    startX: number
    originalStartTime: number
    originalEndTime: number
    track: "original" | "translated" | "onscreen"
  } | null>(null)
  
  // 轨道在时间轴中始终显示，不再需要本地可见性状态

  // Context menu for split/merge
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string; track: string } | null>(null)
  
  const basePixelsPerSecond = 100
  const pixelsPerSecond = basePixelsPerSecond * zoomLevel

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft
    const time = x / pixelsPerSecond
    onTimeChange(Math.min(Math.max(0, time), duration))
  }

  const handlePlayheadDrag = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !timelineRef.current) return
      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left + timelineRef.current.scrollLeft
      const time = x / pixelsPerSecond
      onTimeChange(Math.min(Math.max(0, time), duration))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, duration, onTimeChange, pixelsPerSecond])

  const handleSubtitleClick = (id: string, startTime: number, e?: React.MouseEvent) => {
    // 选中块并移动光标到该字幕的开始时间
    e?.stopPropagation()
    onSelectSubtitle(id)
    onTimeChange(startTime)
  }


  // Auto-scroll both timeline and tracks to current time
  useEffect(() => {
    if (timelineRef.current && tracksRef.current) {
      const currentPosition = currentTime * pixelsPerSecond
      const containerWidth = timelineRef.current.clientWidth
      const scrollLeft = timelineRef.current.scrollLeft

      // Scroll if playhead is near edges
      if (currentPosition < scrollLeft + 100) {
        const newScrollLeft = Math.max(0, currentPosition - containerWidth / 2)
        timelineRef.current.scrollLeft = newScrollLeft
        tracksRef.current.scrollLeft = newScrollLeft
      } else if (currentPosition > scrollLeft + containerWidth - 100) {
        const newScrollLeft = currentPosition - containerWidth / 2
        timelineRef.current.scrollLeft = newScrollLeft
        tracksRef.current.scrollLeft = newScrollLeft
      }
    }
  }, [currentTime, pixelsPerSecond])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`
  }

  const formatTimeShort = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle subtitle edge resizing
  useEffect(() => {
    if (!resizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return
      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left + timelineRef.current.scrollLeft
      const deltaX = x - resizeStartX
      const deltaTime = deltaX / pixelsPerSecond

      // Find the subtitle being resized
      const allSubtitles = [...originalSubtitles, ...translatedSubtitles, ...onScreenText]
      const subtitle = allSubtitles.find(s => s.id === resizing.id)
      if (!subtitle || !onUpdateSubtitleTime) return

      if (resizing.edge === "left") {
        const newStartTime = Math.max(0, resizeStartTime + deltaTime)
        if (newStartTime < subtitle.endTime - 0.1) {
          onUpdateSubtitleTime(resizing.id, newStartTime, subtitle.endTime)
        }
      } else {
        const newEndTime = Math.min(duration, resizeStartTime + deltaTime)
        if (newEndTime > subtitle.startTime + 0.1) {
          onUpdateSubtitleTime(resizing.id, subtitle.startTime, newEndTime)
        }
      }
    }

    const handleMouseUp = () => {
      setResizing(null)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [resizing, resizeStartX, resizeStartTime, pixelsPerSecond, originalSubtitles, translatedSubtitles, onScreenText, duration, onUpdateSubtitleTime])

  // Handle subtitle dragging (moving position)
  useEffect(() => {
    if (!draggingSubtitle) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current || !onUpdateSubtitleTime) return
      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left + timelineRef.current.scrollLeft
      const deltaX = x - draggingSubtitle.startX
      const deltaTime = deltaX / pixelsPerSecond

      const subtitleDuration = draggingSubtitle.originalEndTime - draggingSubtitle.originalStartTime
      let newStartTime = draggingSubtitle.originalStartTime + deltaTime
      let newEndTime = draggingSubtitle.originalEndTime + deltaTime

      // 限制在视频时长内
      if (newStartTime < 0) {
        newStartTime = 0
        newEndTime = subtitleDuration
      }
      if (newEndTime > duration) {
        newEndTime = duration
        newStartTime = duration - subtitleDuration
      }

      // 碰撞检测 - 获取同轨道的其他字幕
      let trackSubtitles: SubtitleBlock[] = []
      if (draggingSubtitle.track === "original") {
        trackSubtitles = originalSubtitles.filter(s => s.id !== draggingSubtitle.id)
      } else if (draggingSubtitle.track === "translated") {
        trackSubtitles = translatedSubtitles.filter(s => s.id !== draggingSubtitle.id)
      } else {
        trackSubtitles = onScreenText.filter(s => s.id !== draggingSubtitle.id)
      }

      // 检查是否与其他字幕重叠
      const hasCollision = trackSubtitles.some(sub =>
        newStartTime < sub.endTime && sub.startTime < newEndTime
      )

      // 如果没有碰撞，更新位置
      if (!hasCollision) {
        onUpdateSubtitleTime(draggingSubtitle.id, newStartTime, newEndTime)
      }
    }

    const handleMouseUp = () => {
      setDraggingSubtitle(null)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [draggingSubtitle, pixelsPerSecond, originalSubtitles, translatedSubtitles, onScreenText, duration, onUpdateSubtitleTime])

  // 渲染音频频谱图 - 模拟人声频谱，与字幕时间对应
  useEffect(() => {
    const canvas = waveformCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = duration * pixelsPerSecond
    const height = 56
    canvas.width = width
    canvas.height = height
    
    // Dark background
    ctx.fillStyle = "#0a0a1a"
    ctx.fillRect(0, 0, width, height)

    // Draw low-level noise floor across entire timeline
    for (let x = 0; x < width; x += 1) {
      const noiseH = Math.random() * 3 + 1
      const alpha = Math.random() * 0.15 + 0.05
      ctx.fillStyle = `rgba(80, 120, 180, ${alpha})`
      ctx.fillRect(x, height - noiseH, 1, noiseH)
    }

    // Draw spectrogram for each subtitle region (voice activity)
    originalSubtitles.forEach(sub => {
      const startX = Math.floor(sub.startTime * pixelsPerSecond)
      const endX = Math.floor(sub.endTime * pixelsPerSecond)
      const segWidth = endX - startX
      if (segWidth <= 0) return

      // Seed from subtitle id for consistent randomness
      const seed = sub.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
      const rng = (i: number, j: number) => Math.abs(Math.sin(seed * 0.37 + i * 0.13 + j * 0.71))

      // Draw frequency bands from bottom to top
      const numBands = 28
      const bandH = height / numBands

      for (let x = 0; x < segWidth; x += 1) {
        // Envelope: fade in/out at edges, stronger in middle
        const pos = x / segWidth
        const envelope = Math.sin(pos * Math.PI) * 0.7 + 0.3
        // Micro variation
        const microVar = 0.5 + 0.5 * Math.sin(x * 0.8 + seed)

        for (let band = 0; band < numBands; band++) {
          const freqFactor = 1 - (band / numBands) // lower bands = more energy
          const energy = rng(x, band) * freqFactor * freqFactor * envelope * microVar

          if (energy < 0.08) continue

          const px = startX + x
          const py = height - (band + 1) * bandH

          // Color: dark blue -> cyan -> green-yellow -> white based on energy
          let r: number, g: number, b: number
          if (energy < 0.2) {
            // Dark blue/purple
            r = 30 + energy * 200
            g = 20 + energy * 150
            b = 80 + energy * 400
          } else if (energy < 0.45) {
            // Cyan/teal
            const t = (energy - 0.2) / 0.25
            r = 70 * (1 - t) + 20 * t
            g = 50 + t * 200
            b = 160 + t * 60
          } else if (energy < 0.7) {
            // Green-yellow
            const t = (energy - 0.45) / 0.25
            r = 20 + t * 180
            g = 250
            b = 220 * (1 - t) + 40 * t
          } else {
            // Bright white-cyan
            const t = (energy - 0.7) / 0.3
            r = 200 + t * 55
            g = 250 + t * 5
            b = 40 + t * 215
          }

          ctx.fillStyle = `rgba(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)},${Math.min(1, energy * 1.5 + 0.1)})`
          ctx.fillRect(px, py, 1, bandH + 0.5)
        }

        // Occasional bright vertical spike (consonant/plosive)
        if (rng(x * 3, 99) > 0.92 && envelope > 0.4) {
          const spikeH = height * (0.3 + rng(x, 50) * 0.5) * envelope
          const gradient = ctx.createLinearGradient(0, height, 0, height - spikeH)
          gradient.addColorStop(0, "rgba(200, 255, 255, 0.6)")
          gradient.addColorStop(0.4, "rgba(100, 220, 255, 0.3)")
          gradient.addColorStop(1, "rgba(60, 100, 200, 0.05)")
          ctx.fillStyle = gradient
          ctx.fillRect(startX + x, height - spikeH, 1, spikeH)
        }
      }
    })
  }, [originalSubtitles, duration, pixelsPerSecond])

  // 渲染多轨道系统（支持同类型多轨道）
  const renderMultiTrackSystem = (
    subtitles: SubtitleBlock[],
    label: string,
    color: string,
    trackType: "original" | "translated" | "onscreen",
    isVisible: boolean
  ) => {
    // 按轨道索引分组
    const subtitlesByTrack = new Map<number, SubtitleBlock[]>()
    subtitles.forEach(sub => {
      const trackIndex = sub.trackIndex ?? 0
      if (!subtitlesByTrack.has(trackIndex)) {
        subtitlesByTrack.set(trackIndex, [])
      }
      subtitlesByTrack.get(trackIndex)!.push(sub)
    })

    // 获取所有轨道索引并排序
    const trackIndices = Array.from(subtitlesByTrack.keys()).sort((a, b) => a - b)

    // 如果没有字幕，至少渲染一个空轨道
    if (trackIndices.length === 0) {
      trackIndices.push(0)
    }

    return (
      <div className="flex flex-col">
        {trackIndices.map((trackIndex) => (
          <div key={`${trackType}-${trackIndex}`} className="flex border-b border-border relative">
            {/* Track label */}
            <div className="w-24 shrink-0 flex items-center justify-between px-2 py-2 bg-muted border-r border-border sticky left-0 z-40">
              <div className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", color)} />
                <span className="text-xs font-medium text-foreground">
                  {trackIndex > 0 ? `${label} ${trackIndex + 1}` : label}
                </span>
              </div>
              {trackIndex === 0 && (
                <div className="flex items-center gap-1">
                  {onToggleSubtitleVisibility && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 hover:bg-accent"
                      onClick={() => onToggleSubtitleVisibility(trackType)}
                      title={isVisible ? "隐藏字幕" : "显示字幕"}
                    >
                      {isVisible ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3 opacity-50" />
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Track content */}
            <div className="relative flex-1 h-12 overflow-hidden bg-card">
              <div className="absolute inset-0">
                {(subtitlesByTrack.get(trackIndex) || []).map((subtitle) => {
                  const left = subtitle.startTime * pixelsPerSecond
                  const width = (subtitle.endTime - subtitle.startTime) * pixelsPerSecond
                  const isSelected = subtitle.id === selectedId

                  return (
                    <div
                      key={subtitle.id}
                      className={cn(
                        "absolute top-1 h-10 rounded border-2 transition-all overflow-hidden group",
                        isSelected
                          ? "border-primary bg-primary/30 shadow-lg z-10"
                          : "border-border bg-primary/10 hover:bg-primary/15",
                        draggingSubtitle?.id === subtitle.id
                          ? "cursor-grabbing opacity-70 shadow-2xl"
                          : "cursor-grab"
                      )}
                      style={{
                        left: `${left}px`,
                        width: `${width}px`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSubtitleClick(subtitle.id, subtitle.startTime, e)
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setContextMenu({ x: e.clientX, y: e.clientY, id: subtitle.id, track: subtitle.track })
                      }}
                      onMouseDown={(e) => {
                        if (isReadOnly) return

                        const rect = e.currentTarget.getBoundingClientRect()
                        const clickX = e.clientX - rect.left
                        const isLeftEdge = clickX < 8
                        const isRightEdge = clickX > rect.width - 8

                        if (!isLeftEdge && !isRightEdge) {
                          setDraggingSubtitle({
                            id: subtitle.id,
                            track: subtitle.track,
                            originalStartTime: subtitle.startTime,
                            originalEndTime: subtitle.endTime,
                            startX: e.clientX,
                          })
                        }
                      }}
                    >
                      <div
                        className={cn(
                          "h-full px-1 truncate text-[10px] flex items-center",
                          isSelected ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {subtitle.text}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 时间轴刻度 - 只在第一个轨道显示 */}
            {trackIndex === 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-4 border-t border-border/50 pointer-events-none">
                {Array.from({ length: Math.ceil(duration) }).map((_, i) => (
                  i % 5 === 0 && (
                    <div
                      key={i}
                      className="absolute top-0 h-full border-l border-border/50"
                      style={{ left: `${i * pixelsPerSecond}px` }}
                    >
                      <span className="absolute top-0.5 left-0.5 text-[8px] text-muted-foreground">
                        {i}s
                      </span>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderTrack = (
    subtitles: SubtitleBlock[],
    label: string,
    color: string,
    trackType: "original" | "translated" | "onscreen",
    isVisible: boolean
  ) => {
    return (
      <div className="flex border-b border-border relative">
        {/* Track label - Fixed position with overlay effect */}
        <div className="w-24 shrink-0 flex items-center justify-between px-2 py-2 bg-muted border-r border-border sticky left-0 z-40">
          <div className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", color)} />
            <span className="text-xs font-medium text-foreground">{label}</span>
          </div>
          <div className="flex items-center gap-1">
            {/* 显示/隐藏按钮 - 控制视频预览中的字幕显示 */}
            {onToggleSubtitleVisibility && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-accent"
                onClick={() => onToggleSubtitleVisibility(trackType)}
                title={isVisible ? "隐藏字幕" : "显示字幕"}
              >
                {isVisible ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3 opacity-50" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Track content - 始终显示所有轨道 */}
        <div className="relative flex-1 h-12 overflow-hidden bg-card">
          <div className="absolute inset-0">
            {subtitles.map((subtitle) => {
              const left = subtitle.startTime * pixelsPerSecond
              const width = (subtitle.endTime - subtitle.startTime) * pixelsPerSecond
              // 只有完全匹配的块才会被选中
              const isSelected = subtitle.id === selectedId

              return (
                <div
                  key={subtitle.id}
                  className={cn(
                    "absolute top-1 h-10 rounded border-2 transition-all overflow-hidden group",
                    isSelected
                      ? "border-primary bg-primary/30 shadow-lg z-10"
                      : "border-border bg-primary/10 hover:bg-primary/15",
                    draggingSubtitle?.id === subtitle.id
                      ? "cursor-grabbing opacity-70 shadow-2xl"
                      : "cursor-grab"
                  )}
                  style={{
                    left: `${left}px`,
                    width: `${width}px`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSubtitleClick(subtitle.id, subtitle.startTime, e)
                  }}
                  onMouseDown={(e) => {
                    // 只读模式下不允许拖动
                    if (isReadOnly) return
                    
                    // 检查是否点击在边缘（resize区域）
                    const rect = e.currentTarget.getBoundingClientRect()
                    const clickX = e.clientX - rect.left
                    const isLeftEdge = clickX < 8 // 左边缘8px
                    const isRightEdge = clickX > rect.width - 8 // 右边缘8px
                    
                    // 如果点击在边缘，不启动拖动（让resize处理）
                    if (isLeftEdge || isRightEdge) return
                    
                    // 启动拖动
                    e.stopPropagation()
                    const timelineRect = timelineRef.current?.getBoundingClientRect()
                    if (!timelineRect) return
                    
                    setDraggingSubtitle({
                      id: subtitle.id,
                      startX: e.clientX - timelineRect.left + (timelineRef.current?.scrollLeft || 0),
                      originalStartTime: subtitle.startTime,
                      originalEndTime: subtitle.endTime,
                      track: trackType
                    })
                    
                    // 选中字幕
                    onSelectSubtitle(subtitle.id)
                  }}
                >
                  {/* Left edge resize handle - 只读模式下不显示 */}
                  {isSelected && !isReadOnly && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-primary/50 z-20"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setResizing({ id: subtitle.id, edge: "left" })
                        setResizeStartX(e.clientX - (timelineRef.current?.getBoundingClientRect().left || 0) + (timelineRef.current?.scrollLeft || 0))
                        setResizeStartTime(subtitle.startTime)
                      }}
                    />
                  )}
                  
                  <div className="px-2 py-1 h-full flex items-center">
                    <p className="text-xs text-foreground truncate">{subtitle.text}</p>
                  </div>

                  {/* Right edge resize handle - 只读模式下不显示 */}
                  {isSelected && !isReadOnly && (
                    <div
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-primary/50 z-20"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setResizing({ id: subtitle.id, edge: "right" })
                        setResizeStartX(e.clientX - (timelineRef.current?.getBoundingClientRect().left || 0) + (timelineRef.current?.scrollLeft || 0))
                        setResizeStartTime(subtitle.endTime)
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-muted/20 relative">
      {/* Timeline ruler */}
      <div className="shrink-0 border-b border-border bg-card">
        {/* Timeline ruler */}
        <div className="flex">
          {/* Track labels spacer */}
          <div className="w-24 shrink-0 bg-muted/30 border-r border-border" />
          
          {/* Timeline ruler */}
          <div
            ref={timelineRef}
            className="relative flex-1 h-8 overflow-hidden bg-muted/30 cursor-pointer"
            onClick={handleTimelineClick}
          >
            <div className="relative h-full" style={{ width: `${duration * pixelsPerSecond}px` }}>
              {/* Time markers - show frames when zoomed in */}
              {zoomLevel >= 2 ? (
                // Frame-level markers (30 fps) - show frame numbers every 5 frames
                Array.from({ length: Math.ceil(duration * 30) + 1 }).map((_, i) => {
                  const frameTime = i / 30
                  const isSecondMark = i % 30 === 0
                  const frameNumber = i % 30
                  const showFrameNumber = frameNumber % 5 === 0 && frameNumber !== 0 && frameNumber !== 30
                  
                  return (
                    <div
                      key={i}
                      className={cn(
                        "absolute top-0 border-l",
                        isSecondMark ? "h-full border-border" : "h-3 border-border/30"
                      )}
                      style={{ left: `${frameTime * pixelsPerSecond}px` }}
                    >
                      {isSecondMark ? (
                        <span className="absolute top-1 left-1 text-[10px] text-muted-foreground">
                          {formatTimeShort(frameTime)}
                        </span>
                      ) : showFrameNumber ? (
                        <span className="absolute top-1 left-1 text-[8px] text-muted-foreground/70">
                          {frameNumber}f
                        </span>
                      ) : null}
                    </div>
                  )
                })
              ) : (
                // Second-level markers
                Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-full border-l border-border/50"
                    style={{ left: `${i * pixelsPerSecond}px` }}
                  >
                    <span className="absolute top-1 left-1 text-[10px] text-muted-foreground">
                      {formatTimeShort(i)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tracks container - synchronized scrolling, no scrollbar */}
      <div
        ref={tracksRef}
        className="flex-1 overflow-x-auto overflow-y-auto relative scrollbar-hide"
        onScroll={(e) => {
          // Sync scroll with timeline ruler
          if (timelineRef.current) {
            timelineRef.current.scrollLeft = e.currentTarget.scrollLeft
          }
        }}
      >
        <div style={{ width: `${duration * pixelsPerSecond + 96}px` }}>
          {/* Audio waveform track - voice extracted from video */}
          <div className="flex border-b border-border relative">
            <div className="w-24 shrink-0 flex items-center px-2 py-1 bg-muted border-r border-border sticky left-0 z-40">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-xs font-medium text-foreground">人声</span>
              </div>
            </div>
            <div className="flex-1 relative h-14 bg-[#0a0a1a]">
              <canvas
                ref={waveformCanvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ width: `${duration * pixelsPerSecond}px`, height: "56px" }}
              />
            </div>
          </div>
          {renderMultiTrackSystem(originalSubtitles, "原文", "bg-blue-500", "original", subtitleVisibility.original)}
          {renderMultiTrackSystem(translatedSubtitles, "译文", "bg-green-500", "translated", subtitleVisibility.translated)}
          {renderMultiTrackSystem(onScreenText, "画面字", "bg-orange-500", "onscreen", subtitleVisibility.onscreen)}
        </div>
      </div>

      {/* Continuous Playhead - spans from timeline through tracks */}
      <div
        className="absolute w-px bg-white dark:bg-white pointer-events-none z-40"
        style={{
          left: `${currentTime * pixelsPerSecond + 96}px`,
          top: "0px", // Start from timeline ruler
          bottom: "41px", // End before zoom controls
        }}
      />

      {/* Draggable Playhead Handle - only in timeline area */}
      <div
        className="absolute w-px z-50"
        style={{
          left: `${currentTime * pixelsPerSecond + 96}px`,
          top: "0px",
          height: "32px", // Timeline ruler height
        }}
        onMouseDown={handlePlayheadDrag}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white dark:bg-white rounded-full cursor-grab active:cursor-grabbing" />
      </div>

      {/* Zoom controls at bottom */}
      <div className="shrink-0 border-t border-border bg-card">
        <div className="px-4 py-2 flex items-center justify-center gap-3">
          <span className="text-xs text-muted-foreground">缩放:</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
            className="w-32 h-1 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:dark:bg-gray-800 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:dark:bg-gray-800 [&::-moz-range-thumb]:border-0"
          />
          <span className="text-xs font-mono text-muted-foreground w-10">{zoomLevel.toFixed(1)}x</span>
        </div>
      </div>

      {/* Context menu for split/merge */}
      {contextMenu && !isReadOnly && (
        <div
          className="fixed z-50 bg-card border border-border rounded-md shadow-lg py-1 min-w-[140px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={() => setContextMenu(null)}
        >
          {onSplitSubtitle && (
            <button
              className="w-full px-3 py-1.5 text-xs text-left hover:bg-muted flex items-center gap-2"
              onClick={() => { onSplitSubtitle(contextMenu.id); setContextMenu(null) }}
            >
              <Scissors className="w-3.5 h-3.5" />拆轴
            </button>
          )}
          {onMergeSubtitles && (() => {
            // Find adjacent subtitle to merge with
            const allSubs = [...originalSubtitles, ...translatedSubtitles, ...onScreenText]
            const current = allSubs.find(s => s.id === contextMenu.id)
            const sameTracks = allSubs.filter(s => s.track === current?.track && s.id !== contextMenu.id)
            const next = sameTracks.filter(s => s.startTime >= (current?.endTime ?? 0)).sort((a, b) => a.startTime - b.startTime)[0]
            if (!next) return null
            return (
              <button
                className="w-full px-3 py-1.5 text-xs text-left hover:bg-muted flex items-center gap-2"
                onClick={() => { onMergeSubtitles(contextMenu.id, next.id); setContextMenu(null) }}
              >
                <Merge className="w-3.5 h-3.5" />合轴（与下一条）
              </button>
            )
          })()}
        </div>
      )}
    </div>
  )
}
