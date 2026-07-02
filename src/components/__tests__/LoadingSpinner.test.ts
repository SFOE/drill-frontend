import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('renders the loading overlay', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.find('.loading-overlay').exists()).toBe(true)
  })

  it('renders the spinner element', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.find('.spinner').exists()).toBe(true)
  })

  it('has spinner-box container', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.find('.spinner-box').exists()).toBe(true)
  })
})
