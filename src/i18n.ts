import { createI18n } from 'vue-i18n'
import zhCN from '@/locales/zh-CN.json'
import en from '@/locales/en.json'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

function detectDefaultLocale(): string {
  const saved = localStorage.getItem('app_locale')
  if (saved) return saved
  return 'en'
}

const initialLocale = detectDefaultLocale()
dayjs.locale(initialLocale === 'zh-CN' ? 'zh-cn' : 'en')
document.documentElement.setAttribute('lang', initialLocale === 'zh-CN' ? 'zh' : 'en')

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en',
  messages: { 'zh-CN': zhCN, en }
})

export function setLocale(locale: 'zh-CN' | 'en') {
  i18n.global.locale.value = locale
  localStorage.setItem('app_locale', locale)
  dayjs.locale(locale === 'zh-CN' ? 'zh-cn' : 'en')
  document.documentElement.setAttribute('lang', locale === 'zh-CN' ? 'zh' : 'en')
}