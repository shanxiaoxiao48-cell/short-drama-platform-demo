"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Play,
  Pause,
  ZoomIn,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { VideoWatermark } from "./video-watermark"

interface SubtitleStyle {
  fontSize: number
  verticalPosition: number
  lineBreakRule?: "auto" | "manual" | "character-limit"
  maxCharactersPerLine?: number
  positionX?: number // 水平位置 0-100
  positionY?: number // 垂直位置 0-100
  scale?: number // 缩放比例
  rotation?: number // 旋转角度
  lineHeight?: number // 行高
  letterSpacing?: number // 字间距
  textAlign?: "left" | "center" | "right" // 对齐方式
  writingMode?: "horizontal-tb" | "vertical-rl" // 横竖排版
  verticalAlign?: "top" | "middle" | "bottom" // 竖排时的垂直对齐
  color?: string // 字体颜色
  fontFamily?: string // 字体
  fontWeight?: "normal" | "bold" // 加粗
  fontStyle?: "normal" | "italic" // 倾斜
  strokeColor?: string // 描边颜色
  strokeWidth?: number // 描边宽度
  strokeEnabled?: boolean // 描边启用
  shadowColor?: string // 阴影颜色
  shadowBlur?: number // 阴影模糊度
  shadowOffsetX?: number // 阴影角度
  shadowOffsetY?: number // 阴影距离
  shadowOpacity?: number // 阴影不透明度
  shadowEnabled?: boolean // 阴影启用
}

interface VideoPlayerPanelProps {
  videoUrl?: string
  posterImage?: string // 添加海报图片参数
  currentTime: number
  currentSubtitle: string | null
  subtitleStyle?: SubtitleStyle
  onTimeChange: (time: number) => void
  onFrameStep: (direction: "forward" | "backward") => void
  isPlaying?: boolean
  onPlayingChange?: (playing: boolean) => void
  duration?: number
  userName?: string // 添加用户名参数用于水印
  // 字幕可见性控制和多字幕支持
  subtitleVisibility?: {
    original: boolean
    translated: boolean
    onscreen: boolean
  }
  originalSubtitle?: string // 原文字幕
  translatedSubtitle?: string // 译文字幕
  onscreenTexts?: Array<{ text: string; type?: string }> // 画面字列表
  selectedSubtitleId?: string | null // 当前选中的字幕ID
  onSubtitleStyleChange?: (style: Partial<SubtitleStyle>) => void // 字幕样式变化回调
}

const DEFAULT_FRAME_RATE = 30 // 30 fps
const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]

// 将十六进制颜色转换为rgba
function hexToRgba(hex: string, opacity: number): string {
  // 移除#号
  hex = hex.replace('#', '')

  // 解析RGB值
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`
}

// 根据角度和距离计算阴影偏移
function getShadowOffset(angle: number, distance: number): { x: number; y: number } {
  // 将角度转换为弧度（注意：CSS中y轴向下为正）
  const radians = angle * Math.PI / 180
  return {
    x: Math.round(distance * Math.cos(radians)),
    y: Math.round(distance * Math.sin(radians))
  }
}

// 获取文本阴影样式
function getTextShadowStyle(style: SubtitleStyle): string {
  // 如果阴影未启用，使用默认阴影
  if (style.shadowEnabled === false) {
    return "0 2px 4px rgba(0,0,0,0.8)"
  }

  // 如果阴影启用但没有设置参数，使用默认值
  const angle = style.shadowOffsetX ?? -45
  const distance = style.shadowOffsetY ?? 5
  const blur = style.shadowBlur ?? 15
  const color = style.shadowColor ?? "#000000"
  const opacity = style.shadowOpacity ?? 90

  // 只有当有实际阴影效果时才应用
  if (blur === 0 && distance === 0) {
    return "0 2px 4px rgba(0,0,0,0.8)"
  }

  const offset = getShadowOffset(angle, distance)
  const rgbaColor = hexToRgba(color, opacity)

  return `${offset.x}px ${offset.y}px ${blur}px ${rgbaColor}`
}

export function VideoPlayerPanel({
  videoUrl,
  posterImage = "/drama-posters/badao-zongcai.png", // 默认海报
  currentTime,
  currentSubtitle,
  subtitleStyle = {
    fontSize: 16,
    verticalPosition: 85,
    lineBreakRule: "auto",
  },
  onTimeChange,
  onFrameStep,
  isPlaying: externalIsPlaying = false,
  onPlayingChange,
  duration: externalDuration = 180,
  userName = "张三", // 默认用户名
  subtitleVisibility = { original: false, translated: true, onscreen: true },
  originalSubtitle,
  translatedSubtitle,
  onscreenTexts = [],
  selectedSubtitleId = null,
  onSubtitleStyleChange,
}: VideoPlayerPanelProps) {
  const [internalIsPlaying, setInternalIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [duration, setDuration] = useState(externalDuration)
  const [videoScale, setVideoScale] = useState(100) // 视频缩放比例 50-150%
  const [aspectRatio, setAspectRatio] = useState("9:16") // 比例选择，默认9:16
  const [showSubtitleControls, setShowSubtitleControls] = useState(false) // 是否显示字幕调整框
  const [isDragging, setIsDragging] = useState(false) // 是否正在拖动
  const [isResizing, setIsResizing] = useState(false) // 是否正在缩放
  const [isRotating, setIsRotating] = useState(false) // 是否正在旋转
  const [dragStartPosition, setDragStartPosition] = useState<{ x: number; y: number } | null>(null) // 拖动起始位置
  const [dragTarget, setDragTarget] = useState<"subtitle" | "onscreen" | null>(null) // 拖动目标类型
  const [dragOnscreenIndex, setDragOnscreenIndex] = useState<number | null>(null) // 拖动的画面字索引
  const videoRef = useRef<HTMLVideoElement>(null)
  const animationFrameRef = useRef<number>()
  const subtitleRef = useRef<HTMLDivElement>(null)
  const onscreenRefs = useRef<(HTMLDivElement | null)[]>([]) // 画面字ref数组

  const isPlaying = onPlayingChange ? externalIsPlaying : internalIsPlaying
  const setIsPlaying = onPlayingChange || setInternalIsPlaying

  // Simulate video playback when playing
  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now()
      const startVideoTime = currentTime

      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000 * playbackSpeed
        const newTime = startVideoTime + elapsed
        
        if (newTime >= duration) {
          setIsPlaying(false)
          onTimeChange(duration)
        } else {
          onTimeChange(newTime)
          animationFrameRef.current = requestAnimationFrame(animate)
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }
  }, [isPlaying, playbackSpeed, duration])

  // Calculate frame information
  const currentFrame = Math.floor(currentTime * DEFAULT_FRAME_RATE)
  const totalFrames = Math.floor(duration * DEFAULT_FRAME_RATE)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for arrow keys
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault()
        
        if (e.key === "ArrowLeft") {
          onFrameStep("backward")
        } else if (e.key === "ArrowRight") {
          onFrameStep("forward")
        }
      }
      
      // Space bar for play/pause
      if (e.key === " " && e.target === document.body) {
        e.preventDefault()
        handlePlayPause()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onFrameStep])

  // Sync video element with currentTime
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.1) {
      videoRef.current.currentTime = currentTime
    }
  }, [currentTime])

  // Update playing state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying])

  // Update playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  // 处理字幕和画面字的鼠标事件（拖动位置）
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartPosition || !onSubtitleStyleChange) return

      const videoContainer = videoRef.current?.parentElement?.parentElement
      if (!videoContainer) return

      const rect = videoContainer.getBoundingClientRect()

      if (isDragging && dragTarget === "subtitle") {
        // 计算新位置（相对于视频容器的百分比）
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        // 限制在0-100范围内
        const clampedX = Math.max(0, Math.min(100, x))
        const clampedY = Math.max(0, Math.min(100, y))

        onSubtitleStyleChange({
          positionX: clampedX,
          positionY: 100 - clampedY, // 转换为从底部计算的值
        })
      }

      if (isResizing) {
        // 简单的缩放逻辑：根据鼠标移动距离调整scale
        const deltaY = e.movementY
        const newScale = Math.max(0.5, Math.min(2, (subtitleStyle.scale || 1) - deltaY * 0.01))
        onSubtitleStyleChange({ scale: newScale })
      } else if (isRotating) {
        // 简单的旋转逻辑：根据鼠标移动调整rotation
        const deltaX = e.movementX
        const newRotation = ((subtitleStyle.rotation || 0) + deltaX) % 360
        onSubtitleStyleChange({ rotation: newRotation })
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setIsRotating(false)
      setIsDragging(false)
      setDragStartPosition(null)
      setDragTarget(null)
      setDragOnscreenIndex(null)
    }

    if (isResizing || isRotating || isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing, isRotating, isDragging, dragStartPosition, dragTarget, subtitleStyle, onSubtitleStyleChange])

  // 点击视频区域外关闭字幕调整框
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (subtitleRef.current && !subtitleRef.current.contains(e.target as Node)) {
        setShowSubtitleControls(false)
      }
    }

    if (showSubtitleControls) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showSubtitleControls])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      onTimeChange(videoRef.current.currentTime)
    }
  }

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleFrameBackward = () => {
    const frameStep = 1 / DEFAULT_FRAME_RATE
    const newTime = Math.max(0, currentTime - frameStep)
    onTimeChange(newTime)
    onFrameStep("backward")
  }

  const handleFrameForward = () => {
    const frameStep = 1 / DEFAULT_FRAME_RATE
    const newTime = Math.min(duration, currentTime + frameStep)
    onTimeChange(newTime)
    onFrameStep("forward")
  }

  const handleSkipBackward = () => {
    const newTime = Math.max(0, currentTime - 5)
    onTimeChange(newTime)
  }

  const handleSkipForward = () => {
    const newTime = Math.min(duration, currentTime + 5)
    onTimeChange(newTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const frames = Math.floor((seconds % 1) * DEFAULT_FRAME_RATE)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`
  }

  const formatTimeWithFrames = (seconds: number, frame: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const frames = frame % DEFAULT_FRAME_RATE
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`
  }

  // 根据aspectRatio计算实际的宽高比
  const getAspectRatioStyle = () => {
    const ratioMap: Record<string, string> = {
      "16:9": "16/9",
      "4:3": "4/3",
      "1:1": "1/1",
      "9:16": "9/16",
    }
    return ratioMap[aspectRatio] || "9/16"
  }

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      {/* Header - 标题栏，与其他面板保持一致的高度 */}
      <div className="px-3 py-2 border-b border-border shrink-0 h-[52px] flex items-center">
        <h3 className="text-sm font-semibold text-foreground">播放器</h3>
      </div>

      {/* Video container - 保持视频完整显示,两侧用背景色填充 */}
      <div className="relative flex-1 bg-black flex items-center justify-center min-h-0">
        {/* 视频容器 - 最大宽度为16:9比例 */}
        <div className="relative w-full h-full flex items-center justify-center" style={{ maxWidth: 'calc(100vh * 16 / 9)' }}>
          <div 
            className="relative w-full max-h-full"
            style={{ aspectRatio: getAspectRatioStyle() }}
          >
            {/* Video element - 使用contain保持视频完整显示 */}
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={handleVideoLoadedMetadata}
                onClick={handlePlayPause}
              />
            ) : posterImage ? (
              // Placeholder image - 使用项目对应的海报（如果提供了海报图片）
              <img
                src={posterImage}
                alt="Video placeholder"
                className="w-full h-full object-contain"
              />
            ) : (
              // 空状态 - 没有视频也没有海报图片
              <div className="w-full h-full flex items-center justify-center bg-black">
                <p className="text-muted-foreground text-sm">暂无视频</p>
              </div>
            )}

            {/* Watermark overlay - 水印层 */}
            <VideoWatermark userName={userName} />

            {/* Subtitle overlays - 多字幕层叠显示 */}
            {/* 原文字幕 - 显示在偏上位置 */}
            {subtitleVisibility.original && originalSubtitle && (
              <div
                className="absolute left-4 right-4 text-center"
                style={{
                  bottom: `${100 - subtitleStyle.verticalPosition + 8}%`, // 比译文高8%
                }}
              >
                <p
                  style={{
                    fontSize: `${subtitleStyle.fontSize}px`,
                    lineHeight: subtitleStyle.lineHeight || 1.4,
                    color: subtitleStyle.color || "#FFFFFF",
                    fontFamily: subtitleStyle.fontFamily || "Arial, sans-serif",
                    fontWeight: subtitleStyle.fontWeight || "normal",
                    fontStyle: subtitleStyle.fontStyle || "normal",
                    WebkitTextStroke: (subtitleStyle.strokeEnabled !== false) && (subtitleStyle.strokeWidth || 0) > 0
                      ? `${subtitleStyle.strokeWidth}px ${subtitleStyle.strokeColor || "#000000"}`
                      : "none",
                    textShadow: getTextShadowStyle(subtitleStyle),
                  }}
                >
                  {originalSubtitle}
                </p>
              </div>
            )}

            {/* 译文字幕 - 显示在底部位置（默认） */}
            {(subtitleVisibility.translated || !translatedSubtitle) && (translatedSubtitle || currentSubtitle) && (
              <div
                ref={subtitleRef}
                className={`absolute cursor-move ${showSubtitleControls ? 'ring-2 ring-blue-500' : ''}`}
                style={{
                  left: `${subtitleStyle.positionX ?? 50}%`,
                  bottom: `${subtitleStyle.positionY ?? subtitleStyle.verticalPosition}%`,
                  transform: `translateX(-50%) rotate(${subtitleStyle.rotation || 0}deg) scale(${subtitleStyle.scale || 1})`,
                  transformOrigin: 'center',
                  textAlign: subtitleStyle.textAlign || "center",
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSubtitleControls(true)
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  setIsDragging(true)
                  setDragTarget("subtitle")
                  setDragStartPosition({ x: e.clientX, y: e.clientY })
                }}
              >
                <p
                  style={{
                    fontSize: `${subtitleStyle.fontSize}px`,
                    lineHeight: subtitleStyle.lineHeight || 1.4,
                    letterSpacing: `${subtitleStyle.letterSpacing || 0}px`,
                    textAlign: subtitleStyle.textAlign || "center",
                    writingMode: subtitleStyle.writingMode || "horizontal-tb",
                    color: subtitleStyle.color || "#FFFFFF",
                    fontFamily: subtitleStyle.fontFamily || "Arial, sans-serif",
                    fontWeight: subtitleStyle.fontWeight || "normal",
                    fontStyle: subtitleStyle.fontStyle || "normal",
                    WebkitTextStroke: (subtitleStyle.strokeEnabled !== false) && (subtitleStyle.strokeWidth || 0) > 0
                      ? `${subtitleStyle.strokeWidth}px ${subtitleStyle.strokeColor || "#000000"}`
                      : "none",
                    textShadow: getTextShadowStyle(subtitleStyle),
                  }}
                >
                  {translatedSubtitle || currentSubtitle}
                </p>

                {/* 字幕调整控制框 */}
                {showSubtitleControls && (
                  <div
                    className="absolute inset-0 border-2 border-blue-500 pointer-events-none"
                    style={{
                      margin: '-4px',
                    }}
                  >
                    {/* 四个角的缩放手柄 */}
                    <div
                      className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize pointer-events-auto"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setIsResizing(true)
                      }}
                    />
                    <div
                      className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-nesw-resize pointer-events-auto"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setIsResizing(true)
                      }}
                    />
                    <div
                      className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-nesw-resize pointer-events-auto"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setIsResizing(true)
                      }}
                    />
                    <div
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize pointer-events-auto"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setIsResizing(true)
                      }}
                    />

                    {/* 旋转手柄 */}
                    <div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full cursor-grab pointer-events-auto"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setIsRotating(true)
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 画面字 - 显示在顶部位置，支持拖动 */}
            {subtitleVisibility.onscreen && onscreenTexts.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {onscreenTexts.map((item, index) => (
                  <div
                    key={index}
                    ref={(el) => {
                      if (onscreenRefs.current) {
                        onscreenRefs.current[index] = el
                      }
                    }}
                    className="absolute cursor-move pointer-events-auto"
                    style={{
                      left: `${subtitleStyle.positionX ?? 50}%`,
                      top: item.type === "标题" ? "20%" : "15%", // 根据类型调整位置
                      transform: `translateX(-50%) rotate(${subtitleStyle.rotation || 0}deg) scale(${subtitleStyle.scale || 1})`,
                      transformOrigin: 'center',
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      setIsDragging(true)
                      setDragTarget("onscreen")
                      setDragOnscreenIndex(index)
                      setDragStartPosition({ x: e.clientX, y: e.clientY })
                    }}
                  >
                    <p
                      style={{
                        fontSize: `${subtitleStyle.fontSize + 4}px`, // 画面字稍大
                        lineHeight: subtitleStyle.lineHeight || 1.2,
                        letterSpacing: `${subtitleStyle.letterSpacing || 0}px`,
                        color: subtitleStyle.color || "#FFFFFF",
                        fontFamily: subtitleStyle.fontFamily || "Arial, sans-serif",
                        fontWeight: subtitleStyle.fontWeight || "bold",
                        fontStyle: subtitleStyle.fontStyle || "normal",
                        WebkitTextStroke: (subtitleStyle.strokeEnabled !== false) && (subtitleStyle.strokeWidth || 0) > 0
                          ? `${subtitleStyle.strokeWidth}px ${subtitleStyle.strokeColor || "#000000"}`
                          : "none",
                        textShadow: getTextShadowStyle(subtitleStyle),
                      }}
                    >
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Play button overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  onClick={handlePlayPause}
                >
                  <Play className="w-8 h-8" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls - 极简布局 */}
      <div className="p-1.5 space-y-0.5 border-t border-border shrink-0">
        {/* Progress bar - 使用暗色调 */}
        <Slider
          value={[currentTime]}
          max={duration}
          step={0.1}
          onValueChange={([value]) => onTimeChange(value)}
          className="w-full [&_[data-slot=slider-thumb]]:bg-black [&_[data-slot=slider-thumb]]:dark:bg-gray-800 [&_[data-slot=slider-thumb]]:border-black [&_[data-slot=slider-thumb]]:dark:border-gray-800 [&_[data-slot=slider-thumb]]:size-2.5"
        />

        {/* Playback controls - 极简单行布局 */}
        <div className="flex items-center justify-between">
          {/* 左侧：当前时间 / 总时间 */}
          <div className="flex items-center gap-1 text-[9px] font-mono">
            <span className="text-blue-500">{formatTimeWithFrames(currentTime, currentFrame)}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{formatTimeWithFrames(duration, totalFrames)}</span>
          </div>

          {/* 中间：播放按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={handlePlayPause}
            title="播放/暂停 (Space)"
          >
            {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
          </Button>

          {/* 右侧：控制组 */}
          <div className="flex items-center gap-1">
            {/* 缩放按钮（放大镜图标） - 点击弹出滑动条 */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4"
                  title="缩放"
                >
                  <ZoomIn className="w-2.5 h-2.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-2" align="end">
                <div className="space-y-1">
                  <div className="text-[9px] text-muted-foreground text-center">
                    缩放: {videoScale}%
                  </div>
                  <Slider
                    value={[videoScale]}
                    min={50}
                    max={150}
                    step={5}
                    onValueChange={([value]) => setVideoScale(value)}
                    className="w-full"
                  />
                </div>
              </PopoverContent>
            </Popover>

            {/* 比例选择 */}
            <Select
              value={aspectRatio}
              onValueChange={(value) => setAspectRatio(value)}
            >
              <SelectTrigger className="w-14 h-4 text-[9px] bg-transparent border-border px-1">
                <SelectValue placeholder="比例" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9</SelectItem>
                <SelectItem value="4:3">4:3</SelectItem>
                <SelectItem value="1:1">1:1</SelectItem>
                <SelectItem value="9:16">9:16</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
