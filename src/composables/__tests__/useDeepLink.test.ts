import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { parseDeepLinkCoordinates, useDeepLink } from '@/composables/useDeepLink'
import { useMapStore } from '@/stores/mapStore'
import { useSearchStore } from '@/stores/searchStore'

const { fetchAddressMock } = vi.hoisted(() => ({ fetchAddressMock: vi.fn() }))

vi.mock('@/composables/useGeoadminReverseGeocoding', () => ({
  useGeoAdmin: () => ({ fetchAddress: fetchAddressMock }),
}))

describe('parseDeepLinkCoordinates', () => {
  it('parses valid LV95 coordinates', () => {
    expect(parseDeepLinkCoordinates({ E: '2600423', N: '1199521' })).toEqual({
      east_coord: 2600423,
      north_coord: 1199521,
    })
  })

  it('accepts decimal coordinates', () => {
    expect(parseDeepLinkCoordinates({ E: '2600423.5', N: '1199521.25' })).toEqual({
      east_coord: 2600423.5,
      north_coord: 1199521.25,
    })
  })

  it.each([
    [{}],
    [{ E: '2600423' }],
    [{ N: '1199521' }],
    [{ E: '', N: '' }],
    [{ E: 'abc', N: '1199521' }],
    [{ E: '2600423', N: 'Infinity' }],
    [{ E: ['2600423', '2600424'], N: '1199521' }],
    [{ E: '0', N: '0' }],
    [{ E: '600000', N: '200000' }], // LV03 values are out of range
    [{ E: '2600423', N: '5000000' }],
  ])('returns null for invalid input %j', (query) => {
    expect(parseDeepLinkCoordinates(query)).toBeNull()
  })

  // The parsed value is interpolated into the backend URL path
  // (v1/drill-category/<E>/<N>), so only plain decimal digits may pass.
  it.each([
    // Alternative numeric bases that Number() would coerce into the extent
    [{ E: '0x27AD44', N: '1199521' }],
    [{ E: '2600423', N: '0x124F61' }],
    [{ E: '0o11721503', N: '1199521' }],
    [{ E: '0b1001111010110101000100', N: '1199521' }],
    // Exponential notation
    [{ E: '2.600423e6', N: '1199521' }],
    [{ E: '2600423', N: '1.199521E6' }],
    // Surrounding or embedded whitespace
    [{ E: '  2600423  ', N: '1199521' }],
    [{ E: '\n2600423\t', N: '1199521' }],
    [{ E: '2600423', N: ' 1199521' }],
    // Explicit sign
    [{ E: '+2600423', N: '1199521' }],
    [{ E: '-2600423', N: '1199521' }],
    // Path traversal / separator injection attempts
    [{ E: '2600423/../../admin', N: '1199521' }],
    [{ E: '2600423/1199521', N: '1199521' }],
    [{ E: '2600423%2F..%2F', N: '1199521' }],
    [{ E: '../2600423', N: '1199521' }],
    // Query and fragment injection attempts
    [{ E: '2600423?foo=bar', N: '1199521' }],
    [{ E: '2600423&x=1', N: '1199521' }],
    [{ E: '2600423#frag', N: '1199521' }],
    // Script / template payloads
    [{ E: '<script>alert(1)</script>', N: '1199521' }],
    [{ E: '2600423<img src=x onerror=alert(1)>', N: '1199521' }],
    [{ E: "2600423'||'1", N: '1199521' }],
    // Null byte and CRLF header injection attempts
    [{ E: '2600423\u0000', N: '1199521' }],
    [{ E: '2600423\r\nX-Injected: 1', N: '1199521' }],
    // Malformed decimals
    [{ E: '2600423.', N: '1199521' }],
    [{ E: '.2600423', N: '1199521' }],
    [{ E: '2600423.1234567', N: '1199521' }], // more than six fraction digits
    [{ E: '26004230', N: '1199521' }], // eight integer digits
    [{ E: '260042', N: '1199521' }], // six integer digits
  ])('rejects non-plain-decimal input %j', (query) => {
    expect(parseDeepLinkCoordinates(query)).toBeNull()
  })

  it('only ever yields values safe for the backend URL path', () => {
    const coords = parseDeepLinkCoordinates({ E: '2600423.5', N: '1199521.25' })
    expect(coords).not.toBeNull()
    const path = `v1/drill-category/${coords!.east_coord}/${coords!.north_coord}`
    expect(path).toBe('v1/drill-category/2600423.5/1199521.25')
    expect(path).toMatch(/^v1\/drill-category\/\d+(\.\d+)?\/\d+(\.\d+)?$/)
  })
})

describe('useDeepLink', () => {
  const Host = defineComponent({
    setup() {
      useDeepLink()
      return () => h('div')
    },
  })

  beforeEach(() => {
    fetchAddressMock.mockReset()
    fetchAddressMock.mockResolvedValue('Musterstrasse 1 3000 Bern')
  })

  const mountAt = async (path: string) => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const mapStore = useMapStore()
    const fetchSpy = vi.spyOn(mapStore, 'fetchGroundCategory').mockResolvedValue(undefined)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: Host }],
    })
    router.push(path)
    await router.isReady()
    mount(Host, { global: { plugins: [pinia, router] } })
    await flushPromises()
    return { router, fetchSpy }
  }

  it('does nothing without E and N', async () => {
    const { fetchSpy } = await mountAt('/?lang=de')
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(fetchAddressMock).not.toHaveBeenCalled()
  })

  it('does nothing for coordinates outside Switzerland', async () => {
    const { fetchSpy } = await mountAt('/?E=1&N=2')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('fetches the ground category and the address for E and N on load', async () => {
    const { fetchSpy } = await mountAt('/?lang=de&E=2600423&N=1199521')

    expect(fetchSpy).toHaveBeenCalledWith(2600423, 1199521)
    expect(fetchAddressMock).toHaveBeenCalledWith(
      { east_coord: 2600423, north_coord: 1199521 },
      [2600323, 1199421, 2600523, 1199621],
      [400, 400],
    )
    expect(useSearchStore().selectedAddress).toBe('Musterstrasse 1 3000 Bern')
  })

  it('clears the address when reverse geocoding finds none', async () => {
    fetchAddressMock.mockResolvedValue(null)
    await mountAt('/?E=2600423&N=1199521')
    expect(useSearchStore().selectedAddress).toBe('')
  })

  it('checks the new point when E and N change', async () => {
    const { router, fetchSpy } = await mountAt('/?E=2600423&N=1199521')
    await router.push('/?E=2683000&N=1248000')
    await flushPromises()

    expect(fetchSpy).toHaveBeenCalledTimes(2)
    expect(fetchSpy).toHaveBeenLastCalledWith(2683000, 1248000)
  })

  it('does not refetch when only lang changes', async () => {
    const { router, fetchSpy } = await mountAt('/?E=2600423&N=1199521')
    await router.push('/?E=2600423&N=1199521&lang=fr')
    await flushPromises()
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('drops a stale address when E and N change during reverse geocoding', async () => {
    let resolveFirst: (value: string) => void = () => {}
    fetchAddressMock.mockImplementationOnce(
      () => new Promise<string>((resolve) => (resolveFirst = resolve)),
    )
    fetchAddressMock.mockResolvedValueOnce('Neue Strasse 2 3000 Bern')

    const { router } = await mountAt('/?E=2600423&N=1199521')
    await router.push('/?E=2683000&N=1248000')
    await flushPromises()
    resolveFirst('Alte Strasse 1 3000 Bern')
    await flushPromises()

    expect(useSearchStore().selectedAddress).toBe('Neue Strasse 2 3000 Bern')
  })
})
