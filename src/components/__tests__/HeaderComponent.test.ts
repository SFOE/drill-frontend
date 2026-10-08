import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import HeaderComponent from '@/components/HeaderComponent.vue'
import de from '@/locales/de.json'

vi.mock('@/i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/i18n')>()
  return {
    ...actual,
    setLocale: vi.fn().mockResolvedValue(undefined),
  }
})

const i18n = createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'de',
  fallbackWarn: false,
  missingWarn: false,
  messages: { de },
})

const mountComponent = () =>
  mount(HeaderComponent, {
    global: { plugins: [createPinia(), i18n] },
  })

describe('HeaderComponent', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('renders the header title as an h1', () => {
    const wrapper = mountComponent()
    const h1 = wrapper.find('h1.title')
    expect(h1.exists()).toBe(true)
    expect(h1.text()).toBe(de.header_title)
  })

  it('renders the Swiss logo with alt text and dimensions', () => {
    const wrapper = mountComponent()
    const logo = wrapper.find('img.logo')
    expect(logo.exists()).toBe(true)
    expect(logo.attributes('alt')).toBe('Swiss Logo')
    expect(logo.attributes('width')).toBe('200')
  })

  it('embeds the language switcher', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('select#language-select').exists()).toBe(true)
  })
})
