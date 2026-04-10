import { UserRole } from "@/lib/permissions"

export interface User {
  id: string                    // 用户ID
  name: string                  // 用户姓名
  email: string                 // 邮箱（唯一）
  phone?: string                // 手机号
  avatar?: string               // 头像URL
  role: UserRole                // 角色
  gender?: string               // 用户性别（male/female）
  remark?: string               // 备注
  status: 'active' | 'disabled' // 账号状态
  projectPermissions: {         // 项目访问权限
    type: 'all' | 'selected'  // 访问类型
    projectIds?: string[]       // 指定项目ID列表
  }
  createdAt: string             // 创建时间
  updatedAt: string             // 更新时间
  createdBy: string             // 创建人ID
  lastLoginAt?: string         // 最后登录时间
}

export interface OperationLog {
  id: string
  operatorId: string            // 操作人ID
  operatorName: string          // 操作人姓名
  targetUserId?: string         // 目标用户ID
  targetUserName?: string       // 目标用户姓名
  action: string                // 操作类型
  details: Record<string, any>  // 操作详情
  ipAddress?: string            // IP地址
  timestamp: string             // 操作时间
}

export interface RolePermissions {
  role: UserRole
  menuPermissions: string[]     // 菜单权限ID列表
  buttonPermissions: string[]   // 按钮权限ID列表
  workflowPermissions: string[] // 工作流权限ID列表
  projectAccess: 'all' | 'selected'
}
