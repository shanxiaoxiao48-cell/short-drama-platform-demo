"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"

interface PersonalCenterProps {
  onBack?: () => void
}

export function PersonalCenter({ onBack }: PersonalCenterProps) {
  // Basic settings state
  const [nickname, setNickname] = useState("管理员")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("admin@dramago.com")
  const [gender, setGender] = useState("male")

  // Password settings state
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Calculate password strength
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: "", color: "" }

    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    const strengths = [
      { label: "弱", color: "bg-red-500" },
      { label: "较弱", color: "bg-orange-500" },
      { label: "中等", color: "bg-yellow-500" },
      { label: "强", color: "bg-green-500" },
      { label: "很强", color: "bg-emerald-500" },
    ]

    return {
      score,
      ...strengths[score - 1] || { label: "弱", color: "bg-red-500" }
    }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  const handleBasicSettingsSave = () => {
    console.log("Saving basic settings:", { nickname, phone, email, gender })
    // TODO: Implement save logic
  }

  const handleBasicSettingsReset = () => {
    setNickname("管理员")
    setPhone("")
    setEmail("admin@dramago.com")
    setGender("male")
  }

  const handlePasswordSave = () => {
    if (newPassword !== confirmPassword) {
      alert("新密码和确认密码不一致")
      return
    }
    console.log("Saving password")
    // TODO: Implement save logic
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handlePasswordReset = () => {
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">个人中心</h1>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="basic">基本设置</TabsTrigger>
          <TabsTrigger value="password">密码设置</TabsTrigger>
        </TabsList>

        {/* Basic Settings Tab */}
        <TabsContent value="basic">
          <Card className="p-6 bg-card border-border">
            <div className="space-y-6">
              {/* 昵称 */}
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-foreground">
                  用户昵称
                </Label>
                <Input
                  id="nickname"
                  placeholder="请输入用户昵称"
                  className="bg-input border-border"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>

              {/* 手机号码 */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">
                  手机号码
                </Label>
                <Input
                  id="phone"
                  placeholder="请输入手机号码"
                  className="bg-input border-border"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* 用户邮箱 */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  用户邮箱
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入用户邮箱"
                  className="bg-input border-border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* 性别选择 */}
              <div className="space-y-2">
                <Label className="text-foreground">性别</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="bg-input border-border w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">男</SelectItem>
                    <SelectItem value="female">女</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-4 pt-4">
                <Button onClick={handleBasicSettingsSave}>保存</Button>
                <Button variant="outline" onClick={handleBasicSettingsReset}>
                  重置
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Password Settings Tab */}
        <TabsContent value="password">
          <Card className="p-6 bg-card border-border">
            <div className="space-y-6">
              {/* 旧密码 */}
              <div className="space-y-2">
                <Label htmlFor="oldPassword" className="text-foreground">
                  旧密码
                </Label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    placeholder="请输入旧密码"
                    className="bg-input border-border pr-10"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* 新密码 */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-foreground">
                  新密码
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="请输入新密码"
                    className="bg-input border-border pr-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* 密码强度指示器 */}
                {newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {passwordStrength.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      密码必须大于等于8个字符，包含字母大小写、数字、符号组合排列的越多强度越高
                    </p>
                  </div>
                )}
              </div>

              {/* 确认密码 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  确认密码
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="请再次输入新密码"
                    className="bg-input border-border pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-4 pt-4">
                <Button onClick={handlePasswordSave}>保存</Button>
                <Button variant="outline" onClick={handlePasswordReset}>
                  重置
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
