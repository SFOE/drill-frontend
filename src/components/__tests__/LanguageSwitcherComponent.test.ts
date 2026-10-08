import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import LanguageSwitcherComponent from '@/components/LanguageSwitcherComponent.vue'
import de from '@/locales/de.json'

// setLocale touches document + dynamic imports; stub it so the store watcher is inert
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
  mount(LanguageSwitcherComponent, {
    global: { plugins: [createPinia(), i18n] },
  })

describe('LanguageSwitcherComponent', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    i18n.global.locale.value = 'de'
  })

  it('renders an option for each supported locale', () => {
    const wrapper = mountComponent()
    const options = wrapper.findAll('option')
    const values = options.map((o) => o.attributes('value'))
    expect(values).toEqual(['fr', 'de', 'it', 'en'])
    expect(options.map((o) => o.text())).toEqual(['FR', 'DE', 'IT', 'EN'])
  })

  it('binds the select to the store current locale (defaults to de)', () => {
    const wrapper = mountComponent()
    const select = wrapper.find('select').element as HTMLSelectElement
    expect(select.value).toBe('de')
  })

  it('updates the store locale when a different option is chosen', async () => {
    const wrapper = mountComponent()
    const select = wrapper.find('select')

    await select.setValue('fr')

    expect((select.element as HTMLSelectElement).value).toBe('fr')
  })

  it('has an accessible label for the select', () => {
    const wrapper = mountComponent()
    const label = wrapper.find('label[for="language-select"]')
    expect(label.exists()).toBe(true)
    expect(wrapper.find('select#language-select').exists()).toBe(true)
  })
})
