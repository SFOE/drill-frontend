import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createI18n } from 'vue-i18n'
import InfoboxComponent from '@/components/InfoboxComponent.vue'
import de from '@/locales/de.json'

// @pinia/testing v1+ requires createSpy option

// Mock useDevice composable — vi.mock is hoisted, so we import ref inline
vi.mock('@/composables/useDevice', async () => {
  const { ref } = await import('vue')
  return {
    useDevice: () => ({ isMobile: ref(false) }),
  }
})

// Mock child components to keep tests focused
vi.mock('@/components/InfoboxLinksComponent.vue', () => ({
  default: {
    name: 'InfoboxLinksComponent',
    props: ['harmonizedValue', 'wmsConfig', 'sourceValues'],
    template: '<div class="mock-links"></div>',
  },
}))

vi.mock('@/components/LoadingSpinner.vue', () => ({
  default: {
    name: 'LoadingSpinner',
    template: '<div class="loading-overlay"></div>',
  },
}))

const i18n = createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'de',
  fallbackWarn: false,
  missingWarn: false,
  messages: { de },
})

const mountInfobox = (mapState = {}) => {
  return mount(InfoboxComponent, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            map: {
              groundCategory: null,
              groundCategoryError: true,
              loadingGroundCategory: false,
              selectedCanton: null,
              wmsConfig: null,
              coordinates: null,
              ...mapState,
            },
            search: {
              searchQuery: '',
              selectedAddress: '',
              searchResults: [],
            },
          },
          stubActions: false,
        }),
        i18n,
      ],
    },
  })
}

describe('InfoboxComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render infobox when groundCategory is null', () => {
    const wrapper = mountInfobox()
    expect(wrapper.find('.info-box').exists()).toBe(false)
  })

  it('shows loading spinner when loadingGroundCategory is true', () => {
    const wrapper = mountInfobox({
      loadingGroundCategory: true,
      groundCategory: null,
    })
    expect(wrapper.find('.loading-overlay').exists()).toBe(true)
    expect(wrapper.find('.info-box').exists()).toBe(false)
  })

  it('renders infobox when groundCategory is set', () => {
    const wrapper = mountInfobox({
      groundCategory: {
        harmonized_value: 1,
        layer_results: [],
        mapping_sum: 10,
        source_values: 'test',
      },
      loadingGroundCategory: false,
    })
    expect(wrapper.find('.info-box').exists()).toBe(true)
  })

  describe('color class mapping', () => {
    const testCases: Array<[number, string]> = [
      [1, 'green'],
      [2, 'orange'],
      [3, 'red'],
      [4, 'blue'],
      [5, 'blue'],
      [6, 'blue'],
      [98, 'purple'],
      [99, 'purple'],
    ]

    testCases.forEach(([harmonizedValue, expectedColor]) => {
      it(`applies "${expectedColor}" class for harmonized_value=${harmonizedValue}`, () => {
        const wrapper = mountInfobox({
          groundCategory: {
            harmonized_value: harmonizedValue,
            layer_results: [],
            mapping_sum: 0,
            source_values: '',
          },
          loadingGroundCategory: false,
        })

        expect(wrapper.find('.info-box').classes()).toContain(expectedColor)
      })
    })
  })

  it('falls back to "blue" for unexpected harmonized_value', () => {
    const wrapper = mountInfobox({
      groundCategory: {
        harmonized_value: 42,
        layer_results: [],
        mapping_sum: 0,
        source_values: '',
      },
      loadingGroundCategory: false,
    })
    expect(wrapper.find('.info-box').classes()).toContain('blue')
  })

  it('renders the title (h2) with translated text', () => {
    const wrapper = mountInfobox({
      groundCategory: {
        harmonized_value: 1,
        layer_results: [],
        mapping_sum: 10,
        source_values: 'test_source',
      },
      loadingGroundCategory: false,
    })
    const h2 = wrapper.find('.info-box .text h2')
    expect(h2.exists()).toBe(true)
    expect(h2.text()).toBeTruthy()
  })

  it('shows selected address when available', () => {
    const wrapper = mount(InfoboxComponent, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              map: {
                groundCategory: {
                  harmonized_value: 1,
                  layer_results: [],
                  mapping_sum: 10,
                  source_values: '',
                },
                loadingGroundCategory: false,
                selectedCanton: 'BE',
                wmsConfig: null,
                groundCategoryError: false,
                coordinates: null,
              },
              search: {
                searchQuery: 'test',
                selectedAddress: 'Ittigenstrasse 13 3063 Ittigen',
                searchResults: [],
              },
            },
            stubActions: false,
          }),
          i18n,
        ],
      },
    })

    expect(wrapper.find('.selected-address').text()).toBe('Ittigenstrasse 13 3063 Ittigen')
  })

  it('does not show selected address when empty', () => {
    const wrapper = mountInfobox({
      groundCategory: {
        harmonized_value: 1,
        layer_results: [],
        mapping_sum: 10,
        source_values: '',
      },
      loadingGroundCategory: false,
    })
    expect(wrapper.find('.selected-address').exists()).toBe(false)
  })

  it('displays desktop details on non-mobile', () => {
    const wrapper = mountInfobox({
      groundCategory: {
        harmonized_value: 2,
        layer_results: [],
        mapping_sum: 0,
        source_values: 'wms source',
      },
      loadingGroundCategory: false,
    })
    expect(wrapper.find('.desktop-details').exists()).toBe(true)
    expect(wrapper.find('.mobile-collapse-wrapper').exists()).toBe(false)
  })

  it('renders an icon image', () => {
    const wrapper = mountInfobox({
      groundCategory: {
        harmonized_value: 1,
        layer_results: [],
        mapping_sum: 10,
        source_values: '',
      },
      loadingGroundCategory: false,
    })
    expect(wrapper.find('.icon img').exists()).toBe(true)
  })

  it('includes canton in title for harmonized_value=98', () => {
    const wrapper = mountInfobox({
      groundCategory: {
        harmonized_value: 98,
        layer_results: [],
        mapping_sum: 0,
        source_values: 'geoservice unavailable',
      },
      selectedCanton: 'ZH',
      loadingGroundCategory: false,
    })

    const title = wrapper.find('.info-box .text h2').text()
    expect(title).toContain('ZH')
  })
})
