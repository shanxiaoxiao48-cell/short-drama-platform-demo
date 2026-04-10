// 数据仪表盘数据聚合工具
// ==================== 类型定义 ====================
export interface Drama {
  id: string
  title: string
  totalEpisodes: number
  status: string
  createdAt: string
}

export interface LanguageVersion {
  id: string
  dramaId: string
  language: string
  languageCode: string
  translatorId: string
  status: string
  progress: number
  startDate: string
  deadline: string
  completedEpisodes: number
}

export interface Translator {
  id: string
  name: string
  role: "translator" | "reviewer"
  rating: number
  languages: string[]
  languageUnitPrices: Record<string, number>
  qualityRating: string
  modificationRate: number
  selfModificationRate: number
  specialties: string[]
  totalMinutes: number
  completedTasks: number
  cost: number
}

export interface Task {
  id: string
  languageVersionId: string
  translatorId: string
  episodeNumber: number
  minutes: number
  cost: number
  completedAt: string
}

export interface Cost {
  id: string
  languageVersionId: string
  translatorId: string
  unitPrice: number
  totalMinutes: number
  totalCost: number
}

export interface AdSpend {
  id: string
  languageVersionId: string
  spend: number
  date: string
}

export interface RawAnalyticsData {
  dramas: Drama[]
  languageVersions: LanguageVersion[]
  translators: Translator[]
  tasks: Task[]
  costs: Cost[]
  adSpends: AdSpend[]
}

export interface FilterConditions {
  dramaId: string      // "all" 或具体短剧ID
  language: string     // "all" 或具体语种代码
  translatorId: string // "all" 或具体译员ID
  period: string       // "week" | "month" | "quarter" | "year"
}

// ==================== 数据聚合函数 ====================
export function aggregateAnalyticsData(
  rawData: RawAnalyticsData,
  filters: FilterConditions
): {
  // 1. 根据短剧筛选语种版本
  let filteredVersions = rawData.languageVersions
  if (filters.dramaId !== "all") {
    filteredVersions = filteredVersions.filter(v => v.dramaId === filters.dramaId)
  }

  // 2. 根据语种筛选
  if (filters.language !== "all") {
    filteredVersions = filteredVersions.filter(v => v.languageCode === filters.language)
  }

  // 3. 根据译员筛选
  if (filters.translatorId !== "all") {
    filteredVersions = filteredVersions.filter(v => v.translatorId === filters.translatorId)
  }

  return {
    overview: {
      totalProjects: filteredVersions.length,
      activeTranslators: [...new Set(filteredVersions.map(v => v.translatorId))].size,
      totalMinutes: rawData.translators.reduce((sum, t) => sum + t.totalMinutes, 0),
      totalCost: rawData.translators.reduce((sum, t) => sum + t.cost, 0),
      averageROI: rawData.translators.reduce((sum, t) => sum + t.cost, 0) > 0 ? rawData.translators.reduce((sum, t) => sum + t.cost, 0) : 0,
      inProgressLanguages: filteredVersions.filter(v =>
        v.status === "翻译中" || v.status === "质检中"
      ).length
    },
    projects: filteredVersions,
    translators: filteredVersions.map(v => v.translatorId),
    languageVersions: filteredVersions,
    costs: rawData.costs.filter(c => versionIds.has(c.languageVersionId)),
    adSpends: rawData.adSpends.filter(a => versionIds.has(a.languageVersionId))
  }
}

export function generateOverviewCards(
  aggregatedData: {
    overview: {
      totalProjects: aggregatedData.overview.totalProjects,
      activeTranslators: aggregatedData.overview.activeTranslators,
      totalMinutes: aggregatedData.overview.totalMinutes,
      totalCost: aggregatedData.overview.totalCost,
      averageROI: aggregatedData.overview.averageROI,
      inProgressLanguages: aggregatedData.overview.inProgressLanguages
    },
    projects: aggregatedData.projects,
    translators: aggregatedData.translators,
    languageVersions: aggregatedData.languageVersions,
    costs: aggregatedData.costs,
    adSpends: aggregatedData.adSpends
  },
  filters: FilterConditions
): OverviewCard[] {
  // 总体看板模式
  if (filters.dramaId === "all" && filters.language === "all" && filters.translatorId === "all") {
    return [
      {
        title: "进行中短剧",
        value: aggregatedData.overview.totalProjects.toString(),
        subtitle: "+3 较上周",
        icon: "Activity"
      },
      {
        title: "活跃译员",
        value: aggregatedData.overview.activeTranslators.toString(),
        subtitle: "平均质量评级: A",
        icon: "Users"
      },
      {
        title: "本月翻译时长",
        value: aggregatedData.overview.totalMinutes.toLocaleString(),
        subtitle: "分钟 · +12%",
        icon: "Clock"
      },
      {
        title: "本月总成本",
        value: `¥${aggregatedData.overview.totalCost.toLocaleString()}`,
        subtitle: `平均 ¥${aggregatedData.overview.totalCost > 0 ? (aggregatedData.overview.totalCost / aggregatedData.overview.totalMinutes).toFixed(2) : 0}/分钟`,
        icon: "DollarSign"
      },
      {
        title: "平均ROI",
        value: `${aggregatedData.overview.averageROI.toFixed(1)}x`,
        subtitle: `投放消耗 ¥${aggregatedData.adSpends.reduce((sum, a) => sum + a.spend, 0).toLocaleString()}`,
        icon: "Activity"
      },
      {
        title: "质量评级",
        value: translator?.qualityRating || "A",
        subtitle: `修改率 ${translator?.modificationRate || 0}%`,
        icon: "Users"
      }
    ]
  }

  // 二维度模式
  if (filters.dramaId === "all" && filters.language === "all" && filters.translatorId === "all") {
    const languages = [...new Set(aggregatedData.languageVersions.map(v => v.language))]
    const avgProgress = aggregatedData.languageVersions.length > 0
      ? aggregatedData.languageVersions.reduce((sum, v) => sum + v.progress, 0) / aggregatedData.languageVersions.length
      : 0

    return [
      {
        title: "项目数",
        value: aggregatedData.overview.totalProjects.toString(),
        subtitle: "个项目",
        icon: "Activity"
      },
      {
        title: "参与译员",
        value: aggregatedData.overview.activeTranslators.toString(),
        subtitle: "人",
        icon: "Users"
      },
      {
        title: "累计翻译时长",
        value: aggregatedData.overview.totalMinutes.toLocaleString(),
        subtitle: "分钟 · 进度 ${Math.round(avgProgress)}%`,
        icon: "Clock"
      },
      {
        title: "总成本",
        value: `¥${aggregatedData.overview.totalCost.toLocaleString()}`,
        subtitle: `平均 ¥${aggregatedData.overview.totalCost > 0 ? (aggregatedData.overview.totalCost / aggregatedData.overview.totalMinutes).toFixed(2) : 0}/分钟`,
        icon: "DollarSign"
      }
    ]
  }

  // 三维度模式
  if (filters.dramaId === "all" && filters.language === "all" && filters.translatorId === "all") {
    const translator = aggregatedData.translators[0]

    return [
      {
        title: "参与短剧",
        value: new Set(aggregatedData.languageVersions.map(v => v.dramaId)).size.toString(),
        subtitle: "部"
      },
      {
        title: "累计翻译时长",
        value: aggregatedData.overview.totalMinutes.toLocaleString(),
        subtitle: "分钟",
        icon: "Clock"
      },
      {
        title: "总成本",
        value: `¥${aggregatedData.overview.totalCost.toLocaleString()}`,
        subtitle: `平均 ¥${aggregatedData.overview.totalCost > 0 ? (aggregatedData.overview.totalCost / aggregatedData.overview.totalMinutes).toFixed(2) : 0}/分钟`,
        icon: "DollarSign"
      },
      {
        title: "质量评级",
        value: translator?.qualityRating || "A",
        subtitle: `修改率 ${translator?.modificationRate || 0}%`,
        icon: "Users"
      }
    ]
  }

export function updateFilterOptions(
  rawData: RawAnalyticsData,
  selectedDramaId: string,
  selectedLanguage: string,
  selectedTranslatorId: string
): {
  const allLanguages = [...new Set(rawData.languageVersions.map(v => ({
    code: v.languageCode,
    name: v.language
  }))]

  const uniqueLanguages = Array.from(allLanguages)

  return {
    availableLanguages: uniqueLanguages,
    availableTranslators: rawData.translators,
    availableDramaIds: rawData.dramas.map(d => d.id)
  }
}

export function searchDramas(dramas: Drama[], keyword: string): Drama[] {
  if (!keyword || keyword.trim() === "") {
    return dramas
  }

  const lowerKeyword = keyword.toLowerCase().trim()
  return dramas.filter(drama =>
    drama.title.toLowerCase().includes(lowerKeyword)
  )
}
