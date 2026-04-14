"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, FileText, Sparkles, BookOpen, Clock, CheckCircle, ArrowRight, Loader2, Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { WashConfig } from "./culture-wash-dialog"

interface WashProjectDetailProps {
  projectName: string
  config: WashConfig
  onBack: () => void
  onCreateTranslationProject: (title: string, content: string) => void
}

type Phase = "idle" | "analyzing" | "analyzed" | "generating" | "done"

const analysisFiles = [
  { id: "characters", name: "原作人物介绍", icon: "👤" },
  { id: "storyline", name: "原作故事主线", icon: "📖" },
  { id: "structure", name: "原著三幕式结构分析", icon: "🎭" },
  { id: "emotions", name: "情感关系分析", icon: "❤️" },
]

const modeLabels: Record<string, { from: string; to: string; emoji: string }> = {
  ancient_to_werewolf: { from: "古言", to: "狼人", emoji: "🐺" },
  period_to_mafia: { from: "年代文", to: "黑手党", emoji: "🔫" },
}

// Mock content for analysis files
const mockAnalysisContent: Record<string, string> = {
  characters: `姓名：老祖宗\n人物遭遇：被柳贵妃误认为低贱妃嫔，遭受其言语羞辱、掌掴、揪扯头发、撞头等暴力对待...\n身份：被皇室隐姓埋名供奉、已存活上千年的老祖宗；王朝的守护者...\n\n姓名：柳贵妃\n人物遭遇：因嫉妒而欺辱老祖宗，最终被揭穿真相...\n身份：新晋受宠的贵妃，柳尚书之女...`,
  storyline: `故事发生在一个皇权更迭的王朝，皇宫深处隐居着一位已存活上千年的皇室老祖宗。她作为王朝的守护者，辅佐历代君王，深受现任皇帝的敬重与依赖。\n\n故事的开端，新晋受宠的柳贵妃趁皇帝不在，闯入老祖宗的居所，将她误认为无名无分的卑贱妃嫔，并对其肆意羞辱...`,
  structure: `第一幕：开端（Setup）\n【范围：第一节-第三节】\n主角设定：一位在皇宫中隐姓埋名、已存活上千年的"老祖宗"。\n初始冲突：新晋柳贵妃闯入老祖宗居所，将其误认为普通妃嫔并进行言语侮辱...\n\n第二幕：对抗（Confrontation）\n冲突升级，柳贵妃为逼迫老祖宗求饶，命人对阿蘅施以酷刑...`,
  emotions: `角色情感关系分析\n\n【老祖宗】与【贵妃】\n关系类型：敌对/冲突\n初始状态：陌生且敌对。贵妃将老祖宗视为争夺皇帝宠爱的"狐媚子"...\n\n【老祖宗】与【皇帝】\n关系类型：复杂/类亲情/政治庇护\n老祖宗对皇帝的态度：长辈对后辈的慈爱与掌控...`,
}

const mockWashResult = `## 古言转狼人改编框架\n\n### 世界观规则转换\n原古言设定：皇权至上，但背后由一位不老不死的"老祖宗"作为王朝的定海神针。\n狼人设定：狼族王庭由月冠狼王统治，但整个狼族的稳定与血脉的延续，系于一位永生的"始祖"（The Progenitor）。\n\n### 角色转换\n老祖宗 → 始祖 (The Progenitor)\n柳贵妃 → 辛德拉 (Cinder)，黑牙部族族长之女\n镇北王 → 凯恩 (Kaelen)，霜牙领主\n皇帝 → 月冠狼王\n\n### 第一幕改编\n原文：贵妃闯入老祖宗居所，将其误认为低贱妃嫔并羞辱。\n改编：辛德拉闯入始祖的隐居之所，将其误认为狼王的普通情妇并挑衅。始祖以千年的淡然回应，内心已决定更换狼王...`

export function WashProjectDetail({ projectName, config, onBack, onCreateTranslationProject }: WashProjectDetailProps) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [progress, setProgress] = useState(0)
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [fileContents, setFileContents] = useState<Record<string, string>>(mockAnalysisContent)
  const [washResult, setWashResult] = useState(mockWashResult)

  const mode = modeLabels[config.washMode] || modeLabels.ancient_to_werewolf

  // Simulate analysis progress
  useEffect(() => {
    if (phase !== "analyzing") return
    const t = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(t); setTimeout(() => setPhase("analyzed"), 500); return 100 }; return p + Math.random() * 8 + 3 })
    }, 300)
    return () => clearInterval(t)
  }, [phase])

  // Simulate generation progress
  useEffect(() => {
    if (phase !== "generating") return
    setProgress(0)
    const t = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(t); setTimeout(() => setPhase("done"), 500); return 100 }; return p + Math.random() * 6 + 2 })
    }, 400)
    return () => clearInterval(t)
  }, [phase])

  // File editor view
  if (editingFile) {
    const isWashResult = editingFile === "wash_result"
    const title = isWashResult ? `${mode.from}转${mode.to}改编框架` : analysisFiles.find(f => f.id === editingFile)?.name || editingFile
    const content = isWashResult ? washResult : (fileContents[editingFile] || "")
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="shrink-0 border-b border-border bg-card px-4 py-2.5 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setEditingFile(null)}><ArrowLeft className="w-4 h-4" /></Button>
          <Edit3 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{title}</span>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground">{content.length.toLocaleString()} 字符</span>
          <Button size="sm" onClick={() => setEditingFile(null)}>保存并返回</Button>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <textarea
            value={content}
            onChange={e => { if (isWashResult) setWashResult(e.target.value); else setFileContents(prev => ({ ...prev, [editingFile]: e.target.value })) }}
            className="absolute inset-0 w-full h-full resize-none border-0 outline-none p-8 bg-background leading-relaxed whitespace-pre-wrap overflow-y-auto"
            style={{ fontSize: "15px", lineHeight: "1.8" }}
            spellCheck={false}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="shrink-0 overflow-auto p-6 pb-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <button className="hover:text-foreground transition-colors" onClick={onBack}>小说项目</button>
          <span>/</span>
          <span className="text-foreground font-medium">{projectName}</span>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{projectName}</h1>
                <Badge variant="secondary" className="text-xs">{mode.emoji} {mode.from} → {mode.to}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">洗稿项目</p>
            </div>
          </div>
          <div className="flex gap-2">
            {phase === "idle" && (
              <Button onClick={() => { setProgress(0); setPhase("analyzing") }}>
                <Sparkles className="w-4 h-4 mr-2" />开始分析
              </Button>
            )}
            {phase === "analyzed" && (
              <Button onClick={() => { setProgress(0); setPhase("generating") }}>
                <Sparkles className="w-4 h-4 mr-2" />生成洗稿
              </Button>
            )}
            {phase === "done" && (
              <Button onClick={() => onCreateTranslationProject(projectName, washResult)}>
                转入翻译流程
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {(phase === "analyzing" || phase === "generating") && (
          <div className="mb-6 p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-sm font-medium">{phase === "analyzing" ? "正在分析原文..." : "正在生成洗稿..."}</span>
              <span className="text-xs text-muted-foreground ml-auto">{Math.min(100, Math.round(progress))}%</span>
            </div>
            <Progress value={Math.min(100, progress)} />
          </div>
        )}

        {/* === Section 1: Source File === */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />原文
          </h2>
          <Card className="p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all" onClick={() => setEditingFile("source")}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{config.sourceFile || "我是皇家老祖，贵妃欺辱我后悔疯了(1).txt"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">点击查看/编辑</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* === Section 2: Analysis Files === */}
        {(phase === "analyzed" || phase === "generating" || phase === "done") && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />分析结果
              <Badge variant="outline" className="text-[10px]">4 个文件</Badge>
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {analysisFiles.map(file => (
                <Card key={file.id} className="p-3 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
                  onClick={() => setEditingFile(file.id)}>
                  <div className="text-2xl mb-2">{file.icon}</div>
                  <p className="text-xs font-medium">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-primary transition-colors">点击查看/编辑</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* === Section 3: Wash Result === */}
        {phase === "done" && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />洗稿结果
            </h2>
            <Card className="p-4 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all border-primary/20 bg-primary/5"
              onClick={() => setEditingFile("wash_result")}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xl">{mode.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{mode.from}转{mode.to}改编框架</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{washResult.length.toLocaleString()} 字 · 点击查看/编辑</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs text-green-600 border-green-600/30"><CheckCircle className="w-3 h-3 mr-0.5" />已完成</Badge>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
