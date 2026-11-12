export interface Coordinates {
  east_coord: number
  north_coord: number
}

export interface LayerPropertyValue {
  name: string
  desc: string
  summand: number
}

export interface Layer {
  name: string
  property_name: string
  property_values: LayerPropertyValue[]
  opacity: number
}

export interface CantonWmsConfig {
  active: boolean
  name: string
  wms_url: string
  query_url: string
  thematic_geoportal_url?: string
  cantonal_energy_service_url?: string
  legend_url?: string
  info_format: string
  bbox_delta: number
  style?: string
  layers: Layer[]
  // WMS GetMap layer names for the overlay. May differ from `layers[].name`
  // (the query identifier) — e.g. WFS cantons whose WMS consolidated layers.
  // When absent, the overlay falls back to `layers[].name`.
  wms_layers?: string[]
}
