import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { nextTick } from 'vue'
import de from '@/locales/de.json'
import type { CantonWmsConfig } from '@/types/wms'

// --- Mocks for composables with side effects / network ---
// Use vi.hoisted so these are available inside the hoisted vi.mock factories.
const { fetchAddressMock, isMobileRef } = vi.hoisted(() => ({
  fetchAddressMock: vi.fn(),
  isMobileRef: { value: false },
}))

vi.mock('@/composables/useGeoadminReverseGeocoding', () => ({
  useGeoAdmin: () => ({ fetchAddress: fetchAddressMock }),
}))

vi.mock('@/composables/useDevice', () => ({
  useDevice: () => ({ isMobile: isMobileRef }),
}))

// Stub out all vue3-openlayers component imports so jsdom doesn't try to build a real map.
// NOTE: vi.mock factories are hoisted, so templates must be inlined (no shared helper).
vi.mock('vue3-openlayers/map/OlMap', () => ({
  default: {
    name: 'OlMap',
    emits: ['click'],
    template: '<div data-ol="map" @click="$emit(\'click\', $event)"><slot /></div>',
  },
}))
vi.mock('vue3-openlayers/map/OlProjectionRegister', () => ({
  default: { name: 'OlProjectionRegister', template: '<div data-ol="OlProjectionRegister"><slot /></div>' },
}))
vi.mock('vue3-openlayers/map/OlView', () => ({
  default: {
    name: 'OlView',
    template: '<div data-ol="OlView"><slot /></div>',
    // The component captures this instance via ref="view" and calls these
    // OpenLayers View methods; expose stubs so the click handler runs end-to-end.
    setup(_props: unknown, { expose }: { expose: (o: Record<string, unknown>) => void }) {
      expose({
        calculateExtent: () => [2480000, 1050000, 2838000, 1390000],
        setCenter: () => {},
        setZoom: () => {},
      })
    },
  },
}))
vi.mock('vue3-openlayers/layers/OlTileLayer', () => ({
  default: { name: 'OlTileLayer', template: '<div data-ol="OlTileLayer"><slot /></div>' },
}))
vi.mock('vue3-openlayers/layers/OlVectorLayer', () => ({
  default: { name: 'OlVectorLayer', template: '<div data-ol="OlVectorLayer"><slot /></div>' },
}))
vi.mock('vue3-openlayers/sources/OlSourceWMTS', () => ({
  default: { name: 'OlSourceWMTS', template: '<div data-ol="OlSourceWMTS"><slot /></div>' },
}))
vi.mock('vue3-openlayers/sources/OlSourceVector', () => ({
  default: { name: 'OlSourceVector', template: '<div data-ol="OlSourceVector"><slot /></div>' },
}))
vi.mock('vue3-openlayers/controls/OlScaleLineControl', () => ({
  default: { name: 'OlScaleLineControl', template: '<div data-ol="OlScaleLineControl"><slot /></div>' },
}))

// ol.css import
vi.mock('ol/ol.css', () => ({}))

import MapComponent from '@/components/MapComponent.vue'
import { useMapStore } from '@/stores/mapStore'
import { useSearchStore } from '@/stores/searchStore'

const i18n = createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'de',
  fallbackWarn: false,
  missingWarn: false,
  messages: { de },
})

const mountComponent = () =>
  mount(MapComponent, {
    global: { plugins: [createPinia(), i18n] },
  })

const makeConfig = (overrides: Partial<CantonWmsConfig> = {}): CantonWmsConfig => ({
  active: true,
  name: 'BE',
  wms_url: 'https://wms.example.com',
  query_url: 'https://query.example.com',
  info_format: 'application/json',
  bbox_delta: 0.01,
  legend_url: 'https://legend.example.com/legend.png',
  layers: [{ name: 'layer-a', property_name: 'p', property_values: [], opacity: 1 }],
  ...overrides,
})

describe('MapComponent', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    isMobileRef.value = false
  })

  it('renders the map info hint text', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.map-info').text()).toBe(de.map_info)
  })

  it('does not show the legend toggle button when there is no wmsConfig', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.legend-toggle-btn').exists()).toBe(false)
  })

  it('shows the legend toggle button once a wmsConfig with legend_url is set', async () => {
    const wrapper = mountComponent()
    const mapStore = useMapStore()

    mapStore.setWmsConfig(makeConfig())
    await nextTick()

    const btn = wrapper.find('.legend-toggle-btn')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain(de.legend_call_to_action)
  })

  it('toggles the legend container visibility when the button is clicked', async () => {
    const wrapper = mountComponent()
    const mapStore = useMapStore()
    mapStore.setWmsConfig(makeConfig())
    await nextTick()

    // v-show hides via style; check display state
    const legend = wrapper.find('.legend-container')
    expect((legend.element as HTMLElement).style.display).toBe('none')

    await wrapper.find('.legend-toggle-btn').trigger('click')
    expect((legend.element as HTMLElement).style.display).not.toBe('none')

    await wrapper.find('.legend-toggle-btn').trigger('click')
    expect((legend.element as HTMLElement).style.display).toBe('none')
  })

  it('renders the legend image with the configured legend_url', async () => {
    const wrapper = mountComponent()
    const mapStore = useMapStore()
    mapStore.setWmsConfig(makeConfig())
    await nextTick()

    const img = wrapper.find('.legend-container img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://legend.example.com/legend.png')
  })

  it('hides the legend button when the config has no layers', async () => {
    const wrapper = mountComponent()
    const mapStore = useMapStore()
    mapStore.setWmsConfig(makeConfig({ layers: [] }))
    await nextTick()

    expect(wrapper.find('.legend-toggle-btn').exists()).toBe(false)
  })

  it('hides the legend button when the config is inactive', async () => {
    const wrapper = mountComponent()
    const mapStore = useMapStore()
    mapStore.setWmsConfig(makeConfig({ active: false }))
    await nextTick()

    expect(wrapper.find('.legend-toggle-btn').exists()).toBe(false)
  })

  it('renders a WMS tile layer per configured layer', async () => {
    const wrapper = mountComponent()
    const mapStore = useMapStore()
    mapStore.setWmsConfig(
      makeConfig({
        layers: [
          { name: 'a', property_name: 'p', property_values: [], opacity: 1 },
          { name: 'b', property_name: 'p', property_values: [], opacity: 1 },
        ],
      }),
    )
    await nextTick()

    // base WMTS tile layer + 2 WMS layers = 3 OlTileLayer stubs
    const tileLayers = wrapper.findAll('[data-ol="OlTileLayer"]')
    expect(tileLayers.length).toBe(3)
  })

  it('clicking the map clears search state and fetches ground category', async () => {
    const wrapper = mountComponent()
    const mapStore = useMapStore()
    const searchStore = useSearchStore()
    const clearSpy = vi.spyOn(mapStore, 'clearSearchState')
    const fetchSpy = vi.spyOn(mapStore, 'fetchGroundCategory').mockResolvedValue(undefined)
    fetchAddressMock.mockResolvedValue('Teststrasse 1 3000 Bern')
    searchStore.searchQuery = 'preexisting'

    await wrapper.find('[data-ol="map"]').trigger('click', {
      coordinate: [2600000, 1200000],
    })
    await flushPromises()

    expect(clearSpy).toHaveBeenCalled()
    expect(fetchSpy).toHaveBeenCalledWith(2600000, 1200000)
  })

  it('does nothing when the click has no coordinate', async () => {
    const wrapper = mountComponent()
    const mapStore = useMapStore()
    const fetchSpy = vi.spyOn(mapStore, 'fetchGroundCategory').mockResolvedValue(undefined)

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await wrapper.find('[data-ol="map"]').trigger('click', { coordinate: undefined })
    await flushPromises()

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('sets the selected address from reverse geocoding on map click', async () => {
    const wrapper = mountComponent()
    const mapStore = useMapStore()
    const searchStore = useSearchStore()
    vi.spyOn(mapStore, 'fetchGroundCategory').mockResolvedValue(undefined)
    fetchAddressMock.mockResolvedValue('Teststrasse 1 3000 Bern')

    await wrapper.find('[data-ol="map"]').trigger('click', {
      coordinate: [2600000, 1200000],
    })
    await flushPromises()

    expect(searchStore.selectedAddress).toBe('Teststrasse 1 3000 Bern')
  })

  it('clears the selected address when reverse geocoding returns null', async () => {
    const wrapper = mountComponent()
    const mapStore = useMapStore()
    const searchStore = useSearchStore()
    vi.spyOn(mapStore, 'fetchGroundCategory').mockResolvedValue(undefined)
    fetchAddressMock.mockResolvedValue(null)

    await wrapper.find('[data-ol="map"]').trigger('click', {
      coordinate: [2600000, 1200000],
    })
    await flushPromises()

    expect(searchStore.selectedAddress).toBe('')
  })
})
