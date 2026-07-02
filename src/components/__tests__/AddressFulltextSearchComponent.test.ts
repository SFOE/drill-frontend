import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createI18n } from 'vue-i18n'
import AddressFulltextSearchComponent from '@/components/AddressFulltextSearchComponent.vue'
import { useMapStore } from '@/stores/mapStore'
import { useSearchStore } from '@/stores/searchStore'
import de from '@/locales/de.json'

// Mock http service
vi.mock('@/services/http', () => ({
  geoAdminHttp: {
    get: vi.fn(),
  },
  backendHttp: {
    get: vi.fn(),
  },
}))

// Mock axios
vi.mock('axios', () => ({
  default: {
    isCancel: vi.fn(() => false),
    create: vi.fn(() => ({ get: vi.fn() })),
  },
}))

import { geoAdminHttp } from '@/services/http'
const mockedGeoAdminGet = vi.mocked(geoAdminHttp.get)

const i18n = createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'de',
  fallbackWarn: false,
  missingWarn: false,
  messages: { de },
})

const mountComponent = () => {
  return mount(AddressFulltextSearchComponent, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
        }),
        i18n,
      ],
      stubs: {
        // Stub SVG imports
        'img': true,
      },
    },
    attachTo: document.body,
  })
}

describe('AddressFulltextSearchComponent', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the search input with correct placeholder', () => {
    const wrapper = mountComponent()
    const input = wrapper.find('[data-cy=address-search-input]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toBe(de.search_placeholder)
    wrapper.unmount()
  })

  it('renders the main title', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.action-title').text()).toBe(de.main_title)
    wrapper.unmount()
  })

  it('displays dropdown results when searchResults has items', async () => {
    const wrapper = mountComponent()
    const searchStore = useSearchStore()
    searchStore.searchResults = [
      { id: '1', attrs: { label: 'Address 1', north_coord: 100, east_coord: 200, detail: '' } },
      { id: '2', attrs: { label: 'Address 2', north_coord: 101, east_coord: 201, detail: '' } },
    ]
    await flushPromises()

    const items = wrapper.findAll('.dropdown-item')
    expect(items).toHaveLength(2)
    wrapper.unmount()
  })

  it('does not display dropdown when searchResults is empty', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.dropdown-menu').exists()).toBe(false)
    wrapper.unmount()
  })

  it('clears results when input is cleared', async () => {
    const wrapper = mountComponent()
    const searchStore = useSearchStore()
    const mapStore = useMapStore()

    searchStore.searchQuery = ''
    const input = wrapper.find('[data-cy=address-search-input]')
    await input.trigger('input')

    expect(searchStore.searchResults).toEqual([])
    expect(mapStore.groundCategory).toBeNull()
    wrapper.unmount()
  })

  it('debounces the search call', async () => {
    const wrapper = mountComponent()
    const searchStore = useSearchStore()

    mockedGeoAdminGet.mockResolvedValue({ data: { results: [] } })

    // Set query in the store (simulating typing)
    searchStore.searchQuery = 'Bern'

    // Trigger the input event which calls onInput → debouncedSearch
    const input = wrapper.find('[data-cy=address-search-input]')
    await input.setValue('Bern')
    await input.trigger('input')

    // Should not call immediately (debounced by 300ms)
    expect(mockedGeoAdminGet).not.toHaveBeenCalled()

    // Advance past debounce delay
    vi.advanceTimersByTime(300)
    await flushPromises()

    expect(mockedGeoAdminGet).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('handles address selection correctly', async () => {
    const wrapper = mountComponent()
    const searchStore = useSearchStore()
    const mapStore = useMapStore()

    searchStore.searchResults = [
      {
        id: '1',
        attrs: {
          label: 'Ittigenstrasse 13 <b>3063 Ittigen</b>',
          north_coord: 200000,
          east_coord: 600000,
          x: 200000,
          y: 600000,
          detail: '',
        },
      },
    ]
    await flushPromises()

    // Click the first result
    await wrapper.find('.dropdown-item').trigger('click')

    expect(searchStore.searchResults).toEqual([])
    expect(searchStore.selectedAddress).toBe('Ittigenstrasse 13 3063 Ittigen')
    expect(mapStore.coordinates).toEqual({ east_coord: 600000, north_coord: 200000 })
    wrapper.unmount()
  })

  it('clears all state when clear button is clicked', async () => {
    const wrapper = mountComponent()
    const searchStore = useSearchStore()

    searchStore.searchQuery = 'something'
    searchStore.selectedAddress = 'Somewhere'
    await flushPromises()

    await wrapper.find('.clear-btn').trigger('click')

    expect(searchStore.searchQuery).toBe('')
    expect(searchStore.selectedAddress).toBe('')
    wrapper.unmount()
  })

  it('has correct ARIA attributes for accessibility', async () => {
    const wrapper = mountComponent()
    const searchStore = useSearchStore()

    const input = wrapper.find('[data-cy=address-search-input]')
    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-autocomplete')).toBe('list')
    expect(input.attributes('aria-expanded')).toBe('false')

    searchStore.searchResults = [
      { id: '1', attrs: { label: 'Test', north_coord: 0, east_coord: 0, detail: '' } },
    ]
    await flushPromises()

    expect(input.attributes('aria-expanded')).toBe('true')
    expect(input.attributes('aria-controls')).toBe('address-listbox')
    wrapper.unmount()
  })

  it('listbox items have correct ARIA roles', async () => {
    const wrapper = mountComponent()
    const searchStore = useSearchStore()

    searchStore.searchResults = [
      { id: '1', attrs: { label: 'Result', north_coord: 0, east_coord: 0, detail: '' } },
    ]
    await flushPromises()

    const listbox = wrapper.find('#address-listbox')
    expect(listbox.attributes('role')).toBe('listbox')

    const option = wrapper.find('.dropdown-item')
    expect(option.attributes('role')).toBe('option')
    wrapper.unmount()
  })

  it('highlights item on mouseover', async () => {
    const wrapper = mountComponent()
    const searchStore = useSearchStore()

    searchStore.searchResults = [
      { id: '1', attrs: { label: 'A', north_coord: 0, east_coord: 0, detail: '' } },
      { id: '2', attrs: { label: 'B', north_coord: 0, east_coord: 0, detail: '' } },
    ]
    await flushPromises()

    const items = wrapper.findAll('.dropdown-item')
    await items[1].trigger('mouseover')

    expect(items[1].classes()).toContain('highlighted')
    wrapper.unmount()
  })
})
