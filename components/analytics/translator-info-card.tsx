"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Star, Award, CheckCircle2, Languages, Film, DollarSign, Activity } from "lucide-react"

interface TranslatorDetail {
  id: string
  name: string
  role: ("translator" | "reviewer")[] | "translator" | "reviewer"
  rating: number
  grade: "S" | "A+" | "A" | "B" | "C" | "D"
  totalTasks: number
  completedTasks: number
  languages: string[]
  languageUnitPrices: Record<string, number>
  genres: string[]
  pricePerMinute: number
  reviewPricePerMinute?: number
  status: "busy" | "available"
}

interface TranslatorInfoCardProps {
  translator: TranslatorDetail
}

const getRatingBadge = (rating: number) => {
  if (rating >= 9.0) return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">S级</Badge>
  if (rating >= 8.5) return <Badge className="bg-green-100 text-green-700 border-green-200">A+级</Badge>
  if (rating >= 8.0) return <Badge className="bg-blue-100 text-blue-700 border-blue-200">A级</Badge>
  if (rating >= 7.5) return <Badge className="bg-orange-100 text-orange-700 border-orange-200">B级</Badge>
  return <Badge className="bg-red-100 text-red-700 border-red-200">C级</Badge>
}

export function TranslatorInfoCard({ translator }: TranslatorInfoCardProps) {
  const renderRoleBadge = (role: string) => {
    const roleText = role === "translator" ? "翻译" : "审校";
    const roleVariant = role === "translator" ? "default" : "secondary";
    return <Badge key={role} variant={roleVariant}>{roleText}</Badge>;
  };

  const getStatusBadge = () => {
    const statusText = translator.status === "available" ? "空闲" : "忙碌";
    const statusClass = translator.status === "available" ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200";
    return <Badge variant="outline" className={`${statusClass} ml-3`}>{statusText}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <User className="w-4 h-4" />
          译员信息
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* 基本信息 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">基本信息</span>
            </div>
            <div className="text-xl font-bold">{translator.name}</div>
            <div className="flex items-center gap-2">
              {Array.isArray(translator.role) ? (
                translator.role.map(renderRoleBadge)
              ) : (
                renderRoleBadge(translator.role)
              )}
              {getStatusBadge()}
            </div>
          </div>

          {/* 综合评分 */}
          {(!Array.isArray(translator.role) && translator.role === "translator") || (Array.isArray(translator.role) && translator.role.includes("translator")) ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">综合评分</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">{translator.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">/ 10.0</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-muted-foreground" />
                {getRatingBadge(translator.rating)}
              </div>
            </div>
          ) : null}

          {/* 任务统计 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">任务统计</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground">接单数量:</span>
                <span className="text-lg font-semibold">{translator.totalTasks}个</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground">完成数量:</span>
                <span className="text-lg font-semibold text-green-600">{translator.completedTasks}个</span>
              </div>
            </div>
          </div>

          {/* 擅长领域 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">擅长语言</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {translator.languages.map((lang) => (
                <Badge key={lang} variant="outline" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">擅长类型</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {translator.genres.map((genre) => (
                <Badge key={genre} variant="outline" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          {/* 语种单价列表 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">语种单价</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">语种</th>
                  {(!Array.isArray(translator.role) && translator.role === "translator") || (Array.isArray(translator.role) && translator.role.includes("translator")) ? (
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">翻译单价</th>
                  ) : null}
                  {(!Array.isArray(translator.role) && translator.role === "reviewer") || (Array.isArray(translator.role) && translator.role.includes("reviewer")) ? (
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">审校单价</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {translator.languages.map((lang) => (
                  <tr key={lang} className="border-b border-border">
                    <td className="py-2 px-2 font-medium">{lang}</td>
                    {(!Array.isArray(translator.role) && translator.role === "translator") || (Array.isArray(translator.role) && translator.role.includes("translator")) ? (
                      <td className="py-2 px-2 font-semibold">
                        {translator.languageUnitPrices?.[lang] !== undefined
                          ? `¥${translator.languageUnitPrices[lang].toFixed(0)}`
                          : '-'
                        }
                      </td>
                    ) : null}
                    {(!Array.isArray(translator.role) && translator.role === "reviewer") || (Array.isArray(translator.role) && translator.role.includes("reviewer")) ? (
                      <td className="py-2 px-2 font-semibold">
                        {translator.languageUnitPrices?.[lang] !== undefined
                          ? `¥${(translator.languageUnitPrices[lang] * 0.8).toFixed(0)}`
                          : '-'
                        }
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 md:col-span-5">
            <Button size="sm">编辑资料</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
