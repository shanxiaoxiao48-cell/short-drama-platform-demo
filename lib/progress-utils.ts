/**
 * 进度计算工具函数（增强版）
 * 支持基于集数完成情况的细分进度计算
 */

/**
 * 阶段权重范围接口
 */
interface StageWeightRange {
  start: number  // 阶段起始权重 (0-100)
  end: number    // 阶段结束权重 (0-100)
}

/**
 * 源语言卡片工作流程阶段权重范围
 * 
 * AI提取: 30% (0-30)
 * 视频擦除: 30% (30-60) - 独立进行，不影响其他阶段
 * AI翻译: 30% (60-90)
 * 任务分配: 10% (90-100)
 */
const SOURCE_STAGE_WEIGHTS: Record<string, StageWeightRange> = {
  "待开始": { start: 0, end: 0 },
  
  // AI提取阶段 (0-30)
  "AI提取": { start: 0, end: 30 },
  "AI提取-进行中": { start: 0, end: 30 },
  "AI提取-待确认": { start: 30, end: 30 },
  "AI提取-已完成": { start: 30, end: 30 },
  
  // 视频擦除阶段 (30-60) - 独立阶段，不影响主流程
  "视频擦除": { start: 30, end: 60 },
  "视频擦除-进行中": { start: 30, end: 60 },
  "视频擦除-待确认": { start: 60, end: 60 },
  "视频擦除-已完成": { start: 60, end: 60 },
  
  // AI翻译阶段 (60-90)
  "AI翻译": { start: 60, end: 90 },
  "AI翻译-进行中": { start: 60, end: 90 },
  "AI翻译-待确认": { start: 90, end: 90 },
  "AI翻译-已完成": { start: 90, end: 90 },
  
  // 任务分配阶段 (90-100)
  "任务分配": { start: 100, end: 100 },
  "任务分配-已完成": { start: 100, end: 100 },
  
  "已完成": { start: 100, end: 100 },
}

/**
 * 目标语言卡片工作流程阶段权重范围
 * 
 * 人工翻译: 40% (0-40)
 * 成片质检: 40% (40-80)
 * 视频压制: 20% (80-100)
 */
const TARGET_STAGE_WEIGHTS: Record<string, StageWeightRange> = {
  "待开始": { start: 0, end: 0 },
  
  // 人工翻译阶段 (0-40)
  "人工翻译": { start: 0, end: 40 },
  "翻译待确认": { start: 40, end: 40 },
  
  // 成片质检阶段 (40-80)
  "质检审核": { start: 40, end: 80 },
  "质检待确认": { start: 80, end: 80 },
  "成片质检": { start: 40, end: 80 },
  
  // 视频压制阶段 (80-100)
  "视频压制": { start: 80, end: 100 },
  
  "已完成": { start: 100, end: 100 },
}

/**
 * 旧版权重配置（保持向后兼容）
 * @deprecated 使用新的 SOURCE_STAGE_WEIGHTS 和 TARGET_STAGE_WEIGHTS
 */
const SOURCE_LANGUAGE_WEIGHTS = {
  "待开始": 0,
  "AI提取": 10,
  "AI提取-进行中": 10,
  "AI提取-待确认": 20,
  "AI提取-已完成": 30,
  "视频擦除": 40,
  "视频擦除-进行中": 40,
  "视频擦除-待确认": 50,
  "视频擦除-已完成": 60,
  "AI翻译": 70,
  "AI翻译-进行中": 70,
  "AI翻译-待确认": 80,
  "AI翻译-已完成": 90,
  "任务分配": 100,
  "任务分配-已完成": 100,
  "已完成": 100,
}

/**
 * 旧版权重配置（保持向后兼容）
 * @deprecated 使用新的 TARGET_STAGE_WEIGHTS
 */
const TARGET_LANGUAGE_WEIGHTS = {
  "待开始": 0,
  "人工翻译": 0,
  "人工翻译-进行中": 20,
  "人工翻译-已完成": 40,
  "质检审核": 60,
  "质检审核-进行中": 60,
  "质检审核-已完成": 80,
  "成片质检": 60,
  "成片质检-进行中": 60,
  "成片质检-已完成": 80,
  "视频压制": 90,
  "视频压制-进行中": 90,
  "视频压制-已完成": 100,
  "已完成": 100,
}

/**
 * 计算阶段内的进度（核心计算函数）
 * 
 * 使用线性插值在阶段权重范围内计算进度
 * 公式：起始权重 + (权重范围 × 已完成集数 / 总集数)
 * 
 * @param stageWeight 阶段权重范围
 * @param completedEpisodes 已完成集数
 * @param totalEpisodes 总集数
 * @returns 进度百分比 (0-100)
 * 
 * @example
 * // 人工翻译阶段，完成 60/80 集
 * calculateStageProgress({ start: 0, end: 40 }, 60, 80)
 * // 返回: 30 (0 + 40 * 60/80)
 */
function calculateStageProgress(
  stageWeight: StageWeightRange,
  completedEpisodes: number,
  totalEpisodes: number
): number {
  // 防止除零错误
  if (totalEpisodes === 0) {
    return stageWeight.start
  }
  
  // 防止负数和超出范围
  const completed = Math.max(0, Math.min(completedEpisodes, totalEpisodes))
  
  // 计算阶段权重范围
  const weightRange = stageWeight.end - stageWeight.start
  
  // 如果权重范围为 0（如待确认状态），直接返回起始权重
  if (weightRange === 0) {
    return stageWeight.start
  }
  
  // 计算完成比例
  const completionRatio = completed / totalEpisodes
  
  // 线性插值
  const progress = stageWeight.start + (weightRange * completionRatio)
  
  // 四舍五入到整数
  return Math.round(progress)
}

/**
 * 计算源语言卡片的进度
 * @param currentStage 当前阶段
 * @returns 进度百分比 (0-100)
 * @deprecated 使用 calculateSourceLanguageProgressEnhanced 以支持集数细分
 */
export function calculateSourceLanguageProgress(currentStage: string): number {
  return SOURCE_LANGUAGE_WEIGHTS[currentStage as keyof typeof SOURCE_LANGUAGE_WEIGHTS] || 0
}

/**
 * 计算源语言卡片的进度（增强版）
 * 
 * 支持基于集数完成情况的细分进度计算
 * 如果不提供集数参数，则使用阶段起始权重（向后兼容）
 * 
 * @param currentStage 当前阶段
 * @param completedEpisodes 已完成集数（可选）
 * @param totalEpisodes 总集数（可选）
 * @returns 进度百分比 (0-100)
 * 
 * @example
 * // 旧的调用方式（向后兼容）
 * calculateSourceLanguageProgressEnhanced("AI翻译-进行中")
 * // 返回: 60 (阶段起始权重)
 * 
 * @example
 * // 新的调用方式（细分进度）
 * calculateSourceLanguageProgressEnhanced("AI翻译-进行中", 50, 80)
 * // 返回: 79 (60 + 30 * 50/80)
 */
export function calculateSourceLanguageProgressEnhanced(
  currentStage: string,
  completedEpisodes?: number,
  totalEpisodes?: number
): number {
  const stageWeight = SOURCE_STAGE_WEIGHTS[currentStage]
  
  // 如果没有权重配置，返回 0
  if (!stageWeight) {
    return 0
  }
  
  // 如果没有提供集数信息，使用起始权重（向后兼容）
  if (completedEpisodes === undefined || totalEpisodes === undefined) {
    return stageWeight.start
  }
  
  // 使用细分计算
  return calculateStageProgress(stageWeight, completedEpisodes, totalEpisodes)
}

/**
 * 计算多语言卡片的进度
 * @param currentStage 当前阶段
 * @returns 进度百分比 (0-100)
 * @deprecated 使用 calculateTargetLanguageProgressEnhanced 以支持集数细分
 */
export function calculateTargetLanguageProgress(currentStage: string): number {
  return TARGET_LANGUAGE_WEIGHTS[currentStage as keyof typeof TARGET_LANGUAGE_WEIGHTS] || 0
}

/**
 * 计算目标语言卡片的进度（增强版）
 * 
 * 支持基于集数完成情况的细分进度计算
 * 如果不提供集数参数，则使用阶段起始权重（向后兼容）
 * 
 * @param currentStage 当前阶段
 * @param completedEpisodes 已完成集数（可选）
 * @param totalEpisodes 总集数（可选）
 * @returns 进度百分比 (0-100)
 * 
 * @example
 * // 旧的调用方式（向后兼容）
 * calculateTargetLanguageProgressEnhanced("人工翻译")
 * // 返回: 0 (阶段起始权重)
 * 
 * @example
 * // 新的调用方式（细分进度）
 * calculateTargetLanguageProgressEnhanced("人工翻译", 60, 80)
 * // 返回: 30 (0 + 40 * 60/80)
 */
export function calculateTargetLanguageProgressEnhanced(
  currentStage: string,
  completedEpisodes?: number,
  totalEpisodes?: number
): number {
  const stageWeight = TARGET_STAGE_WEIGHTS[currentStage]
  
  // 如果没有权重配置，返回 0
  if (!stageWeight) {
    return 0
  }
  
  // 如果没有提供集数信息，使用起始权重（向后兼容）
  if (completedEpisodes === undefined || totalEpisodes === undefined) {
    return stageWeight.start
  }
  
  // 使用细分计算
  return calculateStageProgress(stageWeight, completedEpisodes, totalEpisodes)
}

/**
 * 判断是否为源语言卡片
 * @param targetLanguage 目标语言
 * @returns 是否为源语言
 */
export function isSourceLanguage(targetLanguage: string): boolean {
  return targetLanguage.includes("源语言")
}

/**
 * 计算单个语言卡片的进度
 * @param targetLanguage 目标语言
 * @param currentStage 当前阶段
 * @returns 进度百分比 (0-100)
 * @deprecated 使用 calculateCardProgressEnhanced 以支持集数细分
 */
export function calculateCardProgress(targetLanguage: string, currentStage: string): number {
  if (isSourceLanguage(targetLanguage)) {
    return calculateSourceLanguageProgress(currentStage)
  } else {
    return calculateTargetLanguageProgress(currentStage)
  }
}

/**
 * 计算单个语言卡片的进度（增强版）
 * 
 * 根据语言类型自动选择对应的计算函数
 * 支持基于集数完成情况的细分进度计算
 * 
 * @param targetLanguage 目标语言
 * @param currentStage 当前阶段
 * @param completedEpisodes 已完成集数（可选）
 * @param totalEpisodes 总集数（可选）
 * @returns 进度百分比 (0-100)
 * 
 * @example
 * // 旧的调用方式（向后兼容）
 * calculateCardProgressEnhanced("英语", "人工翻译")
 * // 返回: 0
 * 
 * @example
 * // 新的调用方式（细分进度）
 * calculateCardProgressEnhanced("英语", "人工翻译", 60, 80)
 * // 返回: 30
 */
export function calculateCardProgressEnhanced(
  targetLanguage: string,
  currentStage: string,
  completedEpisodes?: number,
  totalEpisodes?: number
): number {
  if (isSourceLanguage(targetLanguage)) {
    return calculateSourceLanguageProgressEnhanced(
      currentStage,
      completedEpisodes,
      totalEpisodes
    )
  } else {
    return calculateTargetLanguageProgressEnhanced(
      currentStage,
      completedEpisodes,
      totalEpisodes
    )
  }
}

/**
 * 计算整体项目进度
 * 
 * 计算逻辑：
 * 1. 源语言卡片的进度权重为 1
 * 2. 每个多语言卡片的进度权重为 1
 * 3. 总进度 = (源语言进度 + 所有多语言进度之和) / 总卡片数
 * 
 * @param variants 所有语言变体
 * @returns 整体进度百分比 (0-100)
 */
export function calculateOverallProgress(variants: Array<{
  targetLanguage: string
  currentStage: string
}>): number {
  if (variants.length === 0) return 0
  
  // 计算每个卡片的进度
  const progressSum = variants.reduce((sum, variant) => {
    const progress = calculateCardProgress(variant.targetLanguage, variant.currentStage)
    return sum + progress
  }, 0)
  
  // 平均进度
  return Math.round(progressSum / variants.length)
}

/**
 * 获取总集数（所有语言变体的集数之和）
 * @param variants 所有语言变体
 * @returns 总集数
 */
export function getTotalEpisodes(variants: Array<{
  totalEpisodes: number
}>): number {
  return variants.reduce((sum, v) => sum + v.totalEpisodes, 0)
}
