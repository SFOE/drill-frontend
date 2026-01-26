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
    north_coord: number
    east_coord: number
    detail: string
    [key: string]: unknown
  }
}

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL

const wakeUpLambda = async () => {
  try {
    axios.get(`${VITE_BACKEND_URL}v1/cantons/BE`)
  } catch (e) {
    console.error('Lambda Warmup Error:', e)
  }
}

wakeUpLambda()

export const useMapStore = defineStore('map', () => {
  const coordinates = ref<Coordinates | null>(null)
  const wmsConfig = ref<CantonWmsConfig | null>(null)
  const groundCategory = ref<GroundCategory | null>(null)
  const groundCategoryError = ref<boolean>(true)
  const selectedCanton = ref<string | null>(null)

  const searchQuery = ref('')
  const selectedAdress = ref('')
  const searchResults = ref<SearchResult[]>([])

  const loadingGroundCategory = ref(false)

  const hasCoordinates = computed(() => coordinates.value !== null)
  const hasWmsConfig = computed(() => wmsConfig.value !== null)
  const hasGroundCategory = computed(() => groundCategory.value !== null)
  const hasSelectedCanton = computed(() => selectedCanton.value !== null)

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

  const setGroundCategoryError = (error: boolean) => {
    groundCategoryError.value = error
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

  const fetchGroundCategory = async (east_coord: number, north_coord: number) => {
    loadingGroundCategory.value = true
    try {
      // Large timeout to accommodate Lambda cold starts, despite having a wake-up call
      const response = await axios.get(
        `${VITE_BACKEND_URL}v1/drill-category/${east_coord}/${north_coord}`,
        {
          timeout: 15000,
        },
      )
      const data = response.data

      console.log(data.ground_category.harmonized_value)

      // If not in Switzerland, we need to prevent zooming as no background layer will appear
      if (data.ground_category.harmonized_value === 6) {
        setWmsConfig(null)
        setGroundCategory(data.ground_category)
        setGroundCategoryError(true)
        setSelectedCanton(null)
        setCoordinates({ east_coord: east_coord, north_coord: north_coord })
      // In all other cases, keep same behaviour
      } else {
        setWmsConfig(data.canton_config as CantonWmsConfig)
        setGroundCategory(data.ground_category)
        setGroundCategoryError(false)
        setSelectedCanton(data.canton)
        setCoordinates({ east_coord: east_coord, north_coord: north_coord })
      }


    } catch (error) {

      // Uncaught backend error
      console.warn('Error fetching ground category:', error)
      const fallbackCategory: GroundCategory = {
        layer_results: [],
        mapping_sum: 0,
        harmonized_value: 99,
        source_values: 'server error',
      }

      setWmsConfig(null)
      setGroundCategory(fallbackCategory)
      setGroundCategoryError(true)
      setSelectedCanton(null)
      setCoordinates({ east_coord: east_coord, north_coord: north_coord })
    } finally {
      loadingGroundCategory.value = false
    }
  }

  const clearSearchState = () => {
    searchQuery.value = ''
    selectedAdress.value = ''
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

    groundCategoryError,
    setGroundCategoryError,

    selectedCanton,
    setSelectedCanton,
    clearSelectedCanton,
    hasSelectedCanton,

    searchQuery,
    selectedAdress,
    searchResults,

    loadingGroundCategory,

    fetchGroundCategory,

    clearSearchState,
  }
})
