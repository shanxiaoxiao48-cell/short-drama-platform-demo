// Analytics filtering utility functions
// Base date: January 28, 2026

/**
 * Check if a date string is within the specified range
 * @param dateStr - Date string in format "YYYY-MM-DD" or "YYYY-MM-DD HH:mm"
 * @param range - Date range: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'
 * @returns boolean indicating if date is in range
 */
export function isDateInRange(dateStr: string | null, range: string): boolean {
  if (!dateStr || range === 'all') return true
  
  const date = new Date(dateStr)
  const today = new Date('2026-01-28')
  
  // Reset time to start of day for accurate comparison
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  
  switch(range) {
    case 'today':
      return date.getTime() === today.getTime()
      
    case 'week':
      // This week (Monday to Sunday)
      const dayOfWeek = today.getDay()
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() + mondayOffset)
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      
      return date >= weekStart && date <= weekEnd
      
    case 'month':
      return date.getMonth() === today.getMonth() && 
             date.getFullYear() === today.getFullYear()
      
    case 'quarter':
      const quarter = Math.floor(today.getMonth() / 3)
      const dateQuarter = Math.floor(date.getMonth() / 3)
      return dateQuarter === quarter && 
             date.getFullYear() === today.getFullYear()
      
    case 'year':
      return date.getFullYear() === today.getFullYear()
      
    default:
      return true
  }
}

/**
 * Filter data by drama (supports both ID and name matching)
 */
export function matchesDrama(item: any, filterDrama?: string): boolean {
  if (!filterDrama || filterDrama === "all") return true
  
  const matchById = item.dramaId === filterDrama
  const matchByName = item.dramaName === filterDrama || item.drama === filterDrama
  
  return matchById || matchByName
}

/**
 * Filter data by language (supports both code and name matching)
 */
export function matchesLanguage(item: any, filterLanguage?: string): boolean {
  if (!filterLanguage || filterLanguage === "all") return true
  
  const matchByCode = item.languageCode === filterLanguage
  const matchByName = item.language === filterLanguage
  
  return matchByCode || matchByName
}

/**
 * Filter data by translator name
 */
export function matchesTranslator(item: any, filterTranslator?: string): boolean {
  if (!filterTranslator || filterTranslator === "all") return true
  
  return item.translator === filterTranslator || item.name === filterTranslator
}

/**
 * Get translator name from ID (for mapping filter values)
 */
export function getTranslatorName(translatorId: string): string {
  const translatorMap: Record<string, string> = {
    "1": "张三",
    "2": "李四",
    "3": "王五",
    "4": "赵六",
    "5": "钱七",
    "6": "孙八",
    "7": "周九",
    "8": "吴十",
  }
  
  return translatorMap[translatorId] || translatorId
}
