/**
 * 上传功能相关的工具函数
 */

/**
 * 解析集数范围字符串，返回集数数组
 * 支持的格式：
 * - 单个集数: "1" → [1]
 * - 范围: "1-10" → [1,2,3,4,5,6,7,8,9,10]
 * - 组合: "1-3,5,7-9" → [1,2,3,5,7,8,9]
 * 
 * @param range 集数范围字符串
 * @returns 集数数组，按升序排列
 * @throws Error 如果格式无效
 */
export function parseEpisodeRange(range: string): number[] {
  if (!range || !range.trim()) {
    throw new Error("集数范围不能为空")
  }

  const episodes: number[] = []
  const parts = range.split(',').map(p => p.trim())

  for (const part of parts) {
    if (!part) continue

    if (part.includes('-')) {
      // 处理范围格式 "1-10"
      const rangeParts = part.split('-').map(p => p.trim())
      if (rangeParts.length !== 2) {
        throw new Error(`无效的范围格式: ${part}`)
      }

      const start = parseInt(rangeParts[0])
      const end = parseInt(rangeParts[1])

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`无效的数字: ${part}`)
      }

      if (start < 1 || end < 1) {
        throw new Error(`集数必须大于0: ${part}`)
      }

      if (start > end) {
        throw new Error(`起始集数不能大于结束集数: ${part}`)
      }

      for (let i = start; i <= end; i++) {
        if (!episodes.includes(i)) {
          episodes.push(i)
        }
      }
    } else {
      // 处理单个集数 "1"
      const episode = parseInt(part)
      if (isNaN(episode)) {
        throw new Error(`无效的集数: ${part}`)
      }

      if (episode < 1) {
        throw new Error(`集数必须大于0: ${part}`)
      }

      if (!episodes.includes(episode)) {
        episodes.push(episode)
      }
    }
  }

  if (episodes.length === 0) {
    throw new Error("未找到有效的集数")
  }

  // 按升序排列
  return episodes.sort((a, b) => a - b)
}

/**
 * 验证集数范围格式是否有效
 * 
 * @param range 集数范围字符串
 * @returns 是否有效
 */
export function isValidEpisodeRange(range: string): boolean {
  try {
    parseEpisodeRange(range)
    return true
  } catch {
    return false
  }
}

/**
 * 格式化文件大小为可读格式
 * 
 * @param bytes 文件大小（字节）
 * @returns 格式化后的字符串，如 "1.5 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"

  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * 文件类型映射表 - 扩展名
 */
export const FILE_TYPE_ACCEPT: Record<string, string[]> = {
  "视频": [".mp4", ".mov", ".avi", ".mkv", ".flv", ".wmv", ".webm"],
  "字幕": [".srt", ".ass", ".vtt", ".sub", ".ssa"],
  "画面字": [".txt", ".xlsx", ".csv", ".json", ".xls"],
  "术语表": [".xlsx", ".csv", ".json", ".xls"]
}

/**
 * 文件类型映射表 - MIME类型
 */
export const FILE_TYPE_MIME: Record<string, string[]> = {
  "视频": ["video/*"],
  "字幕": ["text/*", "application/x-subrip"],
  "画面字": [
    "text/*",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/json"
  ],
  "术语表": [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/json"
  ]
}

/**
 * 验证文件类型和大小
 * 
 * @param file 要验证的文件
 * @param uploadType 上传类型
 * @returns 错误信息，如果验证通过则返回 null
 */
export function validateFile(file: File, uploadType: string): string | null {
  // 检查文件类型
  const acceptedTypes = FILE_TYPE_ACCEPT[uploadType]
  if (!acceptedTypes) {
    return `不支持的上传类型: ${uploadType}`
  }

  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!acceptedTypes.includes(fileExt)) {
    return `不支持的文件类型: ${fileExt}。请上传 ${acceptedTypes.join(', ')} 格式的文件`
  }

  // 检查文件大小
  // 视频文件最大 2GB，其他文件最大 100MB
  const maxSize = uploadType === "视频" ? 2 * 1024 * 1024 * 1024 : 100 * 1024 * 1024
  if (file.size > maxSize) {
    return `文件过大: ${formatFileSize(file.size)}。最大允许 ${formatFileSize(maxSize)}`
  }

  // 检查文件是否为空
  if (file.size === 0) {
    return "文件不能为空"
  }

  return null
}

/**
 * 批量验证文件
 * 
 * @param files 要验证的文件列表
 * @param uploadType 上传类型
 * @returns 验证结果数组，每个元素对应一个文件的错误信息（null表示通过）
 */
export function validateFiles(files: File[], uploadType: string): Array<string | null> {
  return files.map(file => validateFile(file, uploadType))
}

/**
 * 获取文件的accept属性值（用于input元素）
 * 
 * @param uploadType 上传类型
 * @returns accept属性值
 */
export function getFileAccept(uploadType: string): string {
  const extensions = FILE_TYPE_ACCEPT[uploadType] || []
  return extensions.join(',')
}

/**
 * 解析文件名信息
 * 
 * 视频/字幕格式：短剧名称-语言-数字.扩展名
 * 例如：犬父定乾坤-简体中文-1.mp4
 * 
 * 画面字/术语表格式：短剧名称-类型-语言.扩展名
 * 例如：离婚后前夫全家跪求我原谅-画面字术语表-简体中文.xlsx
 * 
 * @param fileName 文件名
 * @param uploadType 上传类型
 * @returns 解析结果 { dramaName, language, episode?, type? }
 */
export interface ParsedFileName {
  dramaName: string
  language: string
  episode?: number
  type?: string
  isValid: boolean
  error?: string
}

export function parseFileName(fileName: string, uploadType: string): ParsedFileName {
  // 移除扩展名
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName
  
  // 按 "-" 分割
  const parts = nameWithoutExt.split('-').map(p => p.trim())
  
  if (uploadType === "视频" || uploadType === "字幕") {
    // 格式：短剧名称-语言-数字
    if (parts.length < 3) {
      return {
        dramaName: "",
        language: "",
        isValid: false,
        error: `文件名格式错误，应为：短剧名称-语言-数字.扩展名`
      }
    }
    
    const episode = parseInt(parts[parts.length - 1])
    if (isNaN(episode) || episode < 1) {
      return {
        dramaName: "",
        language: "",
        isValid: false,
        error: `集数必须是大于0的数字`
      }
    }
    
    const language = parts[parts.length - 2]
    const dramaName = parts.slice(0, -2).join('-')
    
    return {
      dramaName,
      language,
      episode,
      isValid: true
    }
  } else {
    // 画面字或术语表格式：短剧名称-类型-语言-数字
    if (parts.length < 4) {
      return {
        dramaName: "",
        language: "",
        isValid: false,
        error: `文件名格式错误，应为：短剧名称-${uploadType === "画面字" ? "画面字术语表" : "字幕术语表"}-语言-数字.扩展名`
      }
    }
    
    const episode = parseInt(parts[parts.length - 1])
    if (isNaN(episode) || episode < 1) {
      return {
        dramaName: "",
        language: "",
        isValid: false,
        error: `集数必须是大于0的数字`
      }
    }
    
    const language = parts[parts.length - 2]
    const type = parts[parts.length - 3]
    const dramaName = parts.slice(0, -3).join('-')
    
    // 验证类型
    const expectedType = uploadType === "画面字" ? "画面字术语表" : "字幕术语表"
    if (type !== expectedType) {
      return {
        dramaName: "",
        language: "",
        isValid: false,
        error: `文件名中的类型应为"${expectedType}"，当前为"${type}"`
      }
    }
    
    return {
      dramaName,
      language,
      episode,
      type,
      isValid: true
    }
  }
}

/**
 * 批量解析文件名
 * 
 * @param files 文件列表
 * @param uploadType 上传类型
 * @returns 解析结果数组
 */
export function parseFileNames(files: File[], uploadType: string): ParsedFileName[] {
  return files.map(file => parseFileName(file.name, uploadType))
}
