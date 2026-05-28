import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
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

// Mock vue-i18n
vi.mock('vue-i18n', () => {
  const locale = { value: 'de' }
  return {
    createI18n: vi.fn(() => ({ global: { locale } })),
    useI18n: vi.fn(() => ({ locale })),
  }
})

// Mock @/i18n — setLocale resolves immediately in tests
vi.mock('@/i18n', () => ({
  default: {},
  setLocale: vi.fn(() => Promise.resolve()),
}))

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

    // Wait for the async watcher to fire
    await new Promise((r) => setTimeout(r, 10))

    expect(localStorageMock.setItem).toHaveBeenCalledWith('app-locale', 'fr')
  })

  it('reads saved locale from localStorage on creation', () => {
    localStorageMock.getItem.mockReturnValueOnce('it')

    const store = useLanguageStore()
    expect(store.currentLocale).toBe('it')
  })
})
