// 权限管理工具函数

export type UserRole = 
  | 'admin' 
  | 'project_manager' 
  | 'material_handler' 
  | 'translator' 
  | 'quality_checker' 
  | 'video_encoder'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

// 角色显示名称
export const ROLE_NAMES: Record<UserRole, string> = {
  admin: '管理员',
  project_manager: '项目管理',
  material_handler: '物料处理人员',
  translator: '译者',
  quality_checker: '质检人员',
  video_encoder: '视频压制人员',
}

// 菜单权限配置
const MENU_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['dashboard', 'projects', 'materials', 'tasks', 'task_assign', 'review', 'settings'],
  project_manager: ['dashboard', 'projects', 'materials', 'tasks', 'task_assign', 'review', 'settings'],
  material_handler: ['dashboard', 'projects', 'materials', 'settings'],
  translator: ['dashboard', 'projects', 'tasks', 'settings'],
  quality_checker: ['dashboard', 'projects', 'tasks', 'review', 'settings'],
  video_encoder: ['dashboard', 'projects', 'tasks', 'settings'],
}

// 按钮权限配置
const BUTTON_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['*'], // 所有权限
  project_manager: ['*'], // 所有权限
  material_handler: [
    'batch_select', 'download', 'upload', 'ai_extract', 'video_erase', 
    'ai_translate', 'enter_editor', 'save'
  ],
  translator: [
    'download', 'enter_editor', 'save', 'complete_episode', 'submit_review'
  ],
  quality_checker: [
    'download', 'enter_editor', 'save', 'complete_episode', 'confirm_pass'
  ],
  video_encoder: [
    'download', 'video_compress'
  ],
}

// 工作流程权限配置
const WORKFLOW_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['*'],
  project_manager: ['*'],
  material_handler: ['ai_extract', 'video_erase', 'ai_translate'],
  translator: ['manual_translate'],
  quality_checker: ['quality_check'],
  video_encoder: ['video_compress'],
}

/**
 * 检查菜单权限
 */
export function hasMenuPermission(role: UserRole, menuId: string): boolean {
  const permissions = MENU_PERMISSIONS[role] ?? []
  return permissions.includes(menuId)
}

/**
 * 检查按钮权限
 */
export function hasButtonPermission(role: UserRole, buttonId: string): boolean {
  const permissions = BUTTON_PERMISSIONS[role] ?? []
  return permissions.includes('*') || permissions.includes(buttonId)
}

/**
 * 检查工作流程权限
 */
export function hasWorkflowPermission(role: UserRole, workflowId: string): boolean {
  const permissions = WORKFLOW_PERMISSIONS[role] ?? []
  return permissions.includes('*') || permissions.includes(workflowId)
}

/**
 * 获取当前用户（从 localStorage）
 */
export function getCurrentUser(): User {
  if (typeof window === 'undefined') {
    return {
      id: 'admin',
      name: 'Admin',
      email: 'admin@dramago.com',
      role: 'admin',
    }
  }

  const stored = localStorage.getItem('current-user')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse user data:', e)
    }
  }

  // 默认管理员
  return {
    id: 'admin',
    name: 'Admin',
    email: 'admin@dramago.com',
    role: 'admin',
  }
}

/**
 * 设置当前用户
 */
export function setCurrentUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('current-user', JSON.stringify(user))
  }
}

/**
 * 切换用户角色（仅用于 Demo）
 */
export function switchRole(role: UserRole): void {
  const roleUsers: Record<UserRole, User> = {
    admin: {
      id: 'admin',
      name: '管理员',
      email: 'admin@dramago.com',
      role: 'admin',
    },
    project_manager: {
      id: 'pm001',
      name: '张经理',
      email: 'zhangpm@dramago.com',
      role: 'project_manager',
    },
    material_handler: {
      id: 'mh001',
      name: '李物料',
      email: 'limaterial@dramago.com',
      role: 'material_handler',
    },
    translator: {
      id: 'tr001',
      name: '王译员',
      email: 'wangtrans@dramago.com',
      role: 'translator',
    },
    quality_checker: {
      id: 'qc001',
      name: '赵质检',
      email: 'zhaoqc@dramago.com',
      role: 'quality_checker',
    },
    video_encoder: {
      id: 've001',
      name: '刘压制',
      email: 'liuencode@dramago.com',
      role: 'video_encoder',
    },
  }

  setCurrentUser(roleUsers[role])
}

/**
 * Demo 数据：模拟任务分配
 * 译者被分配了项目 1 和 3 的英语翻译
 * 质检被分配了项目 1 的西班牙语质检
 */
export function getAssignedProjects(userId: string, role: UserRole): string[] {
  // 管理员、项目管理、物料处理可以看到所有项目
  if (role === 'admin' || role === 'project_manager' || role === 'material_handler') {
    return ['*'] // 表示所有项目
  }

  // 译者：被分配了项目 1 和 3
  if (role === 'translator' && userId === 'tr001') {
    return ['1', 'DG001', '3', 'DG003']
  }

  // 质检：被分配了项目 1
  if (role === 'quality_checker' && userId === 'qc001') {
    return ['1', 'DG001']
  }

  // 视频压制：被分配了项目 1
  if (role === 'video_encoder' && userId === 've001') {
    return ['1', 'DG001']
  }

  return []
}

/**
 * 检查是否可以访问某个项目
 */
export function canAccessProject(userId: string, role: UserRole, projectId: string): boolean {
  const assigned = getAssignedProjects(userId, role)
  return assigned.includes('*') || assigned.includes(projectId)
}

/**
 * 检查是否可以访问某个语言变体
 */
export function canAccessVariant(userId: string, role: UserRole, projectId: string, language: string): boolean {
  // 先检查项目权限
  if (!canAccessProject(userId, role, projectId)) {
    return false
  }

  // 管理员、项目管理、物料处理可以访问所有语言变体
  if (role === 'admin' || role === 'project_manager' || role === 'material_handler') {
    return true
  }

  // 译者：只能访问英语（模拟被分配了英语翻译任务）
  if (role === 'translator') {
    return language === '英语'
  }

  // 质检：只能访问西班牙语（模拟被分配了西班牙语质检任务）
  if (role === 'quality_checker') {
    return language === '西班牙语'
  }

  // 视频压制：可以访问所有语言（需要压制所有语言的视频）
  if (role === 'video_encoder') {
    return true
  }

  return false
}
