/**
 * 翻译相关的工具函数
 */

// 语言代码到名称的映射
export const languageCodeToName: Record<string, string> = {
  "en": "英语",
  "ja": "日语",
  "ko": "韩语",
  "th": "泰语",
  "vi": "越南语",
  "id": "印尼语",
  "ms": "马来语",
  "tl": "菲律宾语",
  "my": "缅甸语",
  "km": "柬埔寨语",
  "lo": "老挝语",
  "es": "西班牙语",
  "pt": "葡萄牙语",
  "fr": "法语",
  "de": "德语",
  "it": "意大利语",
  "ru": "俄语",
  "pl": "波兰语",
  "nl": "荷兰语",
  "tr": "土耳其语",
  "ar": "阿拉伯语",
  "he": "希伯来语",
  "fa": "波斯语",
  "sw": "斯瓦希里语",
  "hi": "印地语",
  "bn": "孟加拉语",
  "ur": "乌尔都语",
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
