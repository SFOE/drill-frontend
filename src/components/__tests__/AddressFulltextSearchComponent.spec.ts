import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import axios from 'axios'

import AddressSearchComponent from '../AddressFulltextSearchComponent.vue'
import { useMapStore, type SearchResult } from '../../stores/mapStore'

vi.mock('axios')

// Geoadmin mock response for papiermuhle 13, ittigen
const geoAdminResponse: { fuzzy: string; results: SearchResult[] } = {
  fuzzy: 'true',
  results: [
    {
      id: '983892',
      attrs: {
        label: 'Ittigenstrasse 13 <b>3063 Ittigen</b>',
        x: 203045.59375,
        y: 603632.75,
        detail: 'ittigenstrasse 13 3063 ittigen 362 ittigen ch be',
      },
    },
    {
      id: '843296',
      attrs: {
        label: 'Chasseralstrasse 13 <b>3063 Ittigen</b>',
        x: 203252.609375,
        y: 603014.6875,
        detail: 'chasseralstrasse 13 3063 ittigen 362 ittigen ch be',
      },
    },
    {
      id: '857295',
      attrs: {
        label: 'Baumgartenweg 13 <b>3063 Ittigen</b>',
        x: 203094.703125,
        y: 603397.625,
        detail: 'baumgartenweg 13 3063 ittigen 362 ittigen ch be',
      },
    },
    {
      id: '869351',
      attrs: {
        label: 'Erlenweg 13 <b>3063 Ittigen</b>',
        x: 202323.234375,
        y: 603399.375,
        detail: 'erlenweg 13 3063 ittigen 362 ittigen ch be',
      },
    },
    {
      id: '945172',
      attrs: {
        label: 'Rain 13 <b>3063 Ittigen</b>',
        x: 202778.15625,
        y: 603106.875,
        detail: 'rain 13 3063 ittigen 362 ittigen ch be',
      },
    },
  ],
}

// i18n setup
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      mainTitle: 'Search address',
      search_placeholder: 'Search address',
    },
  },
})

// Helper to mount component
const mountComponent = () => {
  const pinia = createPinia()
  setActivePinia(pinia)

  return mount(AddressSearchComponent, {
    global: {
      plugins: [pinia, i18n],
    },
  })
}

describe('AddressSearchComponent.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('searches addresses and displays all results from GeoAdmin API', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: geoAdminResponse,
    })

    const wrapper = mountComponent()
    const mapStore = useMapStore()

    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)

    await input.setValue('papiermuhle 13, ittigen')
    await flushPromises()

    // Axios called once
    expect(axios.get).toHaveBeenCalledOnce()

    // All 5 results stored
    expect(mapStore.searchResults.length).toBe(5)

    // All 5 dropdown items displayed
    const items = wrapper.findAll('.dropdown-item')
    expect(items.length).toBe(5)

    // Check that each label text is displayed correctly (stripped of <b>)
    const expectedLabels = geoAdminResponse.results.map((r) =>
      r.attrs.label.replace(/<[^>]*>/g, ''),
    )
    items.forEach((item, index) => {
      expect(item.text()).toBe(expectedLabels[index])
    })
  })

  it('selects an address and updates store coordinates on click', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: geoAdminResponse,
    })

    const wrapper = mountComponent()
    const mapStore = useMapStore()

    vi.spyOn(mapStore, 'setCoordinates')
    vi.spyOn(mapStore, 'fetchGroundCategory')

    const input = wrapper.find('input')
    await input.setValue('papiermuhle 13, ittigen')
    await flushPromises()

    const item = wrapper.find('.dropdown-item')
    expect(item.exists()).toBe(true)

    await item.trigger('click')

    expect(mapStore.setCoordinates).toHaveBeenCalledWith({
      x: 203045.59375 + 1000000,
      y: 603632.75 + 2000000,
    })

    expect(mapStore.fetchGroundCategory).toHaveBeenCalled()
    expect(mapStore.searchResults.length).toBe(0)
    expect(mapStore.searchQuery).toBe('Ittigenstrasse 13 3063 Ittigen')
  })

  it('clears results when input is cleared', async () => {
    const wrapper = mountComponent()
    const mapStore = useMapStore()

    mapStore.searchResults = geoAdminResponse.results
    mapStore.searchQuery = 'test'

    const input = wrapper.find('input')
    await input.setValue('')

    expect(mapStore.searchResults.length).toBe(0)
  })
})
