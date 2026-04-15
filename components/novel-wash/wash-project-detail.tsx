"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft, FileText, Sparkles, BookOpen, CheckCircle, ArrowRight,
  Loader2, Edit3, Map, ChevronRight, Plus, Users, Drama, Heart,
  Save, RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { WashConfig } from "./culture-wash-dialog"
import {
  CHARACTERS, STRUCTURE, EMOTIONS, STORYLINE, WOLF_MAPPING,
  WASH_WOLF, WASH_MAFIA,
  type CharacterData, type ActData, type EmotionData, type MappingFramework,
} from "./wash-mock-data"

interface WashProjectDetailProps {
  projectName: string
  config: WashConfig
  onBack: () => void
  onCreateTranslationProject: (title: string, content: string) => void
}

type Phase = "idle" | "analyzing" | "analyzed" | "mapping" | "mapped" | "generating" | "done"
// Which step page to view (can differ from phase when navigating back)
type ViewStep = "source" | "analysis" | "mapping" | "wash"

interface WashVersion {
  id: string
  mode: string
  phase: Phase
  progress: number
  washTitle: string
  mappingResult: MappingFramework
  washResult: string
  createdAt: string
}

const modeLabels: Record<string, { from: string; to: string; emoji: string }> = {
  ancient_to_werewolf: { from: "古言", to: "狼人", emoji: "🐺" },
  period_to_mafia: { from: "年代文", to: "黑手党", emoji: "🔫" },
}
const allModes = [
  { id: "ancient_to_werewolf", label: "古言转狼人", emoji: "🐺" },
  { id: "period_to_mafia", label: "年代文转黑手党", emoji: "🔫" },
]

// ===== Helpers =====
function createVersion(modeId: string): WashVersion {
  const titles: Record<string, string> = {
    ancient_to_werewolf: "我是狼族始祖，情妇欺辱我后悔疯了",
    period_to_mafia: "我是家族教母，情妇欺辱我后悔疯了",
  }
  return {
    id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    mode: modeId, phase: "idle", progress: 0,
    washTitle: titles[modeId] || "洗稿作品",
    mappingResult: JSON.parse(JSON.stringify(WOLF_MAPPING)),
    washResult: modeId === "period_to_mafia" ? WASH_MAFIA : WASH_WOLF,
    createdAt: new Date().toLocaleString("zh-CN"),
  }
}
function phaseLabel(p: Phase): string {
  const m: Record<Phase, string> = { idle: "待分析", analyzing: "分析中...", analyzed: "已分析", mapping: "映射中...", mapped: "已映射", generating: "生成中...", done: "已完成" }
  return m[p]
}
function phaseColor(p: Phase): string {
  if (p === "done") return "text-green-600 bg-green-500/10 border-green-500/30"
  if (["analyzing", "mapping", "generating"].includes(p)) return "text-blue-600 bg-blue-500/10 border-blue-500/30"
  if (["analyzed", "mapped"].includes(p)) return "text-orange-600 bg-orange-500/10 border-orange-500/30"
  return "text-muted-foreground bg-muted/50 border-border"
}
function maxStepForPhase(phase: Phase): number {
  if (["idle", "analyzing"].includes(phase)) return -1
  if (["analyzed", "mapping"].includes(phase)) return 0
  if (["mapped", "generating"].includes(phase)) return 1
  if (phase === "done") return 2
  return -1
}

// ===== Main Component =====
export function WashProjectDetail({ projectName, config, onBack, onCreateTranslationProject }: WashProjectDetailProps) {
  const [initialVersion] = useState(() => createVersion(config.washMode))
  const [versions, setVersions] = useState<WashVersion[]>([initialVersion])
  // Skip outer layer - go directly to the version detail
  const [activeVersionId, setActiveVersionId] = useState<string | null>(initialVersion.id)
  const [showModePicker, setShowModePicker] = useState(false)
  const [sourceContent, setSourceContent] = useState(`（原文内容预览 — 我是皇家老祖，贵妃欺辱我后悔疯了）

第一节

柳贵妃推开了那扇朱红色的大门，一股淡淡的檀香扑面而来。屋内陈设简朴，却透着一种说不出的古雅。

一个看起来不过二十出头的女子正倚在窗边，手中捧着一卷泛黄的古籍，神态悠然。

"就是你？"柳贵妃上下打量着她，嘴角勾起一抹轻蔑的弧度，"一个没名没分的玩意，也配让皇上日日来探望？"

那女子连眼皮都没抬，继续翻着手中的书卷。

柳贵妃的脸色沉了下来。她是当朝柳尚书的女儿，入宫不过半年便封了贵妃，正是春风得意之时。

"本宫在跟你说话！"柳贵妃一把夺过她手中的书卷，"你这个没名没分的贱婢，趁早给本宫滚出这皇宫！"

那女子终于抬起了眼，看了柳贵妃一眼。

那目光平静得像一潭死水，却让柳贵妃莫名地打了个寒颤。

"你知道，"她的声音很轻，"上一个这样跟我说话的人，她满门的脑袋，都被挂在了城门上。"`)

  // viewingStep: which step page to show inside version detail (independent of phase)
  const [viewingStep, setViewingStep] = useState<ViewStep>("source")
  // per-step editing mode
  const [editingStep, setEditingStep] = useState<ViewStep | null>(null)
  // saved toast
  const [showSaved, setShowSaved] = useState(false)

  const activeVersion = versions.find(v => v.id === activeVersionId) || null

  const updateVersion = (id: string, patch: Partial<WashVersion>) => {
    setVersions(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v))
  }

  // Progress simulation
  useEffect(() => {
    if (!activeVersion) return
    const { phase, id } = activeVersion
    if (!["analyzing", "mapping", "generating"].includes(phase)) return
    const nextPhase: Record<string, Phase> = { analyzing: "analyzed", mapping: "mapped", generating: "done" }
    const nextView: Record<string, ViewStep> = { analyzing: "analysis", mapping: "mapping", generating: "wash" }
    const speed = phase === "generating" ? 400 : phase === "mapping" ? 350 : 300
    const inc = phase === "generating" ? 4 : 5
    const t = setInterval(() => {
      setVersions(prev => prev.map(v => {
        if (v.id !== id) return v
        const next = v.progress + Math.random() * inc + 2
        if (next >= 100) {
          clearInterval(t)
          setTimeout(() => {
            updateVersion(id, { phase: nextPhase[phase], progress: 0 })
            setViewingStep(nextView[phase])
            setEditingStep(null)
            // Auto-fill title from wash result when generation completes
            if (phase === "generating") {
              const ver = versions.find(x => x.id === id)
              if (ver) {
                const firstLine = ver.washResult.split("\n").find(l => l.trim().length > 0) || ""
                const title = firstLine.replace(/^#+\s*/, "").trim()
                if (title) updateVersion(id, { washTitle: title })
              }
            }
          }, 500)
          return { ...v, progress: 100 }
        }
        return { ...v, progress: next }
      }))
    }, speed)
    return () => clearInterval(t)
  }, [activeVersion?.phase, activeVersion?.id])

  // When entering a version, set viewingStep to the latest completed step
  const enterVersion = (vId: string) => {
    const v = versions.find(x => x.id === vId)
    if (!v) return
    setActiveVersionId(vId)
    const ms = maxStepForPhase(v.phase)
    if (ms === 2) setViewingStep("wash")
    else if (ms === 1) setViewingStep("mapping")
    else if (ms === 0) setViewingStep("analysis")
    else setViewingStep("source")
  }

  const handleSave = () => { setShowSaved(true); setTimeout(() => setShowSaved(false), 1500) }

  // ===== VERSION DETAIL (inner layer) =====
  if (activeVersion) {
    const mode = modeLabels[activeVersion.mode] || modeLabels.ancient_to_werewolf
    const isProcessing = ["analyzing", "mapping", "generating"].includes(activeVersion.phase)
    const progressLabel = activeVersion.phase === "analyzing" ? "正在分析原文..." : activeVersion.phase === "mapping" ? "正在生成映射框架..." : activeVersion.phase === "generating" ? "正在生成洗稿内容..." : ""
    const maxStep = maxStepForPhase(activeVersion.phase)

    const stepTabs: { key: ViewStep; label: string; minStep: number }[] = [
      { key: "source", label: "原文", minStep: -1 },
      { key: "analysis", label: "分析结果", minStep: 0 },
      { key: "mapping", label: "映射框架", minStep: 1 },
      { key: "wash", label: "洗稿结果", minStep: 2 },
    ]

    // Full-page loading overlay
    if (isProcessing) {
      return (
        <div className="flex flex-col h-full bg-background">
          <div className="shrink-0 border-b border-border bg-card px-4 py-2.5 flex items-center gap-3">
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold truncate">{projectName}</h1>
              <p className="text-[10px] text-muted-foreground">{mode.emoji} {mode.from} → {mode.to}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-sm w-full px-6">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
              <h2 className="text-lg font-semibold">{progressLabel}</h2>
              <Progress value={Math.min(100, activeVersion.progress)} />
              <p className="text-xs text-muted-foreground">{Math.min(100, Math.round(activeVersion.progress))}%</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header with step tabs */}
        <div className="shrink-0 border-b border-border bg-card px-4 py-2.5 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0 mr-2">
            <h1 className="text-sm font-semibold truncate">{projectName}</h1>
            <p className="text-[10px] text-muted-foreground">{mode.emoji} {mode.from} → {mode.to}</p>
          </div>

          {/* Step tabs */}
          <div className="flex items-center gap-1">
            {stepTabs.map((tab, i) => {
              const accessible = tab.minStep <= maxStep
              const active = viewingStep === tab.key
              return (
                <div key={tab.key} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                  <button
                    className={cn(
                      "text-xs px-2.5 py-1 rounded transition-colors",
                      active && "bg-primary/10 text-primary font-medium",
                      !active && accessible && "text-green-600 hover:bg-green-500/10 cursor-pointer",
                      !accessible && "text-muted-foreground/50 cursor-default",
                    )}
                    onClick={() => accessible && setViewingStep(tab.key)}
                    disabled={!accessible}
                  >
                    {!active && accessible && tab.minStep <= maxStep - 1 && <CheckCircle className="w-3 h-3 inline mr-0.5" />}
                    {tab.label}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="flex-1" />

          {/* Saved toast */}
          {showSaved && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />已保存</span>}

          {/* Action buttons based on current viewing step and phase */}
          <div className="flex gap-2">
            {viewingStep === "source" && (
              <>
                {editingStep !== "source" && (
                  <Button size="sm" variant="outline" onClick={() => setEditingStep("source")}>
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" />编辑
                  </Button>
                )}
                {editingStep === "source" && (
                  <Button size="sm" variant="outline" onClick={() => { setEditingStep(null); handleSave() }}>
                    <Save className="w-3.5 h-3.5 mr-1.5" />保存
                  </Button>
                )}
                {activeVersion.phase === "idle" && (
                  <Button size="sm" onClick={() => updateVersion(activeVersion.id, { phase: "analyzing", progress: 0 })}>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />开始分析
                  </Button>
                )}
              </>
            )}
            {viewingStep === "analysis" && (
              <>
                {editingStep !== "analysis" ? (
                  <Button size="sm" variant="outline" onClick={() => setEditingStep("analysis")}><Edit3 className="w-3.5 h-3.5 mr-1.5" />编辑</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => { setEditingStep(null); handleSave() }}><Save className="w-3.5 h-3.5 mr-1.5" />保存</Button>
                )}
                <Button size="sm" variant="outline" onClick={() => updateVersion(activeVersion.id, { phase: "analyzing", progress: 0 })}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />重新分析
                </Button>
                {activeVersion.phase === "analyzed" && (
                  <Button size="sm" onClick={() => updateVersion(activeVersion.id, { phase: "mapping", progress: 0 })}>
                    <Map className="w-3.5 h-3.5 mr-1.5" />生成映射
                  </Button>
                )}
              </>
            )}
            {viewingStep === "mapping" && (
              <>
                {editingStep !== "mapping" ? (
                  <Button size="sm" variant="outline" onClick={() => setEditingStep("mapping")}><Edit3 className="w-3.5 h-3.5 mr-1.5" />编辑</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => { setEditingStep(null); handleSave() }}><Save className="w-3.5 h-3.5 mr-1.5" />保存</Button>
                )}
                <Button size="sm" variant="outline" onClick={() => { updateVersion(activeVersion.id, { phase: "mapping", progress: 0 }) }}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />重新映射
                </Button>
                {activeVersion.phase === "mapped" && (
                  <Button size="sm" onClick={() => updateVersion(activeVersion.id, { phase: "generating", progress: 0 })}>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />生成洗稿
                  </Button>
                )}
              </>
            )}
            {viewingStep === "wash" && (
              <>
                {editingStep !== "wash" ? (
                  <Button size="sm" variant="outline" onClick={() => setEditingStep("wash")}><Edit3 className="w-3.5 h-3.5 mr-1.5" />编辑</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => { setEditingStep(null); handleSave() }}><Save className="w-3.5 h-3.5 mr-1.5" />保存</Button>
                )}
                <Button size="sm" variant="outline" onClick={() => updateVersion(activeVersion.id, { phase: "generating", progress: 0 })}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />重新生成
                </Button>
                <Button size="sm" onClick={() => onCreateTranslationProject(activeVersion.washTitle, `${mode.from}转${mode.to}|${projectName}`)}>
                  转入翻译流程
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ===== PAGE: Source (original text) ===== */}
        {viewingStep === "source" && (
          <div className="flex-1 overflow-hidden relative">
            {editingStep === "source" ? (
              <textarea
                value={sourceContent}
                onChange={e => setSourceContent(e.target.value)}
                className="absolute inset-0 w-full h-full resize-none border-0 outline-none p-8 bg-background leading-relaxed whitespace-pre-wrap overflow-y-auto"
                style={{ fontSize: "15px", lineHeight: "1.8" }}
                spellCheck={false}
                autoFocus
              />
            ) : (
              <div className="absolute inset-0 w-full h-full p-8 overflow-y-auto whitespace-pre-wrap leading-relaxed text-foreground" style={{ fontSize: "15px", lineHeight: "1.8" }}>
                {sourceContent}
              </div>
            )}
          </div>
        )}

        {/* ===== PAGE: Analysis results (structured cards) ===== */}
        {viewingStep === "analysis" && (
          <ScrollArea className="flex-1">
            <div className="p-6 max-w-5xl mx-auto space-y-8">

              {/* 1. Characters - card grid */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">原作人物介绍</h2>
                  <Badge variant="outline" className="text-[10px]">{CHARACTERS.length} 人</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CHARACTERS.map(ch => (
                    <Card key={ch.name} className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">{ch.name[0]}</div>
                        <div>
                          <p className="text-base font-semibold">{ch.name}</p>
                          <p className="text-[11px] text-muted-foreground">{ch.identity}</p>
                        </div>
                      </div>
                      {ch.skills && <div className="flex items-center gap-1.5 mb-1.5"><span className="text-[10px] text-primary font-medium shrink-0">技能</span><p className="text-xs text-muted-foreground">{ch.skills}</p></div>}
                      <div className="mb-1.5"><span className="text-[10px] text-orange-600 font-medium">遭遇</span><p className="text-xs text-muted-foreground mt-0.5">{ch.encounters}</p></div>
                      <div className="mb-1.5"><span className="text-[10px] text-blue-600 font-medium">故事线</span><p className="text-xs text-muted-foreground mt-0.5">{ch.storyline}</p></div>
                      {ch.ending && <div><span className="text-[10px] text-green-600 font-medium">结局</span><p className="text-xs text-muted-foreground mt-0.5">{ch.ending}</p></div>}
                    </Card>
                  ))}
                </div>
              </section>

              {/* 2. Storyline */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">原作故事主线</h2>
                </div>
                <Card className="p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{STORYLINE}</p>
                </Card>
              </section>

              {/* 3. Three-Act Structure - act cards with sub-sections */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Drama className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">原著三幕式结构分析</h2>
                </div>
                <div className="space-y-4">
                  {STRUCTURE.map((act, ai) => (
                    <Card key={ai} className="overflow-hidden">
                      <div className={cn("px-4 py-2.5 border-b border-border", ai === 0 ? "bg-blue-500/10" : ai === 1 ? "bg-orange-500/10" : "bg-green-500/10")}>
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold">{act.title}</h3>
                          <span className="text-[10px] text-muted-foreground">【{act.range}】</span>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        {act.sections.map((s, si) => (
                          <div key={si}>
                            <p className="text-xs font-semibold text-foreground mb-1">{s.heading}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{s.content}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              {/* 4. Emotions - timeline cards */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">情感关系分析</h2>
                </div>
                <div className="space-y-4">
                  {EMOTIONS.map((em, ei) => (
                    <Card key={ei} className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold">{em.pair}</span>
                        <Badge variant="secondary" className="text-[10px]">{em.type}</Badge>
                      </div>
                      <div className="space-y-2 mb-3">
                        {em.acts.map((a, ai2) => (
                          <div key={ai2} className="flex gap-3">
                            <div className="shrink-0 w-14 text-[10px] font-medium text-primary pt-0.5">{a.act}</div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{a.content}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <span className="text-[10px] text-muted-foreground shrink-0">演变轨迹：</span>
                        <p className="text-[11px] font-medium text-foreground">{em.trajectory}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

            </div>
          </ScrollArea>
        )}

        {/* ===== PAGE: Mapping framework (structured) ===== */}
        {viewingStep === "mapping" && (() => {
          const mf = activeVersion.mappingResult
          return (
          <ScrollArea className="flex-1">
            <div className="p-6 max-w-5xl mx-auto space-y-8">

              {/* World view comparison */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Map className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">世界观规则转换</h2>
                </div>
                <Card className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div><p className="text-[10px] font-medium text-muted-foreground mb-1">原设定</p><p className="text-xs leading-relaxed">{mf.worldView.source}</p></div>
                    <div><p className="text-[10px] font-medium text-primary mb-1">狼人设定</p><p className="text-xs leading-relaxed">{mf.worldView.target}</p></div>
                  </div>
                  <div className="pt-2 border-t border-border/50"><p className="text-[10px] text-muted-foreground"><span className="font-medium">转换理由：</span>{mf.worldView.reason}</p></div>
                </Card>
              </section>

              {/* Character mapping - detailed cards */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">角色转换表</h2>
                  <Badge variant="outline" className="text-[10px]">{mf.characters.length} 人</Badge>
                </div>
                <div className="space-y-3">
                  {mf.characters.map((ch, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-base font-semibold">{ch.source}</span>
                          <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-base font-semibold text-primary">{ch.target}</span>
                          {ch.targetAlias && <span className="text-xs text-muted-foreground">({ch.targetAlias})</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div><p className="text-[10px] text-muted-foreground mb-0.5">原著身份</p><p className="text-xs">{ch.sourceRole}</p></div>
                        <div><p className="text-[10px] text-primary mb-0.5">狼人版身份</p><p className="text-xs">{ch.targetRole}</p></div>
                      </div>
                      <p className="text-[10px] text-muted-foreground"><span className="font-medium">核心特质：</span>{ch.traits}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5"><span className="font-medium">关系变化：</span>{ch.relationNote}</p>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Conflict mapping */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">关键冲突转换</h2>
                </div>
                <div className="space-y-3">
                  {mf.conflicts.map((c, i) => (
                    <Card key={i} className="p-4">
                      <div className="grid grid-cols-[1fr_32px_1fr] gap-2 mb-2">
                        <div><p className="text-[10px] text-muted-foreground mb-0.5">原著</p><p className="text-xs">{c.source}</p></div>
                        <div className="flex items-center justify-center"><ArrowRight className="w-4 h-4 text-primary" /></div>
                        <div><p className="text-[10px] text-primary mb-0.5">狼人版</p><p className="text-xs">{c.target}</p></div>
                      </div>
                      <p className="text-[10px] text-muted-foreground pt-2 border-t border-border/50"><span className="font-medium">保留内容：</span>{c.preserved}</p>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Term mapping table */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">称谓与场景转换</h2>
                </div>
                <Card className="overflow-hidden">
                  <div className="grid grid-cols-[1fr_32px_1fr] text-xs">
                    <div className="px-4 py-2 bg-muted/50 font-medium text-muted-foreground border-b border-border">原著称谓/场景</div>
                    <div className="bg-muted/50 border-b border-border" />
                    <div className="px-4 py-2 bg-muted/50 font-medium text-primary border-b border-border">狼人版</div>
                    {mf.terms.map((t, i) => (
                      <div key={i} className="contents">
                        <div className={cn("px-4 py-1.5", i < mf.terms.length - 1 && "border-b border-border/30")}>{t.source}</div>
                        <div className={cn("flex items-center justify-center", i < mf.terms.length - 1 && "border-b border-border/30")}><ArrowRight className="w-3 h-3 text-muted-foreground" /></div>
                        <div className={cn("px-4 py-1.5 text-primary font-medium", i < mf.terms.length - 1 && "border-b border-border/30")}>{t.target}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </section>

              {/* Story points */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">狼人版故事主线</h2>
                </div>
                <Card className="p-4 mb-3">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div><p className="text-[10px] font-medium text-muted-foreground mb-0.5">主角定位</p><p className="text-xs">{mf.coreSetup.protagonist}</p></div>
                    <div><p className="text-[10px] font-medium text-muted-foreground mb-0.5">世界规则</p><p className="text-xs">{mf.coreSetup.worldRule}</p></div>
                    <div><p className="text-[10px] font-medium text-muted-foreground mb-0.5">核心张力</p><p className="text-xs">{mf.coreSetup.tension}</p></div>
                  </div>
                </Card>
                <div className="space-y-2">
                  {mf.storyPoints.map((sp, i) => (
                    <Card key={i} className="p-3 flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{i + 1}</div>
                      <div><p className="text-xs font-semibold mb-0.5">{sp.title}</p><p className="text-xs text-muted-foreground">{sp.content}</p></div>
                    </Card>
                  ))}
                </div>
              </section>

            </div>
          </ScrollArea>
          )
        })()}

        {/* ===== PAGE: Wash result ===== */}
        {viewingStep === "wash" && (() => {
          const isEd = editingStep === "wash"
          return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Title bar */}
            <div className="shrink-0 px-8 pt-6 pb-2 flex items-center gap-3">
              <span className="text-xs text-muted-foreground shrink-0">作品名称：</span>
              <input
                className={cn("text-lg font-semibold bg-transparent border-b-2 flex-1 outline-none", isEd ? "border-transparent hover:border-border focus:border-primary" : "border-transparent cursor-default")}
                value={activeVersion.washTitle}
                onChange={e => isEd && updateVersion(activeVersion.id, { washTitle: e.target.value })}
                readOnly={!isEd}
                placeholder="输入洗稿后的小说名称"
              />
            </div>
            <div className="flex-1 overflow-hidden relative">
              {isEd ? (
                <textarea
                  value={activeVersion.washResult}
                  onChange={e => updateVersion(activeVersion.id, { washResult: e.target.value })}
                  className="absolute inset-0 w-full h-full resize-none border-0 outline-none px-8 py-4 bg-background leading-relaxed whitespace-pre-wrap overflow-y-auto"
                  style={{ fontSize: "15px", lineHeight: "1.8" }}
                  spellCheck={false}
                />
              ) : (
                <div className="absolute inset-0 w-full h-full px-8 py-4 overflow-y-auto whitespace-pre-wrap leading-relaxed text-foreground" style={{ fontSize: "15px", lineHeight: "1.8" }}>
                  {activeVersion.washResult}
                </div>
              )}
            </div>
          </div>
          )
        })()}
      </div>
    )
  }

  // ===== CARD OVERVIEW (outer layer) =====
  const usedModes = versions.map(v => v.mode)
  const availableModes = allModes.filter(m => !usedModes.includes(m.id))

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="shrink-0 border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-base font-semibold truncate">{projectName}</h1>
          <p className="text-xs text-muted-foreground">洗稿项目 · {versions.length} 个版本</p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Section: Source file */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">原文</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <Card className="overflow-hidden hover:border-blue-500/50 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => { setActiveVersionId(versions[0]?.id || null); setViewingStep("source") }}>
                <div className="p-5 min-h-[160px] flex flex-col">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium truncate">{config.sourceFile || "我是皇家老祖，贵妃欺辱我后悔疯了(1).txt"}</p>
                  <p className="text-xs text-muted-foreground mt-1">原始文件</p>
                  <div className="flex-1" />
                  <p className="text-[10px] text-muted-foreground group-hover:text-blue-500 transition-colors mt-2 flex items-center gap-1">
                    <Edit3 className="w-3 h-3" />点击编辑
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Section: Wash versions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">洗稿版本</h2>
              <Badge variant="outline" className="text-[10px]">{versions.length} 个</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {versions.map(v => {
                const m = modeLabels[v.mode] || modeLabels.ancient_to_werewolf
                const processing = ["analyzing", "mapping", "generating"].includes(v.phase)
                return (
                  <Card key={v.id}
                    className={cn("overflow-hidden hover:shadow-lg transition-all cursor-pointer group",
                      v.phase === "done" ? "border-green-500/30 hover:border-green-500/60" : "border-border hover:border-primary/50")}
                    onClick={() => enterVersion(v.id)}>
                    <div className="p-5 min-h-[160px] flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">{m.emoji}</span>
                        <Badge variant="outline" className={cn("text-[10px]", phaseColor(v.phase))}>{phaseLabel(v.phase)}</Badge>
                      </div>
                      <p className="text-sm font-semibold">{m.from} → {m.to}</p>
                      {v.phase === "done" && <p className="text-xs font-medium text-foreground mt-1 truncate">{v.washTitle}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{v.createdAt}</p>
                      {processing && (
                        <div className="mt-3"><Progress value={Math.min(100, v.progress)} className="h-1" /><p className="text-[10px] text-muted-foreground mt-1">{Math.min(100, Math.round(v.progress))}%</p></div>
                      )}
                      {v.phase === "done" && <p className="text-xs text-green-600 mt-2">{v.washResult.length.toLocaleString()} 字</p>}
                      <div className="flex-1" />
                      <p className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors mt-2 flex items-center gap-1">查看详情 <ArrowRight className="w-3 h-3" /></p>
                    </div>
                  </Card>
                )
              })}

              {/* Add new version */}
              {availableModes.length > 0 && !showModePicker && (
                <Card className="overflow-hidden border-dashed border-2 border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => setShowModePicker(true)}>
                  <div className="p-5 min-h-[160px] flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                      <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">洗另一个版本</p>
                    <p className="text-[10px] text-muted-foreground mt-1">选择新的转换模式</p>
                  </div>
                </Card>
              )}
              {showModePicker && availableModes.map(m => (
                <Card key={m.id}
                  className="overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary hover:shadow-lg transition-all cursor-pointer group bg-primary/5"
                  onClick={() => { const nv = createVersion(m.id); setVersions(prev => [...prev, nv]); setShowModePicker(false); setActiveVersionId(nv.id); setViewingStep("source") }}>
                  <div className="p-5 min-h-[160px] flex flex-col items-center justify-center">
                    <span className="text-3xl mb-3">{m.emoji}</span>
                    <p className="text-sm font-semibold">{m.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-primary transition-colors">点击创建</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
