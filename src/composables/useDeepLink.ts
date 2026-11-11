import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMapStore } from '@/stores/mapStore'
import { useSearchStore } from '@/stores/searchStore'
import { useGeoAdmin } from '@/composables/useGeoadminReverseGeocoding'
import type { Coordinates } from '@/types/wms'

// LV95 bounds of the map view (same as viewExtent in MapComponent)
const LV95_EXTENT = { minE: 2480000, minN: 1050000, maxE: 2838000, maxN: 1390000 }

// Half the edge length (in meters) of the extent used for reverse geocoding
const GEOCODE_HALF_EXTENT = 100
const GEOCODE_MAP_SIZE: [number, number] = [400, 400]

const parseNumber = (value: unknown): number | null => {
  if (typeof value !== 'string' || value.trim() === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

/**
 * Reads LV95 coordinates from the query parameters `E` and `N`
 * (for example `?E=2600423&N=1199521`). Returns null when a value is
 * missing, not numeric or outside Switzerland's map extent.
 */
export const parseDeepLinkCoordinates = (query: Record<string, unknown>): Coordinates | null => {
  const east_coord = parseNumber(query.E)
  const north_coord = parseNumber(query.N)
  if (east_coord === null || north_coord === null) return null

  const inExtent =
    east_coord >= LV95_EXTENT.minE &&
    east_coord <= LV95_EXTENT.maxE &&
    north_coord >= LV95_EXTENT.minN &&
    north_coord <= LV95_EXTENT.maxN
  return inExtent ? { east_coord, north_coord } : null
}

/**
 * Checks the point from the URL like a click on the map: loads the ground
 * category, then the address. Runs on load and whenever E or N change.
 */
export const useDeepLink = () => {
  const route = useRoute()
  const mapStore = useMapStore()
  const searchStore = useSearchStore()
  const { fetchAddress } = useGeoAdmin()

  const applyDeepLink = async () => {
    const coords = parseDeepLinkCoordinates(route.query)
    if (!coords) return

    const { east_coord, north_coord } = coords
    mapStore.clearSearchState()
    mapStore.fetchGroundCategory(east_coord, north_coord)

    const address = await fetchAddress(
      coords,
      [
        east_coord - GEOCODE_HALF_EXTENT,
        north_coord - GEOCODE_HALF_EXTENT,
        east_coord + GEOCODE_HALF_EXTENT,
        north_coord + GEOCODE_HALF_EXTENT,
      ],
      GEOCODE_MAP_SIZE,
    )

    searchStore.selectedAddress = address ?? ''
  }

  applyDeepLink()
  // A string key keeps the watcher quiet when only other params (lang) change
  watch(() => `${route.query.E}|${route.query.N}`, applyDeepLink)
}
