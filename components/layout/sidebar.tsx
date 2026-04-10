"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Film,
  ChevronLeft,
  ChevronRight,
  Globe,
  User,
  BarChart3,
  PieChart,
  List,
  BookOpen,
  Users,
  LogOut,
  UserCircle,
  Bell,
  Shield,
  ChevronDown,
  ClipboardList,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePermission } from "@/contexts/permission-context"
import { useNotification } from "@/contexts/notification-context"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { ROLE_NAMES, UserRole } from "@/lib/permissions"

export type PageType =
  | "dashboard"
  | "projects"
  | "workspace"
  | "editor"
  | "tasks"
  | "novels"
  | "novels-workspace"
  | "novel-editor"
  | "task-pool"
  | "recycle-bin"
  | "analytics-overview"
  | "analytics-data-list"
  | "analytics-translator-performance"
  | "analytics-translator-detail"
  | "analytics-business-effect"
  | "personal-center"
  | "user-management"

interface SidebarProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
}

interface NavItem {
  id?: PageType
  menuId?: string // 用于权限检查
  label: string
  icon: any
  children?: {
    id: PageType
    label: string
    icon?: any // 添加子菜单图标
  }[]
}

const navItems: NavItem[] = [
  { 
    id: "dashboard",
    menuId: "dashboard",
    label: "首页", 
    icon: LayoutDashboard 
  },
  {
    menuId: "analytics",
    label: "仪表盘",
    icon: BarChart3,
    children: [
      { id: "analytics-overview", label: "概览", icon: PieChart },
      { id: "analytics-data-list", label: "数据列表", icon: List },
    ],
  },
  {
    menuId: "projects",
    label: "工作台",
    icon: Film,
    children: [
      { id: "projects", label: "短剧", icon: Film },
      { id: "novels", label: "小说", icon: BookOpen },
    ],
  },
  {
    id: "task-pool",
    menuId: "tasks",
    label: "任务池",
    icon: ClipboardList,
  },
  {
    id: "recycle-bin",
    menuId: "projects",
    label: "回收站",
    icon: Trash2,
  },
  {
    id: "user-management",
    menuId: "user_management",
    label: "用户管理",
    icon: Users,
  },
]

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]) // 默认全部收起
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const { user, hasMenu, switchRole } = usePermission()
  const { unreadCount } = useNotification()

  // 判断当前用户是否是译员、质检或压制人员（需要显示站内信）
  const needsNotificationCenter = user.role === "translator" ||
    user.role === "quality_checker" ||
    user.role === "video_encoder"

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [label] // 只保留当前点击的菜单，关闭其他所有菜单
    )
  }

  // 过滤有权限的菜单项
  const visibleNavItems = navItems.filter(item => {
    if (!item.menuId) return true
    return hasMenu(item.menuId)
  })

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <Globe className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-lg text-sidebar-foreground">短剧出海平台</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon
          const isExpanded = expandedMenus.includes(item.label)
          const hasChildren = item.children && item.children.length > 0

          // 一级菜单项
          if (!hasChildren && item.id) {
            const isActive = currentPage === item.id
            return (
              <Button
                key={item.label}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-accent text-sidebar-primary",
                  collapsed && "justify-center px-0"
                )}
                onClick={() => {
                  setExpandedMenus([]) // 关闭所有下拉菜单
                  item.id && onNavigate(item.id)
                }}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            )
          }

          // 带子菜单的菜单项
          return (
            <div key={item.label}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-0"
                )}
                onClick={() => toggleMenu(item.label)}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
              </Button>

              {/* 二级菜单 - 收起状态显示图标，展开状态显示文字 */}
              {item.children && (
                <div 
                  className={cn(
                    "space-y-1 overflow-hidden transition-all duration-300 ease-in-out",
                    collapsed ? "flex flex-col items-center" : "ml-8",
                    isExpanded ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0 mt-0"
                  )}
                >
                  {item.children.map((child, index) => {
                    const isActive = currentPage === child.id
                    const ChildIcon = child.icon
                    
                    // 收起状态：显示图标（带背景）
                    if (collapsed) {
                      return (
                        <Button
                          key={child.label}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-10 h-10 p-0 flex items-center justify-center",
                            "hover:bg-transparent"
                          )}
                          onClick={() => onNavigate(child.id)}
                          title={child.label}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
                            isActive 
                              ? "bg-sidebar-primary/20 text-sidebar-primary" 
                              : "bg-muted/50 text-sidebar-foreground/70 hover:bg-muted hover:text-sidebar-foreground"
                          )}>
                            {ChildIcon && <ChildIcon className="w-4 h-4" />}
                          </div>
                        </Button>
                      )
                    }
                    
                    // 展开状态：显示文字
                    return (
                      <Button
                        key={child.label}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start h-8 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive && "bg-sidebar-accent text-sidebar-primary"
                        )}
                        onClick={() => onNavigate(child.id)}
                      >
                        {child.label}
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {/* 角色切换按钮 - Demo */}
        <div className="flex items-center justify-center mb-2">
          <Select value={user.role} onValueChange={(value) => switchRole(value as UserRole)}>
            <SelectTrigger className="w-full bg-muted/50 border-border text-xs">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <SelectValue />
                <ChevronDown className="w-3 h-3 text-muted-foreground ml-auto" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ROLE_NAMES).map(([role, name]) => (
                <SelectItem key={role} value={role}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-sidebar-accent transition-colors",
              collapsed && "justify-center"
            )}>
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                <User className="w-4 h-4 text-muted-foreground" />
                {/* 未读通知红点 */}
                {needsNotificationCenter && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-sidebar" />
                )}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onNavigate("personal-center")}>
              <UserCircle className="w-4 h-4 mr-2" />
              个人中心
            </DropdownMenuItem>

            {/* 站内信 - 仅译员、质检、压制角色显示 */}
            {needsNotificationCenter && (
              <>
                <DropdownMenuItem onClick={() => setShowNotificationCenter(true)}>
                  <div className="relative">
                    <Bell className="w-4 h-4 mr-2" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  站内信
                  {unreadCount > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {unreadCount}
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem
              variant="destructive"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出系统
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Collapse button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start gap-3 h-10 text-muted-foreground hover:bg-sidebar-accent",
            collapsed && "justify-center px-0"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>收起侧边栏</span>
            </>
          )}
        </Button>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>温馨提示</DialogTitle>
            <DialogDescription>
              是否退出本系统？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowLogoutDialog(false)
                // Navigate to login page - will be handled by app-shell
                window.location.href = "/login"
              }}
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Center Dialog */}
      <NotificationCenter
        open={showNotificationCenter}
        onOpenChange={setShowNotificationCenter}
      />
    </aside>
  )
}
