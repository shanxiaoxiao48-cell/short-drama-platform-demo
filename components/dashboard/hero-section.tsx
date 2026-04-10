"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Film, BookOpen } from "lucide-react"

interface HeroSectionProps {
  onCreateDrama: () => void
  onCreateNovel: () => void
}

export function HeroSection({ onCreateDrama, onCreateNovel }: HeroSectionProps) {
  const [showTypeDialog, setShowTypeDialog] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">欢迎回来，Admin</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            这是您的短剧出海工作台，当前有 48 个任务待处理
          </p>
        </div>
        <Button onClick={() => setShowTypeDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          快速创建项目
        </Button>
      </div>

      <Dialog open={showTypeDialog} onOpenChange={setShowTypeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>选择项目类型</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => { setShowTypeDialog(false); onCreateDrama() }}
            >
              <Film className="w-10 h-10 text-blue-500" />
              <div className="text-center">
                <p className="text-sm font-semibold">短剧项目</p>
                <p className="text-xs text-muted-foreground mt-1">视频翻译与本地化</p>
              </div>
            </button>
            <button
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => { setShowTypeDialog(false); onCreateNovel() }}
            >
              <BookOpen className="w-10 h-10 text-green-500" />
              <div className="text-center">
                <p className="text-sm font-semibold">小说项目</p>
                <p className="text-xs text-muted-foreground mt-1">文本翻译与本地化</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
