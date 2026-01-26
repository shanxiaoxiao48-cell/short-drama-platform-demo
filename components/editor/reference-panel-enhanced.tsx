"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, BookOpen, Search, Plus, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReferencePanelEnhancedProps {
  selectedSubtitleId: string | null
  currentTime: number
  onScreenText: Array<{
    id: string
    startTime: number
    endTime: number
    text: string
  }>
}

// Mock data
const glossary = [
  { term: "总裁", translation: "CEO / President", note: "Corporate title" },
  { term: "少爷", translation: "Young Master", note: "Formal address" },
  { term: "契约", translation: "Contract", note: "Legal agreement" },
  { term: "豪门", translation: "Wealthy family", note: "Elite class" },
  { term: "闪婚", translation: "Flash marriage", note: "Quick marriage" },
]

export function ReferencePanelEnhanced({
  selectedSubtitleId,
  currentTime,
  onScreenText,
}: ReferencePanelEnhancedProps) {
  const [glossarySearch, setGlossarySearch] = useState("")

  const filteredGlossary = glossary.filter(
    (item) =>
      item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.translation.toLowerCase().includes(glossarySearch.toLowerCase())
  )

  // Check if on-screen text is current
  const isCurrentOnScreenText = (item: typeof onScreenText[0]) => {
    return currentTime >= item.startTime && currentTime < item.endTime
  }

  return (
    <div className="flex flex-col h-full bg-card">
      <Tabs defaultValue="onscreen" className="flex flex-col h-full">
        <div className="p-2 border-b border-border">
          <TabsList className="w-full grid grid-cols-2 h-9">
            <TabsTrigger value="onscreen" className="text-xs">
              <ImageIcon className="w-3 h-3 mr-1" />
              画面字
            </TabsTrigger>
            <TabsTrigger value="glossary" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1" />
              术语表
            </TabsTrigger>
          </TabsList>
        </div>

        {/* On-screen text */}
        <TabsContent value="onscreen" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">画面字幕</h4>
                <Button variant="ghost" size="sm" className="h-7">
                  <Plus className="w-3 h-3 mr-1" />
                  添加
                </Button>
              </div>
              {onScreenText.map((item) => {
                const isCurrent = isCurrentOnScreenText(item)
                return (
                  <Card 
                    key={item.id} 
                    className={cn(
                      "p-3 border transition-colors",
                      isCurrent 
                        ? "bg-primary/10 border-primary" 
                        : "bg-muted/50 border-border hover:border-primary/50"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{item.text}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {Math.floor(item.startTime / 60)}:{(Math.floor(item.startTime % 60)).toString().padStart(2, '0')}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Glossary */}
        <TabsContent value="glossary" className="flex-1 m-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border shrink-0">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索术语..."
                className="pl-9 bg-input border-border h-8 text-sm"
                value={glossarySearch}
                onChange={(e) => setGlossarySearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                // TODO: Open add term dialog
                alert("添加新术语功能开发中")
              }}
            >
              <Plus className="w-3 h-3 mr-1" />
              添加术语
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {filteredGlossary.length > 0 ? (
                filteredGlossary.map((item, index) => (
                  <Card
                    key={index}
                    className="p-3 bg-muted/50 border-border hover:border-primary/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
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
                ))
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  未找到匹配的术语
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
