import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { nextTick } from 'vue'
import de from '@/locales/de.json'
import ShareButton from '@/components/ShareButton.vue'
import { useMapStore } from '@/stores/mapStore'

const i18n = createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'de',
  fallbackWarn: false,
  missingWarn: false,
  messages: { de },
})

const mountComponent = () =>
  mount(ShareButton, { global: { plugins: [createPinia(), i18n] } })

describe('ShareButton', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('is hidden when no coordinates are set', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('[data-cy="share-button"]').exists()).toBe(false)
  })

  it('appears once coordinates are set', async () => {
    const wrapper = mountComponent()
    const mapStore = useMapStore()
    mapStore.setCoordinates({ east_coord: 2600423, north_coord: 1199521 })
    await nextTick()
    const btn = wrapper.find('[data-cy="share-button"]')
    expect(btn.exists()).toBe(true)
    // Icon-only button: the label lives in title / aria-label.
    expect(btn.attributes('title')).toBe(de.share)
    expect(btn.attributes('aria-label')).toBe(de.share_aria_label)
  })

  it('copies the current URL and shows a confirmation', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    vi.stubGlobal('isSecureContext', true)

    const wrapper = mountComponent()
    const mapStore = useMapStore()
    mapStore.setCoordinates({ east_coord: 2600423, north_coord: 1199521 })
    await nextTick()

    const btn = wrapper.find('[data-cy="share-button"]')
    await btn.trigger('click')
    await nextTick()

    expect(writeText).toHaveBeenCalledWith(window.location.href)
    expect(btn.attributes('title')).toBe(de.share_copied)
    expect(btn.attributes('aria-label')).toBe(de.share_copied)

    vi.unstubAllGlobals()
  })

  it('reverts the confirmation state after the timeout', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    vi.stubGlobal('isSecureContext', true)

    const wrapper = mountComponent()
    const mapStore = useMapStore()
    mapStore.setCoordinates({ east_coord: 2600423, north_coord: 1199521 })
    await nextTick()

    const btn = wrapper.find('[data-cy="share-button"]')
    await btn.trigger('click')
    await nextTick()
    await Promise.resolve()
    expect(btn.attributes('title')).toBe(de.share_copied)

    vi.advanceTimersByTime(2000)
    await nextTick()
    expect(btn.attributes('title')).toBe(de.share)

    vi.unstubAllGlobals()
    vi.useRealTimers()
  })
})
