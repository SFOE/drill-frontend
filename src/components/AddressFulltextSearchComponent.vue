<template>
  <h1 class="action-title">{{ t('mainTitle') }}</h1>
  <section ref="searchContainer" class="form-group search-container">
    <div class="input-wrapper">
      <input
        ref="searchInput"
        type="text"
        class="form-control"
        v-model="searchQuery"
        :placeholder="t('search_placeholder')"
        @input="onInput"
        @keydown.enter.prevent="onEnter"
        @focus="onFocus"
        @blur="onBlur"
      />
      <button type="button" class="clear-btn" @click="clearSearch" aria-label="Clear search">
        <img src="@/assets/images/oblique/xmark.svg" alt="Clear" />
      </button>
    </div>

    <ul v-if="searchResults.length" class="dropdown-menu show">
      <li
        v-for="(result, index) in searchResults"
        :key="result.id"
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
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import { useMapStore } from '../stores/mapStore'

const { t } = useI18n()
const mapStore = useMapStore()

interface SearchResult {
  id: string
  attrs: {
    label: string
    x: number
    y: number
    detail: string
    [key: string]: unknown
  }
}

const searchResults = ref<SearchResult[]>([])
const searchQuery = ref('')
const searchContainer = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const hoverIndex = ref<number | null>(null)

const stripHtml = (html: string) => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

const searchAddresses = async () => {
  const text = searchQuery.value.trim()
  if (!text) {
    searchResults.value = []
    return
  }
  try {
    const response = await axios.get(
      `https://api3.geo.admin.ch/rest/services/api/SearchServer?searchText=${encodeURIComponent(
        text,
      )}&type=locations&limit=5&origins=address`,
    )
    searchResults.value = response.data.results as SearchResult[]
  } catch (error) {
    console.error('Error fetching addresses:', error)
  }
}

const handleSelection = (selected: SearchResult) => {
  // convert to EPSG: 2056
  const x = selected.attrs.x + 1000000
  const y = selected.attrs.y + 2000000

  if (x && y) {
    mapStore.setCoordinates({ x, y })
    mapStore.fetchGroundCategory(x, y)
  }

  searchQuery.value = stripHtml(selected.attrs.label)
  searchResults.value = []
  searchInput.value?.blur()
}

const onInput = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    mapStore.clearGroundCategory()
    mapStore.clearCoordinates()
    mapStore.clearSelectedCanton()
    mapStore.clearWmsConfig()
    return
  }
  searchAddresses()
}

const onEnter = () => {
  const firstResult =
    hoverIndex.value !== null ? searchResults.value[hoverIndex.value] : searchResults.value[0]
  if (firstResult) handleSelection(firstResult)
}

const onFocus = () => {
  if (searchQuery.value) searchAddresses()
}

const onBlur = () => {}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  searchInput.value?.focus()

  mapStore.clearGroundCategory()
  mapStore.clearCoordinates()
  mapStore.clearSelectedCanton()
  mapStore.clearWmsConfig()
}

const handleClickOutside = (event: MouseEvent) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target as Node)) {
    searchResults.value = []
    hoverIndex.value = null
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (!searchResults.value.length) return

  if (event.key === 'Escape') {
    searchResults.value = []
    hoverIndex.value = null
  }
  if (event.key === 'ArrowDown') {
    hoverIndex.value =
      hoverIndex.value === null ? 0 : Math.min(hoverIndex.value + 1, searchResults.value.length - 1)
    event.preventDefault()
  }
  if (event.key === 'ArrowUp') {
    hoverIndex.value =
      hoverIndex.value === null ? searchResults.value.length - 1 : Math.max(hoverIndex.value - 1, 0)
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
  margin-bottom: 2rem;
}

.search-container {
  position: relative;
  max-width: 800px;
  margin: 50px auto;
}

.input-wrapper {
  position: relative;
}

input.form-control {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  font-size: 1.2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  min-height: 50px;
  line-height: 1.4;
  box-sizing: border-box;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
}

input.form-control:focus {
  border-color: #a4c3e6;
  outline: none;
  box-shadow: 0 3px 12px rgba(0, 123, 255, 0.25);
}

.clear-btn {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  padding: 0;
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
  filter: brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg)
    brightness(0) contrast(100%);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1050;
  display: block;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.1);
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
</style>
