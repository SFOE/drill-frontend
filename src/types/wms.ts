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
  name: string
  wms_url: string
  info_format: string
  layers: Layer[]
  legend_url?: string
  thematic_geoportal_url?: string
}
