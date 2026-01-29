"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SubtitleBlock {
  id: string
  startTime: number
  endTime: number
  text: string
  track: "original" | "translated" | "onscreen"
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
}: TimelinePanelProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const tracksRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1) // 0.5x to 3x
  const [resizing, setResizing] = useState<{ id: string; edge: "left" | "right" } | null>(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartTime, setResizeStartTime] = useState(0)
  
  // 轨道显示/隐藏状态 - 源语言轨道默认隐藏
  const [trackVisibility, setTrackVisibility] = useState({
    original: false, // 源语言默认隐藏
    translated: true,
    onscreen: true,
  })
  
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
  
  // 切换轨道显示/隐藏
  const toggleTrackVisibility = (track: "original" | "translated" | "onscreen") => {
    setTrackVisibility(prev => ({
      ...prev,
      [track]: !prev[track]
    }))
  }
  
  // 在光标位置添加字幕（默认2秒）
  const handleAddSubtitleAtCursor = (track: "original" | "translated" | "onscreen") => {
    if (!onAddSubtitle || isReadOnly) return
    
    const startTime = currentTime
    const endTime = Math.min(currentTime + 2, duration) // 默认2秒，不超过总时长
    
    onAddSubtitle(track, startTime, endTime)
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
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`
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
            {/* 添加字幕按钮 - 只读模式下不显示 */}
            {!isReadOnly && onAddSubtitle && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-accent"
                onClick={() => handleAddSubtitleAtCursor(trackType)}
                title="在光标位置添加字幕"
              >
                <Plus className="w-3 h-3" />
              </Button>
            )}
            {/* 显示/隐藏按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 hover:bg-accent"
              onClick={() => toggleTrackVisibility(trackType)}
              title={isVisible ? "隐藏轨道" : "显示轨道"}
            >
              {isVisible ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3 opacity-50" />
              )}
            </Button>
          </div>
        </div>

        {/* Track content - 隐藏时显示空轨道 */}
        <div className="relative flex-1 h-12 overflow-hidden bg-card">
          {isVisible && (
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
                      "absolute top-1 h-10 rounded border-2 cursor-pointer transition-all overflow-hidden group",
                      isSelected
                        ? "border-primary bg-primary/30 shadow-lg z-10"
                        : "border-border bg-primary/10 hover:bg-primary/15"
                    )}
                    style={{
                      left: `${left}px`,
                      width: `${width}px`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSubtitleClick(subtitle.id, subtitle.startTime, e)
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
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-muted/20 relative">
      {/* Timeline ruler */}
      <div className="shrink-0 border-b border-border bg-card">
        {/* Time display */}
        <div className="px-4 py-1 flex items-center justify-between text-xs text-muted-foreground border-b border-border">
          <span>{formatTime(currentTime)}</span>
          <span>总时长: {formatTime(duration)}</span>
        </div>

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
          {renderTrack(originalSubtitles, "原文", "bg-blue-500", "original", trackVisibility.original)}
          {renderTrack(translatedSubtitles, "译文", "bg-green-500", "translated", trackVisibility.translated)}
          {renderTrack(onScreenText, "画面字", "bg-orange-500", "onscreen", trackVisibility.onscreen)}
        </div>
      </div>

      {/* Continuous Playhead - spans from timeline through tracks */}
      <div
        className="absolute w-px bg-white dark:bg-white pointer-events-none z-40"
        style={{
          left: `${currentTime * pixelsPerSecond + 96}px`,
          top: "41px", // Start from timeline ruler (after time display)
          bottom: "41px", // End before zoom controls
        }}
      />

      {/* Draggable Playhead Handle - only in timeline area */}
      <div
        className="absolute w-px z-50"
        style={{
          left: `${currentTime * pixelsPerSecond + 96}px`,
          top: "41px",
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
    </div>
  )
}
