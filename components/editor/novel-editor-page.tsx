"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft, PanelLeftClose, PanelLeftOpen, PanelRightClose,
  PanelRightOpen, BookOpen, FileText, CheckCircle, Search,
  History, Save, X, XCircle, AlertCircle, Replace,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NovelEditorPageProps {
  projectId: string | null
  languageVariant: string
  chapterId: string | null
  workflowStage?: string
  totalChapters?: number
  onBack: () => void
  onSubmitReview?: (action?: "submit" | "approve" | "reject") => void
  hasTerminology?: boolean
  isPreTranslation?: boolean
  isSourceLanguage?: boolean
}

const mockChapters = Array.from({ length: 50 }, (_, i) => ({
  id: `${i + 1}`,
  title: `第${i + 1}章`,
  name: i === 0 ? "初入都市" : i === 1 ? "神秘来客" : i === 2 ? "暗流涌动" : i === 3 ? "真相大白" : i === 4 ? "风云再起" : `第${i + 1}章`,
}))

const originalParagraphs = [
  `　　夜幕降临，城市的霓虹灯渐次亮起，将整个天际线染成了一片绚烂的色彩。李明站在公寓的阳台上，俯瞰着这座他生活了二十多年的城市，心中却涌起一股莫名的陌生感。`,
  `　　\u201c你还在看什么？\u201d身后传来室友张伟的声音，\u201c快来吃饭了，外卖都凉了。\u201d`,
  `　　李明转过身，走进了狭小的客厅。桌上摆着两份简单的盒饭，这就是他们的晚餐。自从大学毕业后，两人合租了这间不到四十平米的公寓，每天过着朝九晚五的生活。`,
  `　　\u201c今天公司又加班了？\u201d张伟一边吃一边问道。`,
  `　　\u201c嗯，项目赶进度。\u201d李明随口应了一声，心思却不在这里。他的脑海中一直回荡着今天在地铁站遇到的那个奇怪老人说的话——\u201c年轻人，你的命运即将改变。\u201d`,
  `　　当时他只当是疯言疯语，可不知为何，这句话却像一根刺一样扎在心里，怎么也拔不出来。`,
  `　　吃完饭后，李明回到自己的房间，打开电脑准备处理一些工作上的事情。屏幕的蓝光映在他的脸上，让他看起来有些疲惫。就在这时，他的手机突然震动了一下。`,
  `　　一条来自未知号码的短信：`,
  `　　\u201c明天下午三点，城西咖啡馆。有关你父亲的事。\u201d`,
  `　　李明的手微微颤抖了一下。他的父亲在他十岁那年就失踪了，这么多年来，没有任何人提起过关于父亲的消息。这条短信是谁发的？他们知道什么？`,
  `　　一夜无眠。`,
]
const translatedParagraphs = [
  "　　As night fell, the city's neon lights flickered to life one by one, painting the entire skyline in a dazzling array of colors. Li Ming stood on the balcony of his apartment, gazing down at the city he had called home for over twenty years, yet feeling an inexplicable sense of unfamiliarity welling up inside him.",
  '　　"What are you still looking at?" came the voice of his roommate Zhang Wei from behind. "Come eat, the takeout is getting cold."',
  "　　Li Ming turned around and walked into the cramped living room. Two simple boxed meals sat on the table — this was their dinner. Ever since graduating from college, the two of them had been sharing this apartment of less than forty square meters, living the nine-to-five life day after day.",
  '　　"Did the company make you work overtime again today?" Zhang Wei asked between bites.',
  '　　"Yeah, rushing to meet the project deadline," Li Ming replied absently, his mind elsewhere. The words of that strange old man he had encountered at the subway station kept echoing in his head — "Young man, your destiny is about to change."',
  "　　At the time, he had dismissed it as the ramblings of a madman, but for some reason, those words had lodged themselves in his heart like a thorn that couldn't be pulled out.",
  "　　After dinner, Li Ming returned to his room and opened his computer to handle some work matters. The blue glow of the screen reflected off his face, making him look somewhat weary. Just then, his phone suddenly buzzed.",
  "　　A text message from an unknown number:",
  '　　"Tomorrow at three in the afternoon, the West City Café. It\'s about your father."',
  "　　Li Ming's hand trembled slightly. His father had disappeared when he was ten years old, and in all these years, no one had ever mentioned anything about his father. Who sent this message? What did they know?",
  "　　A sleepless night.",
]

interface TermEntry { original: string; type: string; description: string; translated?: string }
const mockSourceTerminology: TermEntry[] = [
  { original: "李明", type: "人名", description: "主角，男，25岁" },
  { original: "张伟", type: "人名", description: "主角室友" },
  { original: "霓虹灯", type: "名词", description: "城市灯光" },
  { original: "朝九晚五", type: "习语", description: "形容上班族的日常作息" },
  { original: "城西咖啡馆", type: "地名", description: "关键地点，与父亲线索相关" },
  { original: "盒饭", type: "文化词汇", description: "外卖盒装饭菜" },
  { original: "公寓", type: "名词", description: "主角住所" },
  { original: "地铁站", type: "名词", description: "遇到神秘老人的地点" },
]
const mockTranslatedTerminology: TermEntry[] = [
  { original: "李明", type: "人名", description: "主角，男，25岁", translated: "Li Ming" },
  { original: "张伟", type: "人名", description: "主角室友", translated: "Zhang Wei" },
  { original: "霓虹灯", type: "名词", description: "城市灯光", translated: "neon lights" },
  { original: "朝九晚五", type: "习语", description: "形容上班族的日常作息", translated: "nine-to-five" },
  { original: "城西咖啡馆", type: "地名", description: "关键地点，与父亲线索相关", translated: "West City Café" },
  { original: "盒饭", type: "文化词汇", description: "外卖盒装饭菜", translated: "boxed meals" },
  { original: "公寓", type: "名词", description: "主角住所", translated: "apartment" },
  { original: "地铁站", type: "名词", description: "遇到神秘老人的地点", translated: "subway station" },
]

interface HistoryVersion { id: string; version: number; type: "ai" | "manual" | "review"; userName: string; timestamp: string; summary: string; paragraphs: string[] }
const v1Paragraphs = [...translatedParagraphs]
const v2Paragraphs = translatedParagraphs.map((p, i) => {
  if (i === 0) return "　　As night fell, the city's neon lights flickered to life one by one, painting the entire skyline in brilliant, dazzling colors. Li Ming stood on the balcony of his apartment, gazing down at the city he had called home for over twenty years, yet feeling an inexplicable sense of unfamiliarity welling up inside him."
  if (i === 4) return '　　"Yeah, rushing to hit the project deadline," Li Ming replied absently, his mind elsewhere. The words of that strange old man he had encountered at the subway station kept echoing in his head — "Young man, your destiny is about to change."'
  if (i === 7) return "　　A text from an unknown number appeared:"
  return p
})
const v3Paragraphs = v2Paragraphs.map((p, i) => {
  if (i === 0) return "　　As night fell, the city's neon lights flickered to life one by one, painting the skyline in a brilliant spectrum of colors. Li Ming stood on the balcony of his apartment, gazing down at the city he had called home for over twenty years, yet feeling an inexplicable sense of unfamiliarity welling up inside him."
  if (i === 5) return "　　At the time, he had dismissed it as the ramblings of a madman, but for some reason, those words had embedded themselves in his mind like a splinter that couldn't be pulled out."
  return p
})
const mockHistoryVersions: HistoryVersion[] = [
  { id: "v1", version: 1, type: "ai", userName: "AI翻译", timestamp: "2026-03-20 14:30", summary: "AI自动翻译", paragraphs: v1Paragraphs },
  { id: "v2", version: 2, type: "manual", userName: "译员A", timestamp: "2026-03-21 09:15", summary: "人工校对修改", paragraphs: v2Paragraphs },
  { id: "v3", version: 3, type: "review", userName: "审校B", timestamp: "2026-03-22 11:00", summary: "审校修改", paragraphs: v3Paragraphs },
]

type DiffSegment = { text: string; type: "same" | "added" | "deleted" }
function computeWordDiff(oldText: string, newText: string): DiffSegment[] {
  const splitWords = (s: string) => s.match(/[\S]+|\s+/g) || []
  const oldWords = splitWords(oldText)
  const newWords = splitWords(newText)
  const m = oldWords.length, n = newWords.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = oldWords[i - 1] === newWords[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
  const segments: DiffSegment[] = []
  let i = m, j = n
  const raw: DiffSegment[] = []
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) { raw.push({ text: oldWords[i - 1], type: "same" }); i--; j-- }
    else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) { raw.push({ text: newWords[j - 1], type: "added" }); j-- }
    else { raw.push({ text: oldWords[i - 1], type: "deleted" }); i-- }
  }
  raw.reverse()
  for (const seg of raw) {
    if (segments.length > 0 && segments[segments.length - 1].type === seg.type) segments[segments.length - 1].text += seg.text
    else segments.push({ ...seg })
  }
  return segments
}

// Build full text with chapter markers
function buildFullText(paragraphs: string[], totalChapters: number): string {
  const lines: string[] = []
  const parasPerChapter = Math.ceil(paragraphs.length / Math.min(5, totalChapters))
  for (let c = 0; c < totalChapters; c++) {
    const ch = mockChapters[c]
    lines.push(`$#{${ch.title}|Chapter ${c + 1}. ${ch.name}}$#`)
    lines.push("")
    if (c < 5) {
      const start = c * parasPerChapter
      const end = Math.min(start + parasPerChapter, paragraphs.length)
      for (let p = start; p < end; p++) { lines.push(paragraphs[p]); lines.push("") }
    } else { lines.push(`　　（${ch.title}内容...）`); lines.push("") }
  }
  return lines.join("\n")
}

// Build original panel items: chapter headers + paragraphs with indices
interface OriginalItem {
  type: "chapter" | "paragraph"
  text: string
  paragraphIndex: number // global paragraph index (only meaningful for type=paragraph)
}
function buildOriginalItems(totalChapters: number): OriginalItem[] {
  const items: OriginalItem[] = []
  let pIdx = 0
  const parasPerChapter = Math.ceil(originalParagraphs.length / Math.min(5, totalChapters))
  for (let c = 0; c < totalChapters; c++) {
    const ch = mockChapters[c]
    items.push({ type: "chapter", text: `$#{${ch.title}|Chapter ${c + 1}. ${ch.name}}$#`, paragraphIndex: -1 })
    if (c < 5) {
      const start = c * parasPerChapter
      const end = Math.min(start + parasPerChapter, originalParagraphs.length)
      for (let p = start; p < end; p++) {
        items.push({ type: "paragraph", text: originalParagraphs[p], paragraphIndex: pIdx++ })
      }
    } else {
      items.push({ type: "paragraph", text: `　　（${ch.title}原文内容...）`, paragraphIndex: pIdx++ })
    }
  }
  return items
}

// Given cursor position in full text, find which paragraph index (0-based, skipping chapter markers and blanks)
function cursorToParagraphIndex(text: string, cursorPos: number): number {
  const textUpToCursor = text.substring(0, cursorPos)
  const lines = textUpToCursor.split("\n")
  // Walk through ALL lines of the full text to count paragraphs
  const allLines = text.split("\n")
  let pIdx = -1
  let charCount = 0
  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i]
    const isChapter = line.startsWith("$#{")
    const isBlank = line.trim() === ""
    if (!isChapter && !isBlank) pIdx++
    // Check if cursor is within this line
    const lineEnd = charCount + line.length
    if (cursorPos >= charCount && cursorPos <= lineEnd) {
      return Math.max(0, pIdx)
    }
    charCount = lineEnd + 1 // +1 for \n
  }
  return Math.max(0, pIdx)
}

export function NovelEditorPage({
  projectId: _projectId, languageVariant, chapterId: _chapterId, workflowStage, totalChapters = 50,
  onBack, onSubmitReview, hasTerminology = false, isPreTranslation = false,
  isSourceLanguage = false,
}: NovelEditorPageProps) {
  const isTermReview = workflowStage === "术语提取待确认"
  const isReviewStage = workflowStage === "翻译待确认"
  const isQualityCheckStage = workflowStage === "质检审核" || workflowStage === "质检待确认" || workflowStage === "终稿质检"
  const isManualTranslate = workflowStage === "人工翻译"
  const isEditable = (isManualTranslate || isReviewStage || isQualityCheckStage) && !isSourceLanguage && !isPreTranslation
  const showOriginalPanelOption = !isSourceLanguage && !isPreTranslation

  const stageLabel = isTermReview ? "术语确认" : isReviewStage ? "审校" :
    isQualityCheckStage ? "终稿质检" : isSourceLanguage ? "原文查看" :
    isPreTranslation ? "原文查看" : "人工翻译"

  // Content
  const baseParagraphs = isPreTranslation || isSourceLanguage ? originalParagraphs : translatedParagraphs
  const [content, setContent] = useState(() => buildFullText(baseParagraphs, totalChapters))
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Original panel items
  const originalItems = useMemo(() => buildOriginalItems(totalChapters), [totalChapters])
  const originalParaRefs = useRef<(HTMLParagraphElement | null)[]>([])

  // Panels
  const [showOriginalPanel, setShowOriginalPanel] = useState(showOriginalPanelOption)
  const [showTermPanel, setShowTermPanel] = useState(hasTerminology)
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)

  // Font
  const [fontSize, setFontSize] = useState("16")
  const [fontFamily, setFontFamily] = useState("default")

  // Active paragraph for sync
  const [activeParagraphIdx, setActiveParagraphIdx] = useState<number>(0)

  // Comments (review/QC can add, translator can view)
  const [showCommentsPanel, setShowCommentsPanel] = useState(isReviewStage || isQualityCheckStage)
  const [comments, setComments] = useState<Array<{ paragraphIdx: number; text: string; author: string; timestamp: string }>>([
    { paragraphIdx: 0, text: "这段翻译语序不太自然，建议调整", author: "审校员A", timestamp: "2026-04-10 14:30" },
    { paragraphIdx: 3, text: "术语'霓虹灯'翻译不一致，请统一", author: "质检员B", timestamp: "2026-04-11 09:15" },
  ])
  const [newComment, setNewComment] = useState("")
  const canAddComment = isReviewStage || isQualityCheckStage

  // Find & Replace
  const [showFindBar, setShowFindBar] = useState(false)
  const [findText, setFindText] = useState("")
  const [replaceText, setReplaceText] = useState("")
  const [showReplaceRow, setShowReplaceRow] = useState(false)
  const [matchPositions, setMatchPositions] = useState<number[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)

  // Terminology
  const [terminology, setTerminology] = useState<TermEntry[]>(isSourceLanguage ? mockSourceTerminology : mockTranslatedTerminology)
  const [editingTermIndex, setEditingTermIndex] = useState<number | null>(null)
  const [editingTerm, setEditingTerm] = useState<TermEntry | null>(null)

  // Review
  const [showReviewCompletionDialog, setShowReviewCompletionDialog] = useState(false)
  const [reviewDecision, setReviewDecision] = useState<"approve" | "reject" | null>(null)
  const [reviewRejectionReason, setReviewRejectionReason] = useState("")

  const fontStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontFamily: fontFamily === "serif" ? "SimSun, serif" : fontFamily === "sans" ? "SimHei, sans-serif" : fontFamily === "mono" ? "monospace" : "inherit",
  }

  // Track cursor position → paragraph index → scroll original panel
  const handleTextareaSelect = useCallback(() => {
    if (!textareaRef.current) return
    const pos = textareaRef.current.selectionStart
    const pIdx = cursorToParagraphIndex(content, pos)
    setActiveParagraphIdx(pIdx)
  }, [content])

  // Auto-scroll original panel when active paragraph changes
  useEffect(() => {
    if (showOriginalPanel && originalParaRefs.current[activeParagraphIdx]) {
      originalParaRefs.current[activeParagraphIdx]?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [activeParagraphIdx, showOriginalPanel])

  // Find logic
  useEffect(() => {
    if (!findText) { setMatchPositions([]); setCurrentMatchIndex(0); return }
    const positions: number[] = []
    const lower = content.toLowerCase()
    const needle = findText.toLowerCase()
    let idx = lower.indexOf(needle)
    while (idx !== -1) { positions.push(idx); idx = lower.indexOf(needle, idx + 1) }
    setMatchPositions(positions)
    setCurrentMatchIndex(0)
  }, [findText, content])

  const goToMatch = useCallback((index: number) => {
    if (matchPositions.length === 0 || !textareaRef.current) return
    const pos = matchPositions[index]
    textareaRef.current.focus()
    textareaRef.current.setSelectionRange(pos, pos + findText.length)
    const textBefore = content.substring(0, pos)
    const lineNum = textBefore.split("\n").length
    const lineHeight = parseInt(fontSize) * 1.8
    textareaRef.current.scrollTop = Math.max(0, lineNum * lineHeight - 200)
    setCurrentMatchIndex(index)
    // Also sync original panel
    const pIdx = cursorToParagraphIndex(content, pos)
    setActiveParagraphIdx(pIdx)
  }, [matchPositions, findText, content, fontSize])

  const handleFindNext = () => { if (matchPositions.length > 0) goToMatch((currentMatchIndex + 1) % matchPositions.length) }
  const handleFindPrev = () => { if (matchPositions.length > 0) goToMatch((currentMatchIndex - 1 + matchPositions.length) % matchPositions.length) }
  const handleReplaceCurrent = () => {
    if (matchPositions.length === 0 || !findText) return
    const pos = matchPositions[currentMatchIndex]
    setContent(content.substring(0, pos) + replaceText + content.substring(pos + findText.length))
  }
  const handleReplaceAll = () => {
    if (!findText) return
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
    setContent(content.replace(regex, replaceText))
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") { e.preventDefault(); setShowFindBar(true); setShowReplaceRow(false) }
      if ((e.ctrlKey || e.metaKey) && e.key === "h") { e.preventDefault(); setShowFindBar(true); setShowReplaceRow(true) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Terminology
  const startEditTerm = (index: number) => { setEditingTermIndex(index); setEditingTerm({ ...terminology[index] }) }
  const saveEditTerm = () => {
    if (editingTermIndex !== null && editingTerm) {
      const updated = [...terminology]; updated[editingTermIndex] = editingTerm
      setTerminology(updated); setEditingTermIndex(null); setEditingTerm(null)
    }
  }
  const cancelEditTerm = () => { setEditingTermIndex(null); setEditingTerm(null) }

  // Submit
  const handleSubmitTranslation = () => { onSubmitReview?.("submit") }
  const handleConfirmTerminology = () => { onSubmitReview?.("approve") }
  const handleOpenReviewCompletion = () => { setReviewDecision(null); setReviewRejectionReason(""); setShowReviewCompletionDialog(true) }
  const handleConfirmReviewCompletion = () => {
    if (reviewDecision === "approve") { onSubmitReview?.("approve"); setShowReviewCompletionDialog(false); onBack() }
    else if (reviewDecision === "reject") {
      if (reviewRejectionReason.trim().length < 10) return
      onSubmitReview?.("reject"); setShowReviewCompletionDialog(false); onBack()
    }
  }

  // History
  const getHistoryDisplayData = () => {
    if (!selectedVersion) return null
    const ver = mockHistoryVersions.find(v => v.id === selectedVersion)
    if (!ver) return null
    return { version: ver, prevVersion: mockHistoryVersions.find(v => v.version === ver.version - 1) || null }
  }

  const chapterCount = useMemo(() => (content.match(/\$#\{/g) || []).length, [content])
  const charCount = useMemo(() => content.length, [content])

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="shrink-0 border-b border-border bg-card flex items-center px-2 py-1.5 gap-1 overflow-x-auto">
        <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <span className="text-xs font-medium shrink-0 ml-1">{languageVariant}</span>
        <span className="text-[10px] text-muted-foreground shrink-0">· {stageLabel}</span>
        <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />
        <Select value={fontFamily} onValueChange={setFontFamily}>
          <SelectTrigger className="w-[72px] h-7 text-xs shrink-0"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="default">默认</SelectItem><SelectItem value="serif">宋体</SelectItem>
            <SelectItem value="sans">黑体</SelectItem><SelectItem value="mono">等宽</SelectItem>
          </SelectContent>
        </Select>
        <Select value={fontSize} onValueChange={setFontSize}>
          <SelectTrigger className="w-[56px] h-7 text-xs shrink-0"><SelectValue /></SelectTrigger>
          <SelectContent>{["12","14","16","18","20","24","28"].map(s => <SelectItem key={s} value={s}>{s}px</SelectItem>)}</SelectContent>
        </Select>
        <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />
        <Button variant={showFindBar ? "default" : "ghost"} size="icon" className="w-7 h-7 shrink-0"
          onClick={() => { setShowFindBar(!showFindBar); setShowReplaceRow(false) }} title="查找 (Ctrl+F)"><Search className="w-3.5 h-3.5" /></Button>
        <Button variant={showFindBar && showReplaceRow ? "default" : "ghost"} size="icon" className="w-7 h-7 shrink-0"
          onClick={() => { setShowFindBar(true); setShowReplaceRow(!showReplaceRow) }} title="替换 (Ctrl+H)"><Replace className="w-3.5 h-3.5" /></Button>
        <div className="flex-1 min-w-2" />
        {showOriginalPanelOption && (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 shrink-0" onClick={() => setShowOriginalPanel(!showOriginalPanel)}>
            {showOriginalPanel ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}原文
          </Button>
        )}
        {hasTerminology && (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 shrink-0" onClick={() => setShowTermPanel(!showTermPanel)}>
            {showTermPanel ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}术语
          </Button>
        )}
        {(isReviewStage || isQualityCheckStage || isManualTranslate) && (
          <Button variant={showHistoryPanel ? "default" : "ghost"} size="sm" className="h-7 text-xs gap-1 shrink-0"
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}><History className="w-3.5 h-3.5" />历史</Button>
        )}
        {(isReviewStage || isQualityCheckStage || isManualTranslate) && (
          <Button variant={showCommentsPanel ? "default" : "ghost"} size="sm" className="h-7 text-xs gap-1 shrink-0"
            onClick={() => setShowCommentsPanel(!showCommentsPanel)}>
            <AlertCircle className="w-3.5 h-3.5" />意见{comments.length > 0 ? `(${comments.length})` : ""}
          </Button>
        )}
        {(isReviewStage || isQualityCheckStage || isTermReview || (isManualTranslate && !isPreTranslation)) && (
          <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />
        )}
        {isReviewStage && <Button size="sm" className="h-7 text-xs shrink-0" onClick={handleOpenReviewCompletion}>完成审校</Button>}
        {isQualityCheckStage && <Button size="sm" className="h-7 text-xs shrink-0" onClick={handleOpenReviewCompletion}>质检完成</Button>}
        {isTermReview && <Button size="sm" className="h-7 text-xs shrink-0" onClick={handleConfirmTerminology}><CheckCircle className="w-3.5 h-3.5 mr-1" />确认术语</Button>}
        {isManualTranslate && !isPreTranslation && <Button size="sm" className="h-7 text-xs shrink-0" onClick={handleSubmitTranslation}>提交翻译</Button>}
      </div>

      {/* Find & Replace bar */}
      {showFindBar && (
        <div className="shrink-0 border-b border-border bg-card px-3 py-1.5 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <Input placeholder="查找..." value={findText} onChange={e => setFindText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleFindNext() }} className="w-48 h-7 text-xs" autoFocus />
            <span className="text-xs text-muted-foreground shrink-0 min-w-[60px]">
              {matchPositions.length > 0 ? `${currentMatchIndex + 1}/${matchPositions.length}` : findText ? "无匹配" : ""}
            </span>
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={handleFindPrev} disabled={matchPositions.length === 0}>
              <ArrowLeft className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={handleFindNext} disabled={matchPositions.length === 0}>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" /></Button>
          </div>
          {showReplaceRow && isEditable && (
            <div className="flex items-center gap-1.5">
              <Replace className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <Input placeholder="替换为..." value={replaceText} onChange={e => setReplaceText(e.target.value)} className="w-48 h-7 text-xs" />
              <Button variant="outline" size="sm" className="h-6 text-xs px-2" onClick={handleReplaceCurrent} disabled={matchPositions.length === 0}>替换</Button>
              <Button variant="outline" size="sm" className="h-6 text-xs px-2" onClick={handleReplaceAll} disabled={matchPositions.length === 0}>全部替换</Button>
            </div>
          )}
          <Button variant="ghost" size="icon" className="w-6 h-6 ml-auto" onClick={() => { setShowFindBar(false); setFindText(""); setReplaceText("") }}>
            <X className="w-3.5 h-3.5" /></Button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Original panel (narrow) */}
        {showOriginalPanelOption && showOriginalPanel && (
          <div className="w-[320px] shrink-0 border-r border-border bg-muted/30 flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">原文</span>
              </div>
              <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setShowOriginalPanel(false)}>
                <PanelLeftClose className="w-3 h-3" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-1" style={{ fontSize: `${parseInt(fontSize) - 1}px`, fontFamily: fontStyle.fontFamily }}>
                {originalItems.map((item, i) => {
                  if (item.type === "chapter") {
                    return (
                      <div key={i} className="pt-4 pb-1 text-xs text-muted-foreground/70 font-mono border-b border-border/30 mb-2">
                        {item.text}
                      </div>
                    )
                  }
                  const isActive = item.paragraphIndex === activeParagraphIdx
                  return (
                    <p
                      key={i}
                      ref={el => { originalParaRefs.current[item.paragraphIndex] = el }}
                      className={cn(
                        "leading-relaxed text-muted-foreground whitespace-pre-wrap rounded px-1.5 py-1 transition-colors",
                        isActive && "bg-primary/15 text-foreground ring-1 ring-primary/30"
                      )}
                    >
                      {item.text}
                    </p>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Center: Editor + History */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {/* Textarea editor */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                onSelect={handleTextareaSelect}
                onClick={handleTextareaSelect}
                onKeyUp={handleTextareaSelect}
                readOnly={!isEditable}
                className={cn(
                  "flex-1 w-full resize-none border-0 outline-none p-8 bg-background leading-relaxed whitespace-pre-wrap",
                  !isEditable && "cursor-default"
                )}
                style={{ ...fontStyle, lineHeight: "1.8", tabSize: 4 }}
                spellCheck={false}
              />
            </div>

            {/* History panel */}
            {showHistoryPanel && (
              <div className="w-[380px] shrink-0 flex flex-col overflow-hidden border-l border-border">
                <div className="shrink-0 px-3 py-1.5 border-b border-border/50 bg-muted/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5"><History className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs font-medium">历史版本</span></div>
                    <Button variant="ghost" size="icon" className="w-5 h-5" onClick={() => setShowHistoryPanel(false)}><X className="w-3 h-3" /></Button>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {mockHistoryVersions.map(ver => (
                      <button key={ver.id} className={cn("px-2 py-0.5 rounded border text-xs transition-colors",
                        selectedVersion === ver.id ? "bg-primary/10 border-primary/40 text-primary font-medium" : "bg-background border-border/50 hover:border-primary/30 text-muted-foreground"
                      )} onClick={() => setSelectedVersion(selectedVersion === ver.id ? null : ver.id)}>
                        <span className={cn("inline-block w-1.5 h-1.5 rounded-full mr-1",
                          ver.type === "ai" ? "bg-blue-500" : ver.type === "manual" ? "bg-orange-500" : "bg-purple-500")} />
                        V{ver.version} {ver.userName}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 px-3 py-1 border-b border-border/30 bg-muted/20 flex items-center">
                  {selectedVersion ? (() => {
                    const ver = mockHistoryVersions.find(v => v.id === selectedVersion)
                    return (<div className="flex items-center gap-1.5">
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium",
                        ver?.type === "ai" ? "bg-blue-500/20 text-blue-500" : ver?.type === "manual" ? "bg-orange-500/20 text-orange-500" : "bg-purple-500/20 text-purple-500"
                      )}>{ver?.type === "ai" ? "AI" : ver?.type === "manual" ? "人工" : "审校"}</span>
                      <span className="text-xs font-medium">V{ver?.version} · {ver?.timestamp} · {ver?.userName}</span>
                    </div>)
                  })() : <span className="text-xs text-muted-foreground">请选择一个历史版本查看</span>}
                </div>
                <ScrollArea className="flex-1">
                  <div className="py-6 px-4">
                    {!selectedVersion ? (
                      <div className="text-center py-20 text-sm text-muted-foreground">点击上方版本标签查看历史内容</div>
                    ) : (() => {
                      const data = getHistoryDisplayData()
                      if (!data) return null
                      const { version: ver, prevVersion: prev } = data
                      const maxLen = Math.max(ver.paragraphs.length, prev?.paragraphs.length || 0)
                      return (
                        <div className="space-y-4" style={fontStyle}>
                          {Array.from({ length: maxLen }).map((_, i) => {
                            const newPara = ver.paragraphs[i] || ""
                            const oldPara = prev?.paragraphs[i] || ""
                            const isChanged = oldPara !== newPara && prev
                            if (!isChanged) return <p key={i} className="leading-relaxed whitespace-pre-wrap text-foreground/70 px-2 py-1">{newPara}</p>
                            const diffSegs = computeWordDiff(oldPara, newPara)
                            return (
                              <div key={i} className="leading-relaxed whitespace-pre-wrap px-2 py-1 rounded bg-yellow-500/5 border-l-2 border-yellow-500/40">
                                {diffSegs.map((seg, si) => {
                                  if (seg.type === "same") return <span key={si} className="text-foreground/70">{seg.text}</span>
                                  if (seg.type === "deleted") return <span key={si} className="text-red-500 line-through bg-red-500/10">{seg.text}</span>
                                  return <span key={si} className="text-green-600 underline decoration-green-500/50 bg-green-500/10">{seg.text}</span>
                                })}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Comments panel */}
            {showCommentsPanel && (
              <div className="w-[300px] shrink-0 flex flex-col overflow-hidden border-l border-border">
                <div className="shrink-0 px-3 py-2 border-b border-border/50 bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium">修改意见（{comments.length}）</span>
                  </div>
                  <Button variant="ghost" size="icon" className="w-5 h-5" onClick={() => setShowCommentsPanel(false)}><X className="w-3 h-3" /></Button>
                </div>
                {/* Add comment (review/QC only) */}
                {canAddComment && (
                  <div className="shrink-0 p-2 border-b border-border/50">
                    <div className="flex gap-1.5">
                      <Input
                        placeholder={`对段落 #${activeParagraphIdx + 1} 写意见...`}
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && newComment.trim()) {
                            setComments(prev => [...prev, { paragraphIdx: activeParagraphIdx, text: newComment.trim(), author: isReviewStage ? "审校员" : "质检员", timestamp: new Date().toLocaleString() }])
                            setNewComment("")
                          }
                        }}
                        className="h-7 text-xs flex-1"
                      />
                      <Button size="sm" className="h-7 text-xs px-2" disabled={!newComment.trim()}
                        onClick={() => {
                          if (newComment.trim()) {
                            setComments(prev => [...prev, { paragraphIdx: activeParagraphIdx, text: newComment.trim(), author: isReviewStage ? "审校员" : "质检员", timestamp: new Date().toLocaleString() }])
                            setNewComment("")
                          }
                        }}>添加</Button>
                    </div>
                  </div>
                )}
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-2">
                    {comments.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">暂无修改意见</p>
                    ) : (
                      comments.map((c, i) => (
                        <div key={i} className={cn("p-2 rounded-md border text-xs space-y-1",
                          c.paragraphIdx === activeParagraphIdx ? "border-primary/50 bg-primary/5" : "border-border bg-muted/30"
                        )}>
                          <div className="flex items-center justify-between">
                            <span className="text-primary font-medium">段落 #{c.paragraphIdx + 1}</span>
                            {canAddComment && (
                              <button className="text-muted-foreground hover:text-destructive" onClick={() => setComments(prev => prev.filter((_, j) => j !== i))}>
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-foreground">{c.text}</p>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{c.author}</span>
                            <span>{c.timestamp}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
          {/* Status bar */}
          <div className="shrink-0 border-t border-border/50 px-4 py-1.5 flex items-center justify-between text-xs text-muted-foreground bg-card">
            <div className="flex items-center gap-3">
              <span>{chapterCount} 章</span>
              <span>{charCount.toLocaleString()} 字符</span>
              {showOriginalPanel && <span className="text-primary">段落 #{activeParagraphIdx + 1}</span>}
            </div>
            <span className="text-[10px]">章节标记：$#&#123;章节数|Chapter No. +章节标题&#125;$#</span>
          </div>
        </div>

        {/* Right: Terminology panel */}
        {hasTerminology && showTermPanel && (
          <div className="w-[280px] shrink-0 border-l border-border bg-muted/30 flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs font-medium">术语表</span></div>
              <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setShowTermPanel(false)}><PanelRightClose className="w-3 h-3" /></Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {terminology.map((term, i) => (
                  <div key={i} className="p-2 rounded-md bg-background border border-border/50 text-xs space-y-1.5">
                    {editingTermIndex === i && editingTerm ? (
                      <div className="space-y-1.5">
                        <div><label className="text-[10px] text-muted-foreground">术语</label>
                          <Input className="h-6 text-xs" value={editingTerm.original} onChange={e => setEditingTerm({ ...editingTerm, original: e.target.value })} /></div>
                        <div><label className="text-[10px] text-muted-foreground">类型</label>
                          <Input className="h-6 text-xs" value={editingTerm.type} onChange={e => setEditingTerm({ ...editingTerm, type: e.target.value })} /></div>
                        <div><label className="text-[10px] text-muted-foreground">描述</label>
                          <Input className="h-6 text-xs" value={editingTerm.description} onChange={e => setEditingTerm({ ...editingTerm, description: e.target.value })} /></div>
                        {!isSourceLanguage && editingTerm.translated !== undefined && (
                          <div><label className="text-[10px] text-muted-foreground">翻译</label>
                            <Input className="h-6 text-xs" value={editingTerm.translated} onChange={e => setEditingTerm({ ...editingTerm, translated: e.target.value })} /></div>
                        )}
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" className="h-5 text-[10px] px-2" onClick={cancelEditTerm}><X className="w-3 h-3" /></Button>
                          <Button size="sm" className="h-5 text-[10px] px-2" onClick={saveEditTerm}><Save className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    ) : (
                      <div className="cursor-pointer hover:bg-muted/50 rounded -m-1 p-1 transition-colors" onClick={() => startEditTerm(i)} title="点击编辑">
                        <div className="flex items-center justify-between"><span className="font-medium">{term.original}</span><span className="text-muted-foreground">{term.type}</span></div>
                        <p className="text-muted-foreground">{term.description}</p>
                        {!isSourceLanguage && term.translated && <p className="text-primary mt-0.5">→ {term.translated}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Review completion dialog */}
      <Dialog open={showReviewCompletionDialog} onOpenChange={setShowReviewCompletionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              {isQualityCheckStage ? "质检提交确认" : "审核提交确认"}
            </DialogTitle>
            <DialogDescription>请确认对本次翻译任务的审核结果</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">语言：</span><span className="font-medium">{languageVariant}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">章节数：</span><span className="font-medium">{chapterCount} 章</span></div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium">请选择审核结果：</label>
              <div className="grid grid-cols-2 gap-3">
                <Button variant={reviewDecision === "approve" ? "default" : "outline"}
                  className={cn("h-auto flex flex-col items-center justify-center p-4 gap-2", reviewDecision === "approve" && "bg-green-600 hover:bg-green-700")}
                  onClick={() => setReviewDecision("approve")}><CheckCircle className="w-6 h-6" /><span className="font-medium">通过</span></Button>
                <Button variant={reviewDecision === "reject" ? "default" : "outline"}
                  className={cn("h-auto flex flex-col items-center justify-center p-4 gap-2", reviewDecision === "reject" && "bg-orange-600 hover:bg-orange-700")}
                  onClick={() => setReviewDecision("reject")}><XCircle className="w-6 h-6" /><span className="font-medium">驳回</span></Button>
              </div>
            </div>
            {reviewDecision === "reject" && (
              <div className="space-y-2 animate-in fade-in-50 duration-200">
                <label className="text-sm font-medium">整体驳回理由 <span className="text-destructive">*</span></label>
                <Textarea placeholder="请详细说明驳回原因..." value={reviewRejectionReason}
                  onChange={e => setReviewRejectionReason(e.target.value)} rows={4} className="resize-none text-sm" />
                <div className="flex items-center justify-between text-xs">
                  <span className={reviewRejectionReason.trim().length < 10 ? "text-muted-foreground" : "text-green-600"}>
                    {reviewRejectionReason.trim().length < 10 ? "至少10个字符" : ""}</span>
                  <span className={reviewRejectionReason.trim().length >= 10 ? "text-green-600" : "text-muted-foreground"}>
                    {reviewRejectionReason.trim().length} / 10</span>
                </div>
              </div>
            )}
            {reviewDecision === "approve" && (
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <p className="text-green-800 dark:text-green-200">通过审核后，翻译将标记为已完成，进入下一个工作流程阶段。</p>
              </div>
            )}
            {reviewDecision === "reject" && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800 text-sm">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                <p className="text-orange-800 dark:text-orange-200">驳回后，任务将返回人工翻译环节，轮次标记为第2轮。</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewCompletionDialog(false)}>取消</Button>
            <Button onClick={handleConfirmReviewCompletion}
              disabled={!reviewDecision || (reviewDecision === "reject" && reviewRejectionReason.trim().length < 10)}
              className={cn(reviewDecision === "approve" && "bg-green-600 hover:bg-green-700", reviewDecision === "reject" && "bg-orange-600 hover:bg-orange-700")}>
              确认提交</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
