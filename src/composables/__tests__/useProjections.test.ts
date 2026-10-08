import { describe, it, expect } from 'vitest'
import { EPSG2056, EPSG21781 } from '@/composables/useProjections'

describe('useProjections', () => {
  it('exports the LV95 (EPSG:2056) proj4 definition', () => {
    expect(EPSG2056).toContain('+proj=somerc')
    // LV95 false easting / northing
    expect(EPSG2056).toContain('+x_0=2600000')
    expect(EPSG2056).toContain('+y_0=1200000')
    expect(EPSG2056).toContain('+ellps=bessel')
  })

  it('exports the LV03 (EPSG:21781) proj4 definition', () => {
    expect(EPSG21781).toContain('+proj=somerc')
    // LV03 false easting / northing
    expect(EPSG21781).toContain('+x_0=600000')
    expect(EPSG21781).toContain('+y_0=200000')
    expect(EPSG21781).toContain('+ellps=bessel')
  })

  it('LV95 and LV03 differ only by the false origin offset', () => {
    expect(EPSG2056).not.toEqual(EPSG21781)
    // Both share the same latitude/longitude of origin
    expect(EPSG2056).toContain('+lat_0=46.95240555555556')
    expect(EPSG21781).toContain('+lat_0=46.95240555555556')
  })
})
