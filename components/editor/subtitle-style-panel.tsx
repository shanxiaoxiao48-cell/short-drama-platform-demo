"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, ChevronDown, ChevronUp,
  Type,
  ArrowUpDown, ArrowLeftRight,
  Sparkles, Zap, Wind, Sun, Moon, Waves
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface SubtitleStyle {
  fontSize: number
  verticalPosition: number
  positionX?: number
  positionY?: number
  lineBreakRule?: "auto" | "manual" | "character-limit"
  maxCharactersPerLine?: number
  fontFamily?: string
  color?: string
  fontWeight?: "normal" | "bold"
  fontStyle?: "normal" | "italic"
  strokeColor?: string
  strokeWidth?: number
  strokeEnabled?: boolean
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
  shadowOpacity?: number
  shadowEnabled?: boolean
  backgroundColor?: string
  backgroundOpacity?: number
  lineHeight?: number
  letterSpacing?: number
  textAlign?: "left" | "center" | "right"
  verticalAlign?: "top" | "middle" | "bottom"
  writingMode?: "horizontal-tb" | "vertical-rl"
  rotation?: number
  scale?: number
  applyToAll?: boolean
  animationEffect?: "none" | "fade-in" | "fade-out" | "fade-in-out" | "slide-up" | "slide-down" | "zoom-in" | "bounce" | "shake"
  animationDuration?: number
}

interface SubtitleStylePanelProps {
  subtitleStyle: SubtitleStyle
  onStyleChange: (style: SubtitleStyle) => void
  showStylePanel?: boolean
  currentSubtitleId?: string
  subtitleCount?: number
}

// 预设颜色
const presetColors = [
  "#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080",
  "#FFC0CB", "#A52A2A", "#808080", "#FFD700", "#4B0082",
  "#006400", "#8B4513", "#2F4F4F", "#800000", "#4682B4",
  "#FFFFFF", "#F5F5F5", "#E0E0E0", "#BDBDBD", "#9E9E9E"
]

// 自定义颜色存储
const getCustomColors = (): string[] => {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('customColors')
  return stored ? JSON.parse(stored) : []
}

const saveCustomColor = (color: string) => {
  const customColors = getCustomColors()
  if (!customColors.includes(color)) {
    customColors.unshift(color)
    if (customColors.length > 10) customColors.pop()
    localStorage.setItem('customColors', JSON.stringify(customColors))
  }
}

// 数值输入框组件 - 箭头在右侧
function NumberInput({
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = "",
  className = ""
}: {
  value: number
  min: number
  max: number
  step?: number
  onChange: (val: number) => void
  suffix?: string
  className?: string
}) {
  const [inputValue, setInputValue] = useState(value.toString())

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    if (!isNaN(val) && val >= min && val <= max) {
      onChange(val)
      setInputValue(e.target.value)
    }
  }

  const handleIncrement = () => {
    const newVal = Math.min(max, value + step)
    onChange(newVal)
    setInputValue(newVal.toString())
  }

  const handleDecrement = () => {
    const newVal = Math.max(min, value - step)
    onChange(newVal)
    setInputValue(newVal.toString())
  }

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center border border-input rounded overflow-hidden">
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          className="w-8 h-6 text-[10px] text-center border-0 focus:outline-none"
        />
        <div className="flex flex-col border-l border-input">
          <button
            type="button"
            onClick={handleIncrement}
            className="px-1 h-3 hover:bg-muted text-[8px] leading-none"
          >
            <ChevronUp className="h-2 w-2" />
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            className="px-1 h-3 hover:bg-muted text-[8px] leading-none border-t border-input"
          >
            <ChevronDown className="h-2 w-2" />
          </button>
        </div>
      </div>
      {suffix && <span className="text-[10px] text-muted-foreground ml-1">{suffix}</span>}
    </div>
  )
}

// 颜色选择器组件
function ColorPicker({
  value,
  onChange,
  disabled = false
}: {
  value: string
  onChange: (color: string) => void
  disabled?: boolean
}) {
  const [customColors] = useState<string[]>(getCustomColors())

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-7 w-12 p-0.5", disabled && "opacity-50")}
          disabled={disabled}
        >
          <div
            className="w-full h-full rounded"
            style={{ backgroundColor: value }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        {/* 颜色预览和输入 */}
        <div className="flex items-center gap-2 mb-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-8 rounded cursor-pointer border-0 p-0"
          />
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-[10px] font-mono flex-1"
          />
        </div>

        {/* 预设颜色 */}
        <div className="space-y-1">
          <Label className="text-[9px] text-muted-foreground">预设颜色</Label>
          <div className="grid grid-cols-5 gap-1">
            {presetColors.map((color, index) => (
              <button
                key={index}
                type="button"
                className={cn(
                  "w-8 h-8 rounded border border-border hover:scale-110 transition-transform",
                  value === color && "ring-2 ring-primary ring-offset-1"
                )}
                style={{ backgroundColor: color }}
                onClick={() => onChange(color)}
              />
            ))}
          </div>
        </div>

        {/* 自定义颜色 */}
        {customColors.length > 0 && (
          <div className="space-y-1 mt-2">
            <Label className="text-[9px] text-muted-foreground">自定义颜色</Label>
            <div className="grid grid-cols-5 gap-1">
              {customColors.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded border border-border hover:scale-110 transition-transform",
                    value === color && "ring-2 ring-primary ring-offset-1"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => onChange(color)}
                />
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// 滑块+数值输入组合
function SliderWithInput({
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = "",
  className = ""
}: {
  value: number
  min: number
  max: number
  step?: number
  onChange: (val: number) => void
  unit?: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2 flex-1", className)}>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="flex-1 h-1.5 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
      />
      <NumberInput
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        suffix={unit}
      />
    </div>
  )
}

// 可折叠区域组件
function CollapsibleSection({
  title,
  checked,
  onCheckedChange,
  defaultExpanded = true,
  children
}: {
  title: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  defaultExpanded?: boolean
  children: React.ReactNode
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-start gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={checked}
            onCheckedChange={onCheckedChange}
            className="h-4 w-4"
          />
          <span className={cn("text-[10px]", !checked && "text-muted-foreground")}>{title}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 -ml-1"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>
      {expanded && (
        <div className={cn("space-y-2 pl-6", !checked && "opacity-50 pointer-events-none")}>
          {children}
        </div>
      )}
    </div>
  )
}

export function SubtitleStylePanel({
  subtitleStyle,
  onStyleChange,
  showStylePanel = true,
  currentSubtitleId,
  subtitleCount = 0,
}: SubtitleStylePanelProps) {
  if (!showStylePanel) {
    return null
  }

  const fontFamilies = [
    { value: "Arial, sans-serif", label: "Arial" },
    { value: "'Microsoft YaHei', sans-serif", label: "微软雅黑" },
    { value: "'SimHei', sans-serif", label: "黑体" },
    { value: "'SimSun', serif", label: "宋体" },
    { value: "'KaiTi', serif", label: "楷体" },
    { value: "'PingFang SC', sans-serif", label: "苹方" },
  ]

  const animationEffects = [
    { value: "none", label: "无效果", icon: Type },
    { value: "fade-in", label: "渐入", icon: Sun },
    { value: "fade-out", label: "渐出", icon: Moon },
    { value: "fade-in-out", label: "渐入渐出", icon: Sparkles },
    { value: "slide-up", label: "上滑", icon: ArrowUpDown },
    { value: "slide-down", label: "下滑", icon: ArrowLeftRight },
    { value: "zoom-in", label: "放大", icon: Zap },
    { value: "bounce", label: "弹跳", icon: Waves },
    { value: "shake", label: "抖动", icon: Wind },
  ]

  const applyToAll = subtitleStyle.applyToAll !== false
  const isVertical = subtitleStyle.writingMode === "vertical-rl"

  return (
    <div className="h-full flex flex-col">
      {!applyToAll && currentSubtitleId && (
        <div className="text-[10px] text-muted-foreground bg-muted/50 rounded px-2 py-1 mb-2 shrink-0">
          调整第 {currentSubtitleId} 条 {subtitleCount > 0 && `(共${subtitleCount}条)`}
        </div>
      )}

      <Tabs defaultValue="basic" className="flex-1 overflow-hidden flex flex-col">
        <TabsList className="grid w-full grid-cols-2 h-7 shrink-0">
          <TabsTrigger value="basic" className="text-[10px]">基础设置</TabsTrigger>
          <TabsTrigger value="animation" className="text-[10px]">动效</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="flex-1 overflow-auto mt-2 custom-scrollbar">
          <div className="px-3 space-y-3 pb-2">
            {/* 字体 */}
            <div className="flex items-center gap-2">
              <Label className="text-[10px] w-8 shrink-0">字体</Label>
              <Select
                value={subtitleStyle.fontFamily || "Arial, sans-serif"}
                onValueChange={(value) => onStyleChange({ ...subtitleStyle, fontFamily: value })}
              >
                <SelectTrigger className="h-7 text-[10px] flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.value} value={font.value} className="text-[10px]">
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 字号 */}
            <div className="flex items-center gap-2">
              <Label className="text-[10px] w-8 shrink-0">字号</Label>
              <SliderWithInput
                value={subtitleStyle.fontSize}
                min={5}
                max={300}
                onChange={(v) => onStyleChange({ ...subtitleStyle, fontSize: v })}
                unit="px"
              />
            </div>

            {/* 样式 */}
            <div className="flex items-center gap-2">
              <Label className="text-[10px] w-8 shrink-0">样式</Label>
              <div className="flex gap-1">
                <Button
                  variant={subtitleStyle.fontWeight === "bold" ? "default" : "outline"}
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onStyleChange({ ...subtitleStyle, fontWeight: subtitleStyle.fontWeight === "bold" ? "normal" : "bold" })}
                  title="加粗"
                >
                  <Bold className="h-3 w-3" />
                </Button>
                <Button
                  variant={subtitleStyle.fontStyle === "italic" ? "default" : "outline"}
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onStyleChange({ ...subtitleStyle, fontStyle: subtitleStyle.fontStyle === "italic" ? "normal" : "italic" })}
                  title="倾斜"
                >
                  <Italic className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* 颜色 */}
            <div className="flex items-center gap-2">
              <Label className="text-[10px] w-8 shrink-0">颜色</Label>
              <ColorPicker
                value={subtitleStyle.color || "#FFFFFF"}
                onChange={(color) => {
                  saveCustomColor(color)
                  onStyleChange({ ...subtitleStyle, color })
                }}
              />
            </div>

            {/* 字间距 + 行间距 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-[10px] shrink-0">字间距</Label>
                <NumberInput
                  value={Math.round((subtitleStyle.letterSpacing || 0) * 10)}
                  min={-10}
                  max={100}
                  onChange={(v) => onStyleChange({ ...subtitleStyle, letterSpacing: v / 10 })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-[10px] shrink-0">行间距</Label>
                <NumberInput
                  value={Math.round((subtitleStyle.lineHeight || 1.4) * 10)}
                  min={10}
                  max={100}
                  onChange={(v) => onStyleChange({ ...subtitleStyle, lineHeight: v / 10 })}
                />
              </div>
            </div>

            {/* 对齐方式 */}
            <div className="flex items-center gap-2">
              <Label className="text-[10px] shrink-0">对齐方式</Label>
              <div className="flex gap-0.5 flex-1">
                <Button
                  variant={!isVertical && subtitleStyle.textAlign === "left" ? "default" : "outline"}
                  size="sm"
                  className="h-5 w-6 p-0"
                  onClick={() => onStyleChange({ ...subtitleStyle, textAlign: "left", writingMode: "horizontal-tb" })}
                  title="左对齐"
                >
                  <AlignLeft className="h-2.5 w-2.5" />
                </Button>
                <Button
                  variant={!isVertical && (subtitleStyle.textAlign === "center" || !subtitleStyle.textAlign) ? "default" : "outline"}
                  size="sm"
                  className="h-5 w-6 p-0"
                  onClick={() => onStyleChange({ ...subtitleStyle, textAlign: "center", writingMode: "horizontal-tb" })}
                  title="居中"
                >
                  <AlignCenter className="h-2.5 w-2.5" />
                </Button>
                <Button
                  variant={!isVertical && subtitleStyle.textAlign === "right" ? "default" : "outline"}
                  size="sm"
                  className="h-5 w-6 p-0"
                  onClick={() => onStyleChange({ ...subtitleStyle, textAlign: "right", writingMode: "horizontal-tb" })}
                  title="右对齐"
                >
                  <AlignRight className="h-2.5 w-2.5" />
                </Button>
                <div className="w-px h-5 bg-border mx-0.5" />
                <Button
                  variant={isVertical && subtitleStyle.verticalAlign === "top" ? "default" : "outline"}
                  size="sm"
                  className="h-5 w-6 p-0"
                  onClick={() => onStyleChange({ ...subtitleStyle, verticalAlign: "top", writingMode: "vertical-rl" })}
                  title="顶部对齐"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-2.5 w-2.5">
                    <line x1="5" y1="4" x2="5" y2="14" />
                    <line x1="12" y1="4" x2="12" y2="14" />
                    <line x1="19" y1="4" x2="19" y2="14" />
                  </svg>
                </Button>
                <Button
                  variant={isVertical && (subtitleStyle.verticalAlign === "middle" || !subtitleStyle.verticalAlign) ? "default" : "outline"}
                  size="sm"
                  className="h-5 w-6 p-0"
                  onClick={() => onStyleChange({ ...subtitleStyle, verticalAlign: "middle", writingMode: "vertical-rl" })}
                  title="居中对齐"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-2.5 w-2.5">
                    <line x1="5" y1="2" x2="5" y2="22" />
                    <line x1="12" y1="2" x2="12" y2="22" />
                    <line x1="19" y1="2" x2="19" y2="22" />
                  </svg>
                </Button>
                <Button
                  variant={isVertical && subtitleStyle.verticalAlign === "bottom" ? "default" : "outline"}
                  size="sm"
                  className="h-5 w-6 p-0"
                  onClick={() => onStyleChange({ ...subtitleStyle, verticalAlign: "bottom", writingMode: "vertical-rl" })}
                  title="底部对齐"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-2.5 w-2.5">
                    <line x1="5" y1="10" x2="5" y2="20" />
                    <line x1="12" y1="10" x2="12" y2="20" />
                    <line x1="19" y1="10" x2="19" y2="20" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* 缩放 */}
            <div className="flex items-center gap-2">
              <Label className="text-[10px] w-8 shrink-0">缩放</Label>
              <SliderWithInput
                value={Math.round((subtitleStyle.scale || 1) * 100)}
                min={50}
                max={200}
                onChange={(v) => onStyleChange({ ...subtitleStyle, scale: v / 100 })}
                unit="%"
              />
            </div>

            {/* 位置 */}
            <div className="flex items-center gap-2">
              <Label className="text-[10px] w-8 shrink-0">位置</Label>
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-[9px] text-muted-foreground">X</span>
                  <NumberInput
                    value={Math.round(subtitleStyle.positionX ?? 50)}
                    min={0}
                    max={100}
                    onChange={(v) => onStyleChange({ ...subtitleStyle, positionX: v })}
                    suffix="%"
                  />
                </div>
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-[9px] text-muted-foreground">Y</span>
                  <NumberInput
                    value={Math.round(subtitleStyle.positionY ?? subtitleStyle.verticalPosition)}
                    min={0}
                    max={100}
                    onChange={(v) => onStyleChange({ ...subtitleStyle, positionY: v })}
                    suffix="%"
                  />
                </div>
              </div>
            </div>

            {/* 描边 */}
            <CollapsibleSection
              title="描边"
              checked={subtitleStyle.strokeEnabled !== false}
              onCheckedChange={(v) => onStyleChange({ ...subtitleStyle, strokeEnabled: v })}
              defaultExpanded={false}
            >
              <div className="flex items-center gap-2">
                <Label className="text-[10px] w-8 shrink-0">颜色</Label>
                <ColorPicker
                  value={subtitleStyle.strokeColor || "#000000"}
                  onChange={(color) => {
                    saveCustomColor(color)
                    onStyleChange({ ...subtitleStyle, strokeColor: color })
                  }}
                  disabled={subtitleStyle.strokeEnabled === false}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-[10px] w-8 shrink-0">粗细</Label>
                <SliderWithInput
                  value={Math.round((subtitleStyle.strokeWidth || 0) * 10)}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(v) => onStyleChange({ ...subtitleStyle, strokeWidth: v / 10 })}
                />
              </div>
            </CollapsibleSection>

            {/* 阴影 */}
            <CollapsibleSection
              title="阴影"
              checked={subtitleStyle.shadowEnabled !== false}
              onCheckedChange={(v) => onStyleChange({ ...subtitleStyle, shadowEnabled: v })}
              defaultExpanded={false}
            >
              <div className="flex items-center gap-2">
                <Label className="text-[10px] w-8 shrink-0">颜色</Label>
                <ColorPicker
                  value={subtitleStyle.shadowColor || "#000000"}
                  onChange={(color) => {
                    saveCustomColor(color)
                    onStyleChange({ ...subtitleStyle, shadowColor: color })
                  }}
                  disabled={subtitleStyle.shadowEnabled === false}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-[10px] w-16 shrink-0">不透明度</Label>
                <SliderWithInput
                  value={Math.round((subtitleStyle.shadowOpacity || 90) * 10)}
                  min={0}
                  max={100}
                  onChange={(v) => onStyleChange({ ...subtitleStyle, shadowOpacity: v / 10 })}
                  unit="%"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-[10px] w-16 shrink-0">模糊度</Label>
                <SliderWithInput
                  value={Math.round(subtitleStyle.shadowBlur || 15)}
                  min={0}
                  max={50}
                  onChange={(v) => onStyleChange({ ...subtitleStyle, shadowBlur: v })}
                  unit="px"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-[10px] w-16 shrink-0">距离</Label>
                <SliderWithInput
                  value={Math.round(subtitleStyle.shadowOffsetY || 5)}
                  min={-30}
                  max={30}
                  onChange={(v) => onStyleChange({ ...subtitleStyle, shadowOffsetY: v })}
                  unit="px"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-[10px] w-16 shrink-0">角度</Label>
                <SliderWithInput
                  value={Math.round(subtitleStyle.shadowOffsetX || -45)}
                  min={-360}
                  max={360}
                  onChange={(v) => onStyleChange({ ...subtitleStyle, shadowOffsetX: v })}
                  unit="°"
                />
              </div>
            </CollapsibleSection>
          </div>
        </TabsContent>

        <TabsContent value="animation" className="flex-1 overflow-auto mt-2 custom-scrollbar">
          <div className="px-3 space-y-3 pb-2">
            <div className="grid grid-cols-3 gap-2">
              {animationEffects.map((effect) => {
                const Icon = effect.icon
                return (
                  <Button
                    key={effect.value}
                    variant={subtitleStyle.animationEffect === effect.value ? "default" : "outline"}
                    size="sm"
                    className="h-12 flex flex-col items-center gap-1"
                    onClick={() => onStyleChange({ ...subtitleStyle, animationEffect: effect.value as any })}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[9px]">{effect.label}</span>
                  </Button>
                )
              })}
            </div>

            {subtitleStyle.animationEffect && subtitleStyle.animationEffect !== "none" && (
              <div className="flex items-center gap-2">
                <Label className="text-[10px] w-16 shrink-0">动效时长</Label>
                <SliderWithInput
                  value={Math.round((subtitleStyle.animationDuration || 0.5) * 10)}
                  min={1}
                  max={20}
                  step={1}
                  onChange={(v) => onStyleChange({ ...subtitleStyle, animationDuration: v / 10 })}
                  unit="s"
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* 自定义滚动条样式 */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </div>
  )
}
