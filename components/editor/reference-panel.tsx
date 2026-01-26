"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, BookOpen, FileText, Keyboard, Search, Plus, Copy } from "lucide-react"

interface ReferencePanelProps {
  selectedSubtitleId: string | null
}

// Mock data
const onScreenText = [
  { id: "1", original: "霸道总裁", translation: "Domineering CEO", context: "Title" },
  { id: "2", original: "第一章", translation: "Chapter 1", context: "Chapter title" },
  { id: "3", original: "相遇", translation: "The Encounter", context: "Scene title" },
]

const glossary = [
  { term: "总裁", translation: "CEO / President", note: "Corporate title" },
  { term: "少爷", translation: "Young Master", note: "Formal address" },
  { term: "契约", translation: "Contract", note: "Legal agreement" },
  { term: "豪门", translation: "Wealthy family", note: "Elite class" },
  { term: "闪婚", translation: "Flash marriage", note: "Quick marriage" },
]

const shortcuts = [
  { key: "Ctrl + S", action: "保存当前翻译" },
  { key: "Ctrl + Enter", action: "确认并下一条" },
  { key: "Space", action: "播放/暂停" },
  { key: "←/→", action: "前进/后退 5 秒" },
  { key: "Ctrl + Z", action: "撤销" },
  { key: "Ctrl + Y", action: "重做" },
  { key: "Ctrl + F", action: "搜索字幕" },
  { key: "Esc", action: "取消编辑" },
]

export function ReferencePanel({ selectedSubtitleId }: ReferencePanelProps) {
  const [glossarySearch, setGlossarySearch] = useState("")

  const filteredGlossary = glossary.filter(
    (item) =>
      item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.translation.toLowerCase().includes(glossarySearch.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="onscreen" className="flex flex-col h-full">
        <div className="p-2 border-b border-border">
          <TabsList className="w-full grid grid-cols-4 h-9">
            <TabsTrigger value="onscreen" className="text-xs">
              <ImageIcon className="w-3 h-3 mr-1" />
              画面字
            </TabsTrigger>
            <TabsTrigger value="glossary" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1" />
              术语表
            </TabsTrigger>
            <TabsTrigger value="brief" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              简介
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="text-xs">
              <Keyboard className="w-3 h-3 mr-1" />
              快捷键
            </TabsTrigger>
          </TabsList>
        </div>

        {/* On-screen text */}
        <TabsContent value="onscreen" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">画面字幕</h4>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  添加
                </Button>
              </div>
              {onScreenText.map((item) => (
                <Card key={item.id} className="p-3 bg-muted/50 border-border">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{item.original}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.context}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.translation}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Glossary */}
        <TabsContent value="glossary" className="flex-1 m-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索术语..."
                className="pl-9 bg-input border-border"
                value={glossarySearch}
                onChange={(e) => setGlossarySearch(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1 h-[calc(100%-73px)]">
            <div className="p-4 space-y-2">
              {filteredGlossary.map((item, index) => (
                <Card
                  key={index}
                  className="p-3 bg-muted/50 border-border hover:border-primary/50 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{item.term}</p>
                      <p className="text-sm text-primary">{item.translation}</p>
                      {item.note && (
                        <p className="text-xs text-muted-foreground">{item.note}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Brief */}
        <TabsContent value="brief" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">剧情简介</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  霸道总裁顾北宸与普通女孩林小暖因一纸契约相遇。
                  顾北宸表面冷酷无情，实则深藏温柔。林小暖善良坚强，
                  用真心融化了他的心防。两人从契约夫妻逐渐发展为真爱，
                  共同面对家族阴谋与商业危机。
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">主要角色</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs text-primary font-medium">顾</span>
                    </div>
                    <div>
                      <p className="text-sm text-foreground">顾北宸 (Gu Beichen)</p>
                      <p className="text-xs text-muted-foreground">男主角 - 霸道总裁</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-chart-2/20 flex items-center justify-center">
                      <span className="text-xs text-chart-2 font-medium">林</span>
                    </div>
                    <div>
                      <p className="text-sm text-foreground">林小暖 (Lin Xiaonuan)</p>
                      <p className="text-xs text-muted-foreground">女主角 - 善良女孩</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">翻译注意事项</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>保持角色性格特点的语气</li>
                  <li>商业术语使用标准英文表达</li>
                  <li>爱情台词注重情感表达</li>
                  <li>注意中英文习惯表达差异</li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Shortcuts */}
        <TabsContent value="shortcuts" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              <h4 className="text-sm font-medium text-foreground mb-3">键盘快捷键</h4>
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="text-sm text-muted-foreground">{shortcut.action}</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {shortcut.key}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
