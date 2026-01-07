import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import LanguageSwitcherComponent from '../LanguageSwitcherComponent.vue'
import { useLanguageStore } from '../../stores/languageStore'

// ---- MOCK vue-i18n so store doesn't crash ----
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'en' },
  }),
}))

describe('LanguageSwitcherComponent.vue', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  it('renders select with all locales', () => {
    const wrapper = mount(LanguageSwitcherComponent)
    const options = wrapper.findAll('option')

    expect(options.length).toBe(4)
    expect(options.map((o) => o.text())).toEqual(['FR', 'DE', 'IT', 'EN'])
  })

  it('updates languageStore.currentLocale when selection changes', async () => {
    const wrapper = mount(LanguageSwitcherComponent)
    const languageStore = useLanguageStore()

    const select = wrapper.find('select')
    expect(select.element.value).toBe(languageStore.currentLocale)

    // Change the value
    await select.setValue('fr')
    expect(languageStore.currentLocale).toBe('fr')

    await select.setValue('it')
    expect(languageStore.currentLocale).toBe('it')
  })
})
