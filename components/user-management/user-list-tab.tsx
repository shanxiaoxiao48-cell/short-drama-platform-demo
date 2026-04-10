"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  UserPlus,
  Search,
  MoreVertical,
  Shield,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Key,
} from "lucide-react"
import { usePermission } from "@/contexts/permission-context"
import type { User as UserType } from "./types"
import type { UserRole } from "@/lib/permissions"
import { ROLE_NAMES } from "@/lib/permissions"
import { AddUserDialog } from "./add-user-dialog"
import { EditUserDialog } from "./edit-user-dialog"

// 角色颜色映射 - 改为白色文字
const roleColors: Record<string, string> = {
  admin: "bg-red-500 text-white hover:bg-red-600",
  project_manager: "bg-blue-500 text-white hover:bg-blue-600",
  material_handler: "bg-green-500 text-white hover:bg-green-600",
  translator: "bg-orange-500 text-white hover:bg-orange-600",
  quality_checker: "bg-purple-500 text-white hover:bg-purple-600",
  video_encoder: "bg-cyan-500 text-white hover:bg-cyan-600",
}

// 模拟用户数据
const mockUsers: UserType[] = [
  {
    id: "admin",
    name: "管理员",
    email: "admin@dramago.com",
    role: "admin",
    status: "active",
    projectPermissions: { type: "all" },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
    lastLoginAt: "2024-02-07T10:30:00Z",
  },
  {
    id: "pm001",
    name: "张经理",
    email: "zhangpm@dramago.com",
    phone: "138****1234",
    role: "project_manager",
    status: "active",
    projectPermissions: { type: "selected", projectIds: ["1", "2", "3"] },
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
    createdBy: "admin",
    lastLoginAt: "2024-02-07T09:15:00Z",
  },
  {
    id: "pm002",
    name: "李经理",
    email: "lipm@dramago.com",
    phone: "139****5678",
    role: "project_manager",
    status: "active",
    projectPermissions: { type: "all" },
    createdAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
    createdBy: "admin",
    lastLoginAt: "2024-02-06T16:45:00Z",
  },
  {
    id: "mh001",
    name: "李物料",
    email: "limaterial@dramago.com",
    phone: "137****2345",
    role: "material_handler",
    status: "active",
    projectPermissions: { type: "all" },
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
    createdBy: "admin",
    lastLoginAt: "2024-02-07T08:20:00Z",
  },
  {
    id: "tr001",
    name: "王译员",
    email: "wangtrans@dramago.com",
    phone: "135****6789",
    role: "translator",
    status: "active",
    projectPermissions: { type: "selected", projectIds: ["1", "3"] },
    createdAt: "2024-02-05T00:00:00Z",
    updatedAt: "2024-02-05T00:00:00Z",
    createdBy: "pm001",
    lastLoginAt: "2024-02-07T11:30:00Z",
  },
  {
    id: "qc001",
    name: "赵质检",
    email: "zhaoqc@dramago.com",
    phone: "136****9876",
    role: "quality_checker",
    status: "active",
    projectPermissions: { type: "selected", projectIds: ["1"] },
    createdAt: "2024-02-03T00:00:00Z",
    updatedAt: "2024-02-03T00:00:00Z",
    createdBy: "pm001",
    lastLoginAt: "2024-02-06T14:20:00Z",
  },
  {
    id: "ve001",
    name: "刘压制",
    email: "liuencode@dramago.com",
    phone: "133****5432",
    role: "video_encoder",
    status: "disabled",
    projectPermissions: { type: "selected", projectIds: ["1"] },
    createdAt: "2024-02-02T00:00:00Z",
    updatedAt: "2024-02-07T00:00:00Z",
    createdBy: "admin",
    lastLoginAt: "2024-02-05T10:00:00Z",
  },
  {
    id: "tr002",
    name: "陈译员",
    email: "chentrans@dramago.com",
    phone: "134****7890",
    role: "translator",
    status: "active",
    projectPermissions: { type: "selected", projectIds: ["2", "4"] },
    createdAt: "2024-02-06T00:00:00Z",
    updatedAt: "2024-02-06T00:00:00Z",
    createdBy: "pm002",
    lastLoginAt: "2024-02-07T07:45:00Z",
  },
]

export function UserListTab() {
  const { user: currentUser } = usePermission()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // 添加用户弹窗状态
  const [showAddDialog, setShowAddDialog] = useState(false)

  // 编辑用户弹窗状态
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)

  // 添加用户
  const handleAddUser = (newUser: Omit<UserType, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status' | 'projectPermissions' | 'lastLoginAt'>) => {
    const id = `u${Date.now()}`
    const now = new Date().toISOString()
    const createdUser: UserType = {
      ...newUser,
      id,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      createdBy: currentUser.id,
      projectPermissions: newUser.projectPermissions,
      lastLoginAt: undefined,
    }
    mockUsers.push(createdUser)
    console.log("添加用户:", createdUser)
  }

  // 编辑用户
  const handleEditUser = (updatedUser: Omit<UserType, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status' | 'projectPermissions' | 'lastLoginAt'>) => {
    if (!editingUser) return
    const updated: UserType = {
      ...editingUser,
      ...updatedUser,
      updatedAt: new Date().toISOString(),
    }
    const index = mockUsers.findIndex(u => u.id === editingUser.id)
    if (index !== -1) {
      mockUsers[index] = updated
    }
    console.log("编辑用户:", updated)
    setShowEditDialog(false)
    setEditingUser(null)
  }

  // 禁用/启用用户
  const handleToggleUserStatus = (user: UserType) => {
    const index = mockUsers.findIndex(u => u.id === user.id)
    if (index !== -1) {
      mockUsers[index] = {
        ...mockUsers[index],
        status: user.status === 'active' ? 'disabled' as const : 'active',
        updatedAt: new Date().toISOString(),
      }
    }
    console.log(`用户${user.name}${user.status === 'active' ? '已禁用' : '已启用'}`)
  }

  // 删除用户
  const handleDeleteUser = (user: UserType) => {
    if (confirm(`确定要删除用户 "${user.name}" 吗？`)) {
      const index = mockUsers.findIndex(u => u.id === user.id)
      if (index !== -1) {
        mockUsers.splice(index, 1)
      }
      console.log("删除用户:", user)
    }
  }

  // 重置密码
  const handleResetPassword = (user: UserType) => {
    if (confirm(`确定要重置用户 "${user.name}" 的密码吗？`)) {
      console.log("重置密码:", user)
      alert("密码重置成功！")
    }
  }

  // 过滤用户
  const filteredUsers = mockUsers.filter(user => {
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!user.name.toLowerCase().includes(query) &&
          !user.email.toLowerCase().includes(query)) {
        return false
      }
    }

    // 角色过滤
    if (roleFilter !== "all" && user.role !== roleFilter) {
      return false
    }

    // 状态过滤
    if (statusFilter !== "all" && user.status !== statusFilter) {
      return false
    }

    return true
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <div className="space-y-4">
      {/* 筛选和搜索栏 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索用户姓名或邮箱"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input border-border"
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40 bg-input border-border">
            <SelectValue placeholder="所有角色" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有角色</SelectItem>
            <SelectItem value="admin">管理员</SelectItem>
            <SelectItem value="project_manager">项目管理</SelectItem>
            <SelectItem value="material_handler">物料处理</SelectItem>
            <SelectItem value="translator">译者</SelectItem>
            <SelectItem value="quality_checker">质检</SelectItem>
            <SelectItem value="video_encoder">视频压制</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 bg-input border-border">
            <SelectValue placeholder="所有状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有状态</SelectItem>
            <SelectItem value="active">启用</SelectItem>
            <SelectItem value="disabled">禁用</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => setShowAddDialog(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          添加用户
        </Button>
      </div>

      {/* 用户表格 */}
      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-sm text-foreground">用户编号</th>
                <th className="text-left p-4 font-medium text-sm text-foreground">用户名</th>
                <th className="text-left p-4 font-medium text-sm text-foreground">用户昵称</th>
                <th className="text-left p-4 font-medium text-sm text-foreground">角色</th>
                <th className="text-left p-4 font-medium text-sm text-foreground">手机号码</th>
                <th className="text-left p-4 font-medium text-sm text-foreground">状态</th>
                <th className="text-left p-4 font-medium text-sm text-foreground">最后登录</th>
                <th className="text-right p-4 font-medium text-sm text-foreground w-20">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  {/* 用户编号 */}
                  <td className="p-4">
                    <span className="text-sm font-mono text-foreground">{user.id}</span>
                  </td>

                  {/* 用户名 */}
                  <td className="p-4">
                    <span className="text-sm text-foreground">{user.email}</span>
                  </td>

                  {/* 用户昵称 */}
                  <td className="p-4">
                    <span className="text-sm text-foreground">{user.name}</span>
                  </td>

                  {/* 角色 */}
                  <td className="p-4">
                    <Badge className={roleColors[user.role]}>
                      <Shield className="w-3 h-3 mr-1" />
                      {ROLE_NAMES[user.role]}
                    </Badge>
                  </td>

                  {/* 手机号码 */}
                  <td className="p-4">
                    <span className="text-sm text-foreground">{user.phone || '-'}</span>
                  </td>

                  {/* 状态 */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {user.status === 'active' ? (
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

                  {/* 最后登录 */}
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : '从未登录'}
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
                        <DropdownMenuItem onClick={() => { setEditingUser(user); setShowEditDialog(true) }}>
                          <Edit className="w-4 h-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                          <Key className="w-4 h-4 mr-2" />
                          重置密码
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={user.status === 'active' ? 'text-red-600' : 'text-green-600'}
                          onClick={() => handleToggleUserStatus(user)}
                        >
                          {user.status === 'active' ? (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              禁用账号
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              启用账号
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除用户
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

      {/* 空状态 */}
      {filteredUsers.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">未找到匹配的用户</p>
        </div>
      )}

      {/* 添加用户弹窗 */}
      <AddUserDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddUser={handleAddUser}
        existingUsers={mockUsers}
      />

      {/* 编辑用户弹窗 */}
      <EditUserDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onEditUser={handleEditUser}
        user={editingUser}
      />
    </div>
  )
}

