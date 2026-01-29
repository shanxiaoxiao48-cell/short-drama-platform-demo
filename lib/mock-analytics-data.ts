// Mock数据 - 数据仪表盘 - 统一数据源
// 此文件是所有分析页面的唯一数据源，确保数据一致性

import type {
  Drama,
  LanguageVersion,
  Translator,
  Task,
  Cost,
  AdSpend,
  RawAnalyticsData
} from "./analytics-utils"

// ============ 短剧数据 ============
export const mockDramas: Drama[] = [
  {
    id: "1",
    title: "霸道总裁爱上我",
    totalEpisodes: 80,
    status: "翻译中",
    createdAt: "2024-02-01"
  },
  {
    id: "2",
    title: "穿越之王妃驾到",
    totalEpisodes: 100,
    status: "已完成",
    createdAt: "2024-01-15"
  },
  {
    id: "3",
    title: "重生之豪门千金",
    totalEpisodes: 60,
    status: "翻译中",
    createdAt: "2024-02-03"
  },
  {
    id: "4",
    title: "神医毒妃不好惹",
    totalEpisodes: 90,
    status: "质检中",
    createdAt: "2024-01-20"
  },
  {
    id: "5",
    title: "闪婚后大佬马甲藏不住了",
    totalEpisodes: 70,
    status: "已完成",
    createdAt: "2024-01-25"
  },
  {
    id: "6",
    title: "豪门继承人的秘密",
    totalEpisodes: 85,
    status: "翻译中",
    createdAt: "2024-02-05"
  },
  {
    id: "7",
    title: "替嫁新娘的逆袭",
    totalEpisodes: 95,
    status: "质检中",
    createdAt: "2024-01-28"
  },
  {
    id: "8",
    title: "重生之商业帝国",
    totalEpisodes: 75,
    status: "已完成",
    createdAt: "2024-01-10"
  }
]

// ============ 译员数据 ============
// 12位译员：8位翻译 + 4位审校
export const mockTranslators: Translator[] = [
  // 翻译译员
  {
    id: "1",
    name: "王五",
    languages: ["英语", "日语", "韩语"],
    qualityRating: "S",
    modificationRate: 8.5,
    selfModificationRate: 4.2,
    specialties: ["现代剧", "都市剧"],
    totalMinutes: 1800,
    completedTasks: 18,
    cost: 81000
  },
  {
    id: "2",
    name: "张三",
    languages: ["英语", "西班牙语"],
    qualityRating: "A+",
    modificationRate: 10.2,
    selfModificationRate: 5.8,
    specialties: ["古装剧", "武侠剧"],
    totalMinutes: 1500,
    completedTasks: 15,
    cost: 63000
  },
  {
    id: "3",
    name: "钱七",
    languages: ["韩语", "日语"],
    qualityRating: "A+",
    modificationRate: 12.8,
    selfModificationRate: 6.5,
    specialties: ["悬疑剧", "推理剧"],
    totalMinutes: 1200,
    completedTasks: 12,
    cost: 48000
  },
  {
    id: "4",
    name: "李四",
    languages: ["日语", "葡萄牙语"],
    qualityRating: "A",
    modificationRate: 15.3,
    selfModificationRate: 7.2,
    specialties: ["古装剧", "宫廷剧"],
    totalMinutes: 1400,
    completedTasks: 14,
    cost: 53200
  },
  {
    id: "5",
    name: "赵六",
    languages: ["西班牙语", "葡萄牙语"],
    qualityRating: "B",
    modificationRate: 18.5,
    selfModificationRate: 8.9,
    specialties: ["现代剧", "爱情剧"],
    totalMinutes: 1000,
    completedTasks: 10,
    cost: 35000
  },
  {
    id: "6",
    name: "孙八",
    languages: ["葡萄牙语", "西班牙语"],
    qualityRating: "A+",
    modificationRate: 11.5,
    selfModificationRate: 5.5,
    specialties: ["现代剧", "都市剧"],
    totalMinutes: 1300,
    completedTasks: 13,
    cost: 55900
  },
  {
    id: "7",
    name: "周九",
    languages: ["英语"],
    qualityRating: "B",
    modificationRate: 20.2,
    selfModificationRate: 9.5,
    specialties: ["现代剧", "青春剧"],
    totalMinutes: 900,
    completedTasks: 9,
    cost: 28800
  },
  {
    id: "8",
    name: "吴十",
    languages: ["法语", "英语"],
    qualityRating: "A",
    modificationRate: 14.8,
    selfModificationRate: 6.8,
    specialties: ["古装剧", "悬疑剧"],
    totalMinutes: 1100,
    completedTasks: 11,
    cost: 42900
  },
  // 审校译员
  {
    id: "9",
    name: "小王",
    languages: ["英语", "日语", "韩语"],
    qualityRating: "S",
    modificationRate: 7.2,
    selfModificationRate: 0,
    specialties: ["现代剧", "都市剧"],
    totalMinutes: 1000,
    completedTasks: 20,
    cost: 50000
  },
  {
    id: "10",
    name: "小李",
    languages: ["日语", "法语"],
    qualityRating: "A+",
    modificationRate: 9.5,
    selfModificationRate: 0,
    specialties: ["古装剧", "武侠剧"],
    totalMinutes: 850,
    completedTasks: 17,
    cost: 40800
  },
  {
    id: "11",
    name: "小刘",
    languages: ["英语", "西班牙语"],
    qualityRating: "A",
    modificationRate: 11.2,
    selfModificationRate: 0,
    specialties: ["悬疑剧", "推理剧"],
    totalMinutes: 800,
    completedTasks: 16,
    cost: 36800
  },
  {
    id: "12",
    name: "小陈",
    languages: ["韩语", "葡萄牙语"],
    qualityRating: "A+",
    modificationRate: 8.8,
    selfModificationRate: 0,
    specialties: ["现代剧", "爱情剧"],
    totalMinutes: 950,
    completedTasks: 19,
    cost: 46550
  }
]

// ============ 汇总统计数据 ============
// 从译员数据计算得出，确保数据一致性
export const translatorStats = {
  totalTranslators: mockTranslators.length, // 12人
  totalCost: mockTranslators.reduce((sum, t) => sum + t.cost, 0), // ¥581,950
  totalTasks: mockTranslators.reduce((sum, t) => sum + t.completedTasks, 0), // 174个
  totalMinutes: mockTranslators.reduce((sum, t) => sum + t.totalMinutes, 0), // 13,800分钟
  avgModificationRate: mockTranslators.reduce((sum, t) => sum + t.modificationRate, 0) / mockTranslators.length, // 12.5%
  avgSelfModificationRate: mockTranslators.filter(t => t.selfModificationRate > 0).reduce((sum, t) => sum + t.selfModificationRate, 0) / mockTranslators.filter(t => t.selfModificationRate > 0).length, // 6.8%
  highRatingCount: mockTranslators.filter(t => t.qualityRating === "S" || t.qualityRating === "A+").length, // 8人
  highRatingPercentage: Math.round((mockTranslators.filter(t => t.qualityRating === "S" || t.qualityRating === "A+").length / mockTranslators.length) * 100) // 67%
}

// 短剧统计数据
export const dramaStats = {
  totalDramas: mockDramas.length, // 8部
  translatingCount: mockDramas.filter(d => d.status === "翻译中").length, // 3部
  reviewingCount: mockDramas.filter(d => d.status === "质检中").length, // 2部
  completedCount: mockDramas.filter(d => d.status === "已完成").length, // 3部
  inProgressCount: mockDramas.filter(d => d.status === "翻译中" || d.status === "质检中").length, // 5部
  completionRate: Math.round((mockDramas.filter(d => d.status === "已完成").length / mockDramas.length) * 100) // 38%
}

// 语种版本数据
export const mockLanguageVersions: LanguageVersion[] = [
  // 霸道总裁爱上我
  {
    id: "lv1",
    dramaId: "1",
    language: "英语",
    languageCode: "en",
    translatorId: "1",
    status: "翻译中",
    progress: 65,
    startDate: "2024-01-15",
    deadline: "2024-02-15",
    completedEpisodes: 52
  },
  {
    id: "lv2",
    dramaId: "1",
    language: "西班牙语",
    languageCode: "es",
    translatorId: "4",
    status: "翻译中",
    progress: 58,
    startDate: "2024-01-16",
    deadline: "2024-02-16",
    completedEpisodes: 46
  },
  {
    id: "lv3",
    dramaId: "1",
    language: "葡萄牙语",
    languageCode: "pt",
    translatorId: "4",
    status: "物料完成",
    progress: 0,
    startDate: "2024-01-20",
    deadline: "2024-02-20",
    completedEpisodes: 0
  },
  // 穿越之王妃驾到
  {
    id: "lv4",
    dramaId: "2",
    language: "日语",
    languageCode: "ja",
    translatorId: "2",
    status: "质检中",
    progress: 85,
    startDate: "2024-01-10",
    deadline: "2024-02-10",
    completedEpisodes: 85
  },
  {
    id: "lv5",
    dramaId: "2",
    language: "韩语",
    languageCode: "ko",
    translatorId: "5",
    status: "质检中",
    progress: 88,
    startDate: "2024-01-11",
    deadline: "2024-02-11",
    completedEpisodes: 88
  },
  // 重生之豪门千金
  {
    id: "lv6",
    dramaId: "3",
    language: "英语",
    languageCode: "en",
    translatorId: "3",
    status: "翻译中",
    progress: 45,
    startDate: "2024-01-18",
    deadline: "2024-02-18",
    completedEpisodes: 27
  },
  {
    id: "lv7",
    dramaId: "3",
    language: "法语",
    languageCode: "fr",
    translatorId: "3",
    status: "翻译中",
    progress: 40,
    startDate: "2024-01-19",
    deadline: "2024-02-19",
    completedEpisodes: 24
  },
  // 神医毒妃不好惹
  {
    id: "lv8",
    dramaId: "4",
    language: "英语",
    languageCode: "en",
    translatorId: "1",
    status: "物料完成",
    progress: 0,
    startDate: "2024-01-25",
    deadline: "2024-02-25",
    completedEpisodes: 0
  },
  {
    id: "lv9",
    dramaId: "4",
    language: "西班牙语",
    languageCode: "es",
    translatorId: "4",
    status: "物料完成",
    progress: 0,
    startDate: "2024-01-26",
    deadline: "2024-02-26",
    completedEpisodes: 0
  },
  // 闪婚后大佬每天都在吃醋
  {
    id: "lv10",
    dramaId: "5",
    language: "英语",
    languageCode: "en",
    translatorId: "3",
    status: "已完成",
    progress: 100,
    startDate: "2023-12-20",
    deadline: "2024-01-20",
    completedEpisodes: 70
  },
  {
    id: "lv11",
    dramaId: "5",
    language: "日语",
    languageCode: "ja",
    translatorId: "5",
    status: "已完成",
    progress: 100,
    startDate: "2023-12-21",
    deadline: "2024-01-21",
    completedEpisodes: 70
  }
]

// 成本数据
export const mockCosts: Cost[] = [
  { id: "c1", languageVersionId: "lv1", translatorId: "1", unitPrice: 2.0, totalMinutes: 1560, totalCost: 3120 },
  { id: "c2", languageVersionId: "lv2", translatorId: "4", unitPrice: 2.0, totalMinutes: 1380, totalCost: 2760 },
  { id: "c3", languageVersionId: "lv3", translatorId: "4", unitPrice: 2.0, totalMinutes: 0, totalCost: 0 },
  { id: "c4", languageVersionId: "lv4", translatorId: "2", unitPrice: 2.0, totalMinutes: 2550, totalCost: 5100 },
  { id: "c5", languageVersionId: "lv5", translatorId: "5", unitPrice: 2.0, totalMinutes: 2640, totalCost: 5280 },
  { id: "c6", languageVersionId: "lv6", translatorId: "3", unitPrice: 2.0, totalMinutes: 810, totalCost: 1620 },
  { id: "c7", languageVersionId: "lv7", translatorId: "3", unitPrice: 2.0, totalMinutes: 720, totalCost: 1440 },
  { id: "c8", languageVersionId: "lv8", translatorId: "1", unitPrice: 2.0, totalMinutes: 0, totalCost: 0 },
  { id: "c9", languageVersionId: "lv9", translatorId: "4", unitPrice: 2.0, totalMinutes: 0, totalCost: 0 },
  { id: "c10", languageVersionId: "lv10", translatorId: "3", unitPrice: 2.0, totalMinutes: 2100, totalCost: 4200 },
  { id: "c11", languageVersionId: "lv11", translatorId: "5", unitPrice: 2.0, totalMinutes: 2100, totalCost: 4200 }
]

// 投放数据
export const mockAdSpends: AdSpend[] = [
  { id: "a1", languageVersionId: "lv1", spend: 8736, date: "2024-01-27" },
  { id: "a2", languageVersionId: "lv2", spend: 7728, date: "2024-01-27" },
  { id: "a3", languageVersionId: "lv4", spend: 16320, date: "2024-01-27" },
  { id: "a4", languageVersionId: "lv5", spend: 16896, date: "2024-01-27" },
  { id: "a6", languageVersionId: "lv6", spend: 4860, date: "2024-01-27" },
  { id: "a7", languageVersionId: "lv7", spend: 4320, date: "2024-01-27" },
  { id: "a10", languageVersionId: "lv10", spend: 13440, date: "2024-01-20" },
  { id: "a11", languageVersionId: "lv11", spend: 13440, date: "2024-01-20" }
]

// 任务数据（暂时为空，后续可扩展）
export const mockTasks: Task[] = []

// 完整的原始数据
export const mockRawAnalyticsData: RawAnalyticsData = {
  dramas: mockDramas,
  languageVersions: mockLanguageVersions,
  translators: mockTranslators,
  tasks: mockTasks,
  costs: mockCosts,
  adSpends: mockAdSpends
}
