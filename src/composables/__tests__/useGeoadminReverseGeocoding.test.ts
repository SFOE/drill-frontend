import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useGeoAdmin } from '@/composables/useGeoadminReverseGeocoding'

vi.mock('@/services/http', () => ({
  geoAdminHttp: {
    get: vi.fn(),
  },
  backendHttp: {
    get: vi.fn(),
  },
}))

import { geoAdminHttp } from '@/services/http'
const mockedGet = vi.mocked(geoAdminHttp.get)

// Default test parameters
const coords = { east_coord: 2600000, north_coord: 1200000 }
const extent: [number, number, number, number] = [2599000, 1199000, 2601000, 1201000]
const mapSize: [number, number] = [800, 600]

describe('useGeoAdmin - fetchAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when API returns no results', async () => {
    mockedGet.mockResolvedValueOnce({ data: { results: [] } })

    const { fetchAddress } = useGeoAdmin()
    const result = await fetchAddress(coords, extent, mapSize)

    expect(result).toBeNull()
  })

  it('returns null when API returns undefined results', async () => {
    mockedGet.mockResolvedValueOnce({ data: {} })

    const { fetchAddress } = useGeoAdmin()
    const result = await fetchAddress(coords, extent, mapSize)

    expect(result).toBeNull()
  })

  it('returns null when more than 3 results (ambiguous location)', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        results: [
          { attributes: { strname: ['A'], deinr: '1', dplz4: '3000', dplzname: 'Bern' } },
          { attributes: { strname: ['B'], deinr: '2', dplz4: '3000', dplzname: 'Bern' } },
          { attributes: { strname: ['C'], deinr: '3', dplz4: '3000', dplzname: 'Bern' } },
          { attributes: { strname: ['D'], deinr: '4', dplz4: '3000', dplzname: 'Bern' } },
        ],
      },
    })

    const { fetchAddress } = useGeoAdmin()
    const result = await fetchAddress(coords, extent, mapSize)

    expect(result).toBeNull()
  })

  it('formats a single address correctly', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        results: [
          {
            attributes: {
              strname: ['Bahnhofstrasse'],
              deinr: '1',
              dplz4: '3000',
              dplzname: 'Bern',
            },
          },
        ],
      },
    })

    const { fetchAddress } = useGeoAdmin()
    const result = await fetchAddress(coords, extent, mapSize)

    expect(result).toBe('Bahnhofstrasse 1 3000 Bern')
  })

  it('joins multiple addresses with a dash separator', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        results: [
          {
            attributes: {
              strname: ['Hauptstrasse'],
              deinr: '10',
              dplz4: '3000',
              dplzname: 'Bern',
            },
          },
          {
            attributes: {
              strname: ['Nebenstrasse'],
              deinr: '5',
              dplz4: '3001',
              dplzname: 'Bern',
            },
          },
        ],
      },
    })

    const { fetchAddress } = useGeoAdmin()
    const result = await fetchAddress(coords, extent, mapSize)

    expect(result).toBe('Hauptstrasse 10 3000 Bern - Nebenstrasse 5 3001 Bern')
  })

  it('handles missing attributes gracefully (skips empty entries)', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        results: [
          { attributes: undefined },
          {
            attributes: {
              strname: ['Testweg'],
              deinr: '7',
              dplz4: '8000',
              dplzname: 'Zürich',
            },
          },
        ],
      },
    })

    const { fetchAddress } = useGeoAdmin()
    const result = await fetchAddress(coords, extent, mapSize)

    expect(result).toBe('Testweg 7 8000 Zürich')
  })

  it('handles partially missing fields in attributes', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        results: [
          {
            attributes: {
              strname: ['Kirchgasse'],
              // deinr missing
              dplz4: '4000',
              dplzname: 'Basel',
            },
          },
        ],
      },
    })

    const { fetchAddress } = useGeoAdmin()
    const result = await fetchAddress(coords, extent, mapSize)

    expect(result).toBe('Kirchgasse  4000 Basel')
  })

  it('returns null when all results have empty attributes', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        results: [{ attributes: {} }, { attributes: {} }],
      },
    })

    const { fetchAddress } = useGeoAdmin()
    const result = await fetchAddress(coords, extent, mapSize)

    // Attributes exist but produce empty strings → trim() → empty → filtered out
    expect(result).toBeNull()
  })

  it('returns null on network error', async () => {
    mockedGet.mockRejectedValueOnce(new Error('Network error'))

    const { fetchAddress } = useGeoAdmin()
    const result = await fetchAddress(coords, extent, mapSize)

    expect(result).toBeNull()
  })

  it('passes correct parameters to the API', async () => {
    mockedGet.mockResolvedValueOnce({ data: { results: [] } })

    const { fetchAddress } = useGeoAdmin()
    await fetchAddress(
      { east_coord: 2683141, north_coord: 1247500 },
      [2682000, 1246000, 2684000, 1249000],
      [1024, 768],
    )

    expect(mockedGet).toHaveBeenCalledWith('/rest/services/ech/MapServer/identify', {
      params: {
        geometryType: 'esriGeometryPoint',
        geometry: '2683141,1247500',
        imageDisplay: '1024,768,96',
        mapExtent: '2682000,1246000,2684000,1249000',
        tolerance: '15',
        sr: '2056',
        layers: 'all:ch.bfs.gebaeude_wohnungs_register',
        returnGeometry: 'false',
      },
    })
  })
})
