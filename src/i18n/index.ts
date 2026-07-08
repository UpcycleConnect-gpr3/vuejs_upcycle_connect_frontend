import { createI18n } from 'vue-i18n'

const files = import.meta.glob('./locales/*.json', { eager: true }) as Record<
  string,
  { default: Record<string, unknown> }
>

const messages: Record<string, Record<string, unknown>> = {}
for (const path in files) {
  const code = path.match(/\/([a-zA-Z-]+)\.json$/)?.[1]
  const mod = files[path]
  if (code && mod) messages[code] = mod.default
}

export const AVAILABLE_LOCALES = Object.keys(messages)

export const localeName = (code: string): string =>
  (messages[code]?._name as string) || code.toUpperCase()

const stored = localStorage.getItem('locale')
const browser = navigator.language?.split('-')[0]
const initial: string =
  (stored && AVAILABLE_LOCALES.includes(stored) && stored) ||
  (browser && AVAILABLE_LOCALES.includes(browser) && browser) ||
  'fr'

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: initial,
  fallbackLocale: 'fr',
  messages: messages as Record<string, Record<string, string>>,
})

if (typeof document !== 'undefined') document.documentElement.lang = initial

export function setLocale(code: string): void {
  ;(i18n.global.locale as unknown as { value: string }).value = code
  localStorage.setItem('locale', code)
  document.documentElement.lang = code
}
