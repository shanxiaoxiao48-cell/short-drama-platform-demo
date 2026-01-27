// Mock数据 - 数据仪表盘

import type {
  Drama,
  LanguageVersion,
  Translator,
  Task,
  Cost,
  AdSpend,
  RawAnalyticsData
} from "./analytics-utils"

// 短剧数据
export const mockDramas: Drama[] = [
  {
    id: "1",
    title: "霸道总裁爱上我",
    totalEpisodes: 80,
    status: "翻译中",
    createdAt: "2024-01-01"
  },
  {
    id: "2",
    title: "穿越之王妃驾到",
    totalEpisodes: 100,
    status: "质检中",
    createdAt: "2024-01-05"
  },
  {
    id: "3",
    title: "重生之豪门千金",
    totalEpisodes: 60,
    status: "翻译中",
    createdAt: "2024-01-10"
  },
  {
    id: "4",
    title: "神医毒妃不好惹",
    totalEpisodes: 90,
    status: "物料完成",
    createdAt: "2024-01-15"
  },
  {
    id: "5",
    title: "闪婚后大佬每天都在吃醋",
    totalEpisodes: 70,
    status: "已完成",
    createdAt: "2023-12-20"
  }
]

// 译员数据
export const mockTranslators: Translator[] = [
  {
    id: "1",
    name: "张三",
    languages: ["英语", "西班牙语"],
    qualityRating: "A",
    modificationRate: 12.5,
    selfModificationRate: 8.3,
    specialties: ["古装", "现代"],
    totalMinutes: 4800,
    completedTasks: 45,
    cost: 9600
  },
  {
    id: "2",
    name: "李四",
    languages: ["日语", "韩语"],
    qualityRating: "B",
    modificationRate: 18.2,
    selfModificationRate: 12.1,
    specialties: ["现代", "男频"],
    totalMinutes: 3600,
    completedTasks: 32,
    cost: 7200
  },
  {
    id: "3",
    name: "王五",
    languages: ["英语", "法语"],
    qualityRating: "A+",
    modificationRate: 9.8,
    selfModificationRate: 6.2,
    specialties: ["古装", "女频"],
    totalMinutes: 5200,
    completedTasks: 52,
    cost: 10400
  },
  {
    id: "4",
    name: "赵六",
    languages: ["葡萄牙语", "西班牙语"],
    qualityRating: "A",
    modificationRate: 11.2,
    selfModificationRate: 7.8,
    specialties: ["现代", "女频"],
    totalMinutes: 3800,
    completedTasks: 38,
    cost: 7600
  },
  {
    id: "5",
    name: "钱七",
    languages: ["韩语", "日语"],
    qualityRating: "A+",
    modificationRate: 8.5,
    selfModificationRate: 5.2,
    specialties: ["古装", "男频"],
    totalMinutes: 4200,
    completedTasks: 42,
    cost: 8400
  }
]

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
