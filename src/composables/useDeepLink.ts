import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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

/**
 * Format a coordinate for the query string: integer part as-is, fraction
 * trimmed to at most six digits (and trailing zeros removed). The result
 * always satisfies LV95_COORDINATE_PATTERN, so a URL we write round-trips
 * through parseCoordinate without loss of validity.
 */
function formatCoordinate(value: number): string {
  // toFixed(6) then strip trailing zeros and a dangling dot.
  return value
    .toFixed(6)
    .replace(/0+$/, '')
    .replace(/\.$/, '')
}

/** True when two coordinate pairs are equal once formatted for the URL. */
function sameCoordinates(a: Coordinates | null, b: Coordinates | null): boolean {
  if (a === null || b === null) return a === b
  return (
    formatCoordinate(a.east_coord) === formatCoordinate(b.east_coord) &&
    formatCoordinate(a.north_coord) === formatCoordinate(b.north_coord)
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
  const router = useRouter()
  const mapStore = useMapStore()
  const searchStore = useSearchStore()
  const { fetchAddress } = useGeoAdmin()

  let latestRequest = 0

  // The coordinates currently reflected in the URL. Used to break the
  // read <-> write feedback loop: the URL writer skips when the store already
  // matches the URL, and the URL reader skips re-applying coordinates it wrote.
  let urlCoordinates: Coordinates | null = parseDeepLinkCoordinates(route.query)

  async function applyDeepLink(): Promise<void> {
    const coords = parseDeepLinkCoordinates(route.query)
    if (!coords) return

    // Ignore URL changes that merely echo the store (i.e. that we just wrote).
    if (sameCoordinates(coords, mapStore.coordinates)) {
      urlCoordinates = coords
      return
    }

    urlCoordinates = coords
    const request = ++latestRequest
    mapStore.clearSearchState()
    mapStore.fetchGroundCategory(coords.east_coord, coords.north_coord)

    const address = await fetchAddress(coords, geocodeExtent(coords), GEOCODE_MAP_SIZE)

    // A newer deep link started meanwhile: drop this stale answer
    if (request !== latestRequest) return
    searchStore.selectedAddress = address ?? ''
  }

  // Mirror the active location into the URL (?E=...&N=...) so it can be shared
  // or reloaded. `replace` avoids filling the browser history on every click,
  // and `lang` (plus any other params) is preserved.
  function writeUrl(coords: Coordinates | null): void {
    if (sameCoordinates(coords, urlCoordinates)) return

    const query = { ...route.query }
    if (coords && isInExtent(coords)) {
      query.E = formatCoordinate(coords.east_coord)
      query.N = formatCoordinate(coords.north_coord)
    } else {
      delete query.E
      delete query.N
    }
    urlCoordinates = coords
    // Fire-and-forget; a redundant navigation rejection is not actionable.
    void router.replace({ query })
  }

  applyDeepLink()
  // A string key keeps the watcher quiet when only other params (lang) change
  watch(() => `${route.query.E}|${route.query.N}`, applyDeepLink)
  // Keep the URL in sync whenever the location changes (map click, address
  // search, or clearing the search).
  watch(() => mapStore.coordinates, writeUrl)
}
