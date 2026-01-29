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
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Maximize,
  RotateCcw,
} from "lucide-react"
import { VideoWatermark } from "./video-watermark"

interface SubtitleStyle {
  fontSize: number
  verticalPosition: number
  lineBreakRule?: "auto" | "manual" | "character-limit"
  maxCharactersPerLine?: number
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
}

const DEFAULT_FRAME_RATE = 30 // 30 fps
const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]

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
}: VideoPlayerPanelProps) {
  const [internalIsPlaying, setInternalIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [duration, setDuration] = useState(externalDuration)
  const videoRef = useRef<HTMLVideoElement>(null)
  const animationFrameRef = useRef<number>()

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
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatFrame = (frame: number) => {
    return frame.toString().padStart(5, "0")
  }

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      {/* Video container - 9:16 aspect ratio */}
      <div className="relative flex-1 bg-black flex items-center justify-center min-h-0">
        <div className="relative w-full aspect-[9/16] max-h-full">
          {/* Video element */}
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              onTimeUpdate={handleVideoTimeUpdate}
              onLoadedMetadata={handleVideoLoadedMetadata}
              onClick={handlePlayPause}
            />
          ) : (
            // Placeholder image - 使用项目对应的海报
            <img
              src={posterImage}
              alt="Video placeholder"
              className="w-full h-full object-cover"
            />
          )}

          {/* Watermark overlay - 水印层 */}
          <VideoWatermark userName={userName} />

          {/* Subtitle overlay */}
          {currentSubtitle && (
            <div
              className="absolute left-4 right-4 text-center"
              style={{
                bottom: `${100 - subtitleStyle.verticalPosition}%`,
              }}
            >
              <p
                className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                style={{
                  fontSize: `${subtitleStyle.fontSize}px`,
                  lineHeight: 1.4,
                }}
              >
                {currentSubtitle}
              </p>
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

      {/* Controls */}
      <div className="p-2 space-y-2 border-t border-border shrink-0">
        {/* Progress bar - 使用暗色调 */}
        <div className="space-y-1">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={([value]) => onTimeChange(value)}
            className="w-full [&_[data-slot=slider-thumb]]:bg-black [&_[data-slot=slider-thumb]]:dark:bg-gray-800 [&_[data-slot=slider-thumb]]:border-black [&_[data-slot=slider-thumb]]:dark:border-gray-800 [&_[data-slot=slider-thumb]]:size-3"
          />
        </div>

        {/* Time display */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span className="font-mono text-[10px]">
            Frame: {formatFrame(currentFrame)} / {formatFrame(totalFrames)}
          </span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-between">
          {/* Left controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleSkipBackward}
              title="后退5秒"
            >
              <SkipBack className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleFrameBackward}
              title="后退一帧 (←)"
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handlePlayPause}
              title="播放/暂停 (Space)"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleFrameForward}
              title="前进一帧 (→)"
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleSkipForward}
              title="前进5秒"
            >
              <SkipForward className="w-3 h-3" />
            </Button>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5">
            {/* Playback speed */}
            <Select
              value={playbackSpeed.toString()}
              onValueChange={(value) => setPlaybackSpeed(parseFloat(value))}
            >
              <SelectTrigger className="w-16 h-7 text-xs bg-transparent border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAYBACK_SPEEDS.map((speed) => (
                  <SelectItem key={speed} value={speed.toString()}>
                    {speed}x
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Reset */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onTimeChange(0)}
              title="重置到开始"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3 h-3 text-muted-foreground" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={([value]) => {
                  setVolume(value)
                  if (videoRef.current) {
                    videoRef.current.volume = value / 100
                  }
                }}
                className="w-12"
              />
            </div>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.requestFullscreen()
                }
              }}
              title="全屏"
            >
              <Maximize className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
