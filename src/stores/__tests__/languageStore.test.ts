import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { useLanguageStore } from '@/stores/languageStore'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// We need vue-i18n to be active for the store to work
function setupI18n() {
  const i18n = createI18n({
    legacy: false,
    locale: 'de',
    fallbackLocale: 'de',
    messages: { de: {}, en: {}, fr: {}, it: {} },
  })
  // Provide the i18n instance globally so useI18n() works in the store
  return i18n
}

// vue-i18n requires a component context for useI18n, so we mock it
vi.mock('vue-i18n', () => {
  const locale = { value: 'de' }
  return {
    createI18n: vi.fn(() => ({ global: { locale } })),
    useI18n: vi.fn(() => ({ locale })),
  }
})

describe('languageStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('initializes with default locale "de"', () => {
    const store = useLanguageStore()
    expect(store.currentLocale).toBe('de')
  })

  it('persists locale to localStorage when changed', async () => {
    const store = useLanguageStore()
    store.currentLocale = 'fr'

    // Wait for the watcher to fire
    await new Promise((r) => setTimeout(r, 0))

    expect(localStorageMock.setItem).toHaveBeenCalledWith('app-locale', 'fr')
  })

  it('reads saved locale from localStorage on creation', () => {
    localStorageMock.getItem.mockReturnValueOnce('it')

    const store = useLanguageStore()
    expect(store.currentLocale).toBe('it')
  })
})
