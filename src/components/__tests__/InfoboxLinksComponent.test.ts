import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import InfoboxLinksComponent from '@/components/InfoboxLinksComponent.vue'
import de from '@/locales/de.json'
import type { CantonWmsConfig } from '@/types/wms'

const i18n = createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'de',
  fallbackWarn: false,
  missingWarn: false,
  messages: { de },
})

const mockWmsConfig: CantonWmsConfig = {
  active: true,
  name: 'BE',
  wms_url: 'https://wms.example.com',
  query_url: 'https://query.example.com',
  thematic_geoportal_url: 'https://geoportal.example.com',
  cantonal_energy_service_url: 'https://energy.example.com',
  legend_url: 'https://legend.example.com',
  info_format: 'application/json',
  bbox_delta: 0.01,
  layers: [],
}

const mountComponent = (props: {
  harmonizedValue: number
  wmsConfig: CantonWmsConfig | null
  sourceValues?: string
}) => {
  return mount(InfoboxLinksComponent, {
    props,
    global: { plugins: [i18n] },
  })
}

describe('InfoboxLinksComponent', () => {
  it('renders nothing when wmsConfig is null', () => {
    const wrapper = mountComponent({
      harmonizedValue: 1,
      wmsConfig: null,
    })
    expect(wrapper.find('.link-list').exists()).toBe(false)
  })

  it('shows only cantonal energy service link for harmonized_value=98', () => {
    const wrapper = mountComponent({
      harmonizedValue: 98,
      wmsConfig: mockWmsConfig,
    })
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(1)
    expect(links[0].attributes('href')).toBe('https://energy.example.com')
  })

  it('shows all three links for harmonized_value != 98', () => {
    const wrapper = mountComponent({
      harmonizedValue: 1,
      wmsConfig: mockWmsConfig,
    })
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(3)

    // cantonal energy service
    expect(links[0].attributes('href')).toBe('https://energy.example.com')
    // geoportal
    expect(links[1].attributes('href')).toBe('https://geoportal.example.com')
    // suitability heating (from i18n)
    expect(links[2].attributes('href')).toBe(
      'https://www.energieschweiz.ch/modernisieren/heizungsersatz/',
    )
  })

  it('displays source values when provided', () => {
    const wrapper = mountComponent({
      harmonizedValue: 1,
      wmsConfig: mockWmsConfig,
      sourceValues: 'ch.bfe.suitability-heat-pump',
    })
    const sourceValues = wrapper.find('.source-values')
    expect(sourceValues.exists()).toBe(true)
    expect(sourceValues.text()).toContain('ch.bfe.suitability-heat-pump')
  })

  it('does not display source values when empty', () => {
    const wrapper = mountComponent({
      harmonizedValue: 1,
      wmsConfig: mockWmsConfig,
      sourceValues: '',
    })
    expect(wrapper.find('.source-values').exists()).toBe(false)
  })

  it('all links open in new tab with security attributes', () => {
    const wrapper = mountComponent({
      harmonizedValue: 2,
      wmsConfig: mockWmsConfig,
    })
    const links = wrapper.findAll('a')
    links.forEach((link) => {
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    })
  })
})
