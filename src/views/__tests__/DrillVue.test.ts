import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import DrillVue from '@/views/DrillVue.vue'
import { useLanguageStore } from '@/stores/languageStore'
import { useMapStore } from '@/stores/mapStore'
import de from '@/locales/de.json'

vi.mock('@/i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/i18n')>()
  return {
    ...actual,
    setLocale: vi.fn().mockResolvedValue(undefined),
  }
})

vi.mock('@/composables/useGeoadminReverseGeocoding', () => ({
  useGeoAdmin: () => ({ fetchAddress: vi.fn().mockResolvedValue(null) }),
}))

const i18n = createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'de',
  fallbackWarn: false,
  missingWarn: false,
  messages: { de },
})

// Stub the heavy / already-tested child components so this test focuses on
// DrillVue's own logic (lang query handling + layout composition).
const childStubs = {
  HeaderComponent: { template: '<div class="stub-header" />' },
  AddressFulltextSearchComponent: { template: '<div class="stub-search" />' },
  InfoboxComponent: { template: '<div class="stub-infobox" />' },
  MapComponent: { template: '<div class="stub-map" />' },
  StaticElementsComponent: { template: '<div class="stub-static" />' },
  FooterComponent: { template: '<div class="stub-footer" />' },
}

const makeRouter = (initialPath = '/') => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: DrillVue }],
  })
  router.push(initialPath)
  return router
}

const mountView = async (router: Router) => {
  await router.isReady()
  const wrapper = mount(DrillVue, {
    global: {
      plugins: [createPinia(), i18n, router],
      stubs: childStubs,
    },
  })
  return wrapper
}

describe('DrillVue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('renders all layout sections', async () => {
    const router = makeRouter('/')
    const wrapper = await mountView(router)

    expect(wrapper.find('.stub-header').exists()).toBe(true)
    expect(wrapper.find('.stub-search').exists()).toBe(true)
    expect(wrapper.find('.stub-infobox').exists()).toBe(true)
    expect(wrapper.find('.stub-map').exists()).toBe(true)
    expect(wrapper.find('.stub-static').exists()).toBe(true)
    expect(wrapper.find('.stub-footer').exists()).toBe(true)
  })

  it('applies the lang query param to the language store on load', async () => {
    const router = makeRouter('/?lang=fr')
    await mountView(router)

    const languageStore = useLanguageStore()
    expect(languageStore.currentLocale).toBe('fr')
  })

  it('reacts to a lang query change after mount', async () => {
    const router = makeRouter('/')
    await mountView(router)
    const languageStore = useLanguageStore()

    await router.push('/?lang=it')
    await flushPromises()

    expect(languageStore.currentLocale).toBe('it')
  })

  it('ignores a non-string (array) lang query param', async () => {
    const router = makeRouter('/?lang=fr&lang=de')
    await mountView(router)

    const languageStore = useLanguageStore()
    // array query -> not applied, store keeps its default
    expect(languageStore.currentLocale).toBe('de')
  })

  it('checks the location from the E and N query params on load', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const fetchSpy = vi.spyOn(useMapStore(), 'fetchGroundCategory').mockResolvedValue(undefined)
    const router = makeRouter('/?lang=de&E=2600423&N=1199521')
    await router.isReady()
    mount(DrillVue, { global: { plugins: [pinia, i18n, router], stubs: childStubs } })
    await flushPromises()

    expect(fetchSpy).toHaveBeenCalledWith(2600423, 1199521)
  })
})
