/**
 * 翻译相关的工具函数
 */

// 语言代码到名称的映射
export const languageCodeToName: Record<string, string> = {
  "en": "英语",
  "zh-Hans": "简体中文",
  "zh-Hant": "繁体中文",
  "es": "西班牙语",
  "tl": "菲律宾语",
  "ko": "韩语",
  "ja": "日语",
  "id": "印尼语",
  "ar": "阿拉伯语",
  "hi": "印地语",
  "pt": "葡萄牙语",
  "vi": "越南语",
  "de": "德语",
  "fr": "法语",
  "ms": "马来语",
  "ru": "俄语",
  "it": "意大利语",
  "tr": "土耳其语",
  "th": "泰语",
}

// 名称到语言代码的映射（反向映射）
export const languageNameToCode: Record<string, string> = Object.entries(languageCodeToName).reduce(
  (acc, [code, name]) => {
    acc[name] = code
    return acc
  },
  {} as Record<string, string>
)

/**
 * 根据语言代码获取语言名称
 */
export function getLanguageName(code: string): string {
  return languageCodeToName[code] || code
}

/**
 * 根据语言名称获取语言代码
 */
export function getLanguageCode(name: string): string {
  return languageNameToCode[name] || name
}
