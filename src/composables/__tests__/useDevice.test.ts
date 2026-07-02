import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useDevice } from '@/composables/useDevice'

// Helper component to test the composable within a lifecycle context
const TestComponent = defineComponent({
  setup() {
    const { isMobile } = useDevice()
    return { isMobile }
  },
  template: '<div>{{ isMobile }}</div>',
})

describe('useDevice', () => {
  const originalInnerWidth = window.innerWidth
  const originalMaxTouchPoints = navigator.maxTouchPoints

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: originalMaxTouchPoints,
    })
  })

  it('returns isMobile=true when window width <= 768', () => {
    Object.defineProperty(window, 'innerWidth', { value: 768, configurable: true })
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true })

    const wrapper = mount(TestComponent)
    expect(wrapper.vm.isMobile).toBe(true)
    wrapper.unmount()
  })

  it('returns isMobile=false when window width > 768 and no touch', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true })
    // Ensure ontouchstart is not defined
    delete (window as Record<string, unknown>).ontouchstart

    const wrapper = mount(TestComponent)
    expect(wrapper.vm.isMobile).toBe(false)
    wrapper.unmount()
  })

  it('returns isMobile=true when maxTouchPoints > 0 even on wide screen', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true })
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 5, configurable: true })

    const wrapper = mount(TestComponent)
    expect(wrapper.vm.isMobile).toBe(true)
    wrapper.unmount()
  })

  it('updates isMobile on window resize', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true })
    delete (window as Record<string, unknown>).ontouchstart

    const wrapper = mount(TestComponent)
    expect(wrapper.vm.isMobile).toBe(false)

    // Simulate resize to mobile width
    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true })
    window.dispatchEvent(new Event('resize'))
    await nextTick()

    expect(wrapper.vm.isMobile).toBe(true)
    wrapper.unmount()
  })

  it('removes resize listener on unmount', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true })

    const removeEventSpy = vi.spyOn(window, 'removeEventListener')
    const wrapper = mount(TestComponent)
    wrapper.unmount()

    expect(removeEventSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    removeEventSpy.mockRestore()
  })
})
