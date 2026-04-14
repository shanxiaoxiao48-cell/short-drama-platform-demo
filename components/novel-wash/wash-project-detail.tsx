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

interface WashProjectDetailProps {
  projectName: string
  config: WashConfig
  onBack: () => void
  onCreateTranslationProject: (title: string, content: string) => void
}

type Phase = "idle" | "analyzing" | "analyzed" | "mapping" | "mapped" | "generating" | "done"
// Which step page to view (can differ from phase when navigating back)
type ViewStep = "source" | "analysis" | "mapping" | "wash"

interface AnalysisCharacter { name: string; role: string; traits: string; identity: string }
interface AnalysisStoryline { act: string; range: string; summary: string }
interface AnalysisEmotion { pair: string; type: string; arc: string }
interface AnalysisData {
  characters: AnalysisCharacter[]
  storyline: AnalysisStoryline[]
  emotions: AnalysisEmotion[]
}

interface WashVersion {
  id: string
  mode: string
  phase: Phase
  progress: number
  washTitle: string
  analysisData: AnalysisData
  mappingResult: MappingData
  washResult: string
  createdAt: string
}

interface MappingData {
  worldView: { source: string; target: string }
  characters: Array<{ source: string; target: string; sourceRole: string; targetRole: string }>
  conflicts: Array<{ source: string; target: string }>
  terms: Array<{ source: string; target: string }>
}

const modeLabels: Record<string, { from: string; to: string; emoji: string }> = {
  ancient_to_werewolf: { from: "古言", to: "狼人", emoji: "🐺" },
  period_to_mafia: { from: "年代文", to: "黑手党", emoji: "🔫" },
}
const allModes = [
  { id: "ancient_to_werewolf", label: "古言转狼人", emoji: "🐺" },
  { id: "period_to_mafia", label: "年代文转黑手党", emoji: "🔫" },
]

// ===== Mock Analysis Data =====
const mockCharacters = [
  { name: "老祖宗", role: "主角", traits: "冷静、淡漠、超然", identity: "存活上千年的皇室老祖宗，王朝守护者" },
  { name: "柳贵妃", role: "反派", traits: "傲慢、嫉妒、愚蠢", identity: "新晋受宠的贵妃，柳尚书之女" },
  { name: "镇北王", role: "男配", traits: "忠诚、刚毅、果决", identity: "手握重兵的王爷，老祖宗亲手带大" },
  { name: "皇帝", role: "配角", traits: "依赖、软弱、矛盾", identity: "当朝天子，依赖老祖宗稳固皇位" },
  { name: "柳尚书", role: "反派", traits: "阴险、狡诈、结党营私", identity: "当朝尚书，柳贵妃之父" },
  { name: "阿蘅", role: "配角", traits: "忠诚、善良", identity: "老祖宗的贴身宫女" },
]
const mockStoryline = [
  { act: "第一幕：开端", range: "第一节-第三节", summary: "柳贵妃闯入老祖宗居所，将其误认为普通妃嫔并羞辱。老祖宗派阿蘅传话，阿蘅被拦下施以酷刑。镇北王率玄甲军赶到，当众下跪揭示身份。" },
  { act: "第二幕：对抗", range: "第四节-第八节", summary: "老祖宗住进镇北王府。柳尚书联合文官弹劾镇北王。柳贵妃设宴下药，老祖宗百毒不侵并揭示千年身份。柳尚书以'妖女'之名逼迫皇帝。" },
  { act: "第三幕：高潮", range: "第九节-第十节", summary: "老祖宗亲临金銮殿，陈述千年功绩，老臣含泪证实。揭露柳尚书罪行，柳家覆灭。贵妃打入冷宫后疯癫。新皇登基，拜见老祖宗。" },
]
const mockEmotions = [
  { pair: "老祖宗 × 贵妃", type: "敌对/冲突", arc: "陌生敌对 → 权力逆转 → 彻底碾压 → 终极审判" },
  { pair: "老祖宗 × 皇帝", type: "类亲情/政治庇护", arc: "幕后扶持 → 公开庇护 → 引导放手 → 永恒象征" },
  { pair: "老祖宗 × 镇北王", type: "类亲情/师徒", arc: "长辈亲情 → 信任守护 → 温暖陪伴 → 宿命分离" },
  { pair: "贵妃 × 皇帝", type: "宠爱/利用", arc: "受宠 → 被训斥 → 被抛弃 → 冷宫疯癫" },
]

// ===== Mock Mapping Data =====
const wolfMapping: MappingData = {
  worldView: {
    source: `皇权至上，背后由不老不死的"老祖宗"作为王朝定海神针。存在皇帝、世家、权臣、王爷、后宫等势力，权力博弈围绕朝堂、宫闱和家族利益展开。`,
    target: `狼族王庭由月冠狼王统治，整个狼族的稳定系于永生的"始祖"（The Progenitor）。王庭之下有纯血部族、支系首领和长老会，权力博弈围绕王庭、部族领地和血脉正统性展开。`,
  },
  characters: [
    { source: "老祖宗", target: "始祖 (The Progenitor)", sourceRole: "存活上千年的皇室老祖宗，王朝守护者", targetRole: "狼族始祖，所有纯血狼族的源头，永生不朽" },
    { source: "柳贵妃", target: "辛德拉 (Cinder)", sourceRole: "新晋受宠的贵妃，柳尚书之女", targetRole: "黑牙部族族长之女，狼王的受宠情妇" },
    { source: "镇北王", target: "凯恩 (Kaelen)", sourceRole: "手握重兵的王爷", targetRole: "北境霜牙领地的Alpha领主，统帅铁卫狼群" },
    { source: "皇帝", target: "科文 (Corvin)", sourceRole: "当朝天子", targetRole: "现任月冠狼王" },
    { source: "柳尚书", target: "马尔科 (Malakor)", sourceRole: "当朝尚书，权臣", targetRole: "黑牙部族的Alpha族长" },
    { source: "阿蘅", target: "海拉 (Hella)", sourceRole: "贴身宫女", targetRole: "侍奉始祖的年轻侍从" },
  ],
  conflicts: [
    { source: "贵妃因争宠而羞辱殴打老祖宗", target: "辛德拉因嫉妒闯入始祖静居地，将其误认为狼王秘密情人并挑衅攻击" },
    { source: "镇北王带兵入宫救人，被弹劾'强抢宫眷'", target: "凯恩率铁卫狼群闯入王庭核心区，被黑牙族长在长老会上审判'践踏王权'" },
    { source: "柳贵妃设宴下药，老祖宗百毒不侵", target: "辛德拉在月宴上用'狂月草'引发狼性狂乱，始祖原始血脉免疫" },
    { source: "柳尚书朝堂指控'妖女'，老祖宗金殿陈述功绩", target: "黑牙族长在部族盟会指控'异端'，始祖释放血脉威压，历数守护功绩" },
  ],
  terms: [
    { source: "皇帝/圣上", target: "狼王/月冠狼王" }, { source: "贵妃/宠妃", target: "受宠情妇" },
    { source: "王爷", target: "Alpha领主" }, { source: "尚书/大臣", target: "族长/长老" },
    { source: "老祖宗", target: "始祖 (The Progenitor)" }, { source: "宫女/嬷嬷", target: "侍从/族人" },
    { source: "皇宫/宫闱", target: "王庭/王庭核心区" }, { source: "朝堂/金銮殿", target: "长老会议厅/部族盟会" },
    { source: "玄甲军", target: "铁卫狼群 (Ironhide Pack)" }, { source: "府/宅", target: "族府 (Clan Hold)" },
  ],
}
const mafiaMapping: MappingData = {
  worldView: { source: `皇权至上，背后由不老不死的"老祖宗"作为王朝定海神针。`, target: "20世纪意大利裔美国黑手党家族，教母是家族的隐退精神领袖，权力围绕家族忠诚与利益展开。" },
  characters: [
    { source: "老祖宗", target: "教母 (The Godmother)", sourceRole: "家族精神领袖", targetRole: "科莱昂家族的隐退教母" },
    { source: "柳贵妃", target: "维多利亚", sourceRole: "新晋受宠的贵妃", targetRole: "新任教父的情妇" },
    { source: "镇北王", target: "桑尼", sourceRole: "手握重兵的王爷", targetRole: "家族军师/执行者" },
  ],
  conflicts: [{ source: "宫斗争宠", target: "家族内部权力争夺" }, { source: "带兵入宫", target: "带手下闯入家族聚会" }, { source: "设宴下药", target: "在家族晚宴上下毒" }],
  terms: [{ source: "皇帝", target: "教父 (Don)" }, { source: "贵妃", target: "情妇" }, { source: "王爷", target: "Consigliere" }, { source: "皇宫", target: "家族庄园" }],
}

// ===== Mock Wash Results =====
const wolfWashResult = `# 我是狼族始祖，情妇欺辱我后悔疯了

## 第一章

月光如银，洒落在王庭禁地那座古老的石殿上。

始祖靠在窗边，漫不经心地翻看着一卷泛黄的羊皮卷。千年的岁月在她身上没有留下任何痕迹，她的面容依旧如少女般年轻，只有那双眼睛深处，沉淀着看尽沧桑的淡漠。

"砰——"

石殿的大门被粗暴地推开，一个身着华贵皮裘的女人带着几个护卫闯了进来。

"就是你？"辛德拉上下打量着始祖，嘴角勾起一抹轻蔑的弧度，"一个连部族标记都没有的野狼，也配让狼王日日来探望？"

始祖连眼皮都没抬，继续翻着手中的羊皮卷。

"我在跟你说话！"辛德拉一把夺过始祖手中的羊皮卷，"你这个没名没分的野狼，趁早给我滚出王庭！"

始祖终于抬起了眼，看了辛德拉一眼。那目光平静得像一潭死水，却让辛德拉莫名地打了个寒颤。

"你知道，"始祖的声音很轻，"上一个这样跟我说话的人，她整个部族的头颅，都被挂在了领地的界碑上。"

## 第二章

侍从海拉匆匆赶来，却被辛德拉的护卫拦在了门外。

"放开我！我要见我家主人！"海拉拼命挣扎。

辛德拉冷笑一声，示意护卫将海拉按倒在地。她走到始祖面前，利爪划过始祖的额头，留下一道浅浅的血痕。

始祖伸手摸了摸额头上的血迹，看着指尖的鲜红，忽然笑了。

"很好。已经很久没有人敢让我流血了。"

就在这时，王庭外传来一阵整齐的脚步声，伴随着低沉的狼嚎。霜牙领主凯恩率铁卫狼群闯入王庭。

他看到始祖额头上的血痕，瞳孔骤然收缩。下一秒，单膝跪地。

"始祖，孙儿来迟了。"

辛德拉的脸色瞬间变得惨白。`

const mafiaWashResult = `# 我是家族教母，情妇欺辱我后悔疯了

## 第一章

曼哈顿的夜色如墨，科莱昂家族的老宅隐没在长岛的梧桐树影中。

教母坐在二楼的书房里，手指轻轻摩挲着一张泛黄的照片。五十年了。

"砰——"

书房的门被推开，一个穿着貂皮大衣的金发女人踩着高跟鞋走了进来。

"就是你？"维多利亚上下打量着教母，"一个住在阁楼里的老太婆，凭什么让迈克尔每天都来请安？"`

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
    analysisData: {
      characters: mockCharacters.map(c => ({ ...c })),
      storyline: mockStoryline.map(s => ({ ...s })),
      emotions: mockEmotions.map(e => ({ ...e })),
    },
    mappingResult: modeId === "period_to_mafia" ? JSON.parse(JSON.stringify(mafiaMapping)) : JSON.parse(JSON.stringify(wolfMapping)),
    washResult: modeId === "period_to_mafia" ? mafiaWashResult : wolfWashResult,
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
// Which step index the phase has reached (max completed)
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
    const mp = activeVersion.mappingResult
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

        {/* ===== PAGE: Analysis results ===== */}
        {viewingStep === "analysis" && (() => {
          const isEd = editingStep === "analysis"
          const inputCls = isEd ? "bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none" : "bg-transparent border-b border-transparent outline-none cursor-default"
          const textCls = isEd ? "bg-transparent border border-transparent hover:border-border focus:border-primary outline-none resize-none rounded p-1" : "bg-transparent border border-transparent outline-none resize-none rounded p-1 cursor-default"
          return (
          <ScrollArea className="flex-1">
            <div className="p-6 max-w-5xl mx-auto space-y-8">
              {/* Characters */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">原作人物介绍</h2>
                  <Badge variant="outline" className="text-[10px]">{activeVersion.analysisData.characters.length} 人</Badge>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeVersion.analysisData.characters.map((ch, ci) => (
                    <Card key={ci} className="p-3 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{ch.name[0]}</div>
                        <input className={cn("text-sm font-medium flex-1 min-w-0", inputCls)} value={ch.name} readOnly={!isEd}
                          onChange={e => { const d = { ...activeVersion.analysisData }; d.characters = [...d.characters]; d.characters[ci] = { ...d.characters[ci], name: e.target.value }; updateVersion(activeVersion.id, { analysisData: d }) }} />
                        <input className={cn("text-[9px] bg-muted/50 rounded px-1.5 py-0.5 w-12 text-center", inputCls)} value={ch.role} readOnly={!isEd}
                          onChange={e => { const d = { ...activeVersion.analysisData }; d.characters = [...d.characters]; d.characters[ci] = { ...d.characters[ci], role: e.target.value }; updateVersion(activeVersion.id, { analysisData: d }) }} />
                      </div>
                      <input className={cn("text-xs text-muted-foreground w-full", inputCls)} value={ch.identity} readOnly={!isEd}
                        onChange={e => { const d = { ...activeVersion.analysisData }; d.characters = [...d.characters]; d.characters[ci] = { ...d.characters[ci], identity: e.target.value }; updateVersion(activeVersion.id, { analysisData: d }) }} />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground/70 shrink-0">特质：</span>
                        <input className={cn("text-[10px] text-muted-foreground/70 flex-1", inputCls)} value={ch.traits} readOnly={!isEd}
                          onChange={e => { const d = { ...activeVersion.analysisData }; d.characters = [...d.characters]; d.characters[ci] = { ...d.characters[ci], traits: e.target.value }; updateVersion(activeVersion.id, { analysisData: d }) }} />
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Structure */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Drama className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">三幕式结构分析</h2>
                </div>
                <div className="space-y-3">
                  {activeVersion.analysisData.storyline.map((act, si) => (
                    <Card key={si} className="p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <input className={cn("text-sm font-semibold", inputCls)} value={act.act} readOnly={!isEd}
                          onChange={e => { const d = { ...activeVersion.analysisData }; d.storyline = [...d.storyline]; d.storyline[si] = { ...d.storyline[si], act: e.target.value }; updateVersion(activeVersion.id, { analysisData: d }) }} />
                        <span className="text-[10px] text-muted-foreground">【</span>
                        <input className={cn("text-[10px] text-muted-foreground w-24", inputCls)} value={act.range} readOnly={!isEd}
                          onChange={e => { const d = { ...activeVersion.analysisData }; d.storyline = [...d.storyline]; d.storyline[si] = { ...d.storyline[si], range: e.target.value }; updateVersion(activeVersion.id, { analysisData: d }) }} />
                        <span className="text-[10px] text-muted-foreground">】</span>
                      </div>
                      <textarea className={cn("text-xs text-muted-foreground leading-relaxed w-full", textCls)} rows={2} value={act.summary} readOnly={!isEd}
                        onChange={e => { const d = { ...activeVersion.analysisData }; d.storyline = [...d.storyline]; d.storyline[si] = { ...d.storyline[si], summary: e.target.value }; updateVersion(activeVersion.id, { analysisData: d }) }} />
                    </Card>
                  ))}
                </div>
              </section>

              {/* Emotions */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">情感关系分析</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {activeVersion.analysisData.emotions.map((em, ei) => (
                    <Card key={ei} className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <input className={cn("text-xs font-semibold w-28", inputCls)} value={em.pair} readOnly={!isEd}
                          onChange={e => { const d = { ...activeVersion.analysisData }; d.emotions = [...d.emotions]; d.emotions[ei] = { ...d.emotions[ei], pair: e.target.value }; updateVersion(activeVersion.id, { analysisData: d }) }} />
                        <input className={cn("text-[9px] bg-muted/50 rounded px-1.5 py-0.5 w-24", inputCls)} value={em.type} readOnly={!isEd}
                          onChange={e => { const d = { ...activeVersion.analysisData }; d.emotions = [...d.emotions]; d.emotions[ei] = { ...d.emotions[ei], type: e.target.value }; updateVersion(activeVersion.id, { analysisData: d }) }} />
                      </div>
                      <input className={cn("text-[10px] text-muted-foreground w-full", inputCls)} value={em.arc} readOnly={!isEd}
                        onChange={e => { const d = { ...activeVersion.analysisData }; d.emotions = [...d.emotions]; d.emotions[ei] = { ...d.emotions[ei], arc: e.target.value }; updateVersion(activeVersion.id, { analysisData: d }) }} />
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          </ScrollArea>
          )
        })()}

        {/* ===== PAGE: Mapping framework ===== */}
        {viewingStep === "mapping" && (() => {
          const isEd = editingStep === "mapping"
          const inputCls = isEd ? "bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none" : "bg-transparent border-b border-transparent outline-none cursor-default"
          const textCls = isEd ? "bg-transparent border border-transparent hover:border-border focus:border-primary outline-none resize-none rounded p-1" : "bg-transparent border border-transparent outline-none resize-none rounded p-1 cursor-default"
          const updateMap = (patch: Partial<MappingData>) => { if (isEd) updateVersion(activeVersion.id, { mappingResult: { ...mp, ...patch } }) }
          const updateChar = (i: number, field: string, val: string) => { const c = mp.characters.map((x, j) => j === i ? { ...x, [field]: val } : x); updateMap({ characters: c }) }
          const updateConflict = (i: number, field: string, val: string) => { const c = mp.conflicts.map((x, j) => j === i ? { ...x, [field]: val } : x); updateMap({ conflicts: c }) }
          const updateTerm = (i: number, field: string, val: string) => { const c = mp.terms.map((x, j) => j === i ? { ...x, [field]: val } : x); updateMap({ terms: c }) }
          return (
          <ScrollArea className="flex-1">
            <div className="p-6 max-w-5xl mx-auto space-y-8">
              {/* World view */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Map className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">世界观转换</h2>
                </div>
                <Card className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1 font-medium">原设定</p>
                      <textarea className={cn("text-xs leading-relaxed w-full", textCls)} rows={3} value={mp.worldView.source} readOnly={!isEd}
                        onChange={e => updateMap({ worldView: { ...mp.worldView, source: e.target.value } })} />
                    </div>
                    <div>
                      <p className="text-[10px] text-primary mb-1 font-medium">目标设定（{mode.to}）</p>
                      <textarea className={cn("text-xs leading-relaxed w-full", textCls)} rows={3} value={mp.worldView.target} readOnly={!isEd}
                        onChange={e => updateMap({ worldView: { ...mp.worldView, target: e.target.value } })} />
                    </div>
                  </div>
                </Card>
              </section>

              {/* Character mapping */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">角色转换表</h2>
                  <Badge variant="outline" className="text-[10px]">{mp.characters.length} 人</Badge>
                </div>
                <Card className="overflow-hidden">
                  <div className="grid grid-cols-[1fr_28px_1fr] text-xs">
                    <div className="px-4 py-2 bg-muted/50 font-medium text-muted-foreground border-b border-border">原著角色</div>
                    <div className="bg-muted/50 border-b border-border" />
                    <div className="px-4 py-2 bg-muted/50 font-medium text-primary border-b border-border">{mode.to}版角色</div>
                    {mp.characters.map((ch, i) => (
                      <div key={i} className="contents">
                        <div className={cn("px-4 py-2", i < mp.characters.length - 1 && "border-b border-border/50")}>
                          <input className={cn("font-medium w-full", inputCls)} value={ch.source} readOnly={!isEd} onChange={e => updateChar(i, "source", e.target.value)} />
                          <input className={cn("text-[10px] text-muted-foreground mt-0.5 w-full", inputCls)} value={ch.sourceRole} readOnly={!isEd} onChange={e => updateChar(i, "sourceRole", e.target.value)} />
                        </div>
                        <div className={cn("flex items-center justify-center", i < mp.characters.length - 1 && "border-b border-border/50")}>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className={cn("px-4 py-2", i < mp.characters.length - 1 && "border-b border-border/50")}>
                          <input className={cn("font-medium text-primary w-full", inputCls)} value={ch.target} readOnly={!isEd} onChange={e => updateChar(i, "target", e.target.value)} />
                          <input className={cn("text-[10px] text-muted-foreground mt-0.5 w-full", inputCls)} value={ch.targetRole} readOnly={!isEd} onChange={e => updateChar(i, "targetRole", e.target.value)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </section>

              {/* Conflict mapping */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">关键冲突转换</h2>
                </div>
                <div className="space-y-2">
                  {mp.conflicts.map((c, i) => (
                    <Card key={i} className="p-3">
                      <div className="grid grid-cols-[1fr_28px_1fr] items-center gap-2">
                        <input className={cn("text-xs w-full", inputCls)} value={c.source} readOnly={!isEd} onChange={e => updateConflict(i, "source", e.target.value)} />
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground mx-auto" />
                        <input className={cn("text-xs text-primary w-full", inputCls)} value={c.target} readOnly={!isEd} onChange={e => updateConflict(i, "target", e.target.value)} />
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Term mapping */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">称谓与场景转换</h2>
                </div>
                <Card className="overflow-hidden">
                  <div className="grid grid-cols-[1fr_28px_1fr] text-xs">
                    <div className="px-4 py-1.5 bg-muted/50 font-medium text-muted-foreground border-b border-border">原著</div>
                    <div className="bg-muted/50 border-b border-border" />
                    <div className="px-4 py-1.5 bg-muted/50 font-medium text-primary border-b border-border">{mode.to}版</div>
                    {mp.terms.map((t, i) => (
                      <div key={i} className="contents">
                        <div className={cn("px-4 py-1", i < mp.terms.length - 1 && "border-b border-border/30")}>
                          <input className={cn("w-full", inputCls)} value={t.source} readOnly={!isEd} onChange={e => updateTerm(i, "source", e.target.value)} />
                        </div>
                        <div className={cn("flex items-center justify-center", i < mp.terms.length - 1 && "border-b border-border/30")}>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <div className={cn("px-4 py-1 text-primary", i < mp.terms.length - 1 && "border-b border-border/30")}>
                          <input className={cn("text-primary w-full", inputCls)} value={t.target} readOnly={!isEd} onChange={e => updateTerm(i, "target", e.target.value)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
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
