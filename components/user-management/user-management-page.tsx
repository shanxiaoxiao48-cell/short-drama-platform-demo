"use client"

import { useState } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import type { User as UserType } from "./types"
import { ROLE_NAMES } from "@/lib/permissions"
import { UserListTab } from "./user-list-tab"
import { RolePermissionsTab } from "./role-permissions-tab"
import { OperationLogsTab } from "./operation-logs-tab"

interface UserManagementPageProps {
  onBack?: () => void
}

export function UserManagementPage({ onBack }: UserManagementPageProps) {
  return (
    <div className="h-full flex flex-col">
      {/* 页面标题 */}
      <div className="px-6 py-4 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">用户管理</h1>
            <p className="text-sm text-muted-foreground mt-1">
              管理系统用户、分配角色和配置权限
            </p>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col">
        <Tabs defaultValue="users" className="flex-1 flex flex-col">
          <div className="px-6 pt-3 border-b border-border">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl">
              <TabsTrigger value="users" className="text-sm">
                用户列表
              </TabsTrigger>
              <TabsTrigger value="roles" className="text-sm">
                角色权限
              </TabsTrigger>
              <TabsTrigger value="logs" className="text-sm">
                操作日志
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto">
            {/* 用户列表 Tab */}
            <TabsContent value="users" className="m-0 p-6">
              <UserListTab />
            </TabsContent>

            {/* 角色权限配置 Tab */}
            <TabsContent value="roles" className="m-0 p-6">
              <RolePermissionsTab />
            </TabsContent>

            {/* 操作日志 Tab */}
            <TabsContent value="logs" className="m-0 p-6">
              <OperationLogsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
