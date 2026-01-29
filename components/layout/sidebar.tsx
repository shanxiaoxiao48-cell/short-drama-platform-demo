"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Film,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Globe,
  User,
  ClipboardList,
  UserCheck,
  FileCheck,
  Shield,
  BarChart3,
} from "lucide-react"
import { usePermission } from "@/contexts/permission-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ROLE_NAMES, UserRole } from "@/lib/permissions"

export type PageType = 
  | "dashboard" 
  | "projects" 
  | "workspace" 
  | "editor" 
  | "tasks" 
  | "novels" 
  | "analytics-overview"
  | "analytics-data-list"
  | "analytics-translator-performance"
  | "analytics-translator-detail"
  | "analytics-business-effect"

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
      { id: "analytics-overview", label: "概览" },
      { id: "analytics-data-list", label: "数据列表" },
    ],
  },
  { 
    id: "projects",
    menuId: "projects",
    label: "工作台", 
    icon: Film 
  },
  {
    menuId: "materials",
    label: "物料管理",
    icon: FolderOpen,
    children: [
      { id: "projects", label: "短剧管理" },
      { id: "novels", label: "小说管理" },
    ],
  },
  {
    menuId: "tasks",
    label: "任务管理",
    icon: ClipboardList,
    children: [
      { id: "tasks", label: "任务列表" },
    ],
  },
  {
    menuId: "task_assign",
    label: "任务分配",
    icon: UserCheck,
    children: [
      { id: "tasks", label: "翻译任务列表" },
    ],
  },
  {
    menuId: "review",
    label: "翻译审核",
    icon: FileCheck,
    children: [
      { id: "tasks", label: "审核" },
      { id: "tasks", label: "翻译" },
    ],
  },
]

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["物料管理"]) // 默认展开物料管理
  const [showRoleSwitch, setShowRoleSwitch] = useState(false)
  const { user, switchRole, hasMenu } = usePermission()

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
                onClick={() => !collapsed && toggleMenu(item.label)}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
              </Button>

              {/* 二级菜单 - 添加平滑过渡动画 */}
              {!collapsed && item.children && (
                <div 
                  className={cn(
                    "ml-8 space-y-1 overflow-hidden transition-all duration-300 ease-in-out",
                    isExpanded ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0 mt-0"
                  )}
                >
                  {item.children.map((child) => {
                    const isActive = currentPage === child.id
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
        {/* 角色切换 - Demo 模式 */}
        {!collapsed && showRoleSwitch && (
          <div className="mb-2 p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-foreground">角色切换 (Demo)</span>
            </div>
            <Select value={user.role} onValueChange={(value) => switchRole(value as UserRole)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_NAMES).map(([role, name]) => (
                  <SelectItem key={role} value={role} className="text-xs">
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-10 text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed && "justify-center px-0"
          )}
          onClick={() => setShowRoleSwitch(!showRoleSwitch)}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>设置</span>}
        </Button>

        <div className={cn(
          "flex items-center gap-3 p-2 rounded-lg",
          collapsed && "justify-center"
        )}>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
        </div>

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
    </aside>
  )
}
