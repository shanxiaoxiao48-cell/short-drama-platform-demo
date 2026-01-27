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
  languages: string[]
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

export interface AggregatedData {
  overview: {
    totalProjects: number
    activeTranslators: number
    totalMinutes: number
    totalCost: number
    averageROI: number
    inProgressLanguages: number
  }
  projects: Drama[]
  translators: Translator[]
  languageVersions: LanguageVersion[]
  costs: Cost[]
  adSpends: AdSpend[]
}

export interface OverviewCard {
  title: string
  value: string
  subtitle: string
  icon: any
}

// ==================== 数据聚合函数 ====================

/**
 * 根据筛选条件聚合分析数据
 */
export function aggregateAnalyticsData(
  rawData: RawAnalyticsData,
  filters: FilterConditions
): AggregatedData {
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
  
  // 4. 获取相关的短剧
  const versionDramaIds = new Set(filteredVersions.map(v => v.dramaId))
  const filteredDramas = rawData.dramas.filter(d => versionDramaIds.has(d.id))
  
  // 5. 获取相关的译员
  const versionTranslatorIds = new Set(filteredVersions.map(v => v.translatorId))
  const filteredTranslators = rawData.translators.filter(t => versionTranslatorIds.has(t.id))
  
  // 6. 获取相关的成本数据
  const versionIds = new Set(filteredVersions.map(v => v.id))
  const filteredCosts = rawData.costs.filter(c => versionIds.has(c.languageVersionId))
  
  // 7. 获取相关的投放数据
  const filteredAdSpends = rawData.adSpends.filter(a => versionIds.has(a.languageVersionId))
  
  // 8. 计算概览数据
  const totalMinutes = filteredCosts.reduce((sum, c) => sum + c.totalMinutes, 0)
  const totalCost = filteredCosts.reduce((sum, c) => sum + c.totalCost, 0)
  const totalAdSpend = filteredAdSpends.reduce((sum, a) => sum + a.spend, 0)
  const averageROI = totalCost > 0 ? totalAdSpend / totalCost : 0
  const inProgressLanguages = filteredVersions.filter(v => 
    v.status === "翻译中" || v.status === "质检中"
  ).length
  
  return {
    overview: {
      totalProjects: filteredDramas.length,
      activeTranslators: filteredTranslators.length,
      totalMinutes,
      totalCost,
      averageROI,
      inProgressLanguages
    },
    projects: filteredDramas,
    translators: filteredTranslators,
    languageVersions: filteredVersions,
    costs: filteredCosts,
    adSpends: filteredAdSpends
  }
}

/**
 * 生成概览卡片数据
 */
export function generateOverviewCards(
  aggregatedData: AggregatedData,
  filters: FilterConditions
): OverviewCard[] {
  const { overview } = aggregatedData
  
  // 总体看板模式
  if (filters.dramaId === "all" && filters.language === "all" && filters.translatorId === "all") {
    return [
      {
        title: "进行中短剧",
        value: overview.totalProjects.toString(),
        subtitle: "+3 较上周",
        icon: "Activity"
      },
      {
        title: "活跃译员",
        value: overview.activeTranslators.toString(),
        subtitle: "平均质量评级: A",
        icon: "Users"
      },
      {
        title: "本月翻译时长",
        value: overview.totalMinutes.toLocaleString(),
        subtitle: "分钟 · +12%",
        icon: "Clock"
      },
      {
        title: "本月总成本",
        value: `¥${overview.totalCost.toLocaleString()}`,
        subtitle: `平均 ¥${overview.totalCost > 0 ? (overview.totalCost / overview.totalMinutes).toFixed(2) : 0}/分钟`,
        icon: "DollarSign"
      }
    ]
  }
  
  // 剧维度模式
  if (filters.dramaId !== "all" && filters.language === "all" && filters.translatorId === "all") {
    const languages = [...new Set(aggregatedData.languageVersions.map(v => v.language))]
    const avgProgress = aggregatedData.languageVersions.length > 0
      ? aggregatedData.languageVersions.reduce((sum, v) => sum + v.progress, 0) / aggregatedData.languageVersions.length
      : 0
    
    return [
      {
        title: "进行中语种",
        value: overview.inProgressLanguages.toString(),
        subtitle: languages.slice(0, 3).join("、"),
        icon: "Activity"
      },
      {
        title: "累计翻译时长",
        value: overview.totalMinutes.toLocaleString(),
        subtitle: `分钟 · 进度 ${Math.round(avgProgress)}%`,
        icon: "Clock"
      },
      {
        title: "总成本",
        value: `¥${overview.totalCost.toLocaleString()}`,
        subtitle: `平均 ¥${overview.totalCost > 0 ? (overview.totalCost / overview.totalMinutes).toFixed(2) : 0}/分钟`,
        icon: "DollarSign"
      },
      {
        title: "平均ROI",
        value: `${overview.averageROI.toFixed(1)}x`,
        subtitle: `投放消耗 ¥${aggregatedData.adSpends.reduce((sum, a) => sum + a.spend, 0).toLocaleString()}`,
        icon: "Activity"
      }
    ]
  }
  
  // 译员维度模式
  if (filters.dramaId === "all" && filters.language === "all" && filters.translatorId !== "all") {
    const translator = aggregatedData.translators[0]
    const participatedDramas = new Set(aggregatedData.languageVersions.map(v => v.dramaId)).size
    
    return [
      {
        title: "参与短剧",
        value: participatedDramas.toString(),
        subtitle: "部",
        icon: "Activity"
      },
      {
        title: "累计翻译时长",
        value: overview.totalMinutes.toLocaleString(),
        subtitle: "分钟",
        icon: "Clock"
      },
      {
        title: "总成本",
        value: `¥${overview.totalCost.toLocaleString()}`,
        subtitle: `平均 ¥${overview.totalCost > 0 ? (overview.totalCost / overview.totalMinutes).toFixed(2) : 0}/分钟`,
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
  
  // 语种维度模式
  if (filters.dramaId === "all" && filters.language !== "all" && filters.translatorId === "all") {
    return [
      {
        title: "项目数",
        value: overview.totalProjects.toString(),
        subtitle: "个项目",
        icon: "Activity"
      },
      {
        title: "参与译员",
        value: overview.activeTranslators.toString(),
        subtitle: "人",
        icon: "Users"
      },
      {
        title: "累计翻译时长",
        value: overview.totalMinutes.toLocaleString(),
        subtitle: "分钟",
        icon: "Clock"
      },
      {
        title: "总成本",
        value: `¥${overview.totalCost.toLocaleString()}`,
        subtitle: `平均 ¥${overview.totalCost > 0 ? (overview.totalCost / overview.totalMinutes).toFixed(2) : 0}/分钟`,
        icon: "DollarSign"
      }
    ]
  }
  
  // 默认返回总体看板
  return [
    {
      title: "进行中短剧",
      value: overview.totalProjects.toString(),
      subtitle: "+3 较上周",
      icon: "Activity"
    },
    {
      title: "活跃译员",
      value: overview.activeTranslators.toString(),
      subtitle: "平均质量评级: A",
      icon: "Users"
    },
    {
      title: "本月翻译时长",
      value: overview.totalMinutes.toLocaleString(),
      subtitle: "分钟 · +12%",
      icon: "Clock"
    },
    {
      title: "本月总成本",
      value: `¥${overview.totalCost.toLocaleString()}`,
      subtitle: `平均 ¥${overview.totalCost > 0 ? (overview.totalCost / overview.totalMinutes).toFixed(2) : 0}/分钟`,
      icon: "DollarSign"
    }
  ]
}

/**
 * 更新筛选器可用选项
 */
export function updateFilterOptions(
  rawData: RawAnalyticsData,
  selectedDramaId: string
): {
  availableLanguages: Array<{ code: string; name: string }>
  availableTranslators: Translator[]
} {
  if (selectedDramaId === "all") {
    // 返回所有可用选项
    const allLanguages = [...new Set(rawData.languageVersions.map(v => ({
      code: v.languageCode,
      name: v.language
    })))]
    
    // 去重语种
    const uniqueLanguages = Array.from(
      new Map(allLanguages.map(l => [l.code, l])).values()
    )
    
    return {
      availableLanguages: uniqueLanguages,
      availableTranslators: rawData.translators
    }
  }
  
  // 筛选该剧的语种版本
  const dramaVersions = rawData.languageVersions.filter(v => v.dramaId === selectedDramaId)
  
  // 获取该剧的语种
  const dramaLanguages = [...new Set(dramaVersions.map(v => ({
    code: v.languageCode,
    name: v.language
  })))]
  
  // 去重语种
  const uniqueLanguages = Array.from(
    new Map(dramaLanguages.map(l => [l.code, l])).values()
  )
  
  // 获取该剧的译员
  const dramaTranslatorIds = new Set(dramaVersions.map(v => v.translatorId))
  const dramaTranslators = rawData.translators.filter(t => dramaTranslatorIds.has(t.id))
  
  return {
    availableLanguages: uniqueLanguages,
    availableTranslators: dramaTranslators
  }
}

/**
 * 搜索短剧（支持模糊搜索）
 */
export function searchDramas(dramas: Drama[], keyword: string): Drama[] {
  if (!keyword || keyword.trim() === "") {
    return dramas
  }
  
  const lowerKeyword = keyword.toLowerCase().trim()
  return dramas.filter(drama => 
    drama.title.toLowerCase().includes(lowerKeyword)
  )
}
