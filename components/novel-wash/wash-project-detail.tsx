"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, FileText, Sparkles, Plus, Clock, CheckCircle, ArrowRight, Globe, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { WashConfig } from "./culture-wash-dialog"
import { WashWorkspace } from "./wash-workspace"

interface WashVersion {
  id: string
  targetCountry: string
  genres: string[]
  status: "completed" | "in_progress"
  createdAt: string
  wordCount: number
}

interface WashProjectDetailProps {
  projectName: string
  config: WashConfig
  onBack: () => void
  onCreateTranslationProject: (title: string, content: string) => void
}

export function WashProjectDetail({ projectName, config, onBack, onCreateTranslationProject }: WashProjectDetailProps) {
  const [activeVersion, setActiveVersion] = useState<string | null>(null)

  const [versions] = useState<WashVersion[]>([
    { id: "v1", targetCountry: "中国", genres: ["修仙", "宗门"], status: "completed", createdAt: "2026-04-08 14:30", wordCount: 148000 },
    { id: "v2", targetCountry: "韩国", genres: ["财阀", "复仇"], status: "completed", createdAt: "2026-04-09 10:15", wordCount: 151000 },
  ])

  if (activeVersion === "new") {
    return <WashWorkspace config={config} onBack={() => setActiveVersion(null)} onCreateTranslationProject={onCreateTranslationProject} />
  }
  if (activeVersion) {
    const ver = versions.find(v => v.id === activeVersion)
    return <WashWorkspace config={{ ...config, targetCountry: ver?.targetCountry || config.targetCountry }} onBack={() => setActiveVersion(null)} onCreateTranslationProject={onCreateTranslationProject} initialPhase="text_edit" />
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header - matches workspace style */}
      <div className="shrink-0 overflow-auto p-6 pb-4" style={{ height: "auto" }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <button className="hover:text-foreground transition-colors" onClick={onBack}>小说项目</button>
          <span>/</span>
          <span className="text-foreground font-medium">{projectName}</span>
        </div>

        {/* Title row */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{projectName}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                洗稿项目 · 源文化：{config.sourceCountry} · {versions.length} 个洗稿版本
              </p>
            </div>
          </div>
          <Button onClick={() => setActiveVersion("new")}>
            <Plus className="w-4 h-4 mr-2" />
            新建洗稿
          </Button>
        </div>

        {/* Source file card */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">原文</h2>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{config.sourceFile || "The Alpha's Rejected Mate.txt"}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{config.sourceCountry}</span>
                  <span>152,000 字</span>
                  <span>120 章</span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">原文</Badge>
            </div>
          </Card>
        </div>

        {/* Washed versions */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">洗稿版本（{versions.length}）</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {versions.map(ver => (
              <Card
                key={ver.id}
                className="p-4 bg-card border-border cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
                onClick={() => setActiveVersion(ver.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  {ver.status === "completed" ? (
                    <Badge variant="outline" className="text-[10px] text-green-600 border-green-600/30 bg-green-500/5">
                      <CheckCircle className="w-3 h-3 mr-0.5" />已完成
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-blue-500 border-blue-500/30 bg-blue-500/5">进行中</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    {config.sourceCountry} → {ver.targetCountry}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {ver.genres.map(g => <Badge key={g} variant="secondary" className="text-[10px]">{g}</Badge>)}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ver.createdAt}</span>
                    <span>{ver.wordCount.toLocaleString()} 字</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">点击查看 / 编辑</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Card>
            ))}

            {/* New wash card */}
            <Card
              className="p-4 border-dashed border-2 border-border cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center min-h-[200px] gap-3"
              onClick={() => setActiveVersion("new")}
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">洗另一个文化版本</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
