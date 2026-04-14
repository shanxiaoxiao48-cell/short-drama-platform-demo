"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import {
  ArrowLeft, Loader2, CheckCircle, FileText, Users, Map,
  ChevronRight, ArrowRight, Sparkles, Edit3, RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { WashConfig } from "./culture-wash-dialog"

export type WashPhase = "analyzing" | "genre_select" | "mapping_edit" | "generating" | "text_edit"

interface WashWorkspaceProps {
  config: WashConfig
  onBack: () => void
  onCreateTranslationProject: (title: string, content: string) => void
  initialPhase?: WashPhase
  onWashComplete?: (targetCountry: string, genres: string[]) => void
}

// Mock data
const mockAnalysis = {
  structure: { totalWords: 152000, chapters: 120, pov: "第三人称", dialogRatio: "45%" },
  sourceGenres: ["狼人", "校园", "命定伴侣"],
  culturalElements: [
    { name: "Alpha", category: "世界观", frequency: 127, dependency: "高" },
    { name: "Pack", category: "社会制度", frequency: 89, dependency: "高" },
    { name: "Mate bond", category: "情感机制", frequency: 64, dependency: "高" },
    { name: "Omega", category: "等级制度", frequency: 52, dependency: "中" },
    { name: "Wolfsbane", category: "道具", frequency: 18, dependency: "中" },
    { name: "Full moon", category: "世界观", frequency: 31, dependency: "中" },
    { name: "Rogue", category: "社会制度", frequency: 23, dependency: "低" },
    { name: "Luna", category: "称谓", frequency: 45, dependency: "中" },
  ],
  characters: [
    { name: "Ethan Black", role: "男主", traits: "冷酷、强大、占有欲强", culturalRole: "Alpha of Dark Moon Pack" },
    { name: "Luna Rivers", role: "女主", traits: "倔强、善良、隐藏实力", culturalRole: "Rejected Omega" },
    { name: "Marcus", role: "反派", traits: "野心勃勃、阴险", culturalRole: "Alpha of Blood Fang Pack" },
    { name: "Sarah", role: "女配", traits: "嫉妒、心机", culturalRole: "Beta female" },
  ],
}

// AI recommended target genres based on source analysis + target country
const recommendedGenres: Record<string, string[]> = {
  "中国": ["修仙", "豪门", "重生", "宫斗", "都市", "穿越", "系统流", "赘婿"],
  "韩国": ["财阀", "复仇", "娱乐圈", "校园霸凌", "契约婚姻"],
  "日本": ["异世界", "后宫", "校园", "职场", "妖怪"],
  "泰国": ["豪门", "复仇", "娱乐圈", "灵异", "腹黑总裁"],
  "印度": ["宝莱坞", "家族", "商战", "禁忌之恋"],
  "印尼": ["豪门", "校园", "复仇", "灰姑娘", "霸总"],
  "越南": ["豪门", "校园", "重生", "复仇", "甜宠"],
  "菲律宾": ["豪门", "校园", "复仇", "灰姑娘", "总裁"],
  "中东": ["王室", "沙漠", "禁忌之恋", "商战"],
  "巴西": ["黑帮", "豪门", "复仇", "禁忌之恋"],
  "美国": ["狼人", "吸血鬼", "校园", "黑帮", "亿万富翁"],
  "英国": ["贵族", "庄园", "吸血鬼", "魔法学院"],
}

const mockMappings = [
  { source: "Alpha", target: "宗主", confidence: 92 },
  { source: "Pack", target: "宗门", confidence: 95 },
  { source: "Mate bond", target: "双修契约", confidence: 78 },
  { source: "Omega", target: "废柴灵根", confidence: 85 },
  { source: "Wolfsbane", target: "断肠散", confidence: 80 },
  { source: "Full moon", target: "突破瓶颈", confidence: 70 },
  { source: "Rogue", target: "散修", confidence: 88 },
  { source: "Luna", target: "宗主夫人", confidence: 90 },
]

const mockCharMappings = [
  { source: "Ethan Black", target: "萧寒", sourceSetting: "Alpha of Dark Moon Pack", targetSetting: "天玄宗宗主，化神期修为" },
  { source: "Luna Rivers", target: "苏晚", sourceSetting: "Rejected Omega", targetSetting: "被退婚的废柴灵根少女" },
  { source: "Marcus", target: "魔渊宗主", sourceSetting: "Alpha of Blood Fang Pack", targetSetting: "魔渊宗宗主，觊觎天玄宗" },
  { source: "Sarah", target: "柳如烟", sourceSetting: "Beta female", targetSetting: "天玄宗大师姐，心机深沉" },
]

const mockGeneratedText = `天玄宗大殿之上，万千弟子齐聚。宗主萧寒负手而立，冷峻的目光扫过众人。当他的视线落在苏晚身上时，胸口的契约印记微微发烫——那是自幼定下的婚约。但他压下了那丝异样。

"今日当着天玄宗上下，我萧寒正式废除与苏晚的婚约。"他的声音如寒冰般回荡在大殿之中。

四周一片哗然。苏晚感到丹田中那缕微弱的灵力剧烈震荡，但她抬起了下巴。她不会在这里倒下。不会在所有人面前示弱。

"苏晚，你可有异议？"长老的声音从高台上传来。

"没有。"她的声音平静得出奇，"既然宗主不愿，苏晚绝不强求。"

她转身离去，背影挺直如剑。身后是无数嘲讽的目光和窃窃私语。柳如烟嘴角微扬，终于等到了这一天。

苏晚走出大殿，走过长长的石阶，走到后山的悬崖边。风吹起她的衣袂，她终于允许自己的眼泪落下。

她不知道的是，三天后的雷劫之夜，她体内沉睡了十八年的上古凤凰血脉将会觉醒。而那个当众废除婚约的男人，将会为今日的决定付出代价。

这个世界的规则很简单——强者为尊。在天玄宗，修为就是一切。筑基期的弟子连内门都进不了，而化神期的宗主，是所有人仰望的存在。

苏晚曾经也是被仰望的人。苏家嫡女，自幼与天玄宗少主定下婚约。可惜天不遂人愿，她的灵根在十二岁那年被诊断为废灵根——修仙界最低等的资质。

从那以后，一切都变了。

苏家对她的态度从宠爱变成了冷漠，天玄宗的弟子从尊敬变成了嘲笑。而今天，连最后一丝体面——那纸婚约，也被当众撕碎。

"废物就是废物，还妄想嫁给宗主？"
"就她那废灵根，连外门弟子都不如。"
"听说苏家已经在给宗主物色新的联姻对象了，柳师姐呼声最高。"

这些话像针一样扎在苏晚心里。但她已经习惯了。

她不知道的是，在她离开大殿的那一刻，萧寒的手在袖中紧握成拳。他的胸口，那枚契约印记灼烧得几乎要将他吞噬。

他不是不想要她。他是不能要她。

因为有人告诉他——如果他不废除婚约，苏晚会死。`

export function WashWorkspace({ config, onBack, onCreateTranslationProject, initialPhase, onWashComplete }: WashWorkspaceProps) {
  const [phase, setPhase] = useState<WashPhase>(initialPhase || "analyzing")
  const [progress, setProgress] = useState(0)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [mappings, setMappings] = useState(mockMappings.map(m => ({ ...m })))
  const [charMappings, setCharMappings] = useState(mockCharMappings.map(m => ({ ...m })))
  const [genProgress, setGenProgress] = useState(0)
  const [generatedText, setGeneratedText] = useState(mockGeneratedText)
  // Track wash history for re-washing
  const [washHistory, setWashHistory] = useState<Array<{ targetCountry: string; genres: string[]; timestamp: string }>>([])

  // Simulate analysis
  useEffect(() => {
    if (phase !== "analyzing") return
    const t = setInterval(() => { setProgress(p => { if (p >= 100) { clearInterval(t); setTimeout(() => setPhase("genre_select"), 400); return 100 }; return p + Math.random() * 10 + 3 }) }, 250)
    return () => clearInterval(t)
  }, [phase])

  // Simulate generation
  useEffect(() => {
    if (phase !== "generating") return
    const t = setInterval(() => { setGenProgress(p => { if (p >= 100) { clearInterval(t); setTimeout(() => { setPhase("text_edit") }, 400); return 100 }; return p + Math.random() * 6 + 2 }) }, 350)
    return () => clearInterval(t)
  }, [phase])

  const targetGenres = recommendedGenres[config.targetCountry] || ["豪门", "复仇", "校园"]
  const toggleGenre = (g: string) => setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])

  const handleStartNewWash = () => {
    setWashHistory(prev => [...prev, { targetCountry: config.targetCountry, genres: selectedGenres, timestamp: new Date().toLocaleString() }])
    // Skip analysis, go directly to genre selection
    setPhase("genre_select")
    setSelectedGenres([])
    setGenProgress(0)
  }

  const steps = [
    { id: "analyzing", label: "分析原文" },
    { id: "genre_select", label: "选择方向" },
    { id: "mapping_edit", label: "映射方案" },
    { id: "generating", label: "生成文稿" },
    { id: "text_edit", label: "编辑文稿" },
  ]
  const stepIdx = steps.findIndex(s => s.id === phase)

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card px-4 py-2.5 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate">{config.projectName}</h1>
          <p className="text-[10px] text-muted-foreground">{config.sourceCountry} → {config.targetCountry}</p>
        </div>
        <div className="flex-1" />
        {/* Steps */}
        <div className="flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              <span className={cn("text-xs px-2 py-0.5 rounded", i === stepIdx ? "bg-primary/10 text-primary font-medium" : i < stepIdx ? "text-green-600" : "text-muted-foreground")}>
                {i < stepIdx && <CheckCircle className="w-3 h-3 inline mr-0.5" />}{s.label}
              </span>
            </div>
          ))}
        </div>
        {/* Wash history */}
        {washHistory.length > 0 && (
          <Badge variant="outline" className="text-xs ml-2">已洗 {washHistory.length} 版</Badge>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {/* Analyzing */}
        {phase === "analyzing" && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 max-w-sm">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
              <h2 className="text-lg font-semibold">正在分析原文...</h2>
              <p className="text-sm text-muted-foreground">提取文化元素、人物关系、叙事结构</p>
              <Progress value={Math.min(100, progress)} />
              <p className="text-xs text-muted-foreground">{Math.min(100, Math.round(progress))}%</p>
            </div>
          </div>
        )}

        {/* Genre Select - two column layout */}
        {phase === "genre_select" && (
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="grid grid-cols-[1fr_360px] gap-6 max-w-[1200px] mx-auto">
                {/* Left: Analysis results */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">原文分析结果</h2>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-3">
                    {[["15.2万", "总字数"], ["120", "章节"], [mockAnalysis.structure.pov, "视角"], [mockAnalysis.structure.dialogRatio, "对话占比"]].map(([v, l]) => (
                      <Card key={l} className="p-3 text-center">
                        <p className="text-xl font-bold">{v}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{l}</p>
                      </Card>
                    ))}
                  </div>

                  {/* Source genres */}
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">识别到的源文化题材</h3>
                    </div>
                    <div className="flex gap-2">
                      {mockAnalysis.sourceGenres.map(g => <Badge key={g} variant="secondary">{g}</Badge>)}
                    </div>
                  </Card>

                  {/* Cultural elements - compact table */}
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Map className="w-4 h-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">文化元素（{mockAnalysis.culturalElements.length}）</h3>
                    </div>
                    <div className="grid grid-cols-[1fr_80px_60px_60px] gap-x-3 gap-y-1 text-xs">
                      <span className="text-[10px] text-muted-foreground">元素</span>
                      <span className="text-[10px] text-muted-foreground">类别</span>
                      <span className="text-[10px] text-muted-foreground text-center">频次</span>
                      <span className="text-[10px] text-muted-foreground text-center">依赖度</span>
                      {mockAnalysis.culturalElements.map(el => (
                        <div key={el.name} className="contents">
                          <span className="font-medium py-1">{el.name}</span>
                          <span className="text-muted-foreground py-1">{el.category}</span>
                          <span className="text-center text-muted-foreground py-1">{el.frequency}</span>
                          <span className={cn("text-center py-1", el.dependency === "高" ? "text-red-500" : el.dependency === "中" ? "text-yellow-600" : "text-muted-foreground")}>{el.dependency}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Characters - horizontal cards */}
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">主要人物（{mockAnalysis.characters.length}）</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {mockAnalysis.characters.map(ch => (
                        <div key={ch.name} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {ch.name[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium">{ch.name}</span>
                              <Badge variant="outline" className="text-[9px] h-4">{ch.role}</Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">{ch.traits}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Right: Genre selection - sticky */}
                <div className="space-y-4">
                  <Card className="p-5 border-primary/30 bg-primary/5 sticky top-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h3 className="text-base font-semibold">选择{config.targetCountry}文化方向</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">AI 根据原文特征推荐以下方向，点击选择：</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {targetGenres.map(g => (
                        <Badge key={g} variant={selectedGenres.includes(g) ? "default" : "outline"}
                          className="cursor-pointer text-sm px-3 py-1.5 transition-all hover:scale-105" onClick={() => toggleGenre(g)}>{g}</Badge>
                      ))}
                    </div>
                    {selectedGenres.length > 0 && (
                      <div className="p-3 rounded-lg bg-background border border-border mb-4">
                        <p className="text-xs text-muted-foreground mb-1">已选方向</p>
                        <p className="text-sm font-semibold text-primary">{selectedGenres.join(" + ")}</p>
                      </div>
                    )}
                    <Button className="w-full" onClick={() => setPhase("mapping_edit")} disabled={selectedGenres.length === 0}>
                      生成映射方案 <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Card>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        {/* Mapping Edit */}
        {phase === "mapping_edit" && (
          <ScrollArea className="h-full">
            <div className="max-w-3xl mx-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">映射方案 <span className="text-sm font-normal text-muted-foreground">（可编辑后再生成）</span></h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setPhase("genre_select")}>返回选择</Button>
                  <Button onClick={() => { setGenProgress(0); setPhase("generating") }}><Sparkles className="w-4 h-4 mr-1" />开始生成</Button>
                </div>
              </div>

              {/* Element mappings - editable */}
              <Card className="p-4 space-y-3">
                <h3 className="text-sm font-semibold">文化元素映射</h3>
                <div className="space-y-1.5">
                  <div className="grid grid-cols-[1fr_28px_1fr_60px] gap-2 text-[10px] text-muted-foreground px-1">
                    <span>源元素</span><span></span><span>目标元素</span><span>置信度</span>
                  </div>
                  {mappings.map((m, i) => (
                    <div key={i} className="grid grid-cols-[1fr_28px_1fr_60px] gap-2 items-center px-1 py-1 rounded bg-muted/30">
                      <span className="text-sm">{m.source}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground mx-auto" />
                      <Input className="h-7 text-sm" value={m.target} onChange={e => { const n = [...mappings]; n[i] = { ...n[i], target: e.target.value }; setMappings(n) }} />
                      <span className={cn("text-xs text-center", m.confidence >= 85 ? "text-green-600" : m.confidence >= 70 ? "text-yellow-600" : "text-orange-600")}>{m.confidence}%</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Character mappings - editable */}
              <Card className="p-4 space-y-3">
                <h3 className="text-sm font-semibold">人物转换</h3>
                <div className="space-y-3">
                  {charMappings.map((ch, i) => (
                    <div key={i} className="grid grid-cols-2 gap-3 p-3 rounded border border-border">
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground">原人物</p>
                        <p className="text-sm font-medium">{ch.source}</p>
                        <p className="text-xs text-muted-foreground">{ch.sourceSetting}</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-primary">目标人物</p>
                        <Input className="h-7 text-sm" value={ch.target} onChange={e => { const n = [...charMappings]; n[i] = { ...n[i], target: e.target.value }; setCharMappings(n) }} />
                        <Input className="h-7 text-xs" value={ch.targetSetting} onChange={e => { const n = [...charMappings]; n[i] = { ...n[i], targetSetting: e.target.value }; setCharMappings(n) }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </ScrollArea>
        )}

        {/* Generating */}
        {phase === "generating" && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 max-w-sm">
              <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto" />
              <h2 className="text-lg font-semibold">正在生成洗稿文本...</h2>
              <p className="text-sm text-muted-foreground">根据映射方案改写全文</p>
              <Progress value={Math.min(100, genProgress)} />
              <p className="text-xs text-muted-foreground">{Math.min(100, Math.round(genProgress))}%</p>
            </div>
          </div>
        )}

        {/* Text Edit - full text editor, no chapters */}
        {phase === "text_edit" && (
          <div className="flex flex-col h-full">
            <div className="shrink-0 px-4 py-2 border-b border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold">洗稿结果</h2>
                <span className="text-xs text-muted-foreground">可直接编辑文本</span>
                <Badge variant="outline" className="text-xs">{mockAnalysis.sourceGenres.join("/")} → {selectedGenres.join("/")}</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPhase("mapping_edit")}>
                  返回映射
                </Button>
                <Button variant="outline" size="sm" onClick={() => { onWashComplete?.(config.targetCountry, selectedGenres); onBack() }}>
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />完成
                </Button>
                <Button variant="outline" size="sm" onClick={handleStartNewWash}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />洗另一个文化
                </Button>
                <Button size="sm" onClick={() => onCreateTranslationProject(config.projectName, generatedText)}>
                  转入翻译流程
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <textarea
                value={generatedText}
                onChange={e => setGeneratedText(e.target.value)}
                className="w-full h-full resize-none border-0 outline-none p-8 bg-background leading-relaxed whitespace-pre-wrap"
                style={{ fontSize: "16px", lineHeight: "1.8" }}
                spellCheck={false}
              />
            </div>
            <div className="shrink-0 border-t border-border/50 px-4 py-1.5 flex items-center justify-between text-xs text-muted-foreground bg-card">
              <span>{generatedText.length.toLocaleString()} 字符</span>
              <span>{mockAnalysis.sourceGenres.join("/")} → {selectedGenres.join("/")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
