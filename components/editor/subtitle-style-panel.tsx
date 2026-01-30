"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FancyTextTemplates } from "./fancy-text-templates"
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  textAlign?: "left" | "center" | "right" // 对齐方式
  writingMode?: "horizontal-tb" | "vertical-rl" // 横竖排版
  rotation?: number // 旋转角度
  scale?: number // 缩放比例
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

  // 常用颜色列表
  const commonColors = [
    { value: "#FFFFFF", label: "白色" },
    { value: "#000000", label: "黑色" },
    { value: "#FF0000", label: "红色" },
    { value: "#00FF00", label: "绿色" },
    { value: "#0000FF", label: "蓝色" },
    { value: "#FFFF00", label: "黄色" },
    { value: "#FF00FF", label: "品红" },
    { value: "#00FFFF", label: "青色" },
  ]

  return (
    <div className="space-y-3">
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

          {/* Writing mode - 横竖排版 */}
          <div className="space-y-1.5">
            <Label className="text-[10px]">排版方式</Label>
            <div className="flex gap-1">
              <Button
                variant={subtitleStyle.writingMode === "horizontal-tb" || !subtitleStyle.writingMode ? "default" : "outline"}
                size="sm"
                className="h-7 flex-1 text-[10px]"
                onClick={() =>
                  onStyleChange({ ...subtitleStyle, writingMode: "horizontal-tb" })
                }
              >
                横排
              </Button>
              <Button
                variant={subtitleStyle.writingMode === "vertical-rl" ? "default" : "outline"}
                size="sm"
                className="h-7 flex-1 text-[10px]"
                onClick={() =>
                  onStyleChange({ ...subtitleStyle, writingMode: "vertical-rl" })
                }
              >
                竖排
              </Button>
            </div>
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
              className="w-full [&_[role=slider]]:h-2.5 [&_[role=slider]]:w-2.5"
            />
          </div>

          {/* Font color */}
          <div className="space-y-1.5">
            <Label className="text-[10px]">字体颜色</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={subtitleStyle.color || "#FFFFFF"}
                onChange={(e) =>
                  onStyleChange({ ...subtitleStyle, color: e.target.value })
                }
                className="h-7 w-12 rounded border border-input cursor-pointer"
              />
              <Select
                value={subtitleStyle.color || "#FFFFFF"}
                onValueChange={(value) =>
                  onStyleChange({ ...subtitleStyle, color: value })
                }
              >
                <SelectTrigger className="h-7 text-[10px] flex-1">
                  <SelectValue placeholder="选择颜色" />
                </SelectTrigger>
                <SelectContent>
                  {commonColors.map((color) => (
                    <SelectItem key={color.value} value={color.value} className="text-[10px]">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded border border-border"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Line height */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px]">行距</Label>
              <span className="text-[10px] text-muted-foreground">{(subtitleStyle.lineHeight || 1.5).toFixed(1)}</span>
            </div>
            <Slider
              value={[subtitleStyle.lineHeight || 1.5]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={([value]) =>
                onStyleChange({ ...subtitleStyle, lineHeight: value })
              }
              className="w-full [&_[role=slider]]:h-2.5 [&_[role=slider]]:w-2.5"
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
              className="w-full [&_[role=slider]]:h-2.5 [&_[role=slider]]:w-2.5"
            />
          </div>

          {/* Text alignment */}
          <div className="space-y-1.5">
            <Label className="text-[10px]">对齐方式</Label>
            <div className="flex gap-1">
              <Button
                variant={subtitleStyle.textAlign === "left" ? "default" : "outline"}
                size="sm"
                className="h-7 flex-1"
                onClick={() =>
                  onStyleChange({ ...subtitleStyle, textAlign: "left" })
                }
              >
                <AlignLeft className="h-3 w-3" />
              </Button>
              <Button
                variant={subtitleStyle.textAlign === "center" || !subtitleStyle.textAlign ? "default" : "outline"}
                size="sm"
                className="h-7 flex-1"
                onClick={() =>
                  onStyleChange({ ...subtitleStyle, textAlign: "center" })
                }
              >
                <AlignCenter className="h-3 w-3" />
              </Button>
              <Button
                variant={subtitleStyle.textAlign === "right" ? "default" : "outline"}
                size="sm"
                className="h-7 flex-1"
                onClick={() =>
                  onStyleChange({ ...subtitleStyle, textAlign: "right" })
                }
              >
                <AlignRight className="h-3 w-3" />
              </Button>
            </div>
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
              className="w-full [&_[role=slider]]:h-2.5 [&_[role=slider]]:w-2.5"
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
