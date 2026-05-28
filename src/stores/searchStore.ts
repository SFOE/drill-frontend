import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SearchResult {
  id: string
  attrs: {
    label: string
    north_coord: number
    east_coord: number
    detail: string
    [key: string]: unknown
  }
}

export const useSearchStore = defineStore('search', () => {
  const searchQuery = ref('')
  const selectedAddress = ref('')
  const searchResults = ref<SearchResult[]>([])

  const clearSearchState = () => {
    searchQuery.value = ''
    selectedAddress.value = ''
    searchResults.value = []
  }

  return {
    searchQuery,
    selectedAddress,
    searchResults,
    clearSearchState,
  }
})
