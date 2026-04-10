"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { usePermission } from '@/contexts/permission-context'

// 通知类型
export type NotificationType =
  | "task_assigned" // 任务分配（所有角色）
  | "translation_rejected" // 翻译被驳回（仅译员）
  | "translation_resubmitted" // 翻译重新提交等待质检（仅质检）
  | "quality_check_assigned" // 质检任务分配（仅质检）
  | "encoding_assigned" // 压制任务分配（仅压制）

// 通知数据结构
export interface Notification {
  id: string
  type: NotificationType
  title: string
  dramaName: string
  language: string
  episodes: number[] // 涉及的集数
  overallRemark?: string // 整体备注
  isRead: boolean
  createdAt: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  deleteNotification: (notificationId: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// 格式化集数显示（连续数字用 x-x 格式）
export function formatEpisodes(episodes: number[]): string {
  if (episodes.length === 0) return ""

  const sorted = [...episodes].sort((a, b) => a - b)
  const ranges: string[] = []
  let start = sorted[0]
  let end = sorted[0]

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i]
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`)
      start = sorted[i]
      end = sorted[i]
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`)

  return ranges.join(", ")
}

// 根据用户角色过滤通知类型
function getVisibleNotificationTypes(userRole: string): NotificationType[] {
  if (userRole === "translator") {
    // 译员只能看到：任务分配 + 翻译被驳回
    return ["task_assigned", "translation_rejected"]
  }
  if (userRole === "quality_checker") {
    // 质检只能看到：任务分配 + 翻译重新提交
    return ["task_assigned", "translation_resubmitted"]
  }
  if (userRole === "video_encoder") {
    // 压制只能看到：任务分配
    return ["task_assigned"]
  }
  // 其他角色（管理员、项目经理、物料处理）可以看到所有类型
  return ["task_assigned", "translation_rejected", "translation_resubmitted", "quality_check_assigned", "encoding_assigned"]
}

// 生成模拟通知数据
function generateMockNotifications(): Notification[] {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

  return [
    {
      id: "1",
      type: "task_assigned",
      title: "新任务分配",
      dramaName: "霸道总裁爱上我",
      language: "英语",
      episodes: [1, 2, 3, 4, 5],
      isRead: false,
      createdAt: now.toISOString(),
    },
    {
      id: "2",
      type: "translation_rejected",
      title: "翻译剧集驳回",
      dramaName: "豪门甜宠",
      language: "西班牙语",
      episodes: [3, 4, 5, 8, 9, 10],
      overallRemark: "部分翻译不够准确，请修改后重新提交",
      isRead: false,
      createdAt: oneHourAgo.toISOString(),
    },
    {
      id: "3",
      type: "translation_resubmitted",
      title: "翻译已重新提交",
      dramaName: "重生之商业帝国",
      language: "泰语",
      episodes: [6, 7, 8],
      overallRemark: "译员已根据意见修改完成，请进行质检",
      isRead: false,
      createdAt: oneHourAgo.toISOString(),
    },
    {
      id: "4",
      type: "quality_check_assigned",
      title: "质检任务分配",
      dramaName: "穿越逆袭",
      language: "葡萄牙语",
      episodes: [1, 2, 3, 15, 16, 17],
      isRead: true,
      createdAt: oneDayAgo.toISOString(),
    },
    {
      id: "5",
      type: "encoding_assigned",
      title: "压制任务分配",
      dramaName: "医妃惊世",
      language: "印尼语",
      episodes: [20, 21, 22, 23, 24, 25],
      isRead: true,
      createdAt: twoDaysAgo.toISOString(),
    },
  ]
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([])
  const [isClient, setIsClient] = useState(false)
  const { user } = usePermission()

  // 客户端挂载后初始化
  useEffect(() => {
    setIsClient(true)
    // 从 localStorage 读取或使用模拟数据
    const stored = localStorage.getItem("notifications")
    if (stored) {
      setAllNotifications(JSON.parse(stored))
    } else {
      setAllNotifications(generateMockNotifications())
    }
  }, [])

  // 持久化到 localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("notifications", JSON.stringify(allNotifications))
    }
  }, [allNotifications, isClient])

  // 根据用户角色过滤可见的通知
  const visibleTypes = useMemo(() => {
    return getVisibleNotificationTypes(user.role)
  }, [user.role])

  // 当角色切换时，重新生成模拟数据以便测试
  useEffect(() => {
    setAllNotifications(generateMockNotifications())
  }, [user.role])

  const notifications = useMemo(() => {
    return allNotifications.filter(n => visibleTypes.includes(n.type))
  }, [allNotifications, visibleTypes])

  const addNotification = (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    setAllNotifications(prev => [newNotification, ...prev])
  }

  const markAsRead = (notificationId: string) => {
    setAllNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
    )
  }

  const markAllAsRead = () => {
    setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setAllNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}
