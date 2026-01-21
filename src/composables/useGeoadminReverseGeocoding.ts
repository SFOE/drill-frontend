import axios from 'axios'
import type { Coordinates } from '@/types/wms'
import { useProjections } from '@/composables/useProjections'

const { to21781 } = useProjections()
const BASE_URL = 'https://api3.geo.admin.ch/rest/services/ech/MapServer/identify'

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
      // Transform coordinates to EPSG:21781
      const { east_coord: east_coord21781, north_coord: north_coord21781 } = to21781({
        east_coord,
        north_coord,
      })

      const params = new URLSearchParams({
        geometryType: 'esriGeometryPoint',
        geometry: `${east_coord21781},${north_coord21781}`,
        imageDisplay: `${mapSize[0]},${mapSize[1]},96`,
        mapExtent: `${extent[0]},${extent[1]},${extent[2]},${extent[3]}`,
        tolerance: '15',
        layers: 'all:ch.bfs.gebaeude_wohnungs_register',
        returnGeometry: 'false',
      })

      const response = await axios.get<GeoAdminResponse>(`${BASE_URL}?${params.toString()}`)
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

      // Prepend translated "address found" key
      return `${addresses.join(' - ')}`
    } catch {
      return null
    }
  }

  return { fetchAddress }
}
