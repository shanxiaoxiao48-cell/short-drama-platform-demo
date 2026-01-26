"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  RotateCcw,
} from "lucide-react"

interface VideoPreviewProps {
  currentTime: number
  onTimeChange: (time: number) => void
  selectedSubtitleId: string | null
}

export function VideoPreview({ currentTime, onTimeChange, selectedSubtitleId }: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const duration = 180 // 3 minutes

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col h-full">
      {/* Video container - 9:16 aspect ratio */}
      <div className="relative flex-1 bg-black flex items-center justify-center">
        <div className="relative w-full aspect-[9/16] max-h-full bg-muted/20">
          {/* Video placeholder */}
          <img
            src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=360&h=640&fit=crop"
            alt="Video frame"
            className="w-full h-full object-cover"
          />

          {/* Subtitle overlay */}
          <div className="absolute bottom-16 left-4 right-4 text-center">
            <div className="bg-black/70 rounded px-3 py-2 inline-block">
              <p className="text-white text-sm">I love you more than anything</p>
            </div>
          </div>

          {/* Play button overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setIsPlaying(true)}
              >
                <Play className="w-8 h-8" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 space-y-3 border-t border-border">
        {/* Progress bar */}
        <div className="space-y-1">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={([value]) => onTimeChange(value)}
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={([value]) => setVolume(value)}
                className="w-16"
              />
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
