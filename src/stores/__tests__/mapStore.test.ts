import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import fc from 'fast-check'
import axios from 'axios'
import { useMapStore } from '@/stores/mapStore'

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

const mockedAxiosGet = vi.mocked(axios.get)

// All 26 Swiss cantons
const SWISS_CANTONS = [
  'AG',
  'AI',
  'AR',
  'BE',
  'BL',
  'BS',
  'FR',
  'GE',
  'GL',
  'GR',
  'JU',
  'LU',
  'NE',
  'NW',
  'OW',
  'SG',
  'SH',
  'SO',
  'SZ',
  'TG',
  'TI',
  'UR',
  'VD',
  'VS',
  'ZG',
  'ZH',
]

// Arbitrary for valid Swiss LV95 coordinates
const swissEastCoord = fc.integer({ min: 2485000, max: 2834000 })
const swissNorthCoord = fc.integer({ min: 1075000, max: 1296000 })
const swissCanton = fc.constantFrom(...SWISS_CANTONS)

describe('Bug Condition Exploration: External Geoservice Failure', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  /**
   * **Validates: Requirements 1.1, 1.2, 1.3**
   *
   * Property 1: Bug Condition - External Geoservice Failure Produces Generic Application Error
   *
   * For all cantons and valid Swiss coordinates, when the external geoservice fails
   * (backend returns HTTP 502), fetchGroundCategory should set:
   * - groundCategory.harmonized_value to 98 (not 99)
   * - selectedCanton to the canton identifier (not null)
   * - groundCategoryError to true
   *
   * EXPECTED: This test PASSES on fixed code because the backend now returns
   * HTTP 200 with harmonized_value=98 and the frontend handles it in the success path.
   */
  it('should set harmonized_value=98 and preserve canton when geoservice fails (502)', async () => {
    await fc.assert(
      fc.asyncProperty(
        swissCanton,
        swissEastCoord,
        swissNorthCoord,
        async (canton, east, north) => {
          // Fresh pinia for each iteration (setup stores don't support $reset)
          setActivePinia(createPinia())
          vi.clearAllMocks()

          const mapStore = useMapStore()

          // Mock axios.get to return HTTP 200 with harmonized_value=98
          // (simulating NEW backend behavior: structured response for geoservice failure)
          const cantonConfig = {
            active: true,
            name: canton,
            cantonal_energy_service_url: `https://example.com/${canton.toLowerCase()}`,
            wms_url: `https://wms.${canton.toLowerCase()}.example.com`,
            query_url: `https://query.${canton.toLowerCase()}.example.com`,
            info_format: 'application/json',
            bbox_delta: 0.01,
            layers: [],
          }
          mockedAxiosGet.mockResolvedValueOnce({
            data: {
              ground_category: {
                layer_results: [],
                harmonized_value: 98,
                source_values: 'geoservice unavailable',
              },
              canton: canton,
              canton_config: cantonConfig,
            },
          })

          // Call fetchGroundCategory
          await mapStore.fetchGroundCategory(east, north)

          // Assert: harmonized_value should be 98 (geoservice failure), not 99 (app error)
          expect(mapStore.groundCategory?.harmonized_value).toBe(98)

          // Assert: selectedCanton should be preserved (not null)
          expect(mapStore.selectedCanton).not.toBeNull()
          expect(mapStore.selectedCanton).toBe(canton)

          // Assert: groundCategoryError should be true
          expect(mapStore.groundCategoryError).toBe(true)

          // Assert: wmsConfig is preserved (contains cantonal_energy_service_url for the link)
          expect(mapStore.wmsConfig).not.toBeNull()
        },
      ),
      { numRuns: 50 },
    )
  })
})

// ============================================================================
// Preservation Property Tests (Task 2)
// These tests verify that existing behavior is unchanged on UNFIXED code.
// They must PASS on the current codebase.
// ============================================================================

// Helper: create a fixed canton config for deterministic comparison
const makeCantonConfig = (canton: string) => ({
  active: true,
  name: canton,
  wms_url: `https://wms.${canton.toLowerCase()}.example.com`,
  query_url: `https://query.${canton.toLowerCase()}.example.com`,
  info_format: 'application/json',
  bbox_delta: 0.01,
  layers: [],
})

// Helper: create a ground category response
const makeGroundCategory = (harmonizedValue: number) => ({
  layer_results: [],
  mapping_sum: harmonizedValue * 10,
  harmonized_value: harmonizedValue,
  source_values: `value_${harmonizedValue}`,
})

describe('Preservation: Successful responses (harmonized_value 1-5)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * **Validates: Requirements 3.2, 3.4**
   *
   * Property 2a: Preservation - Successful Geoservice Responses
   *
   * For all harmonized_value in {1, 2, 3, 4, 5} with arbitrary canton and valid
   * Swiss coordinates, the store sets:
   * - wmsConfig from data.canton_config
   * - groundCategory from data.ground_category
   * - groundCategoryError = false
   * - selectedCanton from data.canton
   * - coordinates from the input
   */
  it('should set wmsConfig, groundCategory, selectedCanton, and coordinates for harmonized_value 1-5', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(1, 2, 3, 4, 5),
        swissCanton,
        swissEastCoord,
        swissNorthCoord,
        async (harmonizedValue, canton, east, north) => {
          // Fresh pinia for each iteration (setup stores don't support $reset)
          setActivePinia(createPinia())
          vi.clearAllMocks()

          const mapStore = useMapStore()
          const cantonConfig = makeCantonConfig(canton)
          const gc = makeGroundCategory(harmonizedValue)

          mockedAxiosGet.mockResolvedValueOnce({
            data: {
              ground_category: gc,
              canton: canton,
              canton_config: cantonConfig,
            },
          })

          await mapStore.fetchGroundCategory(east, north)

          // wmsConfig is set from data.canton_config
          expect(mapStore.wmsConfig).toEqual(cantonConfig)

          // groundCategory is set from data.ground_category
          expect(mapStore.groundCategory).toEqual(gc)

          // groundCategoryError is false for successful responses
          expect(mapStore.groundCategoryError).toBe(false)

          // selectedCanton is set from data.canton
          expect(mapStore.selectedCanton).toBe(canton)

          // coordinates are set from input
          expect(mapStore.coordinates).toEqual({
            east_coord: east,
            north_coord: north,
          })
        },
      ),
      { numRuns: 50 },
    )
  })
})

describe('Preservation: Not in Switzerland (harmonized_value = 6)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * **Validates: Requirements 3.3**
   *
   * Property 2b: Preservation - Not in Switzerland
   *
   * For all coordinates with harmonized_value = 6, the store:
   * - clears wmsConfig (null)
   * - clears selectedCanton (null)
   * - sets groundCategoryError = true
   * - sets coordinates from input
   */
  it('should clear wmsConfig and selectedCanton for harmonized_value = 6', async () => {
    await fc.assert(
      fc.asyncProperty(swissEastCoord, swissNorthCoord, async (east, north) => {
        setActivePinia(createPinia())
        vi.clearAllMocks()

        const mapStore = useMapStore()
        const gc = makeGroundCategory(6)

        mockedAxiosGet.mockResolvedValueOnce({
          data: {
            ground_category: gc,
            canton: null,
            canton_config: null,
          },
        })

        await mapStore.fetchGroundCategory(east, north)

        // wmsConfig is cleared
        expect(mapStore.wmsConfig).toBeNull()

        // selectedCanton is cleared
        expect(mapStore.selectedCanton).toBeNull()

        // groundCategoryError is true
        expect(mapStore.groundCategoryError).toBe(true)

        // groundCategory is set from response
        expect(mapStore.groundCategory).toEqual(gc)

        // coordinates are set from input
        expect(mapStore.coordinates).toEqual({
          east_coord: east,
          north_coord: north,
        })
      }),
      { numRuns: 50 },
    )
  })
})

describe('Preservation: Genuine network errors (frontend-to-backend failures)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * **Validates: Requirements 3.1, 3.5**
   *
   * Property 2c: Preservation - Genuine Network Errors
   *
   * For all network errors (timeout, connection refused, no response from backend),
   * the store produces the harmonized_value = 99 fallback:
   * - harmonized_value = 99
   * - source_values = 'server error'
   * - wmsConfig = null
   * - selectedCanton = null
   * - groundCategoryError = true
   */
  it('should produce harmonized_value=99 fallback for genuine network errors', async () => {
    // Different types of frontend-to-backend network failures
    const networkErrors = fc.constantFrom(
      // Timeout error (no response received)
      {
        isAxiosError: true,
        response: undefined,
        code: 'ECONNABORTED',
        message: 'timeout of 15000ms exceeded',
      },
      // Connection refused (backend unreachable)
      {
        isAxiosError: true,
        response: undefined,
        code: 'ECONNREFUSED',
        message: 'connect ECONNREFUSED 127.0.0.1:8000',
      },
      // Network error (no internet)
      {
        isAxiosError: true,
        response: undefined,
        code: 'ERR_NETWORK',
        message: 'Network Error',
      },
      // Generic error (non-axios)
      new Error('Unexpected error'),
    )

    await fc.assert(
      fc.asyncProperty(
        networkErrors,
        swissEastCoord,
        swissNorthCoord,
        async (networkError, east, north) => {
          setActivePinia(createPinia())
          vi.clearAllMocks()

          const mapStore = useMapStore()

          mockedAxiosGet.mockRejectedValueOnce(networkError)

          await mapStore.fetchGroundCategory(east, north)

          // harmonized_value is 99 for genuine network errors
          expect(mapStore.groundCategory?.harmonized_value).toBe(99)

          // source_values is 'server error'
          expect(mapStore.groundCategory?.source_values).toBe('server error')

          // wmsConfig is cleared
          expect(mapStore.wmsConfig).toBeNull()

          // selectedCanton is cleared
          expect(mapStore.selectedCanton).toBeNull()

          // groundCategoryError is true
          expect(mapStore.groundCategoryError).toBe(true)

          // coordinates are still set from input
          expect(mapStore.coordinates).toEqual({
            east_coord: east,
            north_coord: north,
          })
        },
      ),
      { numRuns: 50 },
    )
  })
})
