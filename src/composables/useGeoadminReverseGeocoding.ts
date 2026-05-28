import { geoAdminHttp } from '@/services/http'
import type { Coordinates } from '@/types/wms'

// Define types for better TS support
interface GeoAdminResult {
  attributes?: {
    strname?: string[]
    deinr?: string
    dplz4?: string
    dplzname?: string
    [key: string]: unknown
  }
}

interface GeoAdminResponse {
  results?: GeoAdminResult[]
}

export const useGeoAdmin = () => {
  const fetchAddress = async (
    { east_coord, north_coord }: Coordinates,
    extent: [number, number, number, number],
    mapSize: [number, number],
  ): Promise<string | null> => {
    try {
      const response = await geoAdminHttp.get<GeoAdminResponse>(
        '/rest/services/ech/MapServer/identify',
        {
          params: {
            geometryType: 'esriGeometryPoint',
            geometry: `${east_coord},${north_coord}`,
            imageDisplay: `${mapSize[0]},${mapSize[1]},96`,
            mapExtent: `${extent[0]},${extent[1]},${extent[2]},${extent[3]}`,
            tolerance: '15',
            sr: '2056',
            layers: 'all:ch.bfs.gebaeude_wohnungs_register',
            returnGeometry: 'false',
          },
        },
      )
      const data = response.data

      if (!data?.results || data.results.length === 0) {
        return null
      }
      if (data.results.length > 3) {
        return null
      }

      // Aggregate results
      const addresses = data.results
        .map((res) => {
          const attrs = res.attributes
          if (!attrs) return null
          const street = attrs.strname?.[0] || ''
          const number = attrs.deinr || ''
          const zip = attrs.dplz4 || ''
          const city = attrs.dplzname || ''
          return `${street} ${number} ${zip} ${city}`.trim() || null
        })
        .filter(Boolean) as string[]

      if (addresses.length === 0) return null

      return `${addresses.join(' - ')}`
    } catch {
      return null
    }
  }

  return { fetchAddress }
}
