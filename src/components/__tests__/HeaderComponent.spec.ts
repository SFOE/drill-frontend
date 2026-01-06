import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HeaderComponent from '../HeaderComponent.vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

// i18n setup for $t
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      headerTitle: 'Test Header Title',
    },
  },
})

describe('HeaderComponent.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(HeaderComponent, {
      global: {
        plugins: [i18n, createPinia()],
      },
    })
  })

  it('renders the top header with language switcher', () => {
    const topHeader = wrapper.find('.top-header-box')
    expect(topHeader.exists()).toBe(true)

    const languageSwitcher = topHeader.find('.language-switcher')
    expect(languageSwitcher.exists()).toBe(true)

    const options = languageSwitcher.findAll('option')
    expect(options.map((o) => o.text())).toEqual(['FR', 'DE', 'IT', 'EN'])
  })

  it('renders the bottom header with logo and title', () => {
    const bottomHeader = wrapper.find('.bottom-header-box')
    expect(bottomHeader.exists()).toBe(true)

    const logo = bottomHeader.find('.logo')
    expect(logo.exists()).toBe(true)
    expect(logo.attributes('alt')).toBe('Swiss Logo')

    const title = bottomHeader.find('.title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('Test Header Title')
  })

  it('renders the header line', () => {
    const headerLine = wrapper.find('.header-line')
    expect(headerLine.exists()).toBe(true)
  })
})
