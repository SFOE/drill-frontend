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
  propertyName: string
  propertyValues: LayerPropertyValue[]
  opacity: number
}

export interface CantonWmsConfig {
  name: string
  exampleLocation: (number | string)[][]
  wmsUrl: string
  infoFormat: string
  layers: Layer[]
  harmonyMap: { sum: number; value: number }[]
  legendUrl?: string
}
