"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Checkbox,
} from "@/components/ui/checkbox"
import {
  Input,
} from "@/components/ui/input"
import {
  Textarea,
} from "@/components/ui/textarea"
import {
  Label,
} from "@/components/ui/label"
import { Shield, MoreVertical, Edit, Menu, Database, Trash2, Search, ChevronDown, ChevronRight, CheckCircle2, Circle } from "lucide-react"
import { ROLE_NAMES } from "@/lib/permissions"
import { cn } from "@/lib/utils"

interface Role {
  id: string
  name: string
  description: string
  type: string
  status: 'active' | 'disabled'
  createdAt: string
}

const roles: Role[] = [
  {
    id: "admin",
    name: "管理员",
    type: "系统管理",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    description: "拥有系统所有权限，可管理所有用户和设置",
  },
  {
    id: "project_manager",
    name: "项目管理",
    type: "业务管理",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    description: "可创建和管理项目、分配任务、查看数据",
  },
  {
    id: "material_handler",
    name: "物料处理人员",
    type: "业务操作",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    description: "可上传物料、AI提取、视频擦除",
  },
  {
    id: "translator",
    name: "译者",
    type: "业务操作",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    description: "可执行翻译任务、保存和提交翻译",
  },
  {
    id: "quality_checker",
    name: "质检人员",
    type: "业务操作",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    description: "可审核翻译内容、通过或驳回",
  },
  {
    id: "video_encoder",
    name: "视频压制人员",
    type: "业务操作",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    description: "可执行视频压制任务",
  },
]

// 菜单权限树形结构
const menuPermissions = [
  {
    id: "dashboard",
    label: "首页",
    children: [
      { id: "dashboard-analytics", label: "仪表盘展示区" },
      { id: "dashboard-analytics-cards", label: "仪表盘卡片" },
      { id: "dashboard-recent-projects", label: "近期项目展示区" },
      { id: "dashboard-view-all-projects", label: "查看全部项目" },
      { id: "dashboard-quick-create", label: "快速创建项目" },
    ]
  },
  {
    id: "analytics",
    label: "仪表盘",
    children: [
      {
        id: "analytics-overview",
        label: "概览",
        children: [
          { id: "analytics-overview-drama-progress", label: "短剧进度概览" },
          { id: "analytics-overview-task-progress", label: "任务进度概览" },
          { id: "analytics-overview-translator-performance", label: "译员绩效概览" },
          { id: "analytics-overview-business-effect", label: "投放效果概览" },
        ]
      },
      {
        id: "analytics-data-list",
        label: "数据列表",
        children: [
          {
            id: "analytics-data-list-drama-progress",
            label: "短剧进度",
            children: [
              { id: "analytics-data-list-drama-progress-filter", label: "短剧筛选" },
              { id: "analytics-data-list-drama-progress-export", label: "导出数据" },
            ]
          },
          {
            id: "analytics-data-list-task-progress",
            label: "任务进度",
            children: [
              { id: "analytics-data-list-task-progress-filter", label: "任务筛选" },
              { id: "analytics-data-list-task-progress-export", label: "导出数据" },
            ]
          },
          {
            id: "analytics-data-list-translator-performance",
            label: "译员绩效",
            children: [
              { id: "analytics-data-list-translator-performance-filter", label: "译员筛选" },
              { id: "analytics-data-list-translator-performance-export", label: "导出数据" },
              { id: "analytics-data-list-translator-performance-detail", label: "译员详情" },
              {
                id: "analytics-data-list-translator-performance-detail-settlement",
                label: "结算管理",
                children: [
                  { id: "analytics-data-list-translator-performance-detail-settlement-calculate", label: "计算结算" },
                  { id: "analytics-data-list-translator-performance-detail-settlement-history", label: "结算历史" },
                  { id: "analytics-data-list-translator-performance-detail-settlement-export", label: "导出结算" },
                ]
              },
            ]
          },
          {
            id: "analytics-data-list-business-effect",
            label: "投放效果",
            children: [
              { id: "analytics-data-list-business-effect-filter", label: "投放筛选" },
              { id: "analytics-data-list-business-effect-export", label: "导出数据" },
            ]
          },
        ]
      },
    ]
  },
  {
    id: "projects",
    label: "工作台",
    children: [
      {
        id: "projects-drama",
        label: "短剧项目",
        children: [
          { id: "projects-drama-source-card", label: "源语言卡片" },
          { id: "projects-drama-multi-language-card", label: "多语言卡片" },
          { id: "projects-drama-workflows", label: "项目流程" },
          { id: "projects-drama-upload", label: "上传操作" },
          { id: "projects-drama-download", label: "下载操作" },
          { id: "projects-drama-ai-extract", label: "AI提取流程" },
          { id: "projects-drama-manual-translate", label: "人工翻译流程" },
          { id: "projects-drama-ai-translate", label: "AI翻译流程" },
          { id: "projects-drama-review", label: "审核流程" },
          { id: "projects-drama-encode", label: "压制流程" },
          { id: "projects-drama-editor", label: "流程编辑器" },
          { id: "projects-drama-editor-subtitle", label: "字幕编辑" },
          { id: "projects-drama-editor-overlay", label: "画面字表编辑" },
          { id: "projects-drama-editor-terms", label: "术语表编辑" },
        ]
      },
      {
        id: "projects-novel",
        label: "小说项目",
        children: [
          { id: "projects-novel-source-card", label: "源语言卡片" },
          { id: "projects-novel-multi-language-card", label: "多语言卡片" },
          { id: "projects-novel-workflows", label: "项目流程" },
          { id: "projects-novel-upload", label: "上传操作" },
          { id: "projects-novel-download", label: "下载操作" },
          { id: "projects-novel-ai-translate", label: "AI翻译流程" },
          { id: "projects-novel-manual-translate", label: "人工翻译流程" },
          { id: "projects-novel-review", label: "审核流程" },
          { id: "projects-novel-editor", label: "流程编辑器" },
        ]
      },
    ]
  },
  {
    id: "user_management",
    label: "用户管理",
    children: [
      {
        id: "user-management-users",
        label: "用户列表",
        children: [
          { id: "user-management-users-view", label: "查看用户" },
          { id: "user-management-users-add", label: "添加用户" },
          { id: "user-management-users-edit", label: "编辑用户" },
          { id: "user-management-users-reset-password", label: "重置密码" },
          { id: "user-management-users-disable", label: "禁用用户" },
          { id: "user-management-users-delete", label: "删除用户" },
        ]
      },
      {
        id: "user-management-roles",
        label: "角色权限",
        children: [
          { id: "user-management-roles-view", label: "查看角色" },
          { id: "user-management-roles-edit", label: "编辑角色" },
          { id: "user-management-roles-menu-permission", label: "菜单权限配置" },
          { id: "user-management-roles-data-permission", label: "数据权限配置" },
        ]
      },
      {
        id: "user-management-logs",
        label: "操作日志",
        children: [
          { id: "user-management-logs-view", label: "查看日志" },
          { id: "user-management-logs-filter", label: "筛选日志" },
          { id: "user-management-logs-export", label: "导出日志" },
        ]
      },
    ]
  },
]

// 数据权限列表
const dataPermissions = [
  { id: "all_projects", label: "所有项目" },
  { id: "assigned_projects", label: "指定项目" },
]

// 角色默认权限配置
const defaultRolePermissions: Record<string, {
  menus: string[]
  dataAccess: string[]
}> = {
  admin: {
    menus: ["dashboard", "analytics", "projects", "tasks", "task_assign", "review", "settings", "user_management"],
    dataAccess: ["all_projects"],
  },
  project_manager: {
    menus: ["dashboard", "analytics", "projects", "tasks", "task_assign", "review", "settings", "user_management"],
    dataAccess: ["all_projects"],
  },
  material_handler: {
    menus: ["dashboard", "projects", "settings"],
    dataAccess: ["all_projects"],
  },
  translator: {
    menus: ["dashboard", "projects", "tasks", "settings"],
    dataAccess: ["assigned_projects"],
  },
  quality_checker: {
    menus: ["dashboard", "projects", "tasks", "review", "settings"],
    dataAccess: ["assigned_projects"],
  },
  video_encoder: {
    menus: ["dashboard", "projects", "tasks", "settings"],
    dataAccess: ["assigned_projects"],
  },
}

export function RolePermissionsTab() {
  // 筛选状态
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // 编辑浮窗状态
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editForm, setEditForm] = useState({ name: "", status: "active" as "active" | "disabled", remark: "" })

  // 菜单权限浮窗状态
  const [showMenuPermissionDialog, setShowMenuPermissionDialog] = useState(false)
  const [menuPermissionRole, setMenuPermissionRole] = useState<Role | null>(null)
  const [menuPermissionsState, setMenuPermissionsState] = useState<string[]>([])
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  // 数据权限浮窗状态
  const [showDataPermissionDialog, setShowDataPermissionDialog] = useState(false)
  const [dataPermissionRole, setDataPermissionRole] = useState<Role | null>(null)
  const [dataPermissionState, setDataPermissionState] = useState<string>("")

  // 模拟：从后端获取的当前角色权限配置
  const [currentPermissions, setCurrentPermissions] = useState(
    () => defaultRolePermissions["admin"]
  )

  // 计算所有菜单ID和父菜单ID
  const allMenuIds = menuPermissions.flatMap(menu => {
    return [menu.id, ...menu.children.map(child => child.id)]
  })

  const parentMenuIds = menuPermissions
    .filter(menu => menu.children.length > 0)
    .map(menu => menu.id)

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  // 筛选角色
  const filteredRoles = roles.filter(role => {
    if (searchQuery && !role.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (typeFilter && typeFilter !== "all" && role.type !== typeFilter) {
      return false
    }
    if (statusFilter && statusFilter !== "all" && role.status !== statusFilter) {
      return false
    }
    return true
  })

  // 处理编辑角色
  const handleEditClick = (role: Role) => {
    setEditingRole(role)
    setEditForm({
      name: role.name,
      status: role.status,
      remark: ""
    })
    setShowEditDialog(true)
  }

  // 处理保存编辑
  const handleSaveEdit = () => {
    if (!editingRole) return
    console.log("保存角色编辑:", { roleId: editingRole.id, ...editForm })
    // TODO: 调用后端API保存角色编辑
    setShowEditDialog(false)
    setEditingRole(null)
  }

  // 处理菜单权限
  const handleMenuPermissionClick = (role: Role) => {
    setMenuPermissionRole(role)
    setMenuPermissionsState(currentPermissions.menus)
    setExpandedMenus([])
    setShowMenuPermissionDialog(true)
  }

  // 处理数据权限
  const handleDataPermissionClick = (role: Role) => {
    setDataPermissionRole(role)
    setDataPermissionState(currentPermissions.dataAccess[0] || "all_projects")
    setShowDataPermissionDialog(true)
  }

  // 处理菜单权限变更
  const handleMenuPermissionChange = (menuId: string, checked: boolean) => {
    setMenuPermissionsState(prev => {
      if (checked) {
        return [...prev, menuId]
      } else {
        return prev.filter(id => id !== menuId)
      }
    })
  }

  // 处理全选菜单权限
  const handleSelectAllMenus = (checked: boolean) => {
    if (checked) {
      setMenuPermissionsState(allMenuIds)
    } else {
      setMenuPermissionsState([])
    }
  }

  // 处理全部展开/折叠
  const handleToggleAllExpand = (expand: boolean) => {
    if (expand) {
      setExpandedMenus(parentMenuIds)
    } else {
      setExpandedMenus([])
    }
  }

  // 处理单个菜单展开/折叠
  const handleToggleMenuExpand = (menuId: string) => {
    setExpandedMenus(prev => {
      if (prev.includes(menuId)) {
        return prev.filter(id => id !== menuId)
      } else {
        return [...prev, menuId]
      }
    })
  }

  // 处理保存菜单权限
  const handleSaveMenuPermissions = () => {
    console.log("保存菜单权限:", { roleId: menuPermissionRole?.id, menus: menuPermissionsState })
    // TODO: 调用后端API保存菜单权限
    setShowMenuPermissionDialog(false)
    setMenuPermissionRole(null)
  }

  // 处理保存数据权限
  const handleSaveDataPermissions = () => {
    console.log("保存数据权限:", { roleId: dataPermissionRole?.id, dataAccess: [dataPermissionState] })
    // TODO: 调用后端API保存数据权限
    setShowDataPermissionDialog(false)
    setDataPermissionRole(null)
  }

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">角色权限配置</h2>
        <p className="text-sm text-muted-foreground">管理系统角色及其访问权限</p>
      </div>

      {/* 筛选区域 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索角色名称"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input border-border"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 bg-input border-border">
            <SelectValue placeholder="所有类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有类型</SelectItem>
            <SelectItem value="系统管理">系统管理</SelectItem>
            <SelectItem value="业务管理">业务管理</SelectItem>
            <SelectItem value="业务操作">业务操作</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 bg-input border-border">
            <SelectValue placeholder="所有状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有状态</SelectItem>
            <SelectItem value="active">启用</SelectItem>
            <SelectItem value="disabled">已禁用</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 角色表格 */}
      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-sm text-foreground">角色编号</th>
                <th className="text-left p-4 font-medium text-sm text-foreground">角色名称</th>
                <th className="text-left p-4 font-medium text-sm text-foreground">角色类型</th>
                <th className="text-left p-4 font-medium text-sm text-foreground">状态</th>
                <th className="text-left p-4 font-medium text-sm text-foreground">创建时间</th>
                <th className="text-right p-4 font-medium text-sm text-foreground w-20">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((role) => (
                <tr key={role.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  {/* 角色编号 */}
                  <td className="p-4">
                    <span className="text-sm font-mono text-foreground">{role.id}</span>
                  </td>

                  {/* 角色名称 */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/10 text-primary">
                        <Shield className="w-3 h-3 mr-1" />
                        {role.name}
                      </Badge>
                    </div>
                  </td>

                  {/* 角色类型 */}
                  <td className="p-4">
                    <span className="text-sm text-foreground">{role.type}</span>
                  </td>

                  {/* 状态 */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {role.status === 'active' ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm text-foreground">启用</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          <span className="text-sm text-muted-foreground">已禁用</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* 创建时间 */}
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(role.createdAt)}
                    </span>
                  </td>

                  {/* 操作 */}
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(role)}>
                          <Edit className="w-4 h-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMenuPermissionClick(role)}>
                          <Menu className="w-4 h-4 mr-2" />
                          菜单权限
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDataPermissionClick(role)}>
                          <Database className="w-4 h-4 mr-2" />
                          数据权限
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 编辑角色弹窗 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>编辑角色</DialogTitle>
            <DialogDescription>
              修改角色信息
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">角色名称 <span className="text-red-500">*</span></Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">状态 <span className="text-red-500">*</span></Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value as "active" | "disabled" }))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">启用</SelectItem>
                  <SelectItem value="disabled">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-remark">备注</Label>
              <Textarea
                id="edit-remark"
                value={editForm.remark}
                onChange={(e) => setEditForm(prev => ({ ...prev, remark: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                取消
              </Button>
              <Button onClick={handleSaveEdit}>
                保存
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 菜单权限弹窗 */}
      <Dialog open={showMenuPermissionDialog} onOpenChange={setShowMenuPermissionDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>菜单权限</DialogTitle>
            <DialogDescription>
              配置角色可访问的菜单和功能
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 角色信息 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium w-24">角色名称：</span>
                <Badge className="bg-primary/10 text-primary">
                  {menuPermissionRole?.name}
                </Badge>
              </div>
            </div>

            {/* 操作开关 */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={menuPermissionsState.length === allMenuIds.length ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSelectAllMenus(menuPermissionsState.length !== allMenuIds.length)}
                >
                  {menuPermissionsState.length === allMenuIds.length ? "全选关闭" : "全选开启"}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={expandedMenus.length === parentMenuIds.length ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleAllExpand(expandedMenus.length !== parentMenuIds.length)}
                >
                  {expandedMenus.length === parentMenuIds.length ? "全部折叠" : "全部展开"}
                </Button>
              </div>
            </div>

            {/* 菜单权限树 */}
            <div className="border rounded-lg p-4 max-h-[500px] overflow-y-auto">
              <div className="space-y-1">
                {menuPermissions.map((menu) => {
                  const renderMenuItem = (item: any, level: number = 0) => (
                    <div key={item.id} className="space-y-1">
                      <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => handleToggleMenuExpand(item.id)}
                      >
                        {item.children && item.children.length > 0 ? (
                          expandedMenus.includes(item.id) ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )
                        ) : (
                          <div className="w-4 h-4 flex-shrink-0" />
                        )}
                        <div
                          className="flex items-center gap-2 flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={menuPermissionsState.includes(item.id)}
                            onCheckedChange={(checked) => handleMenuPermissionChange(item.id, checked || false)}
                          />
                          <span className={level === 0 ? "font-medium" : ""}>{item.label}</span>
                        </div>
                      </div>

                      {/* 子菜单 */}
                      {item.children && item.children.length > 0 && expandedMenus.includes(item.id) && (
                        <div className={`pl-${8 + level * 4} space-y-1`}>
                          {item.children.map((child: any) => renderMenuItem(child, level + 1))}
                        </div>
                      )}
                    </div>
                  );
                  
                  return renderMenuItem(menu);
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowMenuPermissionDialog(false)}>
                取消
              </Button>
              <Button onClick={handleSaveMenuPermissions}>
                确定
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 数据权限弹窗 */}
      <Dialog open={showDataPermissionDialog} onOpenChange={setShowDataPermissionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{dataPermissionRole?.name} - 数据权限配置</DialogTitle>
            <DialogDescription>
              配置角色的数据访问范围
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="data-permission">权限范围 <span className="text-red-500">*</span></Label>
              <Select value={dataPermissionState} onValueChange={setDataPermissionState}>
                <SelectTrigger>
                  <SelectValue placeholder="选择权限范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_projects">所有项目</SelectItem>
                  <SelectItem value="assigned_projects">指定项目</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">ℹ️</span>
                <div>
                  <p className="font-medium text-foreground mb-1">权限说明</p>
                  <p className="text-xs text-muted-foreground">
                    所有项目：可访问系统中所有项目<br />
                    指定项目：只能访问被分配的项目
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDataPermissionDialog(false)}>
                取消
              </Button>
              <Button onClick={handleSaveDataPermissions}>
                保存权限
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
