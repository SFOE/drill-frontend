import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import type { CantonWmsConfig, Coordinates } from '@/types/wms'

export interface GroundCategory {
  layer_results: Array<{
    layer: string
    propertyName: string
    value: string
    description: string | null
  }>
  mapping_sum: number
  harmonized_value: number
  source_values: string
}

export interface SearchResult {
  id: string
  attrs: {
    label: string
    x: number
    y: number
    detail: string
    [key: string]: unknown
  }
}

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL


const wakeUpLambda = async () => {
  try {
    axios.get(`${VITE_BACKEND_URL}v1/cantons/BE`);
  } catch (e) {
    console.error("Lambda Warmup Error:", e);
  }
};

wakeUpLambda();

export const useMapStore = defineStore('map', () => {
  const coordinates = ref<Coordinates | null>(null)
  const wmsConfig = ref<CantonWmsConfig | null>(null)
  const groundCategory = ref<GroundCategory | null>(null)
  const selectedCanton = ref<string | null>(null)

  // Change the type of searchResults from string[] to SearchResult[]
  const searchQuery = ref('')
  const searchResults = ref<SearchResult[]>([])

  const loadingGroundCategory = ref(false)

  const hasCoordinates = computed(() => coordinates.value !== null)
  const hasWmsConfig = computed(() => wmsConfig.value !== null)
  const hasGroundCategory = computed(() => groundCategory.value !== null)
  const hasSelectedCanton = computed(() => selectedCanton.value !== null)

  // --- Setters ---
  const setCoordinates = (coords: Coordinates) => {
    coordinates.value = coords
  }
  const clearCoordinates = () => {
    coordinates.value = null
  }

  const setWmsConfig = (config: CantonWmsConfig | null) => {
    wmsConfig.value = config
  }
  const clearWmsConfig = () => {
    wmsConfig.value = null
  }

  const setGroundCategory = (category: GroundCategory | null) => {
    groundCategory.value = category
  }
  const clearGroundCategory = () => {
    groundCategory.value = null
  }

  const setSelectedCanton = (canton: string | null) => {
    selectedCanton.value = canton
  }
  const clearSelectedCanton = () => {
    selectedCanton.value = null
  }

  const fetchGroundCategory = async (x: number, y: number) => {
    loadingGroundCategory.value = true
    try {
      const response = await axios.get(`${VITE_BACKEND_URL}v1/drill-category/${y}/${x}`)
      const data = response.data

      if (data?.status !== 'success') {
        console.warn('Backend did not return success for coordinates')
        setWmsConfig(null)
        setGroundCategory(null)
        setSelectedCanton(null)
        return
      }

      setWmsConfig(data.canton_config as CantonWmsConfig)
      setGroundCategory(data.ground_category)
      setSelectedCanton(data.canton)
      setCoordinates({ x, y })
    } catch (error) {
      console.error('Error fetching ground category:', error)
      setWmsConfig(null)
      setGroundCategory(null)
      setSelectedCanton(null)
    } finally {
      loadingGroundCategory.value = false
    }
  }

  // --- New Method to Clear Search State ---
  const clearSearchState = () => {
    searchQuery.value = ''
    searchResults.value = []
    clearCoordinates()
    clearGroundCategory()
    clearSelectedCanton()
    clearWmsConfig()
  }

  return {
    coordinates,
    setCoordinates,
    clearCoordinates,
    hasCoordinates,

    wmsConfig,
    setWmsConfig,
    clearWmsConfig,
    hasWmsConfig,

    groundCategory,
    setGroundCategory,
    clearGroundCategory,
    hasGroundCategory,

    selectedCanton,
    setSelectedCanton,
    clearSelectedCanton,
    hasSelectedCanton,

    searchQuery,
    searchResults,

    loadingGroundCategory,

    fetchGroundCategory,

    clearSearchState,
  }
})
