import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSearchStore } from '@/stores/searchStore'

describe('searchStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty state', () => {
    const store = useSearchStore()
    expect(store.searchQuery).toBe('')
    expect(store.selectedAddress).toBe('')
    expect(store.searchResults).toEqual([])
  })

  it('allows setting searchQuery', () => {
    const store = useSearchStore()
    store.searchQuery = 'Bahnhofstrasse 1'
    expect(store.searchQuery).toBe('Bahnhofstrasse 1')
  })

  it('allows setting selectedAddress', () => {
    const store = useSearchStore()
    store.selectedAddress = 'Ittigenstrasse 13 3063 Ittigen'
    expect(store.selectedAddress).toBe('Ittigenstrasse 13 3063 Ittigen')
  })

  it('allows setting searchResults', () => {
    const store = useSearchStore()
    const results = [
      {
        id: '123',
        attrs: {
          label: 'Test Address',
          north_coord: 1200000,
          east_coord: 2600000,
          detail: 'detail info',
        },
      },
    ]
    store.searchResults = results
    expect(store.searchResults).toEqual(results)
    expect(store.searchResults).toHaveLength(1)
  })

  it('clearSearchState resets all fields to initial values', () => {
    const store = useSearchStore()

    // Populate state
    store.searchQuery = 'some query'
    store.selectedAddress = 'Some Address 123'
    store.searchResults = [
      {
        id: '1',
        attrs: {
          label: 'Result 1',
          north_coord: 1200000,
          east_coord: 2600000,
          detail: '',
        },
      },
      {
        id: '2',
        attrs: {
          label: 'Result 2',
          north_coord: 1200100,
          east_coord: 2600100,
          detail: '',
        },
      },
    ]

    // Clear
    store.clearSearchState()

    // Assert all reset
    expect(store.searchQuery).toBe('')
    expect(store.selectedAddress).toBe('')
    expect(store.searchResults).toEqual([])
  })

  it('clearSearchState is idempotent on empty state', () => {
    const store = useSearchStore()
    store.clearSearchState()

    expect(store.searchQuery).toBe('')
    expect(store.selectedAddress).toBe('')
    expect(store.searchResults).toEqual([])
  })
})
