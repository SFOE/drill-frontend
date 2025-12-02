import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
}

export const useMapStore = defineStore('map', () => {
  // --- Reactive state ---
  const coordinates = ref<Coordinates | null>(null)
  const wmsConfig = ref<CantonWmsConfig | null>(null)
  const groundCategory = ref<GroundCategory | null>(null)
  const selectedCanton = ref<string | null>(null)

  // --- Computed convenience flags ---
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
  }
})
