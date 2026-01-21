// src/composables/useProjections.ts
import proj4 from 'proj4'

// Updated Coordinates type
export interface Coordinates {
  east_coord: number
  north_coord: number
}

// EPSG:21781 (LV03 / Swiss CH1903)
export const EPSG21781 =
  '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +units=m +no_defs'

// EPSG:2056 (LV95 / Swiss CH1903+)
export const EPSG2056 =
  '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +units=m +no_defs'

export const useProjections = () => {
  /**
   * Convert coordinates from 21781 → 2056
   */
  const to2056 = ({ east_coord, north_coord }: Coordinates) => {
    const [east, north] = proj4(EPSG21781, EPSG2056, [east_coord, north_coord])
    return {
      east_coord: Math.round(east * 10) / 10,
      north_coord: Math.round(north * 10) / 10,
    }
  }

  /**
   * Convert coordinates from 2056 → 21781
   */
  const to21781 = ({ east_coord, north_coord }: Coordinates) => {
    const [east, north] = proj4(EPSG2056, EPSG21781, [east_coord, north_coord])
    return {
      east_coord: Math.round(east * 10) / 10,
      north_coord: Math.round(north * 10) / 10,
    }
  }

  return {
    EPSG21781,
    EPSG2056,
    to2056,
    to21781,
  }
}
