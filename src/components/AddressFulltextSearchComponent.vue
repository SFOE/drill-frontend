<template>
  <h1 class="action-title">{{ t('main_title') }}</h1>
  <section ref="searchContainer" class="form-group search-container">
    <div class="input-wrapper">
      <input
        ref="searchInput"
        type="text"
        class="form-control"
        data-cy="address-search-input"
        v-model="searchStore.searchQuery"
        :placeholder="t('search_placeholder')"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="searchStore.searchResults.length > 0"
        aria-controls="address-listbox"
        :aria-activedescendant="hoverIndex !== null && searchStore.searchResults.length > 0 ? `address-option-${hoverIndex}` : undefined"
        @input="onInput"
        @keydown.enter.prevent="onEnter"
        @focus="onFocus"
      />
      <button type="button" class="clear-btn" @click="clearSearch" aria-label="Clear search">
        <img src="@/assets/images/oblique/xmark.svg" alt="Clear" />
      </button>
    </div>

    <ul
      v-if="searchStore.searchResults.length"
      id="address-listbox"
      role="listbox"
      class="dropdown-menu show"
    >
      <li
        v-for="(result, index) in searchStore.searchResults"
        :id="`address-option-${index}`"
        :key="result.id"
        role="option"
        :aria-selected="hoverIndex === index"
        class="dropdown-item"
        @click="handleSelection(result)"
        @mouseover="hoverIndex = index"
        :class="{ highlighted: hoverIndex === index }"
      >
        {{ stripHtml(result.attrs.label) }}
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMapStore } from '@/stores/mapStore'
import { useSearchStore } from '@/stores/searchStore'
import { stripHtml } from '@/utils/stripHtml'
import { debounce } from '@/utils/debounce'
import { geoAdminHttp } from '@/services/http'
import axios from 'axios'
import type { SearchResult } from '@/stores/searchStore'

const { t } = useI18n()
const mapStore = useMapStore()
const searchStore = useSearchStore()

const hoverIndex = ref<number | null>(null)
const searchContainer = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)

// AbortController to cancel stale address search requests
let searchAbortController: AbortController | null = null

const searchAddresses = async () => {
  const text = searchStore.searchQuery.trim()
  if (!text) {
    searchStore.searchResults = []
    return
  }

  // Cancel any in-flight search before starting a new one
  if (searchAbortController) {
    searchAbortController.abort()
  }
  searchAbortController = new AbortController()

  try {
    const response = await geoAdminHttp.get(
      `/rest/services/api/SearchServer`,
      {
        params: {
          searchText: text,
          type: 'locations',
          limit: 5,
          origins: 'address',
          sr: '2056',
        },
        signal: searchAbortController.signal,
      },
    )
    searchStore.searchResults = response.data.results as SearchResult[]
  } catch (error) {
    if (!axios.isCancel(error)) {
      console.error('Error fetching addresses:', error)
    }
  }
}

const debouncedSearch = debounce(searchAddresses, 300)

const handleSelection = (selected: SearchResult) => {
  const east_coord = Number(selected.attrs.y)
  const north_coord = Number(selected.attrs.x)

  if (east_coord && north_coord) {
    mapStore.setCoordinates({ east_coord: east_coord, north_coord: north_coord })
    mapStore.fetchGroundCategory(east_coord, north_coord)
  }

  const addressText = stripHtml(selected.attrs.label)
  searchStore.searchQuery = addressText
  searchStore.selectedAddress = addressText
  searchStore.searchResults = []
  searchInput.value?.blur()
}

const onInput = () => {
  if (!searchStore.searchQuery.trim()) {
    searchStore.searchResults = []
    mapStore.clearGroundCategory()
    mapStore.clearCoordinates()
    mapStore.clearSelectedCanton()
    mapStore.clearWmsConfig()
    return
  }
  debouncedSearch()
}

const onEnter = () => {
  const firstResult =
    hoverIndex.value !== null ? searchStore.searchResults[hoverIndex.value] : searchStore.searchResults[0]
  if (firstResult) handleSelection(firstResult)
}

const onFocus = () => {
  if (searchStore.searchQuery) searchAddresses()
}

const clearSearch = () => {
  mapStore.clearSearchState()
  if (searchInput.value) {
    searchInput.value.focus()
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target as Node)) {
    searchStore.searchResults = []
    hoverIndex.value = null
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (!searchStore.searchResults.length) return

  if (event.key === 'Escape') {
    searchStore.searchResults = []
    hoverIndex.value = null
  }
  if (event.key === 'ArrowDown') {
    hoverIndex.value =
      hoverIndex.value === null
        ? 0
        : Math.min(hoverIndex.value + 1, searchStore.searchResults.length - 1)
    event.preventDefault()
  }
  if (event.key === 'ArrowUp') {
    hoverIndex.value =
      hoverIndex.value === null
        ? searchStore.searchResults.length - 1
        : Math.max(hoverIndex.value - 1, 0)
    event.preventDefault()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.action-title {
  text-align: center;
  margin-bottom: 3rem;
  margin-top: 3rem;
  font-size: 2rem;
  line-height: 1.2;
}

.search-container {
  position: relative;
  margin: 40px auto;
}

.input-wrapper {
  position: relative;
}

input.form-control {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  font-size: 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  min-height: 50px;
  line-height: 1.4;
  transition: all 0.2s ease-in-out;
  box-shadow: var(--shadow-sm);
}

input.form-control:focus {
  border-color: #a4c3e6;
  outline: none;
  box-shadow: var(--shadow-focus);
}

.clear-btn {
  position: absolute;
  top: 50%;
  right: 4px;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  padding: 12px;
  min-width: 48px;
  min-height: 48px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn img {
  width: 18px;
  height: 18px;
}

.clear-btn:hover img {
  filter: brightness(0) invert(0);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1050;
  display: block;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  max-height: 350px;
  overflow-y: auto;
  padding: 0.25rem 0;
  margin-top: 0.25rem;
}

.dropdown-item {
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: background-color 0.15s;
  font-size: 1.1rem;
}

.dropdown-item.highlighted,
.dropdown-item:hover {
  background-color: #e6f2ff;
}

@media (max-width: 768px) {
  .action-title {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    margin-top: 1rem;
  }

  input.form-control {
    font-size: 1rem;
    min-height: 44px;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
  }

  .dropdown-item {
    font-size: 1rem;
  }

  .search-container {
    margin: 20px auto;
  }
}

@media (max-width: 480px) {
  .action-title {
    font-size: 1.25rem;
  }
}
</style>
