import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'
import StaticElementsComponent from '../StaticElementsComponent.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      info_section_title: 'Info Section',
      TitelLinkKanton: 'Canton Info',
      textMapCanton: 'Canton text',
      TitelLinkInfos: 'Additional Info',

      WeiterInfos1Title: 'Link 1',
      WeiterInfos2Title: 'Link 2',
      WeiterInfos3Title: 'Link 3',
      WeiterInfos1Url: '#1',
      WeiterInfos2Url: '#2',
      WeiterInfos3Url: '#3',

      hint1: 'Hint 1',
      hint2: 'Hint 2',
      hint3: 'Hint 3',
      hint4: 'Hint 4',

      suitability_heating_cta: 'CTA Text',
    },
  },
})

const mountComponent = () =>
  mount(StaticElementsComponent, {
    global: {
      plugins: [i18n],
    },
  })

describe('StaticElementsComponent.vue', () => {
  it('renders the section title', () => {
    const wrapper = mountComponent()

    const title = wrapper.find('.info-block__title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('Info Section')
  })

  it('renders the headings', () => {
    const wrapper = mountComponent()

    const headings = wrapper.findAll('.info-block__heading')
    expect(headings.length).toBe(2)

    expect(headings[0]!.text()).toBe('Canton Info')
    expect(headings[1]!.text()).toBe('Additional Info')
  })

  it('renders canton text and all hints in correct order', () => {
    const wrapper = mountComponent()

    const texts = wrapper.findAll('.info-block__text')
    expect(texts.length).toBeGreaterThanOrEqual(5)

    expect(texts[0]!.text()).toBe('Canton text')
    expect(texts[1]!.text()).toBe('Hint 1')
    expect(texts[2]!.text()).toBe('Hint 2')
    expect(texts[3]!.text()).toBe('Hint 3')
    expect(texts[4]!.text()).toBe('Hint 4')
  })

  it('renders the external information links', () => {
    const wrapper = mountComponent()

    const links = wrapper.findAll('.info-block__link')
    expect(links.length).toBe(3)

    expect(links[0]!.text()).toContain('Link 1')
    expect(links[1]!.text()).toContain('Link 2')
    expect(links[2]!.text()).toContain('Link 3')
  })

  it('renders the CTA button', () => {
    const wrapper = mountComponent()

    const cta = wrapper.find('.hint-button')
    expect(cta.exists()).toBe(true)
    expect(cta.text()).toContain('CTA Text')
    expect(cta.attributes('href')).toBe('https://www.chauffezrenouvelable.ch/')
  })
})
