/**
 * 字幕碰撞检测工具函数
 * 用于检测和处理字幕时间重叠问题
 */

export interface TimeRange {
  startTime: number
  endTime: number
}

export interface SubtitleWithTime {
  id: string
  startTime: number
  endTime: number
}

/**
 * 检测两个时间段是否重叠
 * @param range1 第一个时间段
 * @param range2 第二个时间段
 * @returns 是否重叠
 */
export function hasTimeOverlap(range1: TimeRange, range2: TimeRange): boolean {
  return range1.startTime < range2.endTime && range2.startTime < range1.endTime
}

/**
 * 找到可用的时间段（避免与现有字幕碰撞）
 * @param desiredStart 期望的开始时间
 * @param duration 字幕时长
 * @param existingSubtitles 现有字幕列表
 * @param maxDuration 视频最大时长
 * @returns 可用的时间段，如果找不到则返回null
 */
export function findAvailableTimeSlot(
  desiredStart: number,
  duration: number,
  existingSubtitles: SubtitleWithTime[],
  maxDuration: number
): TimeRange | null {
  const desiredEnd = desiredStart + duration
  
  // 检查期望位置是否可用
  const hasCollision = existingSubtitles.some(sub =>
    hasTimeOverlap({ startTime: desiredStart, endTime: desiredEnd }, sub)
  )
  
  if (!hasCollision && desiredEnd <= maxDuration) {
    return { startTime: desiredStart, endTime: desiredEnd }
  }
  
  // 如果期望位置不可用，尝试找到最近的可用位置
  // 按开始时间排序
  const sortedSubtitles = [...existingSubtitles].sort((a, b) => a.startTime - b.startTime)
  
  // 尝试在字幕之间的间隙中找到位置
  for (let i = 0; i < sortedSubtitles.length; i++) {
    const current = sortedSubtitles[i]
    const next = sortedSubtitles[i + 1]
    
    // 检查当前字幕之后是否有足够的空间
    if (next) {
      const gapStart = current.endTime
      const gapEnd = next.startTime
      const gapDuration = gapEnd - gapStart
      
      if (gapDuration >= duration) {
        // 找到足够的间隙
        return { startTime: gapStart, endTime: gapStart + duration }
      }
    } else {
      // 最后一个字幕之后
      const availableStart = current.endTime
      const availableEnd = availableStart + duration
      
      if (availableEnd <= maxDuration) {
        return { startTime: availableStart, endTime: availableEnd }
      }
    }
  }
  
  // 如果没有字幕，从0开始
  if (sortedSubtitles.length === 0) {
    const end = Math.min(duration, maxDuration)
    return { startTime: 0, endTime: end }
  }
  
  // 尝试在第一个字幕之前
  const firstSubtitle = sortedSubtitles[0]
  if (firstSubtitle.startTime >= duration) {
    return { startTime: 0, endTime: duration }
  }
  
  // 找不到可用位置
  return null
}

/**
 * 检测拖动时的碰撞
 * @param draggedId 被拖动的字幕ID
 * @param newStartTime 新的开始时间
 * @param newEndTime 新的结束时间
 * @param allSubtitles 所有字幕列表
 * @returns 是否有碰撞
 */
export function checkDragCollision(
  draggedId: string,
  newStartTime: number,
  newEndTime: number,
  allSubtitles: SubtitleWithTime[]
): boolean {
  // 排除自己，检查与其他字幕的碰撞
  const otherSubtitles = allSubtitles.filter(sub => sub.id !== draggedId)
  
  return otherSubtitles.some(sub =>
    hasTimeOverlap({ startTime: newStartTime, endTime: newEndTime }, sub)
  )
}

/**
 * 自动调整位置以避免碰撞
 * @param desiredRange 期望的时间范围
 * @param existingSubtitles 现有字幕列表
 * @returns 调整后的时间范围
 */
export function adjustPositionToAvoidCollision(
  desiredRange: TimeRange,
  existingSubtitles: SubtitleWithTime[]
): TimeRange {
  const duration = desiredRange.endTime - desiredRange.startTime
  
  // 检查是否有碰撞
  const hasCollision = existingSubtitles.some(sub =>
    hasTimeOverlap(desiredRange, sub)
  )
  
  if (!hasCollision) {
    return desiredRange
  }
  
  // 找到与期望位置重叠的所有字幕
  const overlappingSubtitles = existingSubtitles.filter(sub =>
    hasTimeOverlap(desiredRange, sub)
  )
  
  // 找到最晚结束的重叠字幕
  const latestEnd = Math.max(...overlappingSubtitles.map(sub => sub.endTime))
  
  // 将新字幕放在最晚结束的字幕之后
  return {
    startTime: latestEnd,
    endTime: latestEnd + duration
  }
}
