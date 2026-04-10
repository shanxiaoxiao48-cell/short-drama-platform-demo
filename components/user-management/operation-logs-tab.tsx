"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Download } from "lucide-react"
import type { OperationLog } from "./types"

// 模拟操作日志数据
const mockLogs: OperationLog[] = [
  {
    id: "1",
    operatorId: "admin",
    operatorName: "管理员",
    targetUserId: "pm001",
    targetUserName: "张经理",
    action: "创建用户",
    details: {
      role: "project_manager",
      permissions: { type: "selected", projectIds: ["1", "2", "3"] },
    },
    ipAddress: "192.168.1.100",
    timestamp: "2024-02-07T14:30:00Z",
  },
  {
    id: "2",
    operatorId: "pm001",
    operatorName: "张经理",
    targetUserId: "tr001",
    targetUserName: "王译员",
    action: "分配项目权限",
    details: {
      projects: ["1", "3"],
      previousProjects: ["1"],
    },
    ipAddress: "192.168.1.101",
    timestamp: "2024-02-07T13:15:00Z",
  },
  {
    id: "3",
    operatorId: "admin",
    operatorName: "管理员",
    targetUserId: "tr001",
    targetUserName: "王译员",
    action: "修改角色",
    details: {
      oldRole: "material_handler",
      newRole: "translator",
    },
    ipAddress: "192.168.1.100",
    timestamp: "2024-02-07T11:00:00Z",
  },
  {
    id: "4",
    operatorId: "pm002",
    operatorName: "李经理",
    targetUserId: "tr002",
    targetUserName: "陈译员",
    action: "创建用户",
    details: {
      role: "translator",
      permissions: { type: "selected", projectIds: ["2", "4"] },
    },
    ipAddress: "192.168.1.102",
    timestamp: "2024-02-06T16:45:00Z",
  },
  {
    id: "5",
    operatorId: "admin",
    operatorName: "管理员",
    targetUserId: "ve001",
    targetUserName: "刘压制",
    action: "禁用账号",
    details: {
      reason: "长期未登录",
    },
    ipAddress: "192.168.1.100",
    timestamp: "2024-02-05T10:00:00Z",
  },
  {
    id: "6",
    operatorId: "pm001",
    operatorName: "张经理",
    action: "重置密码",
    targetUserId: "qc001",
    targetUserName: "赵质检",
    details: {
      newPassword: "***",
    },
    ipAddress: "192.168.1.101",
    timestamp: "2024-02-05T09:30:00Z",
  },
  {
    id: "7",
    operatorId: "admin",
    operatorName: "管理员",
    targetUserId: "mh001",
    targetUserName: "李物料",
    action: "删除用户",
    details: {
      reason: "人员调整",
    },
    ipAddress: "192.168.1.100",
    timestamp: "2024-02-04T15:20:00Z",
  },
  {
    id: "8",
    operatorId: "pm002",
    operatorName: "李经理",
    action: "批量分配角色",
    details: {
      targetUsers: ["tr002", "qc002", "ve002"],
      role: "translator",
    },
    ipAddress: "192.168.1.102",
    timestamp: "2024-02-04T14:00:00Z",
  },
]

// 操作类型和颜色映射
const actionColors: Record<string, string> = {
  "创建用户": "bg-green-500/10 text-green-700",
  "修改用户": "bg-blue-500/10 text-blue-700",
  "删除用户": "bg-red-500/10 text-red-700",
  "禁用账号": "bg-orange-500/10 text-orange-700",
  "启用账号": "bg-teal-500/10 text-teal-700",
  "修改角色": "bg-purple-500/10 text-purple-700",
  "分配项目权限": "bg-cyan-500/10 text-cyan-700",
  "重置密码": "bg-yellow-500/10 text-yellow-700",
  "批量分配角色": "bg-indigo-500/10 text-indigo-700",
}

export function OperationLogsTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  // 过滤日志
  const filteredLogs = mockLogs.filter(log => {
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const searchIn = [
        log.operatorName,
        log.targetUserName || "",
        log.action,
        JSON.stringify(log.details),
      ].join(" ").toLowerCase()
      if (!searchIn.includes(query)) {
        return false
      }
    }

    // 操作类型过滤
    if (actionFilter !== "all" && !log.action.includes(actionFilter)) {
      return false
    }

    // 日期过滤
    if (dateFilter !== "all") {
      const logDate = new Date(log.timestamp)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / 86400000)

      if (dateFilter === "today" && daysDiff > 1) return false
      if (dateFilter === "week" && daysDiff > 7) return false
      if (dateFilter === "month" && daysDiff > 30) return false
    }

    return true
  })

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatDetails = (details: Record<string, any>) => {
    const entries = Object.entries(details)
    return (
      <div className="text-xs text-muted-foreground mt-1 space-y-1">
        {entries.map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <span className="font-medium text-foreground">{key}:</span>
            <span className="truncate">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 筛选和搜索栏 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索操作人、目标用户或操作内容"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input border-border"
          />
        </div>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-36 bg-input border-border">
            <SelectValue placeholder="所有时间" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有时间</SelectItem>
            <SelectItem value="today">今天</SelectItem>
            <SelectItem value="week">最近7天</SelectItem>
            <SelectItem value="month">最近30天</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          导出日志
        </Button>
      </div>

      {/* 日志表格 */}
      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-sm text-foreground">时间</th>
                <th className="text-left p-4 font-medium text-sm text-foreground">操作人</th>
                <th className="text-left p-4 font-medium text-sm text-foreground">操作类型</th>
                <th className="text-left p-4 font-medium text-sm text-foreground">目标用户</th>
                <th className="text-left p-4 font-medium text-sm text-foreground">操作详情</th>
                <th className="text-left p-4 font-medium text-sm text-foreground">IP地址</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  {/* 时间 */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground font-mono">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                  </td>

                  {/* 操作人 */}
                  <td className="p-4">
                    <span className="text-sm text-foreground">{log.operatorName}</span>
                  </td>

                  {/* 操作类型 */}
                  <td className="p-4">
                    <Badge className={actionColors[log.action] || "bg-gray-500/10 text-gray-700"}>
                      {log.action}
                    </Badge>
                  </td>

                  {/* 目标用户 */}
                  <td className="p-4">
                    {log.targetUserName ? (
                      <span className="text-sm text-foreground">{log.targetUserName}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>

                  {/* 操作详情 */}
                  <td className="p-4">
                    {formatDetails(log.details)}
                  </td>

                  {/* IP地址 */}
                  <td className="p-4">
                    <span className="text-sm font-mono text-muted-foreground">
                      {log.ipAddress || "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 空状态 */}
      {filteredLogs.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">未找到操作日志</p>
        </div>
      )}
    </div>
  )
}
