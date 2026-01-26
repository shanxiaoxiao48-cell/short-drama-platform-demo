"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  User, 
  UserRole, 
  getCurrentUser, 
  setCurrentUser,
  hasMenuPermission,
  hasButtonPermission,
  hasWorkflowPermission,
  canAccessProject,
  canAccessVariant,
} from '@/lib/permissions'

interface PermissionContextType {
  user: User
  setUser: (user: User) => void
  switchRole: (role: UserRole) => void
  hasMenu: (menuId: string) => boolean
  hasButton: (buttonId: string) => boolean
  hasWorkflow: (workflowId: string) => boolean
  canAccessProject: (projectId: string) => boolean
  canAccessVariant: (projectId: string, language: string) => boolean
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

export function PermissionProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User>(getCurrentUser())

  // 监听 localStorage 变化
  useEffect(() => {
    const handleStorageChange = () => {
      setUserState(getCurrentUser())
    }

    window.addEventListener('storage', handleStorageChange)
    
    // 自定义事件监听（用于同一页面内的更新）
    window.addEventListener('user-role-changed', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('user-role-changed', handleStorageChange)
    }
  }, [])

  const setUser = (newUser: User) => {
    setCurrentUser(newUser)
    setUserState(newUser)
    // 触发自定义事件
    window.dispatchEvent(new Event('user-role-changed'))
  }

  const switchRole = (role: UserRole) => {
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

    setUser(roleUsers[role])
  }

  const hasMenu = (menuId: string) => hasMenuPermission(user.role, menuId)
  const hasButton = (buttonId: string) => hasButtonPermission(user.role, buttonId)
  const hasWorkflow = (workflowId: string) => hasWorkflowPermission(user.role, workflowId)
  const canAccessProjectFn = (projectId: string) => canAccessProject(user.id, user.role, projectId)
  const canAccessVariantFn = (projectId: string, language: string) => canAccessVariant(user.id, user.role, projectId, language)

  return (
    <PermissionContext.Provider value={{ 
      user, 
      setUser, 
      switchRole, 
      hasMenu, 
      hasButton, 
      hasWorkflow,
      canAccessProject: canAccessProjectFn,
      canAccessVariant: canAccessVariantFn,
    }}>
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermission() {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermission must be used within PermissionProvider')
  }
  return context
}
