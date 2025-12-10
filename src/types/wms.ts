export interface Coordinates {
  x: number
  y: number
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
}
