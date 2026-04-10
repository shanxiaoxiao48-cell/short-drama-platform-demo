/**
 * 各语种单价配置（元/分钟）
 */

export const LANGUAGE_PRICES: Record<string, number> = {
  "en": 45.0,           // 英语
  "zh-Hans": 25.0,       // 简体中文
  "zh-Hant": 22.0,       // 繁体中文
  "es": 35.0,            // 西班牙语
  "tl": 20.0,             // 菲律宾语
  "ko": 30.0,             // 韩语
  "ja": 28.0,             // 日语
  "id": 15.0,             // 印尼语
  "ar": 18.0,             // 阿拉伯语
  "hi": 15.0,             // 印地语
  "pt": 25.0,             // 葡萄牙语
  "vi": 18.0,             // 越南语
  "de": 38.0,             // 德语
  "fr": 42.0,             // 法语
  "ms": 16.0,             // 马来语
  "ru": 35.0,             // 俄语
  "it": 40.0,             // 意大利语
  "tr": 20.0,             // 土耳其语
  "th": 12.0,             // 泰语
}

/**
 * 获取语种单价
 */
export function getLanguagePrice(languageCode: string): number {
  return LANGUAGE_PRICES[languageCode] || 25.0 // 默认25元/分钟
}

/**
 * 获取语种名称对应的单价（中文名）
 */
export function getLanguagePriceByName(languageName: string): number {
  const codeToPrice: Record<string, number> = {
    "英语": LANGUAGE_PRICES["en"],
    "简体中文": LANGUAGE_PRICES["zh-Hans"],
    "繁体中文": LANGUAGE_PRICES["zh-Hant"],
    "西班牙语": LANGUAGE_PRICES["es"],
    "菲律宾语": LANGUAGE_PRICES["tl"],
    "韩语": LANGUAGE_PRICES["ko"],
    "日语": LANGUAGE_PRICES["ja"],
    "印尼语": LANGUAGE_PRICES["id"],
    "阿拉伯语": LANGUAGE_PRICES["ar"],
    "印地语": LANGUAGE_PRICES["hi"],
    "葡萄牙语": LANGUAGE_PRICES["pt"],
    "越南语": LANGUAGE_PRICES["vi"],
    "德语": LANGUAGE_PRICES["de"],
    "法语": LANGUAGE_PRICES["fr"],
    "马来语": LANGUAGE_PRICES["ms"],
    "俄语": LANGUAGE_PRICES["ru"],
    "意大利语": LANGUAGE_PRICES["it"],
    "土耳其语": LANGUAGE_PRICES["tr"],
    "泰语": LANGUAGE_PRICES["th"],
  }
  return codeToPrice[languageName] || 25.0
}
