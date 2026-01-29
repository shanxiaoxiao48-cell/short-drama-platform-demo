"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SubtitleStyle } from "./subtitle-style-panel"

interface FancyTextTemplate {
  id: string
  name: string
  preview: string
  style: SubtitleStyle
}

const FANCY_TEXT_TEMPLATES: FancyTextTemplate[] = [
  {
    id: "classic",
    name: "经典白字",
    preview: "经典白字",
    style: {
      fontSize: 16,
      verticalPosition: 85,
      fontFamily: "Arial, sans-serif",
      color: "#FFFFFF",
      strokeColor: "#000000",
      strokeWidth: 2,
      shadowColor: "rgba(0,0,0,0.8)",
      shadowBlur: 4,
    }
  },
  {
    id: "golden",
    name: "金色华丽",
    preview: "金色华丽",
    style: {
      fontSize: 18,
      verticalPosition: 85,
      fontFamily: "Arial, sans-serif",
      color: "#FFD700",
      strokeColor: "#8B4513",
      strokeWidth: 3,
      shadowColor: "rgba(0,0,0,0.9)",
      shadowBlur: 6,
    }
  },
  {
    id: "neon",
    name: "霓虹发光",
    preview: "霓虹发光",
    style: {
      fontSize: 17,
      verticalPosition: 85,
      fontFamily: "Arial, sans-serif",
      color: "#00FFFF",
      strokeColor: "#0080FF",
      strokeWidth: 2,
      shadowColor: "rgba(0,255,255,0.8)",
      shadowBlur: 8,
    }
  },
  {
    id: "elegant",
    name: "优雅黑金",
    preview: "优雅黑金",
    style: {
      fontSize: 16,
      verticalPosition: 85,
      fontFamily: "Arial, sans-serif",
      color: "#000000",
      strokeColor: "#FFD700",
      strokeWidth: 2,
      shadowColor: "rgba(255,215,0,0.6)",
      shadowBlur: 5,
    }
  },
  {
    id: "fire",
    name: "火焰红",
    preview: "火焰红",
    style: {
      fontSize: 18,
      verticalPosition: 85,
      fontFamily: "Arial, sans-serif",
      color: "#FF4500",
      strokeColor: "#8B0000",
      strokeWidth: 3,
      shadowColor: "rgba(255,69,0,0.7)",
      shadowBlur: 6,
    }
  },
  {
    id: "ice",
    name: "冰霜蓝",
    preview: "冰霜蓝",
    style: {
      fontSize: 16,
      verticalPosition: 85,
      fontFamily: "Arial, sans-serif",
      color: "#E0FFFF",
      strokeColor: "#4682B4",
      strokeWidth: 2,
      shadowColor: "rgba(70,130,180,0.6)",
      shadowBlur: 5,
    }
  },
]

interface FancyTextTemplatesProps {
  currentStyle: SubtitleStyle
  onSelectTemplate: (style: SubtitleStyle) => void
}

export function FancyTextTemplates({
  currentStyle,
  onSelectTemplate,
}: FancyTextTemplatesProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {FANCY_TEXT_TEMPLATES.map((template) => (
        <Button
          key={template.id}
          variant="outline"
          className={cn(
            "h-auto flex flex-col items-center justify-center p-2 hover:border-primary transition-all",
            "relative overflow-hidden"
          )}
          onClick={() => onSelectTemplate(template.style)}
        >
          {/* 模板名称 */}
          <div className="text-[9px] text-muted-foreground mb-1">
            {template.name}
          </div>
          
          {/* 预览效果 */}
          <div 
            className="text-[11px] font-bold relative"
            style={{
              color: template.style.color,
              textShadow: `
                ${template.style.shadowColor ? `0 0 ${template.style.shadowBlur}px ${template.style.shadowColor}` : ''},
                ${template.style.strokeColor && template.style.strokeWidth ? `
                  -${template.style.strokeWidth}px -${template.style.strokeWidth}px 0 ${template.style.strokeColor},
                  ${template.style.strokeWidth}px -${template.style.strokeWidth}px 0 ${template.style.strokeColor},
                  -${template.style.strokeWidth}px ${template.style.strokeWidth}px 0 ${template.style.strokeColor},
                  ${template.style.strokeWidth}px ${template.style.strokeWidth}px 0 ${template.style.strokeColor}
                ` : ''}
              `.trim(),
              fontFamily: template.style.fontFamily,
            }}
          >
            {template.preview}
          </div>
        </Button>
      ))}
    </div>
  )
}
