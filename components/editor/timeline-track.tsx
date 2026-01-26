"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface SubtitleBlock {
  id: string
  startTime: number
  endTime: number
  text: string
  track: "original" | "translated"
}

interface TimelineTrackProps {
  subtitles: SubtitleBlock[]
  duration: number
  currentTime: number
  selectedId: string | null
  onSelectSubtitle: (id: string) => void
  onTimeChange: (time: number) => void
  trackLabel: string
  trackColor: string
  showRuler?: boolean
}

export function TimelineTrack({
  subtitles,
  duration,
  currentTime,
  selectedId,
  onSelectSubtitle,
  onTimeChange,
  trackLabel,
  trackColor,
  showRuler = true,
}: TimelineTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const pixelsPerSecond = 100

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (trackRef.current && e.target === trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left + trackRef.current.scrollLeft
      const time = x / pixelsPerSecond
      onTimeChange(Math.min(time, duration))
    }
  }

  const handleSubtitleClick = (id: string, startTime: number) => {
    onSelectSubtitle(id)
    onTimeChange(startTime)
  }

  // Auto-scroll to current time
  useEffect(() => {
    if (trackRef.current) {
      const currentPosition = currentTime * pixelsPerSecond
      const containerWidth = trackRef.current.clientWidth
      const scrollLeft = trackRef.current.scrollLeft
      
      // Scroll if playhead is near edges
      if (currentPosition < scrollLeft + 100) {
        trackRef.current.scrollLeft = Math.max(0, currentPosition - containerWidth / 2)
      } else if (currentPosition > scrollLeft + containerWidth - 100) {
        trackRef.current.scrollLeft = currentPosition - containerWidth / 2
      }
    }
  }, [currentTime, pixelsPerSecond])

  return (
    <div className="flex border-b border-border">
      {/* Track label */}
      <div className="w-24 shrink-0 flex items-center justify-center px-2 py-2 bg-muted/30 border-r border-border">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", trackColor)} />
          <span className="text-xs font-medium text-foreground">{trackLabel}</span>
        </div>
      </div>

      {/* Track content */}
      <div
        ref={trackRef}
        className="relative flex-1 h-12 overflow-x-auto overflow-y-hidden bg-card cursor-pointer"
        onClick={handleTrackClick}
      >
        {/* Subtitle blocks */}
        <div className="absolute inset-0">
          {subtitles.map((subtitle) => {
            const left = subtitle.startTime * pixelsPerSecond
            const width = (subtitle.endTime - subtitle.startTime) * pixelsPerSecond
            const isSelected = subtitle.id === selectedId

            return (
              <div
                key={subtitle.id}
                className={cn(
                  "absolute top-1 h-10 rounded border-2 cursor-pointer transition-all overflow-hidden",
                  isSelected
                    ? "border-primary bg-primary/20 shadow-lg z-10"
                    : "border-border bg-primary/10 hover:bg-primary/15"
                )}
                style={{
                  left: `${left}px`,
                  width: `${width}px`,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSubtitleClick(subtitle.id, subtitle.startTime)
                }}
              >
                <div className="px-2 py-1 h-full flex items-center">
                  <p className="text-xs text-foreground truncate">{subtitle.text}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
          style={{ left: `${currentTime * pixelsPerSecond}px` }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
        </div>

        {/* Track width spacer */}
        <div style={{ width: `${duration * pixelsPerSecond}px`, height: "1px" }} />
      </div>
    </div>
  )
}
