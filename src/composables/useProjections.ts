// src/composables/useProjections.ts

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
