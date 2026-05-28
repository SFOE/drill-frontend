import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { backendHttp } from '@/services/http'
import { useSearchStore } from '@/stores/searchStore'
import type { CantonWmsConfig, Coordinates } from '@/types/wms'
import axios from 'axios'

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

// Re-export for backward compatibility
export type { SearchResult } from '@/stores/searchStore'

/**
 * Sends a lightweight request to warm up the Lambda backend.
 * Call this once during app initialization (e.g. in main.ts).
 */
export const wakeUpLambda = () => {
  backendHttp.get('v1/cantons/BE').catch((e) => {
    console.error('Lambda Warmup Error:', e)
  })
}

export const useMapStore = defineStore('map', () => {
  const coordinates = ref<Coordinates | null>(null)
  const wmsConfig = ref<CantonWmsConfig | null>(null)
  const groundCategory = ref<GroundCategory | null>(null)
  const groundCategoryError = ref<boolean>(true)
  const selectedCanton = ref<string | null>(null)

  const loadingGroundCategory = ref(false)

  // AbortController to cancel stale fetchGroundCategory requests
  let groundCategoryAbortController: AbortController | null = null

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
    // Cancel any in-flight request before starting a new one
    if (groundCategoryAbortController) {
      groundCategoryAbortController.abort()
    }
    groundCategoryAbortController = new AbortController()
    const { signal } = groundCategoryAbortController

    loadingGroundCategory.value = true
    try {
      const response = await backendHttp.get(
        `v1/drill-category/${east_coord}/${north_coord}`,
        { signal },
      )
      const data = response.data

      // If not in Switzerland, we need to prevent zooming as no background layer will appear
      if (data.ground_category.harmonized_value === 6) {
        setWmsConfig(null)
        setGroundCategory(data.ground_category)
        setGroundCategoryError(true)
        setSelectedCanton(null)
        setCoordinates({ east_coord, north_coord })
        // External geoservice unavailable — preserve canton identifier for user-facing message
      } else if (data.ground_category.harmonized_value === 98) {
        setWmsConfig(data.canton_config as CantonWmsConfig)
        setGroundCategory(data.ground_category)
        setGroundCategoryError(true)
        setSelectedCanton(data.canton)
        setCoordinates({ east_coord, north_coord })
        // In all other cases, keep same behaviour
      } else {
        setWmsConfig(data.canton_config as CantonWmsConfig)
        setGroundCategory(data.ground_category)
        setGroundCategoryError(false)
        setSelectedCanton(data.canton)
        setCoordinates({ east_coord, north_coord })
      }
    } catch (error) {
      // Ignore aborted requests — a newer request superseded this one
      if (axios.isCancel(error)) return

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
      setCoordinates({ east_coord, north_coord })
    } finally {
      loadingGroundCategory.value = false
    }
  }

  const clearSearchState = () => {
    const searchStore = useSearchStore()
    searchStore.clearSearchState()
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

    loadingGroundCategory,

    fetchGroundCategory,

    clearSearchState,
  }
})
