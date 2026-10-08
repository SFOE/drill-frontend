import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import FooterComponent from '@/components/FooterComponent.vue'
import de from '@/locales/de.json'

const i18n = createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'de',
  fallbackWarn: false,
  missingWarn: false,
  messages: { de },
})

const mountComponent = () =>
  mount(FooterComponent, {
    global: { plugins: [i18n] },
  })

describe('FooterComponent', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the organisation title', () => {
    const wrapper = mountComponent()
    expect(wrapper.text()).toContain(de.header_title)
  })

  it('renders the legal link with the configured URL opening in a new tab', () => {
    const wrapper = mountComponent()
    const legalLink = wrapper.findAll('a').find((a) => a.text() === de.legal_title)
    expect(legalLink).toBeDefined()
    expect(legalLink!.attributes('href')).toBe(de.legal_url)
    expect(legalLink!.attributes('target')).toBe('_blank')
    expect(legalLink!.attributes('rel')).toBe('noopener')
  })

  it('renders a mailto contact link', () => {
    const wrapper = mountComponent()
    const mailto = wrapper.findAll('a').find((a) => a.attributes('href')?.startsWith('mailto:'))
    expect(mailto).toBeDefined()
    expect(mailto!.attributes('href')).toBe('mailto:contact@bfe.admin.ch')
  })

  it('renders the current year in the copyright line', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-06-15T00:00:00Z'))

    const wrapper = mountComponent()
    expect(wrapper.find('.footer-right').text()).toContain('2030')
  })
})
