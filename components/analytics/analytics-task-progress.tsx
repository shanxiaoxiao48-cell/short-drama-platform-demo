"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown, RotateCcw } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"



// Mock数据 - 短剧列表
const mockDramas = [
  { id: "D001", title: "霸道总裁爱上我", episodes: 80 },
  { id: "D002", title: "穿越之王妃驾到", episodes: 100 },
  { id: "D003", title: "重生之豪门千金", episodes: 60 },
  { id: "D004", title: "神医毒妃不好惹", episodes: 90 },
  { id: "D005", title: "闪婚后大佬每天都在吃醋", episodes: 70 },
]

// Mock数据 - 语种列表（移除中文）
const mockLanguages = [
  { code: "EN", name: "英语" },
  { code: "ES", name: "西班牙语" },
  { code: "PT", name: "葡萄牙语" },
  { code: "JA", name: "日语" },
  { code: "KO", name: "韩语" },
  { code: "FR", name: "法语" },
  { code: "DE", name: "德语" },
  { code: "AR", name: "阿拉伯语" },
]

// 环节代码映射
const stageCodeMap: Record<string, string> = {
  AI提取: "TQ",
  视频擦除: "CS",
  AI翻译: "FY",
  人工翻译: "FY",
  审核质检: "ZJ",
  成片压制: "YZ",
}

// 任务列表 - 基于2026年1月28日
// 规则：
// 1. 中文不需要AI翻译环节
// 2. 其他语种需要AI翻译环节
// 3. 工作流顺序：AI翻译 → 人工翻译 → 审核质检 → 成片压制
// 4. 如果某个环节存在，之前的环节也必须存在
// 5. 审核驳回会产生新的人工翻译和审核质检任务，需要标注轮次
// 6. 只有人工翻译和审核质检有轮次概念，其他环节都是一轮
const allTaskList = [
  // 霸道总裁爱上我 - 英语版（已到成片压制，包含所有前置环节）
  {
    dramaId: "D001",
    drama: "霸道总裁爱上我",
    languageCode: "EN",
    language: "英语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2026-01-15 09:00",
    endTime: "2026-01-15 14:30",
  },
  {
    dramaId: "D001",
    drama: "霸道总裁爱上我",
    languageCode: "EN",
    language: "英语",
    stage: "人工翻译",
    round: 1,
    progress: 100,
    translator: "张三",
    qaPersonnel: null,
    startTime: "2024-01-29 09:00",
    endTime: "2024-02-01 17:30",
  },
  {
    dramaId: "D001",
    drama: "霸道总裁爱上我",
    languageCode: "EN",
    language: "英语",
    stage: "审核质检",
    round: 1,
    progress: 100,
    translator: "张三",
    qaPersonnel: ["小王", "小李"],
    startTime: "2024-02-02 10:00",
    endTime: "2024-02-03 16:00",
  },
  {
    dramaId: "D001",
    drama: "霸道总裁爱上我",
    languageCode: "EN",
    language: "英语",
    stage: "成片压制",
    round: 1,
    progress: 85,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2024-02-04 09:00",
    endTime: null,
  },
  
  // 霸道总裁爱上我 - 日语版（人工翻译中，包含AI翻译）
  {
    dramaId: "D001",
    drama: "霸道总裁爱上我",
    languageCode: "JA",
    language: "日语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2024-02-01 08:00",
    endTime: "2024-02-01 15:20",
  },
  {
    dramaId: "D001",
    drama: "霸道总裁爱上我",
    languageCode: "JA",
    language: "日语",
    stage: "人工翻译",
    round: 1,
    progress: 52,
    translator: "王五",
    qaPersonnel: null,
    startTime: "2024-02-02 09:00",
    endTime: null,
  },

  // 穿越之王妃驾到 - 韩语版（已完成所有环节，包含审核驳回重做）
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "KO",
    language: "韩语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2024-01-20 09:00",
    endTime: "2024-01-20 16:45",
  },
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "KO",
    language: "韩语",
    stage: "人工翻译",
    round: 1,
    progress: 100,
    translator: "钱七",
    qaPersonnel: null,
    startTime: "2024-01-21 10:00",
    endTime: "2024-01-25 18:00",
  },
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "KO",
    language: "韩语",
    stage: "审核质检",
    round: 1,
    progress: 100,
    translator: "钱七",
    qaPersonnel: "小陈",
    startTime: "2024-01-26 09:00",
    endTime: "2024-01-27 14:30",
  },
  // 第一次审核驳回，返回人工翻译
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "KO",
    language: "韩语",
    stage: "人工翻译",
    round: 2,
    progress: 100,
    translator: "钱七",
    qaPersonnel: null,
    startTime: "2024-01-28 09:00",
    endTime: "2024-01-29 17:00",
  },
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "KO",
    language: "韩语",
    stage: "审核质检",
    round: 2,
    progress: 100,
    translator: "钱七",
    qaPersonnel: ["小陈", "小刘"],
    startTime: "2024-01-30 10:00",
    endTime: "2024-02-01 15:30",
  },
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "KO",
    language: "韩语",
    stage: "成片压制",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2024-02-02 09:15",
    endTime: "2024-02-06 14:30",
  },

  // 穿越之王妃驾到 - 日语版（审核质检中）
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "JA",
    language: "日语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2024-01-25 08:00",
    endTime: "2024-01-25 15:30",
  },
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "JA",
    language: "日语",
    stage: "人工翻译",
    round: 1,
    progress: 100,
    translator: "李四",
    qaPersonnel: null,
    startTime: "2024-01-26 09:00",
    endTime: "2024-01-28 18:00",
  },
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "JA",
    language: "日语",
    stage: "审核质检",
    round: 1,
    progress: 75,
    translator: "李四",
    qaPersonnel: "小王",
    startTime: "2024-01-29 10:30",
    endTime: null,
  },

  // 重生之豪门千金 - 英语版（人工翻译中）
  {
    dramaId: "D003",
    drama: "重生之豪门千金",
    languageCode: "EN",
    language: "英语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2024-02-01 09:00",
    endTime: "2024-02-01 14:20",
  },
  {
    dramaId: "D003",
    drama: "重生之豪门千金",
    languageCode: "EN",
    language: "英语",
    stage: "人工翻译",
    round: 1,
    progress: 45,
    translator: "王五",
    qaPersonnel: null,
    startTime: "2024-02-02 14:00",
    endTime: null,
  },

  // 重生之豪门千金 - 韩语版（AI翻译刚完成）
  {
    dramaId: "D003",
    drama: "重生之豪门千金",
    languageCode: "KO",
    language: "韩语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2024-02-05 10:00",
    endTime: "2024-02-05 16:30",
  },

  // 神医毒妃不好惹 - 法语版（审核质检中）
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "FR",
    language: "法语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2024-01-24 08:00",
    endTime: "2024-01-24 15:45",
  },
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "FR",
    language: "法语",
    stage: "人工翻译",
    round: 1,
    progress: 100,
    translator: "吴十",
    qaPersonnel: null,
    startTime: "2024-01-25 09:00",
    endTime: "2024-01-27 17:30",
  },
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "FR",
    language: "法语",
    stage: "审核质检",
    round: 1,
    progress: 91,
    translator: "吴十",
    qaPersonnel: "小李",
    startTime: "2024-01-28 11:15",
    endTime: null,
  },

  // 神医毒妃不好惹 - 阿拉伯语版（审核驳回后第二轮审核中）
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "AR",
    language: "阿拉伯语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2024-01-22 09:00",
    endTime: "2024-01-22 16:20",
  },
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "AR",
    language: "阿拉伯语",
    stage: "人工翻译",
    round: 1,
    progress: 100,
    translator: "钱七",
    qaPersonnel: null,
    startTime: "2024-01-23 10:00",
    endTime: "2024-01-26 18:00",
  },
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "AR",
    language: "阿拉伯语",
    stage: "审核质检",
    round: 1,
    progress: 100,
    translator: "钱七",
    qaPersonnel: "小刘",
    startTime: "2024-01-27 09:00",
    endTime: "2024-01-28 14:00",
  },
  // 审核驳回，返回人工翻译
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "AR",
    language: "阿拉伯语",
    stage: "人工翻译",
    round: 2,
    progress: 100,
    translator: "钱七",
    qaPersonnel: null,
    startTime: "2024-01-29 09:00",
    endTime: "2024-01-31 16:00",
  },
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "AR",
    language: "阿拉伯语",
    stage: "审核质检",
    round: 2,
    progress: 78,
    translator: "钱七",
    qaPersonnel: "小刘",
    startTime: "2024-02-01 10:45",
    endTime: null,
  },

  // 闪婚后大佬每天都在吃醋 - 英语版（人工翻译中）
  {
    dramaId: "D005",
    drama: "闪婚后大佬每天都在吃醋",
    languageCode: "EN",
    language: "英语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2024-01-27 08:00",
    endTime: "2024-01-27 14:45",
  },
  {
    dramaId: "D005",
    drama: "闪婚后大佬每天都在吃醋",
    languageCode: "EN",
    language: "英语",
    stage: "人工翻译",
    round: 1,
    progress: 72,
    translator: "周九",
    qaPersonnel: null,
    startTime: "2024-01-28 08:45",
    endTime: null,
  },

  // 闪婚后大佬每天都在吃醋 - 葡萄牙语版（已完成）
  {
    dramaId: "D005",
    drama: "闪婚后大佬每天都在吃醋",
    languageCode: "PT",
    language: "葡萄牙语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2024-01-25 09:00",
    endTime: "2024-01-25 15:30",
  },
  {
    dramaId: "D005",
    drama: "闪婚后大佬每天都在吃醋",
    languageCode: "PT",
    language: "葡萄牙语",
    stage: "人工翻译",
    round: 1,
    progress: 100,
    translator: "孙八",
    qaPersonnel: null,
    startTime: "2024-01-26 10:00",
    endTime: "2024-01-28 17:00",
  },
  {
    dramaId: "D005",
    drama: "闪婚后大佬每天都在吃醋",
    languageCode: "PT",
    language: "葡萄牙语",
    stage: "审核质检",
    round: 1,
    progress: 100,
    translator: "孙八",
    qaPersonnel: "小陈",
    startTime: "2024-01-29 13:00",
    endTime: "2024-02-01 16:00",
  },
  {
    dramaId: "D005",
    drama: "闪婚后大佬每天都在吃醋",
    languageCode: "PT",
    language: "葡萄牙语",
    stage: "成片压制",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2024-02-02 13:00",
    endTime: "2024-02-04 16:45",
  },

  // 添加更多任务数据以演示分页功能
  // 霸道总裁爱上我 - 西班牙语版
  {
    dramaId: "D001",
    drama: "霸道总裁爱上我",
    languageCode: "ES",
    language: "西班牙语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2026-01-16 09:00",
    endTime: "2026-01-16 15:30",
  },
  {
    dramaId: "D001",
    drama: "霸道总裁爱上我",
    languageCode: "ES",
    language: "西班牙语",
    stage: "人工翻译",
    round: 1,
    progress: 85,
    translator: "赵六",
    qaPersonnel: null,
    startTime: "2026-01-17 10:00",
    endTime: null,
  },

  // 穿越之王妃驾到 - 英语版
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "EN",
    language: "英语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2025-12-18 09:00",
    endTime: "2025-12-18 16:30",
  },
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "EN",
    language: "英语",
    stage: "人工翻译",
    round: 1,
    progress: 100,
    translator: "张三",
    qaPersonnel: null,
    startTime: "2025-12-19 09:00",
    endTime: "2025-12-23 18:00",
  },
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "EN",
    language: "英语",
    stage: "审核质检",
    round: 1,
    progress: 100,
    translator: "张三",
    qaPersonnel: "小刘",
    startTime: "2025-12-24 10:00",
    endTime: "2025-12-26 16:00",
  },
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "EN",
    language: "英语",
    stage: "成片压制",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2025-12-27 09:00",
    endTime: "2026-01-02 14:30",
  },

  // 重生之豪门千金 - 葡萄牙语版
  {
    dramaId: "D003",
    drama: "重生之豪门千金",
    languageCode: "PT",
    language: "葡萄牙语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2026-01-23 08:00",
    endTime: "2026-01-23 14:20",
  },
  {
    dramaId: "D003",
    drama: "重生之豪门千金",
    languageCode: "PT",
    language: "葡萄牙语",
    stage: "人工翻译",
    round: 1,
    progress: 30,
    translator: "李四",
    qaPersonnel: null,
    startTime: "2026-01-24 09:00",
    endTime: null,
  },

  // 神医毒妃不好惹 - 英语版
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "EN",
    language: "英语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2026-01-08 09:00",
    endTime: "2026-01-08 16:45",
  },
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "EN",
    language: "英语",
    stage: "人工翻译",
    round: 1,
    progress: 100,
    translator: "王五",
    qaPersonnel: null,
    startTime: "2026-01-09 10:00",
    endTime: "2026-01-11 17:30",
  },
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "EN",
    language: "英语",
    stage: "审核质检",
    round: 1,
    progress: 75,
    translator: "王五",
    qaPersonnel: "小王",
    startTime: "2026-01-12 09:00",
    endTime: null,
  },

  // 神医毒妃不好惹 - 日语版
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "JA",
    language: "日语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2026-01-10 08:00",
    endTime: "2026-01-10 15:30",
  },
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "JA",
    language: "日语",
    stage: "人工翻译",
    round: 1,
    progress: 55,
    translator: "张三",
    qaPersonnel: null,
    startTime: "2026-01-11 09:00",
    endTime: null,
  },

  // 闪婚后大佬每天都在吃醋 - 西班牙语版
  {
    dramaId: "D005",
    drama: "闪婚后大佬每天都在吃醋",
    languageCode: "ES",
    language: "西班牙语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2026-01-26 09:00",
    endTime: "2026-01-26 15:00",
  },
  {
    dramaId: "D005",
    drama: "闪婚后大佬每天都在吃醋",
    languageCode: "ES",
    language: "西班牙语",
    stage: "人工翻译",
    round: 1,
    progress: 45,
    translator: "赵六",
    qaPersonnel: null,
    startTime: "2026-01-27 10:00",
    endTime: null,
  },

  // 闪婚后大佬每天都在吃醋 - 韩语版
  {
    dramaId: "D005",
    drama: "闪婚后大佬每天都在吃醋",
    languageCode: "KO",
    language: "韩语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2026-01-20 08:00",
    endTime: "2026-01-20 14:30",
  },
  {
    dramaId: "D005",
    drama: "闪婚后大佬每天都在吃醋",
    languageCode: "KO",
    language: "韩语",
    stage: "人工翻译",
    round: 1,
    progress: 100,
    translator: "钱七",
    qaPersonnel: null,
    startTime: "2026-01-21 09:00",
    endTime: "2026-01-24 17:00",
  },
  {
    dramaId: "D005",
    drama: "闪婚后大佬每天都在吃醋",
    languageCode: "KO",
    language: "韩语",
    stage: "审核质检",
    round: 1,
    progress: 88,
    translator: "钱七",
    qaPersonnel: ["小陈", "小王", "小李"],
    startTime: "2026-01-25 10:00",
    endTime: null,
  },

  // 添加更多王五的任务（共14个新任务）
  // 霸道总裁爱上我 - 韩语版
  {
    dramaId: "D001",
    drama: "霸道总裁爱上我",
    languageCode: "KO",
    language: "韩语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2026-01-18 09:00",
    endTime: "2026-01-18 15:30",
  },
  {
    dramaId: "D001",
    drama: "霸道总裁爱上我",
    languageCode: "KO",
    language: "韩语",
    stage: "人工翻译",
    round: 1,
    progress: 68,
    translator: "王五",
    qaPersonnel: null,
    startTime: "2026-01-19 10:00",
    endTime: null,
  },

  // 霸道总裁爱上我 - 法语版
  {
    dramaId: "D001",
    drama: "霸道总裁爱上我",
    languageCode: "FR",
    language: "法语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2026-01-20 08:00",
    endTime: "2026-01-20 14:45",
  },
  {
    dramaId: "D001",
    drama: "霸道总裁爱上我",
    languageCode: "FR",
    language: "法语",
    stage: "人工翻译",
    round: 1,
    progress: 42,
    translator: "王五",
    qaPersonnel: null,
    startTime: "2026-01-21 09:00",
    endTime: null,
  },

  // 穿越之王妃驾到 - 西班牙语版
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "ES",
    language: "西班牙语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2026-01-15 09:00",
    endTime: "2026-01-15 16:20",
  },
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "ES",
    language: "西班牙语",
    stage: "人工翻译",
    round: 1,
    progress: 100,
    translator: "王五",
    qaPersonnel: null,
    startTime: "2026-01-16 10:00",
    endTime: "2026-01-20 17:30",
  },
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "ES",
    language: "西班牙语",
    stage: "审核质检",
    round: 1,
    progress: 85,
    translator: "王五",
    qaPersonnel: "小李",
    startTime: "2026-01-21 10:00",
    endTime: null,
  },

  // 穿越之王妃驾到 - 葡萄牙语版
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "PT",
    language: "葡萄牙语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2026-01-22 08:00",
    endTime: "2026-01-22 15:10",
  },
  {
    dramaId: "D002",
    drama: "穿越之王妃驾到",
    languageCode: "PT",
    language: "葡萄牙语",
    stage: "人工翻译",
    round: 1,
    progress: 55,
    translator: "王五",
    qaPersonnel: null,
    startTime: "2026-01-23 09:00",
    endTime: null,
  },

  // 重生之豪门千金 - 日语版
  {
    dramaId: "D003",
    drama: "重生之豪门千金",
    languageCode: "JA",
    language: "日语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2026-01-17 09:00",
    endTime: "2026-01-17 15:40",
  },
  {
    dramaId: "D003",
    drama: "重生之豪门千金",
    languageCode: "JA",
    language: "日语",
    stage: "人工翻译",
    round: 1,
    progress: 72,
    translator: "王五",
    qaPersonnel: null,
    startTime: "2026-01-18 10:00",
    endTime: null,
  },

  // 重生之豪门千金 - 西班牙语版
  {
    dramaId: "D003",
    drama: "重生之豪门千金",
    languageCode: "ES",
    language: "西班牙语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2026-01-19 08:00",
    endTime: "2026-01-19 14:30",
  },
  {
    dramaId: "D003",
    drama: "重生之豪门千金",
    languageCode: "ES",
    language: "西班牙语",
    stage: "人工翻译",
    round: 1,
    progress: 38,
    translator: "王五",
    qaPersonnel: null,
    startTime: "2026-01-20 09:00",
    endTime: null,
  },

  // 神医毒妃不好惹 - 韩语版
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "KO",
    language: "韩语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2026-01-14 09:00",
    endTime: "2026-01-14 16:15",
  },
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "KO",
    language: "韩语",
    stage: "人工翻译",
    round: 1,
    progress: 100,
    translator: "王五",
    qaPersonnel: null,
    startTime: "2026-01-15 10:00",
    endTime: "2026-01-18 17:00",
  },
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "KO",
    language: "韩语",
    stage: "审核质检",
    round: 1,
    progress: 92,
    translator: "王五",
    qaPersonnel: "小陈",
    startTime: "2026-01-19 10:00",
    endTime: null,
  },

  // 神医毒妃不好惹 - 葡萄牙语版
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "PT",
    language: "葡萄牙语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2026-01-16 08:00",
    endTime: "2026-01-16 14:50",
  },
  {
    dramaId: "D004",
    drama: "神医毒妃不好惹",
    languageCode: "PT",
    language: "葡萄牙语",
    stage: "人工翻译",
    round: 1,
    progress: 48,
    translator: "王五",
    qaPersonnel: null,
    startTime: "2026-01-17 09:00",
    endTime: null,
  },

  // 闪婚后大佬每天都在吃醋 - 日语版
  {
    dramaId: "D005",
    drama: "闪婚后大佬每天都在吃醋",
    languageCode: "JA",
    language: "日语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2026-01-23 09:00",
    endTime: "2026-01-23 15:20",
  },
  {
    dramaId: "D005",
    drama: "闪婚后大佬每天都在吃醋",
    languageCode: "JA",
    language: "日语",
    stage: "人工翻译",
    round: 1,
    progress: 62,
    translator: "王五",
    qaPersonnel: null,
    startTime: "2026-01-24 10:00",
    endTime: null,
  },

  // 闪婚后大佬每天都在吃醋 - 法语版
  {
    dramaId: "D005",
    drama: "闪婚后大佬每天都在吃醋",
    languageCode: "FR",
    language: "法语",
    stage: "AI翻译",
    round: 1,
    progress: 100,
    translator: "系统",
    qaPersonnel: null,
    startTime: "2026-01-24 08:00",
    endTime: "2026-01-24 14:35",
  },
  {
    dramaId: "D005",
    drama: "闪婚后大佬每天都在吃醋",
    languageCode: "FR",
    language: "法语",
    stage: "人工翻译",
    round: 1,
    progress: 35,
    translator: "王五",
    qaPersonnel: null,
    startTime: "2026-01-25 09:00",
    endTime: null,
  },
]

const getStageBadge = (stage: string) => {
  const stageConfig: Record<
    string,
    { variant: "default" | "secondary" | "destructive" | "outline"; className: string }
  > = {
    AI提取: { variant: "outline", className: "bg-purple-50 text-purple-700 border-purple-200" },
    视频擦除: { variant: "outline", className: "bg-pink-50 text-pink-700 border-pink-200" },
    AI翻译: { variant: "outline", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    人工翻译: { variant: "default", className: "bg-blue-100 text-blue-700" },
    审核质检: { variant: "secondary", className: "bg-sky-100 text-sky-700" },
    成片压制: { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" },
  }
  const config = stageConfig[stage] || { variant: "outline" as const, className: "" }
  return (
    <Badge variant={config.variant} className={config.className}>
      {stage}
    </Badge>
  )
}

export function AnalyticsTaskProgress({
  initialDramaFilter,
  initialLanguageFilter,
  initialTranslatorFilter,
  onNavigateToTranslator,
}: {
  initialDramaFilter?: string
  initialLanguageFilter?: string
  initialTranslatorFilter?: string
  onNavigateToTranslator?: (translatorName: string) => void
}) {
  // 筛选器状态
  const [selectedDrama, setSelectedDrama] = useState("all")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [selectedTranslator, setSelectedTranslator] = useState("all")
  const [selectedStage, setSelectedStage] = useState("all")
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  
  // 选中任务状态
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  
  // 排序状态
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // 应用初始筛选器
  useEffect(() => {
    if (initialDramaFilter) {
      const drama = mockDramas.find(d => d.title === initialDramaFilter)
      if (drama) {
        setSelectedDrama(drama.id)
      }
    }
    if (initialLanguageFilter) {
      const language = mockLanguages.find(l => l.name === initialLanguageFilter)
      if (language) {
        setSelectedLanguage(language.code)
      }
    }
    if (initialTranslatorFilter) {
      setSelectedTranslator(initialTranslatorFilter)
    }
  }, [initialDramaFilter, initialLanguageFilter, initialTranslatorFilter])

  // 准备筛选器选项
  const dramaOptions = useMemo(
    () => [
      { value: "all", label: "全部短剧" },
      ...mockDramas.map((d) => ({
        value: d.id,
        label: d.title,
        subtitle: `${d.episodes}集`,
      })),
    ],
    []
  )

  const languageOptions = useMemo(
    () => [
      { value: "all", label: "全部语种" },
      ...mockLanguages.map((l) => ({ value: l.code, label: l.name })),
    ],
    []
  )

  // 从数据中提取所有译员和质检人员
  const allPersonnel = useMemo(() => {
    const personnel = new Set<string>()
    allTaskList.forEach(task => {
      if (task.translator && task.translator !== "系统") {
        personnel.add(task.translator)
      }
      if (task.qaPersonnel) {
        // 支持数组格式的质检人员
        if (Array.isArray(task.qaPersonnel)) {
          task.qaPersonnel.forEach(qa => personnel.add(qa))
        } else {
          personnel.add(task.qaPersonnel)
        }
      }
    })
    return Array.from(personnel).sort()
  }, [])

  const translatorOptions = useMemo(
    () => [
      { value: "all", label: "全部译员/质检" },
      ...allPersonnel.map((name) => ({ value: name, label: name })),
    ],
    [allPersonnel]
  )

  const stageOptions = [
    { value: "all", label: "全部环节" },
    { value: "AI翻译", label: "AI翻译" },
    { value: "人工翻译", label: "人工翻译" },
    { value: "审核质检", label: "审核质检" },
    { value: "成片压制", label: "成片压制" },
  ]

  // 筛选任务列表
  const filteredTaskList = useMemo(() => {
    console.log('=== 开始筛选 ===')
    console.log('筛选器状态:', { 
      selectedDrama, 
      selectedLanguage, 
      selectedStage, 
      selectedTranslator 
    })
    
    const filtered = allTaskList.filter((task) => {
      // Filter by stage - strictly match the selected stage (最优先检查)
      if (selectedStage && selectedStage !== "all") {
        const stageMatch = task.stage === selectedStage
        if (!stageMatch) {
          console.log(`❌ 环节不匹配: 任务环节="${task.stage}", 选择环节="${selectedStage}"`)
          return false
        }
      }
      
      // Filter by drama
      if (selectedDrama && selectedDrama !== "all") {
        const matchById = task.dramaId === selectedDrama
        const matchByName = task.drama === selectedDrama
        if (!matchById && !matchByName) return false
      }
      
      // Filter by language
      if (selectedLanguage && selectedLanguage !== "all") {
        const matchByCode = task.languageCode === selectedLanguage
        const matchByName = task.language === selectedLanguage
        if (!matchByCode && !matchByName) return false
      }
      
      // Filter by translator - exclude system tasks when a translator is selected
      if (selectedTranslator && selectedTranslator !== "all") {
        // 匹配译员或质检人员，但排除系统任务
        const matchTranslator = task.translator === selectedTranslator
        // 支持数组格式的质检人员
        const matchQA = Array.isArray(task.qaPersonnel) 
          ? task.qaPersonnel.includes(selectedTranslator)
          : task.qaPersonnel === selectedTranslator
        // 如果选择了译员，必须匹配且不能是系统任务
        if (!matchTranslator && !matchQA) {
          return false
        }
        // 额外检查：如果是系统任务，直接排除
        if (task.translator === "系统" && !matchQA) {
          return false
        }
      }
      
      return true
    })
    
    // 详细调试输出
    console.log('筛选前任务数:', allTaskList.length)
    console.log('筛选后任务数:', filtered.length)
    
    if (selectedStage && selectedStage !== "all") {
      const aiTasks = filtered.filter(t => t.stage === "AI翻译")
      console.log(`⚠️ 筛选后AI翻译任务数: ${aiTasks.length}`)
      if (aiTasks.length > 0) {
        console.log('AI翻译任务详情:', aiTasks.map(t => ({
          drama: t.drama,
          language: t.language,
          stage: t.stage,
          translator: t.translator
        })))
      }
    }
    
    // 显示筛选后的环节分布
    const stageDistribution = filtered.reduce((acc, task) => {
      acc[task.stage] = (acc[task.stage] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    console.log('筛选后环节分布:', stageDistribution)
    console.log('=== 筛选结束 ===')
    
    return filtered
  }, [selectedDrama, selectedLanguage, selectedTranslator, selectedStage])

  // 排序数据
  const sortedTaskList = useMemo(() => {
    if (!sortField) return filteredTaskList

    return [...filteredTaskList].sort((a, b) => {
      let aValue: any = a[sortField as keyof typeof a]
      let bValue: any = b[sortField as keyof typeof b]

      // 处理null值
      if (aValue === null) aValue = ""
      if (bValue === null) bValue = ""

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [filteredTaskList, sortField, sortOrder])

  // 分页数据
  const paginatedTaskList = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginated = sortedTaskList.slice(startIndex, endIndex)
    
    console.log('=== 分页数据 ===')
    console.log(`当前页: ${currentPage}, 每页: ${pageSize}`)
    console.log(`分页后任务数: ${paginated.length}`)
    
    // 检查分页后是否有AI翻译任务
    const aiTasksInPage = paginated.filter(t => t.stage === "AI翻译")
    if (aiTasksInPage.length > 0) {
      console.log(`⚠️ 当前页包含 ${aiTasksInPage.length} 个AI翻译任务:`)
      aiTasksInPage.forEach(t => {
        console.log(`  - ${t.drama} (${t.language}) - ${t.stage} - 译员: ${t.translator}`)
      })
    }
    
    return paginated
  }, [sortedTaskList, currentPage, pageSize])

  // 总页数
  const totalPages = Math.ceil(sortedTaskList.length / pageSize)

  // 重置到第一页当筛选条件改变时
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedDrama, selectedLanguage, selectedTranslator, selectedStage])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1" />
    return sortOrder === "asc" ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
  }

  // 生成任务ID：短剧ID-语种缩写-环节代码-轮次（仅人工翻译和审核质检显示轮次）
  // 为了确保唯一性，我们在key中包含环节名称
  const getTaskId = (task: (typeof allTaskList)[0], index?: number) => {
    const stageCode = stageCodeMap[task.stage] || "XX"
    // 使用环节名称的首字母来区分AI翻译和人工翻译
    const stagePrefix = task.stage === "AI翻译" ? "AI" : task.stage === "人工翻译" ? "MT" : ""
    
    // 只有人工翻译和审核质检需要显示轮次
    if ((task.stage === "人工翻译" || task.stage === "审核质检") && task.round > 1) {
      return `${task.dramaId}-${task.languageCode}-${stagePrefix}${stageCode}-R${task.round}`
    }
    return `${task.dramaId}-${task.languageCode}-${stagePrefix}${stageCode}`
  }

  // 重置所有筛选器
  const handleResetFilters = () => {
    setSelectedDrama("all")
    setSelectedLanguage("all")
    setSelectedTranslator("all")
    setSelectedStage("all")
  }

  // 处理译员/质检人员点击
  const handleTranslatorClick = (translatorName: string, e: React.MouseEvent) => {
    e.stopPropagation() // 阻止行点击事件
    if (onNavigateToTranslator && translatorName !== "系统") {
      onNavigateToTranslator(translatorName)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">任务列表</CardTitle>
          
          {/* 筛选器 */}
          <div className="flex items-center gap-2 flex-wrap">
            <SearchableSelect
              value={selectedDrama}
              onValueChange={setSelectedDrama}
              options={dramaOptions}
              placeholder="选择短剧"
              searchPlaceholder="搜索短剧..."
              emptyText="未找到匹配的短剧"
              className="w-48 h-8 text-xs"
            />

            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="选择语种" />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <SearchableSelect
              value={selectedTranslator}
              onValueChange={setSelectedTranslator}
              options={translatorOptions}
              placeholder="选择译员/质检"
              searchPlaceholder="搜索译员/质检..."
              emptyText="未找到匹配的译员/质检"
              className="w-36 h-8 text-xs"
            />

            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="选择环节" />
              </SelectTrigger>
              <SelectContent>
                {stageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="h-8 text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              重置
            </Button>
            
            <div className="text-xs text-muted-foreground">
              共 {sortedTaskList.length} 个任务 (筛选后: {filteredTaskList.length} / 总计: {allTaskList.length})
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("dramaId")}
                          className="flex items-center hover:text-foreground"
                        >
                          任务ID
                          {getSortIcon("dramaId")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("drama")}
                          className="flex items-center hover:text-foreground"
                        >
                          短剧名称
                          {getSortIcon("drama")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("language")}
                          className="flex items-center hover:text-foreground"
                        >
                          语种
                          {getSortIcon("language")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("stage")}
                          className="flex items-center hover:text-foreground"
                        >
                          环节
                          {getSortIcon("stage")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("round")}
                          className="flex items-center hover:text-foreground"
                        >
                          轮次
                          {getSortIcon("round")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("progress")}
                          className="flex items-center hover:text-foreground"
                        >
                          进度
                          {getSortIcon("progress")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("translator")}
                          className="flex items-center hover:text-foreground"
                        >
                          译员/质检
                          {getSortIcon("translator")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("startTime")}
                          className="flex items-center hover:text-foreground"
                        >
                          开始时间
                          {getSortIcon("startTime")}
                        </button>
                      </th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                        <button
                          onClick={() => handleSort("endTime")}
                          className="flex items-center hover:text-foreground"
                        >
                          结束时间
                          {getSortIcon("endTime")}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTaskList.map((task) => {
                      const taskId = getTaskId(task)
                      // 判断是否显示轮次（只有人工翻译和审核质检显示轮次）
                      const showRound = task.stage === "人工翻译" || task.stage === "审核质检"
                      return (
                        <tr
                          key={taskId}
                          className={`border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                            selectedTask === taskId ? "bg-blue-50 dark:bg-blue-950/20" : ""
                          }`}
                          onClick={() => setSelectedTask(taskId === selectedTask ? null : taskId)}
                        >
                          <td className="py-3 px-2 font-mono text-xs">{taskId}</td>
                          <td className="py-3 px-2">{task.drama}</td>
                          <td className="py-3 px-2">{task.language}</td>
                          <td className="py-3 px-2">{getStageBadge(task.stage)}</td>
                          <td className="py-3 px-2">
                            {showRound ? (
                              <span className={`text-xs font-medium ${task.round > 1 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                                第{task.round}轮
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-[80px]">
                                <div
                                  className="h-full bg-blue-600 transition-all"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-10">
                                {task.progress}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            {task.stage === "审核质检" ? (
                              // 审核质检环节显示质检人员
                              task.qaPersonnel ? (
                                Array.isArray(task.qaPersonnel) ? (
                                  <span className="text-xs">
                                    {task.qaPersonnel.map((qa, idx) => (
                                      <span key={idx}>
                                        <span 
                                          className="text-primary hover:underline cursor-pointer"
                                          onClick={(e) => handleTranslatorClick(qa, e)}
                                        >
                                          {qa}
                                        </span>
                                        {idx < task.qaPersonnel.length - 1 && "、"}
                                      </span>
                                    ))}
                                  </span>
                                ) : (
                                  <span 
                                    className="text-xs text-primary hover:underline cursor-pointer"
                                    onClick={(e) => handleTranslatorClick(task.qaPersonnel as string, e)}
                                  >
                                    {task.qaPersonnel}
                                  </span>
                                )
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )
                            ) : (
                              // 其他环节显示译员
                              task.translator === "系统" ? (
                                <span className="text-xs text-muted-foreground">-</span>
                              ) : (
                                <span 
                                  className="text-xs text-primary hover:underline cursor-pointer"
                                  onClick={(e) => handleTranslatorClick(task.translator, e)}
                                >
                                  {task.translator}
                                </span>
                              )
                            )}
                          </td>
                          <td className="py-3 px-2 text-xs whitespace-nowrap">{task.startTime}</td>
                          <td className="py-3 px-2 text-xs whitespace-nowrap">
                            {task.endTime ? (
                              <span className="text-green-600">{task.endTime}</span>
                            ) : (
                              <span className="text-muted-foreground">进行中</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* 选中任务的详细信息 */}
              {selectedTask && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">任务详情 - {selectedTask}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedTask(null)
                      }}
                      className="h-6 text-xs"
                    >
                      关闭
                    </Button>
                  </div>
                  {(() => {
                    const task = sortedTaskList.find((t) => getTaskId(t) === selectedTask)
                    if (!task) return null
                    const showRound = task.stage === "人工翻译" || task.stage === "审核质检"
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <div className="text-muted-foreground mb-1">短剧名称</div>
                          <div className="font-medium">{task.drama}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">目标语种</div>
                          <div className="font-medium">{task.language}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">当前环节</div>
                          <div>{getStageBadge(task.stage)}</div>
                        </div>
                        {showRound && (
                          <div>
                            <div className="text-muted-foreground mb-1">轮次</div>
                            <div className={`font-medium ${task.round > 1 ? 'text-orange-600' : ''}`}>
                              第{task.round}轮
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-muted-foreground mb-1">译员/质检</div>
                          <div className="font-medium">
                            {task.stage === "审核质检" ? (
                              // 审核质检环节显示质检人员
                              task.qaPersonnel ? (
                                Array.isArray(task.qaPersonnel) 
                                  ? task.qaPersonnel.join("、") 
                                  : task.qaPersonnel
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )
                            ) : (
                              // 其他环节显示译员
                              task.translator === "系统" ? (
                                <span className="text-muted-foreground">-</span>
                              ) : (
                                task.translator
                              )
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">任务进度</div>
                          <div className="font-medium">{task.progress}%</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-muted-foreground mb-1">开始时间</div>
                          <div className="font-medium">{task.startTime}</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-muted-foreground mb-1">结束时间</div>
                          <div className="font-medium">
                            {task.endTime ? (
                              <span className="text-green-600">{task.endTime}</span>
                            ) : (
                              <span className="text-orange-600">任务进行中</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* 分页控件 */}
              {sortedTaskList.length > 0 && (
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      共 {sortedTaskList.length} 条，每页显示
                    </span>
                    <Select value={pageSize.toString()} onValueChange={(value) => {
                      setPageSize(Number(value))
                      setCurrentPage(1)
                    }}>
                      <SelectTrigger className="w-20 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">条</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="h-8 text-xs"
                    >
                      首页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 text-xs"
                    >
                      上一页
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      第 {currentPage} / {totalPages} 页
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 text-xs"
                    >
                      下一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="h-8 text-xs"
                    >
                      末页
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
  )
}
