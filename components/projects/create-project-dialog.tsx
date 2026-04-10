"use client"

import React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated?: (project: {
    id: string
    title: string
    originalLanguage: string
    episodes: number
    languageCount: number
    remark: string
    createdAt: string
    videoType?: "subtitle" | "no_subtitle" // 添加视频类型字段
  }) => void
}

const SOURCE_LANGUAGES = [
  { value: "中文", label: "中文" },
  { value: "英语", label: "英语" },
  { value: "日语", label: "日语" },
  { value: "韩语", label: "韩语" },
  { value: "西班牙语", label: "西班牙语" },
  { value: "葡萄牙语", label: "葡萄牙语" },
  { value: "法语", label: "法语" },
  { value: "德语", label: "德语" },
  { value: "俄语", label: "俄语" },
  { value: "阿拉伯语", label: "阿拉伯语" },
  { value: "泰语", label: "泰语" },
  { value: "越南语", label: "越南语" },
  { value: "印尼语", label: "印尼语" },
  { value: "马来语", label: "马来语" },
  { value: "印地语", label: "印地语" },
  { value: "土耳其语", label: "土耳其语" },
  { value: "意大利语", label: "意大利语" },
  { value: "荷兰语", label: "荷兰语" },
  { value: "波兰语", label: "波兰语" },
  { value: "瑞典语", label: "瑞典语" },
]

export function CreateProjectDialog({ open, onOpenChange, onProjectCreated }: CreateProjectDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    originalLanguage: "中文",
    videoType: "subtitle" as "subtitle" | "no_subtitle", // 默认有字幕
  })
  const [validationError, setValidationError] = useState("")

  // 生成项目ID - 格式：DJ+年月日+当日序号 如：DJ26021001
  const generateProjectId = () => {
    const today = new Date()
    const year = today.getFullYear().toString().substring(2) // 获取年份后两位
    const month = String(today.getMonth() + 1).padStart(2, '0') // 月份补零
    const day = String(today.getDate()).padStart(2, '0') // 日期补零
    const datePrefix = `${year}${month}${day}`
    
    // 从localStorage获取今日已创建的项目数量
    if (typeof window !== 'undefined') {
      const savedProjects = localStorage.getItem('drama-projects')
      if (savedProjects) {
        try {
          const projects = JSON.parse(savedProjects)
          // 过滤出今日创建的项目
          const todayProjects = projects.filter((p: any) => 
            p.id.startsWith(`DJ${datePrefix}`)
          )
          // 计算今日序号
          const todayCount = todayProjects.length + 1
          return `DJ${datePrefix}${String(todayCount).padStart(2, '0')}`
        } catch (e) {
          console.error('Failed to parse saved projects:', e)
        }
      }
    }
    // 默认返回今日第一个项目
    return `DJ${datePrefix}01`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setValidationError("请输入项目名称")
      return
    }

    const newProject = {
      id: generateProjectId(),
      title: formData.title,
      originalLanguage: formData.originalLanguage,
      episodes: 1,
      languageCount: 0,
      remark: "",
      createdAt: new Date().toISOString().split('T')[0],
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=400&fit=crop",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=400&fit=crop",
      videoType: formData.videoType,
    }

    if (onProjectCreated) {
      onProjectCreated(newProject)
    }

    setFormData({ title: "", originalLanguage: "中文", videoType: "subtitle" as const })
    setValidationError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-foreground">新建短剧项目</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            创建一个新的短剧出海本地化项目，支持多语言翻译
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">
                  项目名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="请输入短剧名称"
                  className="bg-input border-border"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value })
                    setValidationError("")
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">源语言 / 视频类型</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.originalLanguage}
                    onValueChange={(value) => setFormData({ ...formData, originalLanguage: value })}
                  >
                    <SelectTrigger className="bg-input border-border flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCE_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.videoType}
                    onValueChange={(value) => setFormData({ ...formData, videoType: value as "subtitle" | "no_subtitle" })}
                  >
                    <SelectTrigger className="bg-input border-border flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subtitle">有字幕</SelectItem>
                      <SelectItem value="no_subtitle">无字幕</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </ScrollArea>

          {validationError && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              {validationError}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => {
              setFormData({ title: "", originalLanguage: "中文", videoType: "subtitle" as const })
              setValidationError("")
              onOpenChange(false)
            }}>取消</Button>
            <Button type="submit">创建项目</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
