import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import StaticElementsComponent from '@/components/StaticElementsComponent.vue'
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
  mount(StaticElementsComponent, {
    global: { plugins: [i18n] },
  })

describe('StaticElementsComponent', () => {
  it('renders the information block title', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.info-block-title').text()).toBe(de.information_title)
  })

  it('renders the section headings', () => {
    const wrapper = mountComponent()
    const headings = wrapper.findAll('.info-block-heading').map((h) => h.text())
    expect(headings).toContain(de.app_goal_title)
    expect(headings).toContain(de.title_link_canton)
    expect(headings).toContain(de.title_link_infos)
  })

  it('renders the additional-info links with their configured URLs', () => {
    const wrapper = mountComponent()
    const hrefs = wrapper.findAll('.info-block-links a').map((a) => a.attributes('href'))

    expect(hrefs).toContain(de.suitability_heating_url)
    expect(hrefs).toContain(de.additional_info_1_url)
    expect(hrefs).toContain(de.additional_info_2_url)
    expect(hrefs).toContain(de.additional_info_3_url)
    expect(hrefs).toContain(de.additional_info_4_url)
  })

  it('all external links open in a new tab with rel=noopener', () => {
    const wrapper = mountComponent()
    wrapper.findAll('.info-block-links a').forEach((link) => {
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener')
    })
  })

  it('renders html content via v-html for the app goal body', () => {
    const wrapper = mountComponent()
    // app_goal is injected as raw HTML; the rendered text should be non-empty
    const bodies = wrapper.findAll('.info-block-body')
    expect(bodies.length).toBeGreaterThan(0)
  })
})
