import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createI18n } from 'vue-i18n'
import AddressFulltextSearchComponent from '@/components/AddressFulltextSearchComponent.vue'
import { useMapStore } from '@/stores/mapStore'
import { useSearchStore } from '@/stores/searchStore'
import de from '@/locales/de.json'

vi.mock('@/services/http', () => ({
  geoAdminHttp: { get: vi.fn() },
  backendHttp: { get: vi.fn() },
}))

const isCancelMock = vi.fn()
vi.mock('axios', () => ({
  default: {
    isCancel: (e: unknown) => isCancelMock(e),
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

const mountComponent = () =>
  mount(AddressFulltextSearchComponent, {
    global: {
      plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false }), i18n],
      stubs: { img: true },
    },
    attachTo: document.body,
  })

const seedResults = (searchStore: ReturnType<typeof useSearchStore>, n = 3) => {
  searchStore.searchResults = Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    attrs: {
      label: `Result ${i + 1}`,
      north_coord: 1200000 + i,
      east_coord: 2600000 + i,
      x: 1200000 + i,
      y: 2600000 + i,
      detail: '',
    },
  }))
}

describe('AddressFulltextSearchComponent - keyboard navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isCancelMock.mockReturnValue(false)
  })
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('ArrowDown moves highlight from none to 0 then increments and clamps', async () => {
    const wrapper = mountComponent()
    const searchStore = useSearchStore()
    seedResults(searchStore, 2)
    await flushPromises()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    await flushPromises()
    expect(wrapper.findAll('.dropdown-item')[0].classes()).toContain('highlighted')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    await flushPromises()
    expect(wrapper.findAll('.dropdown-item')[1].classes()).toContain('highlighted')

    // Clamp at last index
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    await flushPromises()
    expect(wrapper.findAll('.dropdown-item')[1].classes()).toContain('highlighted')
    wrapper.unmount()
  })

  it('ArrowUp from none selects last item then decrements and clamps at 0', async () => {
    const wrapper = mountComponent()
    const searchStore = useSearchStore()
    seedResults(searchStore, 3)
    await flushPromises()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    await flushPromises()
    expect(wrapper.findAll('.dropdown-item')[2].classes()).toContain('highlighted')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    await flushPromises()
    expect(wrapper.findAll('.dropdown-item')[1].classes()).toContain('highlighted')
    wrapper.unmount()
  })

  it('Escape clears results and highlight', async () => {
    const wrapper = mountComponent()
    const searchStore = useSearchStore()
    seedResults(searchStore, 2)
    await flushPromises()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()

    expect(searchStore.searchResults).toEqual([])
    wrapper.unmount()
  })

  it('ignores keydown when there are no results', async () => {
    const wrapper = mountComponent()
    const searchStore = useSearchStore()
    searchStore.searchResults = []
    await flushPromises()

    // Should be a no-op (no throw, results stay empty)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    await flushPromises()
    expect(searchStore.searchResults).toEqual([])
    wrapper.unmount()
  })

  it('removes the keydown/click listeners on unmount', async () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const wrapper = mountComponent()
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function))
    removeSpy.mockRestore()
  })
})

describe('AddressFulltextSearchComponent - Enter selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isCancelMock.mockReturnValue(false)
  })

  it('Enter selects the highlighted item when one is highlighted', async () => {
    const wrapper = mountComponent()
    const searchStore = useSearchStore()
    const mapStore = useMapStore()
    seedResults(searchStore, 3)
    await flushPromises()

    // Highlight the second item via ArrowDown twice
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    await flushPromises()

    await wrapper.find('[data-cy=address-search-input]').trigger('keydown.enter')
    await flushPromises()

    expect(searchStore.selectedAddress).toBe('Result 2')
    expect(mapStore.coordinates).not.toBeNull()
    wrapper.unmount()
  })

  it('Enter selects the first item when nothing is highlighted', async () => {
    const wrapper = mountComponent()
    const searchStore = useSearchStore()
    seedResults(searchStore, 3)
    await flushPromises()

    await wrapper.find('[data-cy=address-search-input]').trigger('keydown.enter')
    await flushPromises()

    expect(searchStore.selectedAddress).toBe('Result 1')
    wrapper.unmount()
  })

  it('Enter is a no-op when there are no results', async () => {
    const wrapper = mountComponent()
    const searchStore = useSearchStore()
    searchStore.searchResults = []
    await flushPromises()

    await wrapper.find('[data-cy=address-search-input]').trigger('keydown.enter')
    await flushPromises()

    expect(searchStore.selectedAddress).toBe('')
    wrapper.unmount()
  })
})

describe('AddressFulltextSearchComponent - selection edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isCancelMock.mockReturnValue(false)
  })

  it('does not set coordinates when the result has zero/invalid coords', async () => {
    const wrapper = mountComponent()
    const searchStore = useSearchStore()
    const mapStore = useMapStore()
    searchStore.searchResults = [
      { id: '1', attrs: { label: 'No coords', north_coord: 0, east_coord: 0, x: 0, y: 0, detail: '' } },
    ]
    await flushPromises()

    await wrapper.find('.dropdown-item').trigger('click')

    // Coordinates branch skipped, but address text still applied
    expect(mapStore.coordinates).toBeNull()
    expect(searchStore.selectedAddress).toBe('No coords')
    wrapper.unmount()
  })
})

describe('AddressFulltextSearchComponent - focus & search request', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isCancelMock.mockReturnValue(false)
  })

  it('onFocus triggers a search when a query is already present', async () => {
    mockedGeoAdminGet.mockResolvedValue({ data: { results: [] } })
    const wrapper = mountComponent()
    const searchStore = useSearchStore()
    searchStore.searchQuery = 'Bern'
    await flushPromises()

    await wrapper.find('[data-cy=address-search-input]').trigger('focus')
    await flushPromises()

    expect(mockedGeoAdminGet).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('onFocus does nothing when the query is empty', async () => {
    const wrapper = mountComponent()
    const searchStore = useSearchStore()
    searchStore.searchQuery = ''
    await flushPromises()

    await wrapper.find('[data-cy=address-search-input]').trigger('focus')
    await flushPromises()

    expect(mockedGeoAdminGet).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('populates results from a successful search response', async () => {
    mockedGeoAdminGet.mockResolvedValue({
      data: { results: [{ id: '9', attrs: { label: 'Hit', x: 1, y: 2, detail: '' } }] },
    })
    const wrapper = mountComponent()
    const searchStore = useSearchStore()
    searchStore.searchQuery = 'Zürich'
    await flushPromises()

    await wrapper.find('[data-cy=address-search-input]').trigger('focus')
    await flushPromises()

    expect(searchStore.searchResults).toHaveLength(1)
    expect(searchStore.searchResults[0].id).toBe('9')
    wrapper.unmount()
  })

  it('logs an error for a genuine (non-cancel) request failure', async () => {
    const err = new Error('boom')
    isCancelMock.mockReturnValue(false)
    mockedGeoAdminGet.mockRejectedValue(err)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mountComponent()
    const searchStore = useSearchStore()
    searchStore.searchQuery = 'Fail'
    await flushPromises()

    await wrapper.find('[data-cy=address-search-input]').trigger('focus')
    await flushPromises()

    expect(errorSpy).toHaveBeenCalledWith('Error fetching addresses:', err)
    errorSpy.mockRestore()
    wrapper.unmount()
  })

  it('does not log when the request was cancelled', async () => {
    const cancelErr = new Error('cancelled')
    isCancelMock.mockReturnValue(true)
    mockedGeoAdminGet.mockRejectedValue(cancelErr)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mountComponent()
    const searchStore = useSearchStore()
    searchStore.searchQuery = 'Cancel'
    await flushPromises()

    await wrapper.find('[data-cy=address-search-input]').trigger('focus')
    await flushPromises()

    expect(errorSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
    wrapper.unmount()
  })

  it('aborts an in-flight request when a new search starts', async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort')
    mockedGeoAdminGet.mockResolvedValue({ data: { results: [] } })

    const wrapper = mountComponent()
    const searchStore = useSearchStore()
    searchStore.searchQuery = 'first'
    await flushPromises()

    await wrapper.find('[data-cy=address-search-input]').trigger('focus')
    await flushPromises()
    await wrapper.find('[data-cy=address-search-input]').trigger('focus')
    await flushPromises()

    expect(abortSpy).toHaveBeenCalled()
    abortSpy.mockRestore()
    wrapper.unmount()
  })
})
