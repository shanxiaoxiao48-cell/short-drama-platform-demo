"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, DollarSign, Calendar } from "lucide-react"
import { TranslatorInfoCard } from "@/components/analytics/translator-info-card"
import { TranslatorTaskList } from "@/components/analytics/translator-task-list"
import { mockDramas } from "@/lib/mock-analytics-data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// 格式化分钟为"X小时X分钟"
const formatMinutesToHoursAndMinutes = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)
  if (hours === 0) return `${minutes}分钟`
  if (minutes === 0) return `${hours}小时`
  return `${hours}小时${minutes}分钟`
}

// 固定种子随机数生成器
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

interface TranslatorDetailPageProps {
  translatorId: string
  onBack: () => void
  fromDataList?: boolean
}

export function TranslatorDetailPage({ translatorId, onBack }: TranslatorDetailPageProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all")

  // Mock译员数据库
  const translatorDatabase: Record<string, any> = {
    "王五": {
      id: "1", name: "王五", role: "translator" as const, rating: 9.2, grade: "S" as const,
      totalTasks: 20, completedTasks: 20, languages: ["英语", "日语", "韩语"],
      genres: ["现代剧", "都市剧"], pricePerMinute: 45.0, status: "available" as const,
    },
    "张三": {
      id: "2", name: "张三", role: "translator" as const, rating: 8.8, grade: "A+" as const,
      totalTasks: 18, completedTasks: 18, languages: ["英语", "西班牙语"],
      genres: ["古装剧", "武侠剧"], pricePerMinute: 42.0, status: "busy" as const,
    },
    "钱七": {
      id: "3", name: "钱七", role: "translator" as const, rating: 8.5, grade: "A+" as const,
      totalTasks: 16, completedTasks: 16, languages: ["韩语", "日语"],
      genres: ["悬疑剧", "推理剧"], pricePerMinute: 40.0, status: "busy" as const,
    },
    "李四": {
      id: "4", name: "李四", role: "translator" as const, rating: 8.2, grade: "A" as const,
      totalTasks: 17, completedTasks: 17, languages: ["日语", "葡萄牙语"],
      genres: ["古装剧", "宫廷剧"], pricePerMinute: 38.0, status: "available" as const,
    },
    "赵六": {
      id: "5", name: "赵六", role: "translator" as const, rating: 7.8, grade: "B" as const,
      totalTasks: 15, completedTasks: 15, languages: ["西班牙语", "葡萄牙语"],
      genres: ["现代剧", "爱情剧"], pricePerMinute: 35.0, status: "busy" as const,
    },
    "孙八": {
      id: "6", name: "孙八", role: "translator" as const, rating: 8.6, grade: "A+" as const,
      totalTasks: 17, completedTasks: 17, languages: ["葡萄牙语", "西班牙语"],
      genres: ["现代剧", "都市剧"], pricePerMinute: 43.0, status: "available" as const,
    },
    "周九": {
      id: "7", name: "周九", role: "translator" as const, rating: 7.5, grade: "B" as const,
      totalTasks: 14, completedTasks: 14, languages: ["英语"],
      genres: ["现代剧", "青春剧"], pricePerMinute: 32.0, status: "busy" as const,
    },
    "吴十": {
      id: "8", name: "吴十", role: "translator" as const, rating: 8.3, grade: "A" as const,
      totalTasks: 16, completedTasks: 16, languages: ["法语", "英语"],
      genres: ["古装剧", "悬疑剧"], pricePerMinute: 39.0, status: "available" as const,
    },
    "小王": {
      id: "9", name: "小王", role: "reviewer" as const, rating: 9.0, grade: "S" as const,
      totalTasks: 19, completedTasks: 19, languages: ["英语", "日语", "韩语"],
      genres: ["现代剧", "都市剧"], pricePerMinute: 50.0, status: "busy" as const,
    },
    "小李": {
      id: "10", name: "小李", role: "reviewer" as const, rating: 8.7, grade: "A+" as const,
      totalTasks: 17, completedTasks: 17, languages: ["日语", "法语"],
      genres: ["古装剧", "武侠剧"], pricePerMinute: 48.0, status: "available" as const,
    },
    "小刘": {
      id: "11", name: "小刘", role: "reviewer" as const, rating: 8.4, grade: "A" as const,
      totalTasks: 16, completedTasks: 16, languages: ["英语", "西班牙语"],
      genres: ["悬疑剧", "推理剧"], pricePerMinute: 46.0, status: "busy" as const,
    },
    "小陈": {
      id: "12", name: "小陈", role: "reviewer" as const, rating: 8.8, grade: "A+" as const,
      totalTasks: 18, completedTasks: 18, languages: ["韩语", "葡萄牙语"],
      genres: ["现代剧", "爱情剧"], pricePerMinute: 49.0, status: "available" as const,
    },
  }

  const translatorDetail = translatorDatabase[translatorId] || translatorDatabase["王五"]

  // 使用 useMemo 和固定种子生成稳定的任务数据
  const allTasks = useMemo(() => {
    const baseTime = new Date('2026-01-29T14:30:00')
    const pricePerMinute = translatorDetail.pricePerMinute || 40
    const languages = translatorDetail.languages || ["英语"]
    const taskCount = translatorDetail.totalTasks || 20
    const translatorName = translatorDetail.name
    
    // 基于译员名称的种子
    let seed = translatorName.charCodeAt(0) * 1000 + (translatorName.charCodeAt(1) || 0) * 100
    const getRandom = () => {
      seed++
      return seededRandom(seed)
    }
    
    const getHistoricalDate = (daysAgo: number, hour: number, minute: number) => {
      const date = new Date(baseTime)
      date.setDate(date.getDate() - daysAgo)
      date.setHours(hour, minute, 0, 0)
      return date.toISOString().slice(0, 16).replace('T', ' ')
    }
    
    const getMonthTag = (daysAgo: number) => {
      const date = new Date(baseTime)
      date.setDate(date.getDate() - daysAgo)
      return date.toISOString().slice(0, 7)
    }
    
    const getDrama = () => mockDramas[Math.floor(getRandom() * mockDramas.length)]
    const getLanguage = () => languages[Math.floor(getRandom() * languages.length)]
    
    const tasks: any[] = []
    
    // 2026年01月 - 3个任务
    for (let i = 0; i < Math.min(3, Math.ceil(taskCount * 0.15)); i++) {
      const daysAgo = i * 4
      const status = i === 0 ? "in_progress" : i === 1 ? "pending_review" : "pending_settlement"
      const videoDuration = 80 + Math.floor(getRandom() * 70)
      const workDuration = 5 + getRandom() * 6
      const hour = 10 + Math.floor(getRandom() * 8)
      const minute = Math.floor(getRandom() * 60)
      const drama = getDrama()
      const round = Math.floor(getRandom() * 2) + 1
      tasks.push({
        id: `T${translatorName}-${String(tasks.length + 1).padStart(3, '0')}`,
        dramaId: drama.id, dramaName: drama.title, language: getLanguage(),
        videoDuration, workDuration,
        modificationRate: status === "in_progress" ? 0 : 5 + getRandom() * 15,
        rejectionRate: status === "in_progress" ? 0 : getRandom() * 8,
        completionRate: status === "in_progress" ? 0 : 60 + getRandom() * 35,
        settlementAmount: status === "pending_settlement" ? videoDuration * pricePerMinute : 0,
        startedAt: getHistoricalDate(daysAgo, Math.max(8, hour - Math.floor(workDuration)), Math.floor(getRandom() * 60)),
        completedAt: status === "in_progress" ? "" : (daysAgo === 0 ? '2026-01-29 14:30' : getHistoricalDate(daysAgo, hour, minute)),
        round,
        month: getMonthTag(daysAgo), status,
      })
    }
    
    // 2025年12月 - 约25%任务（待结算）
    for (let i = 0; i < Math.ceil(taskCount * 0.25); i++) {
      const daysAgo = 35 + i * 3
      const videoDuration = 85 + Math.floor(getRandom() * 65)
      const workDuration = 5.5 + getRandom() * 5.5
      const hour = 9 + Math.floor(getRandom() * 10)
      const minute = Math.floor(getRandom() * 60)
      const drama = getDrama()
      const round = Math.floor(getRandom() * 2) + 1
      tasks.push({
        id: `T${translatorName}-${String(tasks.length + 1).padStart(3, '0')}`,
        dramaId: drama.id, dramaName: drama.title, language: getLanguage(),
        videoDuration, workDuration,
        modificationRate: 6 + getRandom() * 12, rejectionRate: 1 + getRandom() * 7,
        completionRate: 65 + getRandom() * 30,
        settlementAmount: videoDuration * pricePerMinute,
        startedAt: getHistoricalDate(daysAgo, Math.max(8, hour - Math.floor(workDuration)), Math.floor(getRandom() * 60)),
        completedAt: getHistoricalDate(daysAgo, hour, minute),
        round,
        month: getMonthTag(daysAgo), status: "pending_settlement" as const,
      })
    }
    
    // 2025年11月 - 约20%任务（已结算）
    for (let i = 0; i < Math.ceil(taskCount * 0.20); i++) {
      const daysAgo = 65 + i * 4
      const videoDuration = 80 + Math.floor(getRandom() * 70)
      const workDuration = 5 + getRandom() * 6
      const hour = 8 + Math.floor(getRandom() * 11)
      const minute = Math.floor(getRandom() * 60)
      const drama = getDrama()
      const round = Math.floor(getRandom() * 2) + 1
      tasks.push({
        id: `T${translatorName}-${String(tasks.length + 1).padStart(3, '0')}`,
        dramaId: drama.id, dramaName: drama.title, language: getLanguage(),
        videoDuration, workDuration,
        modificationRate: 5 + getRandom() * 13, rejectionRate: 0.5 + getRandom() * 7.5,
        completionRate: 70 + getRandom() * 25,
        settlementAmount: videoDuration * pricePerMinute,
        startedAt: getHistoricalDate(daysAgo, Math.max(8, hour - Math.floor(workDuration)), Math.floor(getRandom() * 60)),
        completedAt: getHistoricalDate(daysAgo, hour, minute),
        round,
        month: getMonthTag(daysAgo), status: "settled" as const,
      })
    }
    
    // 2025年10月 - 约20%任务（已结算）
    for (let i = 0; i < Math.ceil(taskCount * 0.20); i++) {
      const daysAgo = 95 + i * 4
      const videoDuration = 75 + Math.floor(getRandom() * 75)
      const workDuration = 4.5 + getRandom() * 6.5
      const hour = 7 + Math.floor(getRandom() * 12)
      const minute = Math.floor(getRandom() * 60)
      const drama = getDrama()
      const round = Math.floor(getRandom() * 2) + 1
      tasks.push({
        id: `T${translatorName}-${String(tasks.length + 1).padStart(3, '0')}`,
        dramaId: drama.id, dramaName: drama.title, language: getLanguage(),
        videoDuration, workDuration,
        modificationRate: 4 + getRandom() * 14, rejectionRate: getRandom() * 8,
        completionRate: 68 + getRandom() * 27,
        settlementAmount: videoDuration * pricePerMinute,
        startedAt: getHistoricalDate(daysAgo, Math.max(8, hour - Math.floor(workDuration)), Math.floor(getRandom() * 60)),
        completedAt: getHistoricalDate(daysAgo, hour, minute),
        round,
        month: getMonthTag(daysAgo), status: "settled" as const,
      })
    }
    
    // 2025年09月 - 约15%任务（已结算）
    for (let i = 0; i < Math.ceil(taskCount * 0.15); i++) {
      const daysAgo = 125 + i * 5
      const videoDuration = 70 + Math.floor(getRandom() * 80)
      const workDuration = 4 + getRandom() * 7
      const hour = 6 + Math.floor(getRandom() * 13)
      const minute = Math.floor(getRandom() * 60)
      const drama = getDrama()
      const round = Math.floor(getRandom() * 2) + 1
      tasks.push({
        id: `T${translatorName}-${String(tasks.length + 1).padStart(3, '0')}`,
        dramaId: drama.id, dramaName: drama.title, language: getLanguage(),
        videoDuration, workDuration,
        modificationRate: 3 + getRandom() * 15, rejectionRate: getRandom() * 8.5,
        completionRate: 65 + getRandom() * 30,
        settlementAmount: videoDuration * pricePerMinute,
        startedAt: getHistoricalDate(daysAgo, Math.max(8, hour - Math.floor(workDuration)), Math.floor(getRandom() * 60)),
        completedAt: getHistoricalDate(daysAgo, hour, minute),
        round,
        month: getMonthTag(daysAgo), status: "settled" as const,
      })
    }
    
    // 剩余任务 - 2025年08月（已结算）
    const remaining = taskCount - tasks.length
    for (let i = 0; i < remaining; i++) {
      const daysAgo = 155 + i * 5
      const videoDuration = 70 + Math.floor(getRandom() * 80)
      const workDuration = 4 + getRandom() * 7
      const hour = 6 + Math.floor(getRandom() * 13)
      const minute = Math.floor(getRandom() * 60)
      const drama = getDrama()
      const round = Math.floor(getRandom() * 2) + 1
      tasks.push({
        id: `T${translatorName}-${String(tasks.length + 1).padStart(3, '0')}`,
        dramaId: drama.id, dramaName: drama.title, language: getLanguage(),
        videoDuration, workDuration,
        modificationRate: 3 + getRandom() * 16, rejectionRate: getRandom() * 9,
        completionRate: 62 + getRandom() * 33,
        settlementAmount: videoDuration * pricePerMinute,
        startedAt: getHistoricalDate(daysAgo, Math.max(8, hour - Math.floor(workDuration)), Math.floor(getRandom() * 60)),
        completedAt: getHistoricalDate(daysAgo, hour, minute),
        round,
        month: getMonthTag(daysAgo), status: "settled" as const,
      })
    }
    
    return tasks
  }, [translatorDetail.name, translatorDetail.totalTasks, translatorDetail.languages, translatorDetail.pricePerMinute])

  const monthOptions = useMemo(() => {
    const months = new Set(allTasks.map(t => t.month).filter(m => m))
    return [
      { value: "all", label: "全部任务" },
      ...Array.from(months).sort().reverse().map(month => ({
        value: month,
        label: `${month.split('-')[0]}年${month.split('-')[1]}月`
      }))
    ]
  }, [allTasks])

  const filteredTasks = useMemo(() => {
    if (selectedMonth === "all") return allTasks
    return allTasks.filter(t => t.month === selectedMonth)
  }, [selectedMonth, allTasks])

  const monthlyData = useMemo(() => {
    const tasks = filteredTasks
    const totalTasks = tasks.length
    const totalDuration = tasks.reduce((sum, t) => sum + t.videoDuration, 0)
    const totalWorkHours = tasks.reduce((sum, t) => sum + t.workDuration, 0)
    const totalAmount = tasks.reduce((sum, t) => sum + t.settlementAmount, 0)
    const completedTasks = tasks.filter(t => t.status !== "in_progress")
    const avgModificationRate = completedTasks.length > 0 
      ? completedTasks.reduce((sum, t) => sum + t.modificationRate, 0) / completedTasks.length : 0
    const avgRejectionRate = completedTasks.length > 0
      ? completedTasks.reduce((sum, t) => sum + t.rejectionRate, 0) / completedTasks.length : 0
    return { totalTasks, totalDuration, totalWorkHours, totalAmount, avgModificationRate, avgRejectionRate }
  }, [filteredTasks])

  const handleDownloadReport = () => console.log("下载结算清单", selectedMonth)
  const handleMonthlySettlement = () => {
    if (selectedMonth === "all") { alert("请选择具体月份进行结算"); return }
    console.log("按月结算", selectedMonth)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1" />返回
            </Button>
            <div>
              <h1 className="text-xl font-bold">译员详情 - {translatorDetail.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">查看译员的详细信息和任务记录</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40 h-9">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="按月查看" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleDownloadReport}>
              <Download className="w-4 h-4 mr-1" />下载清单
            </Button>
            <Button size="sm" onClick={handleMonthlySettlement} disabled={selectedMonth === "all"}>
              <DollarSign className="w-4 h-4 mr-1" />结算
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <TranslatorInfoCard translator={translatorDetail} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedMonth === "all" ? "全部任务汇总" : `${monthOptions.find(m => m.value === selectedMonth)?.label}汇总数据`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div><div className="text-xs text-muted-foreground">任务数</div><div className="text-xl font-bold mt-1">{monthlyData.totalTasks}个</div></div>
              <div><div className="text-xs text-muted-foreground">视频时长</div><div className="text-xl font-bold mt-1">{formatMinutesToHoursAndMinutes(monthlyData.totalDuration)}</div></div>
              <div><div className="text-xs text-muted-foreground">工作时长</div><div className="text-xl font-bold mt-1">{formatMinutesToHoursAndMinutes(Math.round(monthlyData.totalWorkHours * 60))}</div></div>
              <div><div className="text-xs text-muted-foreground">结算金额</div><div className="text-xl font-bold mt-1 text-green-600">¥{monthlyData.totalAmount.toLocaleString()}</div></div>
              <div><div className="text-xs text-muted-foreground">平均修改率</div><div className="text-xl font-bold mt-1">{monthlyData.avgModificationRate > 0 ? `${monthlyData.avgModificationRate.toFixed(1)}%` : "-"}</div></div>
              <div><div className="text-xs text-muted-foreground">平均返修率</div><div className="text-xl font-bold mt-1">{monthlyData.avgRejectionRate > 0 ? `${monthlyData.avgRejectionRate.toFixed(1)}%` : "-"}</div></div>
            </div>
          </CardContent>
        </Card>
        {/* 任务列表 - 传递 {filteredTasks.length} 条数据 */}
        <TranslatorTaskList key={selectedMonth} tasks={filteredTasks as any} />
      </div>
    </div>
  )
}
