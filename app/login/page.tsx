"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Globe, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      alert("请输入用户名/手机号和密码")
      return
    }

    setIsLoading(true)

    // Simulate login API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Store user info in localStorage if remember me is checked
    if (rememberMe) {
      localStorage.setItem("rememberedUsername", username)
    } else {
      localStorage.removeItem("rememberedUsername")
    }

    setIsLoading(false)

    // Navigate to platform home page
    router.push("/")
  }

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
    alert("忘记密码功能待实现")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 bg-card border-border">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary mb-4">
            <Globe className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">短剧出海平台</h1>
          <p className="text-sm text-muted-foreground mt-2">登录您的账户</p>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          {/* Username / Phone */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">
              用户名 / 手机号
            </Label>
            <Input
              id="username"
              placeholder="请输入用户名或手机号"
              className="bg-input border-border"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              密码
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="请输入密码"
                className="bg-input border-border pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                记住我
              </Label>
            </div>
            <Button
              type="button"
              variant="link"
              className="text-sm text-primary h-auto p-0"
              onClick={handleForgotPassword}
            >
              忘记密码？
            </Button>
          </div>

          {/* Login Button */}
          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? "登录中..." : "登录"}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 短剧出海平台. All rights reserved.
          </p>
        </div>
      </Card>
    </div>
  )
}
