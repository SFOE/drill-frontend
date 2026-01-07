import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FooterComponent from '../FooterComponent.vue'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      headerTitle: 'Test Header Title',
      legalTitle: 'Legal Notice',
      legalUrl: 'https://example.com/legal',
      contact: 'Contact Us',
    },
  },
})

describe('FooterComponent.vue', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(FooterComponent, {
      global: {
        plugins: [i18n],
      },
    })
  })

  it('renders the left section with headerTitle', () => {
    const leftSection = wrapper.find('.footer-left')
    expect(leftSection.exists()).toBe(true)
    const listItem = leftSection.find('li')
    expect(listItem.text()).toBe('Test Header Title')
  })

  it('renders the center section with legal and contact links', () => {
    const links = wrapper.findAll('.footer-center a')
    expect(links).toHaveLength(2)

    const legalLink = links[0]!
    const contactLink = links[1]!

    expect(legalLink.text()).toBe('Legal Notice')
    expect(legalLink.attributes('href')).toBe('https://example.com/legal')

    expect(contactLink.text()).toBe('Contact Us')
    expect(contactLink.attributes('href')).toBe('mailto:contact@bfe.admin.ch')
  })

  it('renders the right section with current year and copyright', () => {
    const paragraph = wrapper.find('.footer-right p')
    expect(paragraph.exists()).toBe(true)

    const currentYear = new Date().getFullYear()
    expect(paragraph.text()).toContain(`${currentYear}`)
    expect(paragraph.text()).toContain('copyright')
  })
})
