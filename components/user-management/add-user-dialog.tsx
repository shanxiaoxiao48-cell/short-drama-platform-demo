"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { User as UserType } from "./types"
import type { UserRole } from "@/lib/permissions"
import { ROLE_NAMES } from "@/lib/permissions"

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddUser: (user: Omit<UserType, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status' | 'projectPermissions' | 'lastLoginAt'>) => void
  existingUsers: UserType[]
}

export function AddUserDialog({ open, onOpenChange, onAddUser, existingUsers }: AddUserDialogProps) {
  // 表单状态
  const [nickname, setNickname] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [gender, setGender] = useState<string>("")
  const [role, setRole] = useState<UserRole>("")
  const [remark, setRemark] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  // 验证用户名是否重复
  const isEmailDuplicate = existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase())

  // 验证表单
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!nickname.trim()) {
      newErrors.nickname = "请输入用户昵称"
    }
    if (!email.trim()) {
      newErrors.email = "请输入邮箱"
    }
    if (!phone.trim()) {
      newErrors.phone = "请输入手机号码"
    }
    if (!password) {
      newErrors.password = "请输入密码"
    }
    if (!role) {
      newErrors.role = "请选择角色"
    }
    if (password && password.length < 6) {
      newErrors.password = "密码长度不能少于6位"
    }

    // 验证邮箱是否重复
    if (email.trim() && isEmailDuplicate) {
      newErrors.email = "此用户名已被使用，请重新输入"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 重置表单
  const resetForm = () => {
    setNickname("")
    setPhone("")
    setEmail("")
    setPassword("")
    setGender("")
    setRole("")
    setRemark("")
    setErrors({})
    setShowSuccess(false)
  }

  // 处理添加用户
  const handleAddUser = () => {
    if (!validateForm()) {
      return
    }

    const newUser: Omit<UserType, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status' | 'projectPermissions' | 'lastLoginAt'> = {
      name: nickname.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      role,
      projectPermissions: { type: 'all' },
    }

    onAddUser(newUser)
    setShowSuccess(true)

    // 2秒后关闭弹窗
    setTimeout(() => {
      setShowSuccess(false)
      resetForm()
      onOpenChange(false)
    }, 2000)
  }

  // 处理取消
  const handleCancel = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">添加用户</DialogTitle>
          <DialogDescription>
            填写用户基本信息创建新用户
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
              <span className="text-3xl text-white">✓</span>
            </div>
            <p className="text-lg font-semibold text-foreground mb-2">创建成功</p>
            <p className="text-sm text-muted-foreground">正在关闭窗口...</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* 用户昵称（必填） */}
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-sm font-medium text-foreground">
                用户昵称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nickname"
                placeholder="请输入用户昵称"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onBlur={() => {
                  const newErrors = { ...errors };
                  if (!nickname.trim()) {
                    newErrors.nickname = "请输入用户昵称";
                  } else {
                    delete newErrors.nickname;
                  }
                  setErrors(newErrors);
                }}
                className={errors.nickname ? "border-red-500" : ""}
              />
              {errors.nickname && (
                <p className="text-sm text-red-500 mt-1">{errors.nickname}</p>
              )}
            </div>

            {/* 邮箱（必填） */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                邮箱 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  const newErrors = { ...errors };
                  if (!email.trim()) {
                    newErrors.email = "请输入邮箱";
                  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    newErrors.email = "请输入正确的邮箱";
                  } else if (existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                    newErrors.email = "此邮箱已被使用，请重新输入";
                  } else {
                    delete newErrors.email;
                  }
                  setErrors(newErrors);
                }}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* 手机号码 */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                手机号码 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="请输入手机号码"
                value={phone}
                onChange={(e) => {
                  const phoneValue = e.target.value;
                  setPhone(phoneValue);
                }}
                onBlur={() => {
                  const newErrors = { ...errors };
                  if (!phone.trim()) {
                    newErrors.phone = "请输入手机号码";
                  } else if (!/^1\d{10}$/.test(phone)) {
                    newErrors.phone = "请输入正确的手机号码";
                  } else {
                    delete newErrors.phone;
                    // 自动填充密码为手机号后6位
                    if (phone.length >= 6) {
                      const passwordValue = phone.slice(-6);
                      setPassword(passwordValue);
                    }
                  }
                  setErrors(newErrors);
                }}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* 用户密码（必填） */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                用户密码 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入用户密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => {
                  const newErrors = { ...errors };
                  if (!password) {
                    newErrors.password = "请输入密码";
                  } else if (password.length < 6) {
                    newErrors.password = "密码长度不能少于6位";
                  } else {
                    delete newErrors.password;
                  }
                  setErrors(newErrors);
                }}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* 性别 */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-medium text-foreground">
                性别
              </Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 角色（必填） */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-foreground">
                角色 <span className="text-red-500">*</span>
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_NAMES).map(([roleId, roleName]) => (
                    <SelectItem key={roleId} value={roleId}>
                      {roleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500 mt-1">{errors.role}</p>
              )}
            </div>

            {/* 备注 */}
            <div className="space-y-2">
              <Label htmlFor="remark" className="text-sm font-medium text-foreground">
                备注
              </Label>
              <Textarea
                id="remark"
                placeholder="请输入备注（可选）"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
        )}

        {!showSuccess && (
          <DialogFooter>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                取消
              </Button>
              <Button onClick={handleAddUser}>
                确定
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
