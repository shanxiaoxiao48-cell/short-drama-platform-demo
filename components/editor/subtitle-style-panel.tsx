"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FancyTextTemplates } from "./fancy-text-templates"

export interface SubtitleStyle {
  fontSize: number
  verticalPosition: number
  lineBreakRule?: "auto" | "manual" | "character-limit"
  maxCharactersPerLine?: number
  fontFamily?: string
  color?: string
  strokeColor?: string
  strokeWidth?: number
  shadowColor?: string
  shadowBlur?: number
  backgroundColor?: string
  backgroundOpacity?: number
  lineHeight?: number // 行高
  letterSpacing?: number // 字间距
}

interface SubtitleStylePanelProps {
  subtitleStyle: SubtitleStyle
  onStyleChange: (style: SubtitleStyle) => void
  showStylePanel?: boolean
}

export function SubtitleStylePanel({
  subtitleStyle,
  onStyleChange,
  showStylePanel = true,
}: SubtitleStylePanelProps) {
  if (!showStylePanel) {
    return null
  }

  // 常用字体列表
  const fontFamilies = [
    { value: "Arial, sans-serif", label: "Arial" },
    { value: "Helvetica, sans-serif", label: "Helvetica" },
    { value: "'Microsoft YaHei', sans-serif", label: "微软雅黑" },
    { value: "'SimHei', sans-serif", label: "黑体" },
    { value: "'SimSun', serif", label: "宋体" },
    { value: "'KaiTi', serif", label: "楷体" },
    { value: "'PingFang SC', sans-serif", label: "苹方" },
    { value: "'Noto Sans SC', sans-serif", label: "思源黑体" },
  ]

  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-medium text-foreground">字幕样式</h4>
      
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-7">
          <TabsTrigger value="basic" className="text-[10px]">基础设置</TabsTrigger>
          <TabsTrigger value="templates" className="text-[10px]">花字模板</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-3 mt-3">
          {/* Font family */}
          <div className="space-y-1.5">
            <Label className="text-[10px]">字体</Label>
            <Select
              value={subtitleStyle.fontFamily || "Arial, sans-serif"}
              onValueChange={(value) =>
                onStyleChange({ ...subtitleStyle, fontFamily: value })
              }
            >
              <SelectTrigger className="h-7 text-[10px]">
                <SelectValue placeholder="选择字体" />
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

          {/* Font size */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px]">字体大小</Label>
              <span className="text-[10px] text-muted-foreground">{subtitleStyle.fontSize}px</span>
            </div>
            <Slider
              value={[subtitleStyle.fontSize]}
              min={12}
              max={32}
              step={1}
              onValueChange={([value]) =>
                onStyleChange({ ...subtitleStyle, fontSize: value })
              }
              className="w-full"
            />
          </div>

          {/* Line height */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px]">行高</Label>
              <span className="text-[10px] text-muted-foreground">{subtitleStyle.lineHeight || 1.5}</span>
            </div>
            <Slider
              value={[subtitleStyle.lineHeight || 1.5]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={([value]) =>
                onStyleChange({ ...subtitleStyle, lineHeight: value })
              }
              className="w-full"
            />
          </div>

          {/* Letter spacing */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px]">字间距</Label>
              <span className="text-[10px] text-muted-foreground">{subtitleStyle.letterSpacing || 0}px</span>
            </div>
            <Slider
              value={[subtitleStyle.letterSpacing || 0]}
              min={-2}
              max={10}
              step={0.5}
              onValueChange={([value]) =>
                onStyleChange({ ...subtitleStyle, letterSpacing: value })
              }
              className="w-full"
            />
          </div>

          {/* Vertical position */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px]">垂直位置</Label>
              <span className="text-[10px] text-muted-foreground">{subtitleStyle.verticalPosition}%</span>
            </div>
            <Slider
              value={[subtitleStyle.verticalPosition]}
              min={0}
              max={100}
              step={1}
              onValueChange={([value]) =>
                onStyleChange({ ...subtitleStyle, verticalPosition: value })
              }
              className="w-full"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="templates" className="mt-3">
          <FancyTextTemplates
            currentStyle={subtitleStyle}
            onSelectTemplate={(template) => onStyleChange(template)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
