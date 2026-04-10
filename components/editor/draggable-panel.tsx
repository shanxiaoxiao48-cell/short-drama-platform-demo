"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { GripHorizontal, Minimize2, Maximize2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PanelConfig {
  id: string
  title: string
  x: number
  y: number
  width: number
  height: number
  minWidth?: number
  minHeight?: number
  visible: boolean
  minimized: boolean
  zIndex: number
}

interface DraggablePanelProps {
  config: PanelConfig
  onConfigChange: (config: PanelConfig) => void
  onBringToFront: () => void
  onClose?: () => void
  children: React.ReactNode
  className?: string
  containerBounds?: { width: number; height: number }
  siblingPanels?: PanelConfig[]
}

export function DraggablePanel({ config, onConfigChange, onBringToFront, onClose, children, className, containerBounds, siblingPanels }: DraggablePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0, pw: 0, ph: 0 })

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input") || (e.target as HTMLElement).closest("textarea")) return
    e.preventDefault()
    setIsDragging(true)
    onBringToFront()
    dragStart.current = { x: e.clientX, y: e.clientY, px: config.x, py: config.y, pw: config.width, ph: config.height }
  }, [config.x, config.y, onBringToFront])

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(direction)
    onBringToFront()
    dragStart.current = { x: e.clientX, y: e.clientY, px: config.x, py: config.y, pw: config.width, ph: config.height }
  }, [config.x, config.y, config.width, config.height, onBringToFront])

  useEffect(() => {
    if (!isDragging && !isResizing) return
    const SNAP = 8 // snap threshold in px

    const snap = (val: number, targets: number[]): number => {
      for (const t of targets) {
        if (Math.abs(val - t) < SNAP) return t
      }
      return val
    }

    const getSnapTargets = () => {
      const xTargets: number[] = [0]
      const yTargets: number[] = [0]
      if (containerBounds) {
        xTargets.push(containerBounds.width)
        yTargets.push(containerBounds.height)
      }
      if (siblingPanels) {
        for (const p of siblingPanels) {
          if (p.id === config.id || !p.visible || p.minimized) continue
          xTargets.push(p.x, p.x + p.width)
          yTargets.push(p.y, p.y + p.height)
        }
      }
      return { xTargets, yTargets }
    }

    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      const { xTargets, yTargets } = getSnapTargets()

      if (isDragging) {
        let nx = dragStart.current.px + dx
        let ny = dragStart.current.py + dy
        nx = snap(nx, xTargets)
        ny = snap(ny, yTargets)
        // Also snap right/bottom edges
        const cw = containerBounds?.width || 9999
        const ch = containerBounds?.height || 9999
        const snapR = snap(nx + config.width, xTargets)
        if (snapR !== nx + config.width) nx = snapR - config.width
        const snapB = snap(ny + config.height, yTargets)
        if (snapB !== ny + config.height) ny = snapB - config.height
        onConfigChange({ ...config, x: Math.max(0, nx), y: Math.max(0, ny) })
      } else if (isResizing) {
        const minW = config.minWidth || 200
        const minH = config.minHeight || 120
        let { px, py, pw, ph } = dragStart.current
        if (isResizing.includes("e")) { let nw = pw + dx; nw = snap(px + nw, xTargets) - px; pw = Math.max(minW, nw) }
        if (isResizing.includes("s")) { let nh = ph + dy; nh = snap(py + nh, yTargets) - py; ph = Math.max(minH, nh) }
        if (isResizing.includes("w")) { let nw = Math.max(minW, pw - dx); let nx = px + (pw - nw); nx = snap(nx, xTargets); nw = px + pw - nx; px = nx; pw = Math.max(minW, nw) }
        if (isResizing.includes("n")) { let nh = Math.max(minH, ph - dy); let ny = py + (ph - nh); ny = snap(ny, yTargets); nh = py + ph - ny; py = ny; ph = Math.max(minH, nh) }
        onConfigChange({ ...config, x: Math.max(0, px), y: Math.max(0, py), width: pw, height: ph })
      }
    }
    const handleUp = () => { setIsDragging(false); setIsResizing(null) }
    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseup", handleUp)
    return () => { document.removeEventListener("mousemove", handleMove); document.removeEventListener("mouseup", handleUp) }
  }, [isDragging, isResizing, config, onConfigChange, containerBounds, siblingPanels])

  if (!config.visible) return null

  if (config.minimized) {
    return (
      <div
        className="absolute bg-card border border-border rounded-md shadow-lg flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
        style={{ left: config.x, top: config.y, zIndex: config.zIndex }}
        onClick={() => { onConfigChange({ ...config, minimized: false }); onBringToFront() }}
      >
        <GripHorizontal className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs font-medium">{config.title}</span>
        <Maximize2 className="w-3 h-3 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div
      ref={panelRef}
      className={cn("absolute bg-card border border-border rounded-lg shadow-xl flex flex-col overflow-hidden", isDragging && "opacity-90 shadow-2xl", className)}
      style={{ left: config.x, top: config.y, width: config.width, height: config.height, zIndex: config.zIndex }}
      onMouseDown={() => onBringToFront()}
    >
      {/* Title bar */}
      <div className="shrink-0 h-8 bg-muted/50 border-b border-border flex items-center justify-between px-2 cursor-move select-none" onMouseDown={handleDragStart}>
        <div className="flex items-center gap-1.5">
          <GripHorizontal className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">{config.title}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onConfigChange({ ...config, minimized: true })}><Minimize2 className="w-3 h-3" /></Button>
          {onClose && <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onClose}><X className="w-3 h-3" /></Button>}
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-hidden">{children}</div>
      {/* Resize handles */}
      <div className="absolute top-0 left-0 w-1 h-full cursor-w-resize" onMouseDown={e => handleResizeStart(e, "w")} />
      <div className="absolute top-0 right-0 w-1 h-full cursor-e-resize" onMouseDown={e => handleResizeStart(e, "e")} />
      <div className="absolute bottom-0 left-0 w-full h-1 cursor-s-resize" onMouseDown={e => handleResizeStart(e, "s")} />
      <div className="absolute top-0 left-0 w-full h-1 cursor-n-resize" onMouseDown={e => handleResizeStart(e, "n")} />
      <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" onMouseDown={e => handleResizeStart(e, "se")} />
      <div className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize" onMouseDown={e => handleResizeStart(e, "sw")} />
      <div className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize" onMouseDown={e => handleResizeStart(e, "ne")} />
      <div className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize" onMouseDown={e => handleResizeStart(e, "nw")} />
    </div>
  )
}

export type { PanelConfig }
