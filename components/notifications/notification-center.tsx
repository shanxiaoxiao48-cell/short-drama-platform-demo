"use client"

import { useState } from "react"
import {
  Bell,
  Check,
  Trash2,
  AlertCircle,
  FileCheck,
  Video,
  ClipboardCheck,
  ChevronRight,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useNotification, formatEpisodes, type Notification } from "@/contexts/notification-context"

interface NotificationCenterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// 通知类型图标映射
const notificationIcons = {
  task_assigned: <ClipboardCheck className="w-5 h-5" />,
  translation_rejected: <AlertCircle className="w-5 h-5" />,
  translation_resubmitted: <FileCheck className="w-5 h-5" />,
  quality_check_assigned: <FileCheck className="w-5 h-5" />,
  encoding_assigned: <Video className="w-5 h-5" />,
}

// 通知类型颜色映射
const notificationColors = {
  task_assigned: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  translation_rejected: "bg-red-500/10 text-red-500 border-red-500/20",
  translation_resubmitted: "bg-green-500/10 text-green-500 border-green-500/20",
  quality_check_assigned: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  encoding_assigned: "bg-orange-500/10 text-orange-500 border-orange-500/20",
}

function NotificationCard({
  notification,
  isRead,
  onClick,
}: {
  notification: Notification
  isRead: boolean
  onClick: () => void
}) {
  // 新任务分配不显示备注
  const showRemarks = notification.type !== "task_assigned"

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg border transition-all cursor-pointer hover:border-primary/50 hover:bg-muted/50",
        isRead
          ? "bg-muted/30 border-border opacity-70"
          : "bg-card border-primary/50"
      )}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div className={cn(
          "p-2 rounded-lg border shrink-0",
          notificationColors[notification.type]
        )}>
          {notificationIcons[notification.type]}
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className={cn(
              "font-medium text-base",
              isRead ? "text-muted-foreground" : "text-foreground"
            )}>
              {notification.title}
            </h4>
            {!isRead && (
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 ml-auto" />
            )}
          </div>

          <div className="space-y-1.5 text-sm">
            <p className={cn(
              isRead ? "text-muted-foreground" : "text-foreground"
            )}>
              短剧：{notification.dramaName}
            </p>
            <p className={cn(
              isRead ? "text-muted-foreground" : "text-foreground"
            )}>
              语言：{notification.language}
            </p>
            <p className={cn(
              isRead ? "text-muted-foreground" : "text-foreground"
            )}>
              剧集：第{formatEpisodes(notification.episodes)}集
            </p>

            {/* 备注 - 新任务分配不显示 */}
            {showRemarks && notification.overallRemark && (
              <p className="text-foreground mt-3">
                备注：{notification.overallRemark}
              </p>
            )}

            {/* 时间 */}
            <p className="text-muted-foreground/70 mt-3">
              {new Date(notification.createdAt).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 shrink-0 ml-2">
          {!isRead && (
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
              title="标为已读"
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Implement delete notification
            }}
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function NotificationCenter({ open, onOpenChange }: NotificationCenterProps) {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
  } = useNotification()
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all")

  const filteredNotifications = activeTab === "all"
    ? notifications
    : notifications.filter(n => !n.isRead)

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[500px] flex flex-col bg-card border-border overflow-hidden p-0">
        {/* 固定的头部区域 */}
        <div className="shrink-0 p-5 border-b border-border bg-card">
          <DialogHeader className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <DialogTitle className="text-foreground">站内信</DialogTitle>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={markAllAsRead}
                >
                  全部已读
                </Button>
              )}
            </div>

            {/* 标签切换 */}
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg mt-3">
              <button
                className={cn(
                  "flex-1 py-1.5 px-3 text-sm rounded-md transition-colors",
                  activeTab === "all"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTab("all")}
              >
                全部 ({notifications.length})
              </button>
              <button
                className={cn(
                  "flex-1 py-1.5 px-3 text-sm rounded-md transition-colors",
                  activeTab === "unread"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTab("unread")}
              >
                未读 ({unreadCount})
              </button>
            </div>
          </DialogHeader>
        </div>

        {/* 可滚动的通知列表 */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Bell className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">
                  {activeTab === "unread" ? "暂无未读消息" : "暂无消息"}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  isRead={notification.isRead}
                  onClick={() => markAsRead(notification.id)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
