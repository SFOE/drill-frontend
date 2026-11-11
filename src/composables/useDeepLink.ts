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

/**
 * Strict shape of an LV95 coordinate in the query string: exactly seven
 * integer digits and an optional fraction of up to six digits.
 *
 * Deliberately stricter than `Number()`, which also accepts hexadecimal
 * (`0x27AD44`), octal (`0o11721503`), exponential (`2.600423e6`), a leading
 * `+`/`-` and surrounding whitespace. Those all coerce to in-extent values and
 * would silently widen the accepted input far beyond the documented format.
 * The parsed value is interpolated into a backend URL path
 * (`v1/drill-category/<E>/<N>`), so the accepted character set is pinned to
 * digits and a single dot here, at the trust boundary.
 *
 * Anchored with no nested quantifiers or alternation, so matching is linear
 * and cannot backtrack (no ReDoS).
 *
 * Every coordinate inside LV95_EXTENT has a seven-digit integer part
 * (E 2480000-2838000, N 1050000-1390000), so `\d{7}` loses no valid input.
 */
const LV95_COORDINATE_PATTERN = /^\d{7}(?:\.\d{1,6})?$/

function parseCoordinate(value: unknown): number | null {
  if (typeof value !== 'string') return null
  if (!LV95_COORDINATE_PATTERN.test(value)) return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function isInExtent({ east_coord, north_coord }: Coordinates): boolean {
  return (
    east_coord >= LV95_EXTENT.minE &&
    east_coord <= LV95_EXTENT.maxE &&
    north_coord >= LV95_EXTENT.minN &&
    north_coord <= LV95_EXTENT.maxN
  )
}

function geocodeExtent({ east_coord, north_coord }: Coordinates): [number, number, number, number] {
  return [
    east_coord - GEOCODE_HALF_EXTENT,
    north_coord - GEOCODE_HALF_EXTENT,
    east_coord + GEOCODE_HALF_EXTENT,
    north_coord + GEOCODE_HALF_EXTENT,
  ]
}

/**
 * Reads LV95 coordinates from the query parameters `E` and `N`
 * (for example `?E=2600423&N=1199521`). Returns null when a value is missing,
 * repeated (vue-router yields an array), not a plain decimal number in the
 * documented format, or outside Switzerland's map extent.
 */
export function parseDeepLinkCoordinates(query: Record<string, unknown>): Coordinates | null {
  const east_coord = parseCoordinate(query.E)
  const north_coord = parseCoordinate(query.N)
  if (east_coord === null || north_coord === null) return null

  const coords = { east_coord, north_coord }
  return isInExtent(coords) ? coords : null
}

/**
 * Checks the point from the URL like a click on the map: loads the ground
 * category, then the address. Runs on load and whenever E or N change.
 */
export function useDeepLink(): void {
  const route = useRoute()
  const mapStore = useMapStore()
  const searchStore = useSearchStore()
  const { fetchAddress } = useGeoAdmin()

  let latestRequest = 0

  async function applyDeepLink(): Promise<void> {
    const coords = parseDeepLinkCoordinates(route.query)
    if (!coords) return

    const request = ++latestRequest
    mapStore.clearSearchState()
    mapStore.fetchGroundCategory(coords.east_coord, coords.north_coord)

    const address = await fetchAddress(coords, geocodeExtent(coords), GEOCODE_MAP_SIZE)

    // A newer deep link started meanwhile: drop this stale answer
    if (request !== latestRequest) return
    searchStore.selectedAddress = address ?? ''
  }

  applyDeepLink()
  // A string key keeps the watcher quiet when only other params (lang) change
  watch(() => `${route.query.E}|${route.query.N}`, applyDeepLink)
}
